import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';

async function testConnection() {
  console.log('Testing MongoDB Atlas connection...');
  console.log('URI present:', Boolean(process.env.MONGODB_URI));
  try {
    const conn = await connectDB();
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    console.log('Database name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('ReadyState:', conn.connection.readyState);
    await conn.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('ERROR connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
}

testConnection();
