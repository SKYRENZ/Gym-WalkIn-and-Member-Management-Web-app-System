// db.js
const { Pool } = require('pg');

// Create a new pool instance
const pool = new Pool({
    user: 'postgres',         // Your PostgreSQL username
    host: 'localhost',              // Database host (usually localhost)
    database: 'GymDB', // Your database name
    password: 'CHOCOLATES',      // Your PostgreSQL password
    port: 5432,                     // Default PostgreSQL port
});

// Export the pool for use in other modules
module.exports = pool;