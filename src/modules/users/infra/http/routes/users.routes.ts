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

// users
usersRoutes.post('/register', usersController.create);
usersRoutes.post('/verify', usersController.verifyCode);
usersRoutes.post('/upload', upload.single('photo'), userRegisterSchema, usersController.upload);
usersRoutes.post('/updateEmail', usersController.updateEmail);
usersRoutes.delete('/deleteUser', usersController.deleteUser);
usersRoutes.get('/listUsers', usersController.listUsers);
usersRoutes.get('/listPseudoUsers', usersController.listPseudoUsers);
usersRoutes.post('/resendCode', usersController.resendVerificationCode);
usersRoutes.get('/listContacts/:phone', usersController.listContacts);

// tokens
usersRoutes.get('/google', usersController.getGoogleTokens);
usersRoutes.get('/outlook', usersController.getOutlookTokens);

// urls
usersRoutes.post('/getGoogleAuthUrl/:phone', usersController.getGoogleAuthUrl);
usersRoutes.post('/getOutlookAuthUrl/:phone', usersController.getOutlookAuthUrl);

usersRoutes.post('/getRecommededTimes', usersController.getRecommendedTime);

// create events
usersRoutes.post('/createGoogleEvent', usersController.createGoogleEvent);
usersRoutes.post('/createOutlookEvent', usersController.createOutlookEvent);

// get events
usersRoutes.get('/getGoogleEvents', usersController.getGoogleEvents);
usersRoutes.get('/getOutlookEvents', usersController.getOutlookEvents);

usersRoutes.get('/GetUserByPhone/:phone', usersController.GetUserByPhone);
usersRoutes.post('/notifyBySms/:phone', usersController.NotifyBySms);
usersRoutes.post('/notifyByEmail', usersController.NotifyByEmail);
usersRoutes.get('/GetUserByEmail/:email', usersController.GetUserByEmail);
usersRoutes.post('/addContact', usersController.addContact);
usersRoutes.post('/updateState', usersController.updateEventState);
usersRoutes.post('/updateEvent', usersController.updateEvent);
usersRoutes.post('/updateOutlookEvent', usersController.updateOutlookEvent);
usersRoutes.post('/suggestNewTime', usersController.SuggestNewTime);
usersRoutes.post('/checkUserAvailability', usersController.CheckUserAvailability);

export default usersRoutes;
