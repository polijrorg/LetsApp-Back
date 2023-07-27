import { Router } from 'express';

import InvitesController from '../controller/InvitesController';

const invitesRoutes = Router();

const invitesController = new InvitesController();

invitesRoutes.post('/create', invitesController.create);
invitesRoutes.post('/listEventsByUser', invitesController.listEventsByUser);
invitesRoutes.post('/listInvitesByUser', invitesController.listInvitesByUser);

export default invitesRoutes;
