import { Router } from 'express';
import multer from 'multer';
import UploadFunction from '@config/upload';
import userRegisterSchema from '../schemas/userRegisterSchema';

// import forgotPasswordAuthentication from '@shared/infra/http/middleware/forgotPasswordAuthentication';
// import ensureAuthenticated from '@shared/infra/http/middleware/ensureAuthenticated';

import UsersController from '../controller/UsersController';

const usersRoutes = Router();
const upload = multer(UploadFunction('user'));

const usersController = new UsersController();

usersRoutes.get('/register', usersController.create);
usersRoutes.get('/verify', usersController.verifyCode);
usersRoutes.get('/upload', upload.single('photo'), userRegisterSchema, usersController.upload);
usersRoutes.get('/updateEmail', usersController.updateEmail);
usersRoutes.delete('/deleteUser', usersController.deleteUser);
usersRoutes.get('/listUsers', usersController.listUsers);
// usersRoutes.get('/getcalendar', usersController.getcalendar);
usersRoutes.get('', usersController.getTokens);
usersRoutes.get('/getAuthUrl', usersController.getAuthUrl);
usersRoutes.get('/getTokens', usersController.getTokens);
usersRoutes.post('/createEvent', usersController.createEvent);
usersRoutes.get('/getEvents', usersController.getEvents);

export default usersRoutes;
