const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pastelnote_db'
});

db.connect((err) => {
    if(err) {
        console.error('Database Connection Failed: ' + err.message);
        return;
    }
    console.log('Database Connection Success with ID: ' + db.threadId);
});

module.exports = db;