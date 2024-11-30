const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'GYM',
    password: '',
    port: 5432,
});

app.use(bodyParser.json());

// Route to create a table
app.post('/create-table', async (req, res) => {
    const { tableName, columns } = req.body;
    const query = `CREATE TABLE ${tableName} (${columns})`;
    await pool.query(query);
    res.send(`Table ${tableName} created successfully.`);
});

// Route to run a custom query
app.post('/query', async (req, res) => {
    const { query } = req.body;
    const result = await pool.query(query);
    res.json(result.rows);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
app.post('/add', async (req, res) => {
    const { name, age } = req.body;
    const result = await pool.query('INSERT INTO example_table (name, age) VALUES ($1, $2) RETURNING *', [name, age]);
    res.json(result.rows[0]);
});

