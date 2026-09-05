const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_FULL_NAME || 'JN Ceylon Admin';

    if (!username || !password) {
      console.warn('[SEED] Admin creation skipped: ADMIN_USERNAME and ADMIN_PASSWORD are required.');
      return;
    }

    if (password.length < 12) {
      console.warn('[SEED] Admin creation skipped: ADMIN_PASSWORD must be at least 12 characters.');
      return;
    }

    const adminUser = await User.findOne({ username: username.trim() });
    if (!adminUser) {
      console.log(`[SEED] Admin account not found. Creating ${username.trim()} user...`);
      const newAdmin = new User({
        username: username.trim(),
        fullName,
        password,
        role: 'ADMIN'
      });
      await newAdmin.save();
      console.log('[SEED] Initial Admin user created successfully.');
    }
  } catch (error) {
    console.error('[SEED] Error seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
