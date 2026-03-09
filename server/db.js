const { MongoClient } = require('mongodb');
const { setServers } = require('node:dns/promises');
require('dotenv').config();

// Фікс для DNS: примусово використовуємо Cloudflare та Google
setServers(['1.1.1.1', '8.8.8.8']);
console.log('DNS servers set: 1.1.1.1, 8.8.8.8');

const client = new MongoClient(process.env.NEXT_PUBLIC_DB_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
});

let db;

async function connectDB() {
    if (!db) {
        try {
            await client.connect();
            db = client.db(process.env.NEXT_PUBLIC_DB_NAME);
            console.log('Connected to MongoDB Atlas (via custom DNS)');
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err.message);
            throw err;
        }
    }
    return db;
}

module.exports = connectDB;