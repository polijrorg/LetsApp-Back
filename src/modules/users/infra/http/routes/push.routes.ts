// Adicionar nas users.routes.ts
import { Router } from 'express';
import PushNotificationController from '../controller/PushNotificationController';

const router = Router();
const pushNotificationController = new PushNotificationController();

router.post('/push-token', pushNotificationController.pushToken);

router.delete('/push-token', pushNotificationController.deleteToken);
