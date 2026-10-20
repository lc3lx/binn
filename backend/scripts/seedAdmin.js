/**
 * Seeds a default admin user into MongoDB.
 *
 * Env (optional unless noted):
 *   DB_URI              — required (same as app)
 *   SEED_ADMIN_EMAIL    — default: admin@example.com
 *   SEED_ADMIN_PASSWORD — default: ChangeMe123! (change in production)
 *   SEED_ADMIN_NAME     — default: Administrator
 *
 * Run: npm run seed:admin
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const slugify = require('slugify');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
const name = process.env.SEED_ADMIN_NAME || 'Administrator';

async function run() {
  if (!process.env.DB_URI) {
    console.error('Missing DB_URI. Set it in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_URI);
  console.log('Connected:', mongoose.connection.host);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin already exists:', email);
      await mongoose.connection.close();
      process.exit(0);
    }
    console.error(
      `User with this email exists but role is "${existing.role}". Use another SEED_ADMIN_EMAIL or remove that user.`
    );
    await mongoose.connection.close();
    process.exit(1);
  }

  await User.create({
    name,
    slug: slugify(name, { lower: true }),
    email,
    password,
    role: 'admin',
    authProvider: 'local',
    active: true,
  });

  console.log('Admin created:', email);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn('Used default password ChangeMe123! — set SEED_ADMIN_PASSWORD in .env and recreate user if needed.');
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  mongoose.connection.close().finally(() => process.exit(1));
});
