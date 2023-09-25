import { Router } from 'express';

import InvitesController from '../controller/InvitesController';

const invitesRoutes = Router();

const invitesController = new InvitesController();

// invitesRoutes.post('/create', invitesController.create);
invitesRoutes.post('/listEventsByUser', invitesController.listEventsByUser);
invitesRoutes.get('/listEventsInWeek/:phone', invitesController.listEventsInAWeekByUser);
invitesRoutes.post('/listInvitesByUser', invitesController.listInvitesByUser);
invitesRoutes.post('/updateInviteState', invitesController.UpdateEventState);
invitesRoutes.post('/updateInvite', invitesController.UpdateEvent);
invitesRoutes.post('/outlookUpdateInviteState', invitesController.outlookUpdateInviteState);

export default invitesRoutes;
