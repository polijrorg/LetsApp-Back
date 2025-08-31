/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-console */
/* eslint-disable max-classes-per-file */
import { Request, Response, NextFunction } from 'express';

interface IPushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string;
  topic?: string;
}

interface IPushNotificationProvider {
  sendNotification(payload: IPushNotificationPayload): Promise<boolean>;
  subscribeToTopic(token: string, topic: string): Promise<boolean>;
  unsubscribeFromTopic(token: string, topic: string): Promise<boolean>;
}

class FCMProvider implements IPushNotificationProvider {
  private admin: any;

  constructor() {
    const admin = require('firebase-admin');

    // Inicializar Firebase Admin SDK apenas uma vez
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
        console.log('[FCM] Firebase Admin SDK inicializado com sucesso');
      } catch (error) {
        console.error('[FCM] Erro ao inicializar Firebase Admin SDK:', error);
      }
    }

    this.admin = admin;
  }

  supports(): 'push' {
    return 'push';
  }

  private async getUserTokens(userId: string): Promise<string[]> {
    try {
      const { getCustomRepository } = require('typeorm');
      // Implementar busca no banco quando a tabela existir
      const { database } = require('@shared/infra/typeorm');
      const result = await database.query(`
        SELECT push_token
        FROM user_push_tokens
        WHERE user_id = ? AND is_active = true
      `, [userId]);
      return result.map((row: any) => row.push_token);
    } catch (error) {
      console.error('Erro ao buscar tokens do usuário:', error);
      return [];
    }
  }

  async sendNotification(payload: IPushNotificationPayload): Promise<boolean> {
    try {
      console.log(`[FCM] Enviando notificação: ${JSON.stringify(payload)}`);

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#3446E4',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Se tem userId, busca tokens específicos do usuário
      if (payload.userId) {
        const tokens = await this.getUserTokens(payload.userId);
        if (tokens.length > 0) {
          const multicastMessage = { ...message, tokens };
          await this.admin.messaging().sendMulticast(multicastMessage);
          console.log(`[FCM] Notificação enviada para ${tokens.length} tokens do usuário ${payload.userId}`);
        } else {
          console.log(`[FCM] Nenhum token encontrado para usuário ${payload.userId}`);
          return false;
        }
      } else if (payload.topic) { // Se tem tópico, envia para o tópico
        const topicMessage = { ...message, topic: payload.topic };
        await this.admin.messaging().send(topicMessage);
        console.log(`[FCM] Notificação enviada para tópico: ${payload.topic}`);
      } else {
        console.log('[FCM] Nem userId nem topic fornecidos');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação FCM:', error);
      return false;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    try {
      console.log(`[FCM] Inscrevendo token ${token} no tópico ${topic}`);
      await this.admin.messaging().subscribeToTopic([token], topic);
      return true;
    } catch (error) {
      console.error('Erro ao inscrever no tópico:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    try {
      console.log(`[FCM] Desinscrevendo token ${token} do tópico ${topic}`);
      await this.admin.messaging().unsubscribeFromTopic([token], topic);
      return true;
    } catch (error) {
      console.error('Erro ao desinscrever do tópico:', error);
      return false;
    }
  }
}

class APNSProvider implements IPushNotificationProvider {
  async sendNotification(payload: IPushNotificationPayload): Promise<boolean> {
    try {
      // Implementação do Apple Push Notification Service
      console.log(`[APNS] Enviando notificação: ${JSON.stringify(payload)}`);
      // Aqui seria a implementação real do APNS
      // const apn = require('apn');
      // const notification = new apn.Notification();
      // notification.alert = payload.body;
      // notification.title = payload.title;
      // notification.payload = payload.data;
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação APNS:', error);
      return false;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    // APNS não tem conceito de tópicos como FCM
    console.log(`[APNS] Simulando inscrição no tópico ${topic} para token ${token}`);
    return true;
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    // APNS não tem conceito de tópicos como FCM
    console.log(`[APNS] Simulando desinscrição do tópico ${topic} para token ${token}`);
    return true;
  }
}

export class PushTokenService {
  async saveToken(userId: string, token: string, platform: 'ios' | 'android', deviceId?: string) {
    try {
      const { database } = require('@shared/infra/typeorm');

      await database.query(`
        INSERT INTO user_push_tokens (user_id, push_token, platform, device_id)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_active = true,
          updated_at = CURRENT_TIMESTAMP,
          device_id = VALUES(device_id)
      `, [userId, token, platform, deviceId]);

      console.log(`[PUSH TOKEN] Token salvo para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar token:', error);
      return false;
    }
  }

  async removeToken(userId: string, token: string) {
    try {
      const { database } = require('@shared/infra/typeorm');

      await database.query(`
        UPDATE user_push_tokens
        SET is_active = false
        WHERE user_id = ? AND push_token = ?
      `, [userId, token]);

      console.log(`[PUSH TOKEN] Token removido para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error('Erro ao remover token:', error);
      return false;
    }
  }

  async getUserTokens(userId: string): Promise<string[]> {
    try {
      const { database } = require('@shared/infra/typeorm');
      const result = await database.query(`
        SELECT push_token
        FROM user_push_tokens
        WHERE user_id = ? AND is_active = true
      `, [userId]);
      console.log(`[PUSH TOKEN] Tokens recuperados para usuário ${userId}`);
      return result.map((row: any) => row.push_token);
    } catch (error) {
      console.error('Erro ao buscar tokens:', error);
      return [];
    }
  }
}

export class PushNotificationService {
  private providers: IPushNotificationProvider[];

  constructor() {
    this.providers = [
      new FCMProvider(),
      new APNSProvider(),
    ];
  }

  async sendNotification(payload: IPushNotificationPayload): Promise<boolean> {
    const promises = this.providers.map((provider) => provider.sendNotification(payload));

    try {
      const results: (boolean | { error: any })[] = await Promise.all(promises.map((p) => p.catch((e) => ({ error: e }))));
      return results.some((result) => typeof result === 'boolean' && result);
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      return false;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    const promises = this.providers.map((provider) => provider.subscribeToTopic(token, topic));

    try {
      const results = await Promise.all(promises.map((p) => p.catch((e) => ({ error: e }))));
      return results.some((result) => (typeof result === 'boolean' && result));
    } catch (error) {
      console.error('Erro ao inscrever no tópico:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    const promises = this.providers.map((provider) => provider.unsubscribeFromTopic(token, topic));

    try {
      const results = await Promise.all(promises.map((p) => p.catch((e) => ({ error: e }))));
      return results.some((result) => (typeof result === 'boolean' && result));
    } catch (error) {
      console.error('Erro ao desinscrever do tópico:', error);
      return false;
    }
  }

  // Métodos para eventos específicos do LetsApp
  async notifyInviteCreated(userId: string, inviteData: any): Promise<boolean> {
    return this.sendNotification({
      title: 'Novo Convite',
      body: `Você foi convidado para: ${inviteData.name}`,
      data: { type: 'invite_created', inviteId: inviteData.id },
      userId,
    });
  }

  async notifyInviteUpdated(userId: string, inviteData: any): Promise<boolean> {
    return this.sendNotification({
      title: 'Convite Atualizado',
      body: `O evento "${inviteData.name}" foi atualizado`,
      data: { type: 'invite_updated', inviteId: inviteData.id },
      userId,
    });
  }

  async notifyInviteCancelled(userId: string, inviteData: any): Promise<boolean> {
    return this.sendNotification({
      title: 'Convite Cancelado',
      body: `O evento "${inviteData.name}" foi cancelado`,
      data: { type: 'invite_cancelled', inviteId: inviteData.id },
      userId,
    });
  }
}

export const pushNotificationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.pushNotificationService = new PushNotificationService();
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      pushNotificationService?: PushNotificationService;
    }
  }
}
