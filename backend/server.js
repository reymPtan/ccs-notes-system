
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./data/ccs_notes.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT
  )`);
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users(username,password) VALUES (?,?)",
    [username, hash],
    err => err ? res.status(400).json({error:"User already exists"}) : res.json({message:"Registered"})
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=?", [username], async (err, user) => {
    if (!user) return res.status(401).json({error:"Invalid credentials"});
    const ok = await bcrypt.compare(password, user.password);
    ok ? res.json({userId:user.id}) : res.status(401).json({error:"Wrong password"});
  });
});

app.get('/api/notes/:userId', (req, res) => {
  db.all("SELECT * FROM notes WHERE user_id=?", [req.params.userId],
    (_, rows) => res.json(rows));
});

app.post('/api/notes', (req, res) => {
  const { userId, content } = req.body;
  db.run("INSERT INTO notes(user_id,content) VALUES (?,?)",
    [userId, content], () => res.json({message:"Note added"}));
});

app.delete('/api/notes/:id', (req, res) => {
  db.run("DELETE FROM notes WHERE id=?", [req.params.id],
    () => res.json({message:"Deleted"}));
});

app.listen(3000, () => console.log("CCS Backend running at http://localhost:3000"));
