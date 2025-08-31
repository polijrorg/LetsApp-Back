import { Request, Response } from 'express';
import { PushTokenService } from '@shared/infra/http/middleware/pushNotificationService';

const pushTokenService = new PushTokenService();

export default class PushNotificationController {
  public async pushToken(req:Request, res:Response): Promise<Response> {
    try {
      const { token, platform, deviceId } = req.body;
      const userId = req.user?.id; // Do middleware de auth

      if (!userId || !token || !platform) {
        return res.status(400).json({ error: 'Dados obrigatórios: token, platform' });
      }

      const success = await pushTokenService.saveToken(userId, token, platform, deviceId);

      if (success) {
        return res.json({ message: 'Token salvo com sucesso' });
      }
      return res.status(500).json({ error: 'Falha ao salvar token' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  public async deleteToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.body;
      const userId = req.user?.id;

      if (!userId || !token) {
        return res.status(400).json({ error: 'Token é obrigatório' });
      }

      const success = await pushTokenService.removeToken(userId, token);

      if (success) {
        return res.json({ message: 'Token removido com sucesso' });
      }
      return res.status(400).json({ error: 'Falha ao remover token' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
