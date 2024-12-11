const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: ['GET', 'POST'], // Specify allowed methods
};

module.exports = cors(corsOptions);