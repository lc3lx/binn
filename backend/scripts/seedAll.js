/**
 * Comprehensive Database Seeder for ETG Ride Platform
 * Seeds:
 * 1. Admin account (if not exists)
 * 2. Platform settings (BEP-20 wallet 0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19)
 * 3. Default ETG Ride VIP Vehicles (VIP 1 to VIP 6)
 * 4. Default FAQs (ETG Ride Mobility & Earnings)
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');
const PlatformSetting = require('../models/platformSettingModel');
const Plan = require('../models/planModel');
const FAQ = require('../models/faqModel');

const defaultPlans = [
  {
    name: 'E1',
    modelName: 'E1',
    price: 50,
    currency: 'USDT',
    vipTier: 1,
    deviceCount: 1,
    scooterIncome: 1.5,
    dailyIncome: 1.5,
    vehicleType: 'Electric Scooter E1',
    dailyTasks: 1,
    hashrate: 50,
    hashrateUnit: 'TH/s',
    roiMinPercent: 3,
    roiMaxPercent: 3,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '1 جهاز سكوتر كهربائي ذكي',
      'دخل السكوتر اليومي 1.50 USDT',
      'إجمالي الدخل اليومي: 1.50 USDT',
      'سحب فوري USDT BEP-20',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E2',
    modelName: 'E2',
    price: 220,
    currency: 'USDT',
    vipTier: 2,
    deviceCount: 4,
    scooterIncome: 1.6,
    dailyIncome: 6.4,
    vehicleType: 'Electric Scooter E2 Pro',
    dailyTasks: 4,
    hashrate: 220,
    hashrateUnit: 'TH/s',
    roiMinPercent: 2.91,
    roiMaxPercent: 2.91,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '4 أجهزة سكوتر كهربائي متطورة',
      'دخل السكوتر اليومي: 1.60 USDT',
      'إجمالي الدخل اليومي: 6.40 USDT',
      'تشغيل بنقرة واحدة وعد تنازلي ذكي',
    ],
    isPopular: true,
    isActive: true,
  },
  {
    name: 'E3',
    modelName: 'E3',
    price: 500,
    currency: 'USDT',
    vipTier: 3,
    deviceCount: 8,
    scooterIncome: 2.5,
    dailyIncome: 20.0,
    vehicleType: 'Electric Scooter E3 Turbo',
    dailyTasks: 8,
    hashrate: 500,
    hashrateUnit: 'TH/s',
    roiMinPercent: 4.0,
    roiMaxPercent: 4.0,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '8 أجهزة سكوتر كهربائي فائق السرعة',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 20.00 USDT',
      'أولوية توزيع الطاقة والعوائد',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E4',
    modelName: 'E4',
    price: 1000,
    currency: 'USDT',
    vipTier: 4,
    deviceCount: 15,
    scooterIncome: 3.2,
    dailyIncome: 48.0,
    vehicleType: 'Electric Scooter E4 Fleet',
    dailyTasks: 15,
    hashrate: 1000,
    hashrateUnit: 'TH/s',
    roiMinPercent: 4.8,
    roiMaxPercent: 4.8,
    durationDays: 45,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '15 جهاز سكوتر أسطول متقدم',
      'دخل السكوتر اليومي: 3.20 USDT',
      'إجمالي الدخل اليومي: 48.00 USDT',
      'تشغيل تلقائي متواصل ومراقبة GPS',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E5',
    modelName: 'E5',
    price: 2000,
    currency: 'USDT',
    vipTier: 5,
    deviceCount: 25,
    scooterIncome: 4.2,
    dailyIncome: 105.0,
    vehicleType: 'Electric Scooter E5 Ultra Fleet',
    dailyTasks: 25,
    hashrate: 2000,
    hashrateUnit: 'TH/s',
    roiMinPercent: 5.25,
    roiMaxPercent: 5.25,
    durationDays: 60,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '25 جهاز سكوتر طاقة استثنائية',
      'دخل السكوتر اليومي: 4.20 USDT',
      'إجمالي الدخل اليومي: 105.00 USDT',
      'أعلى معدلات أرباح يومية وسحب فوري',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E6',
    modelName: 'E6',
    price: 5000,
    currency: 'USDT',
    vipTier: 6,
    deviceCount: 50,
    scooterIncome: 5.5,
    dailyIncome: 275.0,
    vehicleType: 'Electric Scooter E6 Sovereign Fleet',
    dailyTasks: 50,
    hashrate: 5000,
    hashrateUnit: 'TH/s',
    roiMinPercent: 5.5,
    roiMaxPercent: 5.5,
    durationDays: 90,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '50 جهاز سكوتر أسطول رئاسي شامل',
      'دخل السكوتر اليومي: 5.50 USDT',
      'إجمالي الدخل اليومي: 275.00 USDT',
      'أقصى عمولة إحالة وعائد استثماري',
    ],
    isPopular: false,
    isActive: true,
  },
];

const defaultFaqs = [
  {
    question: 'ما هي منصة ETG Ride وكيف تعمل؟',
    answer: 'ETG Ride هي منصة استئجار وإدارة أساطيل النقل الفاخر والذكي. تتيح للمستخدمين استئجار مركبات VIP وتنفيذ مهام الرحلات اليومية للحصول على عوائد أرباح يومية بالـ USDT مباشرة إلى محفظتهم.',
    category: 'general',
    isActive: true,
  },
  {
    question: 'كيف أنفذ مهام الرحلات اليومية (Ride Tasks)؟',
    answer: 'بعد استئجار مركبة VIP، توجه إلى صفحة "الرحلات اليومية"، واضغط على زر "بدء الرحلة". بمجرد اكتمال إرسال الرحلة، ستُضاف أرباح المهمة فوراً إلى رصيد محفظتك القابل للسحب.',
    category: 'rides',
    isActive: true,
  },
  {
    question: 'ما هي طرق الإيداع والسحب المدعومة؟',
    answer: 'تدعم المنصة عملة USDT عبر شبكة BNB Smart Chain (BEP-20) مع تأكيد آلي فوري للمدفوعات وسحوبات سريعة بدون تعقيد.',
    category: 'deposits',
    isActive: true,
  },
  {
    question: 'كيف يعمل نظام الفريق والإحالة في ETG Ride؟',
    answer: 'يمكنك مشاركة رابط إحالتك الفريد مع أصدقائك. ستحصل على عمولات على 3 مستويات: 10% للمستوى الأول، 3% للمستوى الثاني، و 1% للمستوى الثالث، بالإضافة إلى مكافأة 100$ لكل 10 إحالات مفعلة.',
    category: 'team',
    isActive: true,
  },
  {
    question: 'ما هو الحد الأدنى للسحب؟',
    answer: 'الحد الأدنى للسحب هو 10 USDT فقط، وتتم معالجة الطلبات بأمان وسرعة مباشرة إلى محفظة BEP-20 الخاصة بك.',
    category: 'withdrawals',
    isActive: true,
  },
];

const runSeeder = async () => {
  const dbUri = process.env.DB_URI || 'mongodb://127.0.0.1:27017/mininng';
  console.log('Connecting to database:', dbUri);

  await mongoose.connect(dbUri);
  console.log('Database connected successfully.');

  // 1. Seed Platform Settings
  let setting = await PlatformSetting.findOne();
  if (!setting) {
    console.log('Creating default Platform Settings...');
    setting = await PlatformSetting.create({
      bep20DepositWallet: '0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19',
      minDepositAmount: 10,
      minWithdrawalAmount: 10,
      withdrawalFeePercent: 0,
      allowDeposits: true,
      allowWithdrawals: true,
      autoKycEnabled: true,
    });
    console.log('Platform Settings created.');
  } else {
    setting.bep20DepositWallet = '0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19';
    setting.autoKycEnabled = true;
    await setting.save();
    console.log('Platform Settings updated to wallet: 0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19');
  }

  // 2. Seed / Replace VIP Vehicle Plans
  console.log('Seeding ETG Ride VIP Vehicle tiers...');
  await Plan.deleteMany({});
  for (const planData of defaultPlans) {
    await Plan.create(planData);
    console.log(` Created VIP Plan: ${planData.name} - $${planData.price}`);
  }

  // 3. Seed FAQs
  console.log('Seeding ETG Ride FAQs...');
  await FAQ.deleteMany({});
  for (const faqData of defaultFaqs) {
    await FAQ.create(faqData);
  }
  console.log('FAQs seeded.');

  // 4. Seed Admin if not exists
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@admin.com').trim().toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    console.log(`Creating Admin user (${adminEmail})...`);
    admin = await User.create({
      name: (process.env.SEED_ADMIN_NAME || 'ETG Admin').trim(),
      slug: slugify(process.env.SEED_ADMIN_NAME || 'ETG Admin', { lower: true }),
      email: adminEmail,
      password: (process.env.SEED_ADMIN_PASSWORD || 'admin@admin123').trim(),
      role: 'admin',
      active: true,
      kycStatus: 'approved',
      walletBalance: 10000,
    });
    console.log('Admin user created.');
  }

  console.log('\n=========================================');
  console.log('  ETG Ride Seeder completed successfully!');
  console.log('=========================================\n');
  await mongoose.disconnect();
};

if (require.main === module) {
  runSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeder Error:', err);
      process.exit(1);
    });
}

module.exports = runSeeder;
