import { body } from 'express-validator';

const userRegisterSchema = [
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail().withMessage('Email must contain a valid email address'),
  body('phone').isString().trim().notEmpty(),
];

export default userRegisterSchema;
