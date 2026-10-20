/**
 * Comprehensive Database Seeder for Binance Mining Platform
 * Seeds:
 * 1. Admin account (if not exists)
 * 2. Platform settings (if not exists)
 * 3. Default Mining Plans (if none exist)
 * 4. Default FAQs (if none exist)
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
    name: 'Starter Miner',
    price: 50,
    currency: 'USDT',
    hashrate: 15,
    hashrateUnit: 'TH/s',
    roiMinPercent: 30,
    roiMaxPercent: 40,
    durationDays: 30,
    features: ['Daily automatic payouts', 'Instant cloud activation', '24/7 technical monitoring'],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'Standard Miner',
    price: 100,
    currency: 'USDT',
    hashrate: 35,
    hashrateUnit: 'TH/s',
    roiMinPercent: 35,
    roiMaxPercent: 45,
    durationDays: 30,
    features: ['Optimized power efficiency', 'Daily automatic payouts', 'Priority support', 'Highest return for starters'],
    isPopular: true,
    isActive: true,
  },
  {
    name: 'Advanced Miner',
    price: 500,
    currency: 'USDT',
    hashrate: 200,
    hashrateUnit: 'TH/s',
    roiMinPercent: 40,
    roiMaxPercent: 55,
    durationDays: 60,
    features: ['High hashrate cluster', 'Daily compound profits', 'Dedicated account manager', 'Free maintenance'],
    isPopular: false,
    isActive: true,
  },
  {
    name: 'Elite Pro Miner',
    price: 1000,
    currency: 'USDT',
    hashrate: 450,
    hashrateUnit: 'TH/s',
    roiMinPercent: 50,
    roiMaxPercent: 70,
    durationDays: 90,
    features: ['Enterprise-grade ASIC mining', 'Maximum ROI yield', 'VIP Telegram & 24/7 hotline', 'Zero withdrawal fee bonus'],
    isPopular: false,
    isActive: true,
  },
];

const defaultFaqs = [
  {
    question: 'كيف أبدأ التعدين في منصة Binance Mining؟',
    answer: 'قم بإنشاء حساب جديد، وتأكيد هويتك، ثم قم بإيداع رصيد USDT عبر شبكة BEP-20، واختر خطة التعدين المناسبة لتبدأ أرباحك بالنزول يومياً.',
    category: 'mining',
    isActive: true,
  },
  {
    question: 'ما هي الشبكات المدعومة للإيداع والسحب؟',
    answer: 'المنصة تدعم عملة USDT عبر شبكة BNB Smart Chain (BEP-20) لضمان سرعة المعاملات ورسوم تحويل شبه معدومة وتأكيدات آلية فورية.',
    category: 'deposits',
    isActive: true,
  },
  {
    question: 'متى وكيف يتم توزيع أرباح التعدين؟',
    answer: 'تُحسب وتُوزع أرباح التعدين بشكل آلي تماماً كل 24 ساعة مباشرة إلى رصيد محفظتك، ويمكنك سحب أرباحك أو إعادة استثمارها في أي وقت.',
    category: 'mining',
    isActive: true,
  },
  {
    question: 'ما هو الحد الأدنى للسحب وكم يستغرق؟',
    answer: 'الحد الأدنى للسحب هو 10 USDT فقط، وتتم مراجعة ومعالجة طلبات السحب بأمان وسرعة عالية.',
    category: 'withdrawals',
    isActive: true,
  },
  {
    question: 'كيف يعمل نظام عمولات الإحالة والشركاء؟',
    answer: 'يمكنك مشاركة رابط إحالتك مع أصدقائك، وستحصل على عمولات يومية مجزية (10% إلى 20% للمستوى الأول و 5% للمستوى الثاني) تضاف لرصيدك مباشرة من عوائد تعدين فريقك.',
    category: 'referrals',
    isActive: true,
  },
];

async function seed() {
  if (!process.env.DB_URI) {
    console.error('Missing DB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_URI);
  console.log('Connected to MongoDB:', mongoose.connection.host);

  // 1. Seed Admin User
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@admin.com').trim().toLowerCase();
  const adminPassword = (process.env.SEED_ADMIN_PASSWORD || 'admin@admin123').trim();
  const adminName = (process.env.SEED_ADMIN_NAME || 'Admin').trim();

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: adminName,
      slug: slugify(adminName, { lower: true }),
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      authProvider: 'local',
      active: true,
    });
    console.log(`[Seed] Created admin: ${adminEmail}`);
  } else {
    console.log(`[Seed] Admin already exists: ${adminEmail}`);
  }

  // 2. Seed Platform Settings
  let settings = await PlatformSetting.findOne({});
  const bep20Wallets = (process.env.BEP20_DEPOSIT_ADDRESSES || '').split(',').map((x) => x.trim()).filter(Boolean);
  const primaryBep20 = bep20Wallets[0] || '0x24EF9b2804C8a9550A28Ca35806d9D6B91ea6B19';

  if (!settings) {
    const depositWallets = (process.env.TRC20_DEPOSIT_ADDRESSES || '').split(',').map((x) => x.trim()).filter(Boolean);
    const primaryAddress = depositWallets[0] || 'TWNBSyonFaJEUf1eodkCqVjhyWmbXTAyBq';

    settings = await PlatformSetting.create({
      bep20DepositWalletAddress: primaryBep20,
      trc20DepositWalletAddress: primaryAddress,
      minimumWithdrawal: 10,
      maximumWithdrawal: 50000,
      starterDailyRatePercent: 1.0,
      starterDurationDays: 30,
      eliteDailyRatePercent: 1.5,
      eliteDurationDays: 90,
      level1CommissionPercent: 10,
      level2CommissionPercent: 5,
      referralActiveMinPlans: 1,
      referralRegistrationBaseUrl: 'https://www.binancecoins.com/ar/user_auth/signup',
      referralTiers: [
        { name: 'Bronze', minActiveReferrals: 0, commissionPercent: 10 },
        { name: 'Silver', minActiveReferrals: 5, commissionPercent: 12 },
        { name: 'Gold', minActiveReferrals: 15, commissionPercent: 15 },
        { name: 'Diamond', minActiveReferrals: 30, commissionPercent: 20 },
      ],
    });
    console.log('[Seed] Created default platform settings with BEP20 wallet');
  } else if (!settings.bep20DepositWalletAddress) {
    settings.bep20DepositWalletAddress = primaryBep20;
    await settings.save();
    console.log('[Seed] Updated platform settings with BEP20 wallet');
  } else {
    console.log('[Seed] Platform settings already present');
  }

  // 3. Seed Mining Plans
  const planCount = await Plan.countDocuments();
  if (planCount === 0) {
    await Plan.insertMany(defaultPlans);
    console.log(`[Seed] Inserted ${defaultPlans.length} default mining plans`);
  } else {
    console.log(`[Seed] Found ${planCount} existing mining plans, skipping`);
  }

  // 4. Seed FAQs
  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    await FAQ.insertMany(defaultFaqs);
    console.log(`[Seed] Inserted ${defaultFaqs.length} default FAQs`);
  } else {
    console.log(`[Seed] Found ${faqCount} existing FAQs, skipping`);
  }

  console.log('[Seed] All seeding tasks completed successfully!');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  mongoose.connection.close().finally(() => process.exit(1));
});
