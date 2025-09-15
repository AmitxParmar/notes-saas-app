import mongoose from "mongoose";
import { env } from "./env";
import User, { UserRole } from "../models/User";
import Tenant, { SubscriptionPlan } from "../models/Tenant";

export async function connectDB() {
  mongoose.set("strictQuery", false);
  mongoose.set("debug", true); // Enable debug mode

  try {
    await mongoose.connect(env.mongoUri);
    
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

const seedDatabase = async () => {
  try {
    // Check if tenants already exist
    const existingTenants = await Tenant.countDocuments();
    if (existingTenants > 0) {
      console.log('Database already seeded');
      return;
    }

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

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
