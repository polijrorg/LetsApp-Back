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

export default usersRoutes;
