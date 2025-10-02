import dotenv from 'dotenv';
import { initializeDatabase } from '../config/database';
import { UserModel } from '../models/User';
import { EventModel } from '../models/Event';
import { WorkerModel } from '../models/Worker';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database
    await initializeDatabase();

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await UserModel.create({
      name: 'Admin User',
      email: 'admin@studentevents.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create worker users
    console.log('👷 Creating worker users...');
    const worker1 = await UserModel.create({
      name: 'John Smith',
      email: 'john.worker@studentevents.com',
      password: 'worker123',
      role: 'worker'
    });

    const worker2 = await UserModel.create({
      name: 'Sarah Johnson',
      email: 'sarah.worker@studentevents.com',
      password: 'worker123',
      role: 'worker'
    });
    console.log(`✅ Worker users created: ${worker1.email}, ${worker2.email}`);

    // Create regular users
    console.log('👥 Creating regular users...');
    const user1 = await UserModel.create({
      name: 'Alice Student',
      email: 'alice@student.edu',
      password: 'student123',
      role: 'user'
    });

    const user2 = await UserModel.create({
      name: 'Bob Student',
      email: 'bob@student.edu',
      password: 'student123',
      role: 'user'
    });
    console.log(`✅ Regular users created: ${user1.email}, ${user2.email}`);

    // Create sample events
    console.log('🎉 Creating sample events...');
    
    const event1 = await EventModel.create({
      title: 'Spring Music Festival',
      description: 'Join us for an amazing night of live music featuring local student bands and special guest performers. Food trucks, games, and great vibes guaranteed!',
      date: new Date('2024-04-15T19:00:00Z'),
      location: 'University Main Quad',
      price: 25.00,
      max_tickets: 500,
      image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    });

    const event2 = await EventModel.create({
      title: 'Tech Innovation Summit',
      description: 'Discover the latest in technology and innovation. Network with industry professionals, attend workshops, and showcase your projects.',
      date: new Date('2024-05-20T09:00:00Z'),
      location: 'Student Union Building',
      price: 15.00,
      max_tickets: 200,
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
    });

    const event3 = await EventModel.create({
      title: 'Cultural Night Celebration',
      description: 'Experience diverse cultures through food, music, dance, and art. A celebration of our multicultural student community.',
      date: new Date('2024-06-10T18:30:00Z'),
      location: 'Campus Cultural Center',
      price: 20.00,
      max_tickets: 300,
      image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    });

    const event4 = await EventModel.create({
      title: 'Career Fair 2024',
      description: 'Meet with top employers, learn about internship opportunities, and kickstart your career. Professional attire recommended.',
      date: new Date('2024-03-25T10:00:00Z'),
      location: 'Sports Complex Arena',
      price: 0.00, // Free event
      max_tickets: 1000,
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'
    });

    console.log(`✅ Sample events created: ${event1.title}, ${event2.title}, ${event3.title}, ${event4.title}`);

    // Assign workers to events
    console.log('👷‍♂️ Assigning workers to events...');
    await WorkerModel.assignWorker(event1.id, worker1.id);
    await WorkerModel.assignWorker(event1.id, worker2.id);
    await WorkerModel.assignWorker(event2.id, worker1.id);
    await WorkerModel.assignWorker(event3.id, worker2.id);
    await WorkerModel.assignWorker(event4.id, worker1.id);
    await WorkerModel.assignWorker(event4.id, worker2.id);
    console.log('✅ Workers assigned to events');

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Created accounts:');
    console.log(`  Admin: ${adminUser.email} / admin123`);
    console.log(`  Worker 1: ${worker1.email} / worker123`);
    console.log(`  Worker 2: ${worker2.email} / worker123`);
    console.log(`  User 1: ${user1.email} / student123`);
    console.log(`  User 2: ${user2.email} / student123`);
    console.log('');
    console.log('🎪 Created events:');
    console.log(`  1. ${event1.title} - $${event1.price}`);
    console.log(`  2. ${event2.title} - $${event2.price}`);
    console.log(`  3. ${event3.title} - $${event3.price}`);
    console.log(`  4. ${event4.title} - $${event4.price} (Free)`);
    console.log('');
    console.log('🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    
    // Check for specific errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value')) {
        console.log('ℹ️ Some data already exists in the database. This is normal if you\'ve run the seed script before.');
      } else if (error.message.includes('connect')) {
        console.log('ℹ️ Make sure your database is running and the DATABASE_URL is correct in your .env file.');
      }
    }
    
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
