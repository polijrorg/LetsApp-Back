import { body } from 'express-validator';

const userRegisterSchema = [
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail().withMessage('Email must contain a valid email address'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  body('phone').isString().trim().notEmpty(),
];

export default userRegisterSchema;
