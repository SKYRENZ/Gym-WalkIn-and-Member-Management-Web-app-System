const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = {
  corsOptions
};