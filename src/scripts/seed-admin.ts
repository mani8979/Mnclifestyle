import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Admin, hashAdminPassword } from '../models/Admin';

async function seedAdmin() {
  console.log('=====================================================');
  console.log('MNC LifeStyle — Secure Admin Seeder');
  console.log('=====================================================\n');

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    console.error('[Admin Seeder Error]: ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be configured in .env.local');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[Admin Seeder Error]: ADMIN_INITIAL_PASSWORD must be at least 8 characters long');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB Atlas...`);
  await connectDB();
  console.log(`Connected to database.`);

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    console.log(`[Admin Seeder] Admin account "${email}" already exists.`);
    console.log(`Updating password and confirming role=super_admin, isActive=true...`);

    const passwordHash = await hashAdminPassword(password);
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.role = 'super_admin';
    existingAdmin.isActive = true;
    await existingAdmin.save();

    console.log(`[PASS] Admin account "${email}" successfully refreshed and active.`);
  } else {
    console.log(`[Admin Seeder] Creating new super admin account: "${email}"...`);
    const passwordHash = await hashAdminPassword(password);

    const newAdmin = new Admin({
      name: 'MNC Atelier Administrator',
      email,
      passwordHash,
      role: 'super_admin',
      isActive: true,
      lastLoginAt: null,
    });

    await newAdmin.save();
    console.log(`[PASS] Super admin account "${email}" created successfully.`);
  }

  console.log('\n=====================================================');
  console.log('Admin seeding completed securely. (No passwords logged)');
  console.log('=====================================================');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[Admin Seeder Failure]:', err.message);
  process.exit(1);
});
