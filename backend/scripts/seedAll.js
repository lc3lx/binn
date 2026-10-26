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
    scooterIncome: 2.5,
    dailyIncome: 2.5,
    vehicleType: 'Electric Scooter E1',
    dailyTasks: 1,
    hashrate: 50,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '1 جهاز سكوتر كهربائي ذكي',
      'دخل السكوتر اليومي 2.50 USDT',
      'إجمالي الدخل اليومي: 2.50 USDT',
      'سحب يومي فوري USDT BEP-20',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E2',
    modelName: 'E2',
    price: 100,
    currency: 'USDT',
    vipTier: 2,
    deviceCount: 2,
    scooterIncome: 2.5,
    dailyIncome: 5.0,
    vehicleType: 'Electric Scooter E2',
    dailyTasks: 2,
    hashrate: 100,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '2 جهاز سكوتر كهربائي متطور',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 5.00 USDT',
      'سحب يومي فوري ومتابعة دورية',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E3',
    modelName: 'E3',
    price: 200,
    currency: 'USDT',
    vipTier: 3,
    deviceCount: 4,
    scooterIncome: 2.5,
    dailyIncome: 10.0,
    vehicleType: 'Electric Scooter E3 Pro',
    dailyTasks: 4,
    hashrate: 200,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '4 أجهزة سكوتر كهربائي فائق الأداء',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 10.00 USDT',
      'الأكثر طلباً - تشغيل بنقرة واحدة',
    ],
    isPopular: true,
    isActive: true,
  },
  {
    name: 'E4',
    modelName: 'E4',
    price: 500,
    currency: 'USDT',
    vipTier: 4,
    deviceCount: 10,
    scooterIncome: 2.5,
    dailyIncome: 25.0,
    vehicleType: 'Electric Scooter E4 Turbo',
    dailyTasks: 10,
    hashrate: 500,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 30,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '10 أجهزة سكوتر أسطول متقدم',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 25.00 USDT',
      'أولوية توزيع الطاقة وتتبع GPS',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E5',
    modelName: 'E5',
    price: 1000,
    currency: 'USDT',
    vipTier: 5,
    deviceCount: 20,
    scooterIncome: 2.5,
    dailyIncome: 50.0,
    vehicleType: 'Electric Scooter E5 Fleet',
    dailyTasks: 20,
    hashrate: 1000,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 45,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '20 جهاز سكوتر أسطول تجاري',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 50.00 USDT',
      'تشغيل متواصل ودعم فني خاص',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E6',
    modelName: 'E6',
    price: 2000,
    currency: 'USDT',
    vipTier: 6,
    deviceCount: 40,
    scooterIncome: 2.5,
    dailyIncome: 100.0,
    vehicleType: 'Electric Scooter E6 Ultra',
    dailyTasks: 40,
    hashrate: 2000,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 60,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '40 جهاز سكوتر طاقة استثنائية',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 100.00 USDT',
      'أعلى عوائد أرباح يومية مؤكدة',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'E7',
    modelName: 'E7',
    price: 5000,
    currency: 'USDT',
    vipTier: 7,
    deviceCount: 100,
    scooterIncome: 2.5,
    dailyIncome: 250.0,
    vehicleType: 'Electric Scooter E7 Sovereign',
    dailyTasks: 100,
    hashrate: 5000,
    hashrateUnit: 'Devices',
    roiMinPercent: 5.0,
    roiMaxPercent: 5.0,
    durationDays: 90,
    vehicleImage: '/scooter_transparent.png',
    scooterImage: '/scooter_transparent.png',
    features: [
      '100 جهاز سكوتر أسطول رئاسي متكامل',
      'دخل السكوتر اليومي: 2.50 USDT',
      'إجمالي الدخل اليومي: 250.00 USDT',
      'أقصى عمولة إحالة وعائد استثماري',
    ],
    isPopular: false,
    isActive: true,
  },
];

const defaultFaqs = [
  {
    question: 'ما هي منصة ETG Ride وكيف تعمل؟',
    answer: 'ETG RIDE هي منصة استثمار وتشغيل أساطيل السكوترات الكهربائية الذكية (Smart E-Scooters). تتيح للمستخدمين استئجار طرازات السكوتر (من E1 إلى E7 بقيمة 50$ إلى 5,000$) وتشغيلها يومياً بنقرة واحدة لتحقيق عوائد أرباح يومية بنسبة 5% بالـ USDT مباشرة إلى محفظتهم.',
    category: 'general',
    isActive: true,
  },
  {
    question: 'كيف أنفذ مهام الرحلات اليومية (Ride Tasks)؟',
    answer: 'بعد استئجار طراز السكوتر، توجه إلى شاشة RIDE، واضغط على زر الطاقة الأزرق (⏻). سيبدأ العد التنازلي الذكي 04:59:50، وعند اكتمال الدورة اضغط زر ($) أو زر "جمع في نقرة واحدة" لتحويل أرباحك لمحفظتك.',
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
    answer: 'الحد الأدنى للسحب هو 2.50 USDT فقط لتمكين أصحاب باقة الـ 50$ من سحب ربحهم اليومي. يمكنك السحب يومياً من الإثنين إلى الجمعة (السبت والأحد عطلة أسبوعية لقسم السحوبات).',
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
      minWithdrawalAmount: 2.5,
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
