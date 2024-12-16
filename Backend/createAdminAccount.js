// createAdminAccount.js
const { Pool } = require('pg');
const readline = require('readline');

// Create a new pool instance
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'GymDB', // Your database name
    password: 'CHOCOLATES', // Your PostgreSQL password
    port: 5432,
});

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to validate input
function validateInput(name, role, password, contactInfo) {
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    if (!role || !['admin', 'staff'].includes(role.toLowerCase())) {
        errors.push('Role must be either "admin" or "staff"');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!contactInfo || !contactInfo.includes('@')) {
        errors.push('Valid email is required');
    }

    return errors;
}

// Function to add staff account
async function addStaffAccount(name, role, password, contactInfo) {
    // Validate input first
    const validationErrors = validateInput(name, role, password, contactInfo);
    
    if (validationErrors.length > 0) {
        console.error('Validation Errors:');
        validationErrors.forEach(error => console.error(`- ${error}`));
        return false;
    }

    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        // Check if an account with the same name or contact info already exists
        const checkExistingQuery = `
            SELECT * FROM Staff 
            WHERE name = $1 OR contact_info = $2
        `;
        const checkResult = await client.query(checkExistingQuery, [name, contactInfo]);

        if (checkResult.rows.length > 0) {
            console.error('An account with this name or contact information already exists.');
            await client.query('ROLLBACK');
            return false;
        }

        // Insert new staff account
        const insertQuery = `
            INSERT INTO Staff (name, role, password, contact_info) 
            VALUES ($1, $2, $3, $4) 
            RETURNING staff_id;
        `;

        const result = await client.query(insertQuery, [
            name, 
            role.toLowerCase(), 
            password, 
            contactInfo
        ]);

        // Commit the transaction
        await client.query('COMMIT');

        console.log(`Staff account created successfully!`);
        console.log(`Staff ID: ${result.rows[0].staff_id}`);
        return true;

    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error creating staff account:', error);
        return false;
    } finally {
        // Release the client back to the pool
        client.release();
    }
}

// Interactive prompt function
function promptForAccountDetails() {
    rl.question('Enter Name: ', (name) => {
        rl.question('Enter Role (admin/staff): ', (role) => {
            rl.question('Enter Password: ', (password) => {
                rl.question('Enter Contact Info (email): ', async (contactInfo) => {
                    try {
                        const success = await addStaffAccount(name, role, password, contactInfo);
                        
                        if (success) {
                            console.log('Account created successfully!');
                        } else {
                            console.log('Failed to create account.');
                        }
                        
                        rl.close();
                        await pool.end();
                    } catch (error) {
                        console.error('Unexpected error:', error);
                        rl.close();
                        await pool.end();
                    }
                });
            });
        });
    });
}

// Run the script
promptForAccountDetails();