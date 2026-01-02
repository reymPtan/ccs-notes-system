const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data', 'ccs_notes.db');
const db = new sqlite3.Database(dbPath);

// Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    color TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    folder_id INTEGER,
    content TEXT,
    created_at TEXT
  )`);
});

// Auth
app.post('/api/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  db.run(
    "INSERT INTO users(username,password) VALUES (?,?)",
    [req.body.username, hash],
    err => err
      ? res.status(400).json({ error: "User exists" })
      : res.json({ message: "Registered" })
  );
});

app.post('/api/login', (req, res) => {
  db.get(
    "SELECT * FROM users WHERE username=?",
    [req.body.username],
    async (_, user) => {
      if (!user) return res.status(401).json({ error: "Invalid" });
      const ok = await bcrypt.compare(req.body.password, user.password);
      ok ? res.json({ userId: user.id }) : res.status(401).json({ error: "Invalid" });
    }
  );
});

// Profile
app.get('/api/user/:id', (req, res) => {
  db.get("SELECT username FROM users WHERE id=?", [req.params.id],
    (_, row) => res.json(row));
});

// Folders
app.get('/api/folders/:uid', (req, res) => {
  db.all("SELECT * FROM folders WHERE user_id=?", [req.params.uid],
    (_, rows) => res.json(rows));
});

app.post('/api/folders', (req, res) => {
  db.run(
    "INSERT INTO folders(user_id,name,color) VALUES (?,?,?)",
    [req.body.userId, req.body.name, req.body.color],
    () => res.json({ message: "Folder added" })
  );
});

// Notes
app.get('/api/notes/:uid', (req, res) => {
  db.all("SELECT * FROM notes WHERE user_id=?", [req.params.uid],
    (_, rows) => res.json(rows));
});

app.post('/api/notes', (req, res) => {
  db.run(
    "INSERT INTO notes(user_id,folder_id,content,created_at) VALUES (?,?,?,?)",
    [req.body.userId, req.body.folderId, req.body.content, new Date().toISOString()],
    () => res.json({ message: "Note added" })
  );
});

app.put('/api/notes/:id', (req, res) => {
  db.run("UPDATE notes SET content=? WHERE id=?",
    [req.body.content, req.params.id],
    () => res.json({ message: "Updated" }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on", PORT));
