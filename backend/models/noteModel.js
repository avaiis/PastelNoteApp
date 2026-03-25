const db = require('../config/db');

const Note = {
    // 1. GET semua ctt user tertentu
    getByUserId: (userId, callback) => {
        const sql = 'SELECT *, COALESCE(updated_at, created_at) AS last_activity FROM notes WHERE user_id = ? ORDER BY last_activity DESC';
        db.query(sql, [userId], callback);
    },

    // 2. POST ctt baru
    create: (data, callback) => {
        const sql = 'INSERT INTO notes (user_id, title, content, category, mood) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [data.user_id, data.title, data.content, data.category, data.mood || null], callback);
    },

    // 3. UPDATE ctt - dinamis, hanya kolom yang dikirim yang ter-update
    update: (noteId, data, callback) => {
        const allowed = ['title', 'content', 'category', 'mood', 'is_favorite', 'is_archive', 'is_delete'];

        // Filter: hanya masukkan kolom yang nilainya bukan undefined
        const fields = allowed.filter(col => data[col] !== undefined);

        if (fields.length === 0) {
            return callback(new Error('No fields were updated'));
        }

        // cek yg diupdate itu isi catatan
        const contentFields = ['title', 'content', 'category', 'mood'];
        const isEditingContent = fields.some(col => contentFields.includes(col));

        let setCols = fields.map(col => `${col} = ?`).join(', ');

        if (isEditingContent) {
            setCols += ', updated_at = NOW()';
        }

        const values  = fields.map(col => data[col]);

        values.push(noteId, data.user_id);

        const sql = `UPDATE notes SET ${setCols} WHERE note_id = ? AND user_id = ?`;
        db.query(sql, values, callback);
    },

    // 4. DELETE ctt permanen
    delete: (noteId, userId, callback) => {
        const sql = 'DELETE FROM notes WHERE note_id = ? AND user_id = ?';
        db.query(sql, [noteId, userId], callback);
    }
};

module.exports = Note;