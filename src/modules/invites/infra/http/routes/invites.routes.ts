import { Router } from 'express';

import InvitesController from '../controller/InvitesController';

const invitesRoutes = Router();

const invitesController = new InvitesController();

invitesRoutes.post('/create', invitesController.create);
invitesRoutes.get('/listAll', invitesController.listAll);

export default invitesRoutes;
