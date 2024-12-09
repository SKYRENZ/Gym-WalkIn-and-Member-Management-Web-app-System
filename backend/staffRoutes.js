const express = require('express');
const pool = require('./db');
const router = express.Router();

router.post('/staff', async (req, res) => {
    const { name, role, password, contactInfo } = req.body;

    const query = `
        INSERT INTO Staff (name, role, password, contact_info)
        VALUES ($1, $2, $3, $4) RETURNING staff_id;
    `;

    try {
        const client = await pool.connect();
        const result = await client.query(query, [name, role, password, contactInfo]);
        client.release();
        res.status(201).json({ staff_id: result.rows[0].staff_id });
    } catch (err) {
        console.error('Error creating staff account:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;