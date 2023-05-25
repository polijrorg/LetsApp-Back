import { body } from 'express-validator';

const userRegisterSchema = [
  body('name').isString().trim().notEmpty(),
  body('phone').isString().trim().notEmpty(),
];

export default userRegisterSchema;
