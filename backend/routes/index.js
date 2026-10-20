const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const walletRoute = require('./walletRoute');
const notificationRoute = require('./notificationRoute');
const planRoute = require('./planRoute');
const supportRoute = require('./supportRoute');
const dashboardRoute = require('./dashboardRoute');
const faqRoute = require('./faqRoute');
const adminDashboardRoute = require('./adminDashboardRoute');
const platformSettingRoute = require('./platformSettingRoute');
const adminProfileRoute = require('./adminProfileRoute');
const paymentOrderRoute = require('./paymentOrderRoute');
const referralRoute = require('./referralRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/wallet', walletRoute);
  app.use('/api/v1/notifications', notificationRoute);
  app.use('/api/v1/plans', planRoute);
  app.use('/api/v1/support', supportRoute);
  app.use('/api/v1/dashboard', dashboardRoute);
  app.use('/api/v1/faq', faqRoute);
  app.use('/api/v1/admin/dashboard', adminDashboardRoute);
  app.use('/api/v1/platform-settings', platformSettingRoute);
  app.use('/api/v1/admin/profile', adminProfileRoute);
  app.use('/api/v1/payments', paymentOrderRoute);
  app.use('/api/v1/referrals', referralRoute);
};

module.exports = mountRoutes;
