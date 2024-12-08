const pool = require('./db'); // Make sure to adjust the path if necessary

const addCustomer = async (name, contactInfo, membershipType, paymentInformation) => {
    const query = `
        INSERT INTO Customer (name, contact_info, membership_type, payment_information)
        VALUES ($1, $2, $3, $4) RETURNING customer_id;
    `;

    try {
        const client = await pool.connect(); // Get a client from the pool
        const res = await client.query(query, [name, contactInfo, membershipType, paymentInformation]);
        console.log('Customer added with ID:', res.rows[0].customer_id);
        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error adding customer:', err);
    }
};

// Example usage
addCustomer('John Doe', 'john.doe@example.com', 'Premium', 'Visa **** 1234');