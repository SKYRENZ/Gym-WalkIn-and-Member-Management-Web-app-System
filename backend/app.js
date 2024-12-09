const express = require('express');
const bodyParser = require('body-parser');
const staffRoutes = require('./staffRoutes');  // Import the staffRoutes

const app = express();
const port = 5173;

app.use(bodyParser.json());
app.use('/api', staffRoutes);  // Use the staffRoutes

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});