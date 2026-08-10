const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminUser = await User.findOne({ username: { $regex: /^AdminJN$/i } });
    if (!adminUser) {
      console.log('[SEED] AdminJN account not found. Creating AdminJN user...');
      const newAdmin = new User({
        username: 'AdminJN',
        fullName: 'JN Ceylon Admin',
        password: 'Password123',
        role: 'ADMIN'
      });
      await newAdmin.save();
      console.log('[SEED] Initial Admin user "AdminJN" created successfully!');
    }
  } catch (error) {
    console.error('[SEED] Error seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
