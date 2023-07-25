import { Router } from 'express';

// Users
import usersRoutes from '@modules/users/infra/http/routes/users.routes';
import sessionsRoutes from '@modules/users/infra/http/routes/sessions.routes';
import invitesRoutes from '@modules/invites/infra/http/routes/invites.routes';

const routes = Router();

routes.use('/', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/invites', invitesRoutes);

export default routes;
