/**
 * Smart error formatter that extracts and translates API/validation errors
 * into clear, friendly localized messages for the user.
 *
 * @param {any} error
 * @param {'ar' | 'en' | string} locale
 * @returns {string}
 */
export function formatApiError(error, locale = 'ar') {
  const isAr = locale === 'ar';

  if (!error) {
    return isAr ? 'حدث خطأ غير متوقع، يرجى المحاولة ثانية' : 'An unexpected error occurred';
  }

  // 1. Direct string error
  if (typeof error === 'string') {
    return translateRawError(error, isAr);
  }

  // 2. Axios Response data
  const data = error.response?.data;
  if (data) {
    // If backend returns express-validator array: { errors: [ { msg, param, ... } ] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstErr = data.errors[0];
      const errMsg =
        firstErr?.msg ||
        firstErr?.message ||
        (typeof firstErr === 'string' ? firstErr : '');
      if (errMsg) {
        return translateRawError(errMsg, isAr);
      }
    }

    // Top-level message string
    if (typeof data.message === 'string' && data.message.trim()) {
      return translateRawError(data.message.trim(), isAr);
    }

    // Alternative error field
    if (typeof data.error === 'string' && data.error.trim()) {
      return translateRawError(data.error.trim(), isAr);
    }
  }

  // 3. Network or Timeout Error
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
    return isAr
      ? 'تعذر الاتصال بالسيرفر، يرجى التحقق من اتصال الإنترنت'
      : 'Network error, please check your internet connection';
  }

  // 4. Default error.message if meaningful
  if (error.message && !error.message.includes('status code')) {
    return translateRawError(error.message, isAr);
  }

  return isAr
    ? 'حدث خطأ أثناء معالجة الطلب، يرجى التحقق من البيانات والمحاولة مجدداً'
    : 'An error occurred, please verify your input and try again';
}

function translateRawError(rawMsg, isAr) {
  const s = String(rawMsg || '').trim();
  if (!s) return isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred';

  // If message already contains Arabic
  if (/[\u0600-\u06FF]/.test(s)) {
    // If it's formatted as "Arabic / English", pick the right part
    if (s.includes(' / ')) {
      const [arPart, enPart] = s.split(' / ');
      return isAr ? arPart.trim() : (enPart ? enPart.trim() : arPart.trim());
    }
    return s;
  }

  const lower = s.toLowerCase();

  if (isAr) {
    if (
      lower.includes('already in user') ||
      lower.includes('already in use') ||
      lower.includes('already registered') ||
      lower.includes('already exists') ||
      lower.includes('duplicate key')
    ) {
      return 'البريد الإلكتروني مستخدم بالفعل، يرجى تسجيل الدخول أو استخدام بريد آخر';
    }
    if (
      lower.includes('incorrect email or password') ||
      lower.includes('invalid credentials') ||
      lower.includes('invalid email or password')
    ) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
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
      lower.includes('too short password') ||
      lower.includes('password length')
    ) {
      return 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل';
    }
    if (lower.includes('password required')) {
      return 'يرجى إدخال كلمة المرور';
    }
    if (lower.includes('user required') || lower.includes('name required')) {
      return 'يرجى إدخال الاسم بالكامل';
    }
    if (lower.includes('too short user name') || lower.includes('name must be at least')) {
      return 'الاسم يجب أن يتكون من 3 أحرف على الأقل';
    }
    if (lower.includes('user not found')) {
      return 'هذا الحساب غير مسجل لدينا، يرجى إنشاء حساب جديد';
    }
    if (lower.includes('referral code')) {
      return 'كود الإحالة غير صالح أو غير نشط';
    }
    if (lower.includes('insufficient')) {
      return 'رصيد المحفظة غير كافٍ لإتمام هذه العملية';
    }
    if (lower.includes('weekend') || lower.includes('closed on weekend')) {
      return 'طلبات السحب غير متاحة خلال عطلة نهاية الأسبوع (السبت والأحد)';
    }
    if (lower.includes('minimum withdrawal')) {
      return 'الحد الأدنى للسحب هو 2.50 USDT';
    }
    if (lower.includes('blocked') || lower.includes('suspended')) {
      return 'تم إيقاف هذا الحساب، يرجى التواصل مع الدعم الفني';
    }
  } else {
    if (lower.includes('already in user') || lower.includes('already in use')) {
      return 'This email is already registered. Please log in or use another email.';
    }
    if (lower.includes('incorrect email or password')) {
      return 'Incorrect email or password. Please try again.';
    }
  }

  return s;
}
