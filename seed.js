const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./server/models/User');
const Company = require('./server/models/Company');
const Sequence = require('./server/models/Sequence');

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jn_ceylon_erp');
    console.log('Database connected for seeding...');

    // 1. Seed Admin User
    const existingUser = await User.findOne({ username: 'admin' });
    if (!existingUser) {
      const admin = new User({
        username: 'admin',
        passwordHash: 'admin123', // Will be hashed automatically by pre-save hook
        fullName: 'JN Ceylon Admin',
        role: 'ADMIN'
      });
      await admin.save();
      console.log('Created admin user (admin / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // 2. Seed Default Company (Constance Halaveli)
    const existingCompany = await Company.findOne({ name: 'Constance Halaveli' });
    if (!existingCompany) {
      const company = new Company({
        name: 'Constance Halaveli',
        address: {
          line1: 'AlifuAlifu Atoll, Halaveli',
          line2: '09130',
          country: 'Republic of Maldives'
        },
        custCode: 'Halav 05',
        contactEmail: 'purchasing@halaveli.com',
        contactPhone: '+960 666 7000',
        isDefault: true
      });
      await company.save();
      console.log('Created default company: Constance Halaveli');
    } else {
      console.log('Default company Constance Halaveli already exists');
    }

    // 3. Seed Sequences
    const quotSeq = await Sequence.findOne({ type: 'QUOTATION' });
    if (!quotSeq) {
      await Sequence.create({
        type: 'QUOTATION',
        prefix: '11QUOTE',
        currentNumber: 323
      });
      console.log('Initialized Quotation Sequence at 323');
    }

    const invSeq = await Sequence.findOne({ type: 'INVOICE' });
    if (!invSeq) {
      await Sequence.create({
        type: 'INVOICE',
        prefix: 'INV-',
        currentNumber: 351
      });
      console.log('Initialized Invoice Sequence at 351');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDB();
