const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createSupportTicketValidator = [
  body('subject')
    .notEmpty()
    .withMessage('subject is required')
    .isLength({ min: 3 })
    .withMessage('subject is too short'),
  body('message')
    .notEmpty()
    .withMessage('message is required')
    .isLength({ min: 3 })
    .withMessage('message is too short'),
  validatorMiddleware,
];

exports.ticketIdValidator = [
  check('id').isMongoId().withMessage('Invalid ticket id format'),
  validatorMiddleware,
];

exports.addSupportMessageValidator = [
  check('id').isMongoId().withMessage('Invalid ticket id format'),
  body('message')
    .notEmpty()
    .withMessage('message is required')
    .isLength({ min: 2 })
    .withMessage('message is too short'),
  validatorMiddleware,
];

exports.updateTicketStatusValidator = [
  check('id').isMongoId().withMessage('Invalid ticket id format'),
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(['open', 'waiting', 'closed'])
    .withMessage('status must be open, waiting or closed'),
  validatorMiddleware,
];

exports.adminSupportQueryValidator = [
  check('status')
    .optional()
    .isIn(['active', 'all', 'open', 'waiting', 'closed'])
    .withMessage('status must be active, all, open, waiting or closed'),
  validatorMiddleware,
];
