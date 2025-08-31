/* eslint-disable import/extensions */
/* eslint-disable no-console */
import { container } from 'tsyringe';

import AwsSnsSmsProvider from '@modules/users/services/SmsService';
import { SMSProvider } from './SMSProvider/implementations/SMSProvider';
import { ISMSProvider } from './SMSProvider/models/ISMSProvider';

// Importe seu provedor AWS SNS adaptado (o SmsService.ts modificado)

// Opcional: Você pode criar um provedor de mock para usar em desenvolvimento
// para não enviar SMS reais. Exemplo:
class MockSmsProvider implements ISMSProvider {
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`[MOCK SMS] Simulação de envio para ${to}: ${message}`);
    return true; // Sempre sucesso no mock para testes
  }
}

container.register<ISMSProvider>(
  'SMSProvider', // Nome do token de injeção para o serviço de SMS com fallback
  {
    useFactory: () => {
      // Instancie seu provedor AWS SNS
      const awsSnsProvider = container.resolve(AwsSnsSmsProvider);

      // Instancie o provedor de mock (opcional, para desenvolvimento)
      const mockProvider = new MockSmsProvider();

      // Crie a instância do SMSProvider (o orquestrador de fallback)
      // A ordem aqui define a prioridade: o primeiro da lista é tentado primeiro.
      // Se você quiser que o AWS SNS seja o primário e o mock seja o secundário:
      return new SMSProvider([awsSnsProvider, mockProvider]);

      // Se você quiser que o mock seja o primário (para desenvolvimento) e o AWS SNS o secundário:
      // return new SMSProvider([mockProvider, awsSnsProvider]);

      // Para produção, você pode ter apenas provedores reais, por exemplo:
      // return new SMSProvider([awsSnsProvider, new TwilioSmsProvider()]); // Se tiver Twilio
    },
  },
);
