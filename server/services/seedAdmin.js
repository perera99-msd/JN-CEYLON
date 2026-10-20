const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const fullName = process.env.ADMIN_FULL_NAME || 'JN Ceylon Admin';

    if (!username || !password) {
      return;
    }

    if (password.length < 12) {
      console.warn('\x1b[33m[WARN]\x1b[0m Admin password must be at least 12 characters.');
      return;
    }

    const adminUser = await User.findOne({ username: username.trim() });
    if (!adminUser) {
      const newAdmin = new User({
        username: username.trim(),
        fullName,
        password,
        role: 'ADMIN'
      });
      await newAdmin.save();
      console.log(`[AUTH] Initial admin user (${username.trim()}) created.`);
    } else {
      const isMatch = await adminUser.matchPassword(password);
      if (!isMatch) {
        adminUser.password = password;
        await adminUser.save();
        console.log(`[AUTH] Admin password updated to match configured ADMIN_PASSWORD.`);
      }
    }
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m Error initializing admin user:', error.message);
  }
};

module.exports = seedAdmin;
