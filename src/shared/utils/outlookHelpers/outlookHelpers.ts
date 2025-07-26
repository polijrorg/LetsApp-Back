import msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { Event } from '@microsoft/microsoft-graph-types';

export function buildMsalClient(tokenCache: string) {
  const clientConfig = {
    auth: {
      clientId: process.env.OUTLOOK_CLIENT_ID!,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
      authority: 'https://login.microsoftonline.com/common',
    },
    system: {
      loggerOptions: {
        loggerCallback: (_level: any, message: any) => console.log(message),
        piiLoggingEnabled: false,
        logLevel: 3,
      },
    },
  };

  const cca = new msal.ConfidentialClientApplication(clientConfig);
  cca.getTokenCache().deserialize(tokenCache);

  return cca;
}

export async function getGraphClient(cca: msal.ConfidentialClientApplication) {
    
//   const accounts = await cca.getTokenCache().getAllAccounts();
    const account = JSON.parse(cca.getTokenCache().serialize()).Account;

    // console.log(`❌❌OutlookHelpers 20: Accounts found: ${JSON.stringify(accounts)}`);
  if (!account ) {
    throw new Error('❌ Nenhuma conta encontrada no cache MSAL. O usuário precisa se autenticar novamente.');
  }
  const tokenRequest = {
    account,
      scopes: ['openid','profile', 'offline_access', 'User.Read', 'Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
  };

  const tokens = await cca.acquireTokenSilent(tokenRequest);
  if (!tokens) throw new Error('❌ AccessToken não encontrado com acquireTokenSilent.');

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => tokens.accessToken as string,
    },
  });
}

export async function resolveEmails(emails: string[], lookupFn: (phone: string) => Promise<string>) {
  const resolved = [];
  for (const item of emails) {
    if (item.includes('@')) {
      resolved.push(item);
    } else {
      try {
        const email = await lookupFn(item);
        resolved.push(email);
      } catch (e: any) {
        console.log(`Error resolving ${item}:`, e.message);
      }
    }
  }
  return resolved;
}

export function buildEvent({
  name,
  description,
  address,
  begin,
  end,
  attendees,
}: {
  name: string;
  description: string;
  address: string;
  begin: string;
  end: string;
  attendees: string[];
}): Event {
  const timeZone = Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo' }).resolvedOptions().timeZone;
  return {
    subject: name,
    body: { content: description },
    location: { displayName: address },
    start: { dateTime: begin, timeZone },
    end: { dateTime: end, timeZone },
    attendees: attendees.map((email) => ({
      emailAddress: { address: email },
      type: 'required',
    })),
  };
}

export async function tryCreateMeetingLink(graphClient: Client, { name, begin, end }: { name: string; begin: string; end: string; }) {
  try {
    const meeting = await graphClient.api('/me/onlineMeetings').post({
      startDateTime: begin,
      endDateTime: end,
      subject: name,
      joinMeetingIdSettings: { isPasscodeRequired: false },
    });

    return {
      url: meeting.joinWebUrl,
      conferenceId: meeting.id,
    };
  } catch (error: any) {
    console.log(error?.body || error);
    return null;
  }
}
