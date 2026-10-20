const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.markNotificationAsReadValidator = [
  check('id').isMongoId().withMessage('Invalid notification id format'),
  validatorMiddleware,
];
