import { connectDB } from '../config/db';
import User, { UserRole } from '../models/User';
import Tenant, { SubscriptionPlan } from '../models/Tenant';
import mongoose from 'mongoose';

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if tenants already exist
    const existingTenants = await Tenant.countDocuments();
    if (existingTenants > 0) {
      console.log('Database already seeded');
      await mongoose.connection.close();
      return;
    }

    console.log('Starting database seeding...');

    // Create tenants
    const acmeTenant = await Tenant.create({
      name: 'Acme Corporation',
      slug: 'acme',
      plan: SubscriptionPlan.FREE,
      maxNotes: 3
    });

    const globexTenant = await Tenant.create({
      name: 'Globex Corporation',
      slug: 'globex',
      plan: SubscriptionPlan.FREE,
      maxNotes: 3
    });

    console.log('Tenants created successfully');

    // Create test users
    await User.create([
      {
        email: 'admin@acme.test',
        password: 'password',
        role: UserRole.ADMIN,
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: UserRole.MEMBER,
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: UserRole.ADMIN,
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: UserRole.MEMBER,
        tenantId: globexTenant._id
      }
    ]);

    console.log('Test users created successfully');
    console.log('Database seeded successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };