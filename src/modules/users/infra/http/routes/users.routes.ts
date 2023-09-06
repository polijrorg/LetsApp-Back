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

usersRoutes.post('/register', usersController.create);
usersRoutes.post('/verify', usersController.verifyCode);
usersRoutes.post('/upload', upload.single('photo'), userRegisterSchema, usersController.upload);
usersRoutes.post('/updateEmail', usersController.updateEmail);
usersRoutes.delete('/deleteUser', usersController.deleteUser);
usersRoutes.get('/listUsers', usersController.listUsers);
// usersRoutes.get('/getcalendar', usersController.getcalendar);
usersRoutes.get('', usersController.getTokens);
usersRoutes.post('/getAuthUrl/:phone', usersController.getAuthUrl);
usersRoutes.get('/getTokens', usersController.getTokens);
usersRoutes.post('/createEvent', usersController.createEvent);
usersRoutes.post('/getRecommededTimes', usersController.getRecommendedTime);
usersRoutes.get('/getEvents', usersController.getEvents);
usersRoutes.get('/GetUserByPhone/:phone', usersController.GetUserByPhone);
usersRoutes.post('/notifyBySms/:phone', usersController.NotifyBySms);
usersRoutes.post('/notifyByEmail', usersController.NotifyByEmail);
usersRoutes.post('/GetUserByEmail/', usersController.GetUserByEmail);
usersRoutes.post('/addContact', usersController.addContact);
usersRoutes.post('/updateState', usersController.updateEventState);
usersRoutes.post('/updateEvent', usersController.updateEvent);
usersRoutes.post('/suggestNewTime', usersController.SuggestNewTime);

export default usersRoutes;
