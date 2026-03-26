const Note = require('../models/noteModel');

exports.getNotesByUser = (req, res) => {
    const userId = req.params.user_id;
    Note.getByUserId(userId, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createNote = (req, res) => {
    const { user_id, title, content, category, mood } = req.body;

    // Validasi title tidak boleh kosong
    if (!title || title.trim() === "") {
        return res.status(400).json({ 
            message: "Column 'title' cannot be null"
        });
    }

    Note.create({ user_id, title, content, category, mood }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Note added successfully", note_id: result.insertId });
    });
};

exports.updateNote = (req, res) => {
    const noteId = req.params.note_id;
    const { user_id, title, content, category, mood, is_favorite, is_archive, is_delete } = req.body;

     // Validasi title tidak boleh kosong
    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({ message: "Column 'title' cannot be null" });
    }

    const fields = { user_id };

    if (title !== undefined) fields.title = title;
    if (content !== undefined) fields.content = content;
    if (category !== undefined) fields.category = category;
    if (mood !== undefined) fields.mood = mood;
    if (is_favorite !== undefined) fields.is_favorite = is_favorite;
    if (is_archive !== undefined) fields.is_archive = is_archive;
    if (is_delete !== undefined) fields.is_delete = is_delete;

    Note.update(noteId, fields, (err, result) => {
        if (err) {
            console.log('ERROR:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Note not found or unauthorized" });

        res.json({ message: "Note updated successfully" });
    });
};

exports.deleteNote = (req, res) => {
    const noteId = req.params.note_id;
    const { user_id } = req.body;
    Note.delete(noteId, user_id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Note not found or unauthorized" });
        res.json({ message: "Note deleted successfully" });
    });
};