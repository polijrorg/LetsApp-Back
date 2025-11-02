import { Router, Request, Response } from 'express';
import { getLandingPage } from '@shared/utils/landingPage';

// Users
import usersRoutes from '@modules/users/infra/http/routes/users.routes';
import sessionsRoutes from '@modules/users/infra/http/routes/sessions.routes';
import invitesRoutes from '@modules/invites/infra/http/routes/invites.routes';

const routes = Router();

// Landing page route
routes.get('/', (_req: Request, res: Response) => {
  return res.send(getLandingPage());
});

routes.use('/', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/invites', invitesRoutes);

export default routes;
