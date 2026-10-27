const { validationResult } = require('express-validator');

/**
 * Maps validator messages to friendly localized strings.
 */
const translateValidationMessage = (msg, param, lang = 'ar') => {
  const raw = String(msg || '').trim();
  if (!raw) {
    return lang === 'ar' ? 'بيانات الإدخال غير صالحة' : 'Invalid input';
  }

  // If already contains Arabic
  if (/[\u0600-\u06FF]/.test(raw)) {
    if (raw.includes(' / ')) {
      const parts = raw.split(' / ');
      return lang === 'ar' ? parts[0].trim() : (parts[1] || parts[0]).trim();
    }
    return raw;
  }

  const lower = raw.toLowerCase();

  if (lang === 'ar') {
    if (
      lower.includes('already in user') ||
      lower.includes('already in use') ||
      lower.includes('already registered') ||
      lower.includes('already exists')
    ) {
      return 'البريد الإلكتروني مستخدم بالفعل، يرجى تسجيل الدخول أو استخدام بريد آخر';
    }
    if (lower.includes('invalid email') || lower.includes('email required')) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }
    if (
      lower.includes('password confirmation') ||
      lower.includes('confirmation incorrect') ||
      lower.includes('does not match')
    ) {
      return 'كلمتا المرور غير متطابقتين';
    }
    if (
      lower.includes('password must be at least') ||
      lower.includes('too short password')
    ) {
      return 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل';
    }
    if (lower.includes('password required')) {
      return 'يرجى إدخال كلمة المرور';
    }
    if (lower.includes('too short user name') || lower.includes('name must be at least')) {
      return 'الاسم يجب أن يتكون من 3 أحرف على الأقل';
    }
    if (lower.includes('user required') || lower.includes('name required')) {
      return 'يرجى إدخال الاسم بالكامل';
    }
    if (lower.includes('referral code')) {
      return 'كود الإحالة غير صالح أو غير نشط';
    }
    if (lower.includes('must be greater than 0') || lower.includes('positive')) {
      return 'القيمة يجب أن تكون أكبر من 0';
    }
  } else {
    if (lower.includes('already in user') || lower.includes('already in use')) {
      return 'This email address is already in use. Please log in or use another email.';
    }
    if (lower.includes('confirmation incorrect')) {
      return 'Password confirmation does not match.';
    }
  }

  return raw;
};

// @desc Finds the validation errors in this request and wraps them in a friendly localized response
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArr = errors.array();
    // Prefer query/header language, default to Arabic
    const langHeader = req.headers['accept-language'] || req.headers['x-locale'] || '';
    const lang = langHeader.toLowerCase().includes('en') ? 'en' : 'ar';

    const localizedErrors = errorArr.map((err) => ({
      ...err,
      msg: translateValidationMessage(err.msg, err.param, lang),
    }));

    const primaryMessage =
      localizedErrors[0]?.msg ||
      (lang === 'ar' ? 'يرجى التأكد من صحة البيانات المدخلة' : 'Invalid input data');

    return res.status(400).json({
      status: 'fail',
      message: primaryMessage,
      errors: localizedErrors,
    });
  }
  next();
};

module.exports = validatorMiddleware;
