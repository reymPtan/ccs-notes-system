const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data folder exists
const dbPath = path.join(__dirname, 'data', 'ccs_notes.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// ================= AUTH ROUTES =================

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      (err) => {
        if (err) {
          return res.status(400).json({ error: 'User already exists' });
        }
        res.json({ message: 'Registered successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({ userId: user.id });
    }
  );
});

// ================= NOTES ROUTES =================

// Get notes
app.get('/api/notes/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM notes WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notes' });
      }
      res.json(rows);
    }
  );
});

// Add note
app.post('/api/notes', (req, res) => {
  const { userId, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Empty note' });
  }

  db.run(
    'INSERT INTO notes (user_id, content) VALUES (?, ?)',
    [userId, content],
    () => {
      res.json({ message: 'Note added' });
    }
  );
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM notes WHERE id = ?',
    [id],
    () => {
      res.json({ message: 'Note deleted' });
    }
  );
});

// ================= SERVER START =================

// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CCS Notes Backend running on port ${PORT}`);
});
