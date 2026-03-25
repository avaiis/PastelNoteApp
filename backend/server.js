const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Registrasi Route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const noteRoutes = require('./routes/noteRoutes');
console.log("noteRoutes telah dimuat!");
app.use('/api/notes', noteRoutes);

// Route Utama
app.get('/', (req, res) => {
    res.send('API Pastel Note App Start');
});

// Run server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

