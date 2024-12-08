const pool = require('./db'); // Adjust the path if necessary

const testConnection = async () => {
    try {
        const client = await pool.connect(); // Get a client from the pool
        console.log('Connected to the database successfully!');

        // Optionally, you can run a simple query to test
        const res = await client.query('SELECT NOW()'); // Get the current time
        console.log('Current time:', res.rows[0]);

        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await pool.end(); // Close the pool when done
    }
};

testConnection();