const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'pastelnote_db',
    connectTimeout: 10000,
    enableKeepAlive: true
});

db.connect((err) => {
    if(err) {
        console.error('Database Connection Failed: ' + err.message);
        return;
    }
    console.log('Database Connection Success with ID: ' + db.threadId);
});

module.exports = db;