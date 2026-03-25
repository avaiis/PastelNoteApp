const db = require('../config/db');

const User = {
    register: (data, callback) => {
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [data.username, data.email, data.password], callback);
    },

    findByUsername: (username, callback) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.query(sql, [username], callback);
    }
};

module.exports = User;