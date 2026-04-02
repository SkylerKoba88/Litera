"use strict";
import bcrypt from 'bcrypt';
// This file handles routes to server-side
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const imagekit_1 = require("./imagekit");
const promise_1 = __importDefault(require("mysql2/promise"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.ALLOWED_ORIGIN ?? '*', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
// database pool
// note: you must start the SQL connection first before running the server
// note: you must restart the server before running the front end
// type npm run build:server, then type node dist-server/server.js to start the server
// open a separate terminal and type npm run dev to start the front end
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? 'CrimsonCityWalls44!',
    database: process.env.DB_NAME ?? 'litera',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// helper
async function getUserById(id) {
    const [rows] = await pool.query('SELECT id, username, firstname, lastname, email, dob FROM users WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function checkUniqueUsernameEmail(username, email, idToIgnore) {
    const conditions = [];
    const params = [];
    if (username) {
        conditions.push('username = ?');
        params.push(username);
    }
    if (email) {
        conditions.push('email = ?');
        params.push(email);
    }
    if (conditions.length === 0) {
        return [];
    }
    let sql = `SELECT id, username, email FROM users WHERE (${conditions.join(' OR ')})`;
    if (typeof idToIgnore === 'number' && !Number.isNaN(idToIgnore)) {
        sql += ' AND id <> ?';
        params.push(idToIgnore);
    }
    const [rows] = await pool.query(sql, params);
    return Array.isArray(rows) ? rows : [];
}
// API endpoints
// users
// check if username/email is unique (for validation on frontend)
app.get('/api/users/check-unique', async (req, res) => {
    const username = typeof req.query.username === 'string' ? req.query.username : undefined;
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const rawId = typeof req.query.id === 'string' ? req.query.id : undefined;
    const id = rawId && !Number.isNaN(Number(rawId)) ? Number(rawId) : undefined;
    if (!username && !email) {
        return res.status(400).json({ error: 'username/email required' });
    }
    try {
        const conflicts = await checkUniqueUsernameEmail(username, email, id);
        res.json({ unique: conflicts.length === 0, conflicts });
    }
    catch (e) {
        console.error('check unique error', e);
        res.status(500).json({ error: 'Server error' });
    }
});
// search user by id
app.get('/api/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
        return res.status(400).json({ error: 'Invalid user id' });
    try {
        const user = await getUserById(id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (e) {
        console.error('user fetch error', e);
        res.status(500).json({ error: 'Server error' });
    }
});
const USERNAME_REGEX = /^[A-Za-z0-9_]{1,20}$/;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
app.put('/api/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { username, email, firstname, lastname, dob } = req.body || {};
    if (!Number.isInteger(id) || id < 1)
        return res.status(400).json({ error: 'Invalid user id' });
    if (!username || !USERNAME_REGEX.test(username))
        return res.status(400).json({ error: 'Bad username' });
    if (!email || !EMAIL_REGEX.test(email))
        return res.status(400).json({ error: 'Bad email' });
    try {
        const conflicts = await checkUniqueUsernameEmail(username, email, id);
        if (conflicts.length > 0) {
            return res.status(409).json({ error: 'Username or email already in use', conflicts });
        }
        await pool.query(`UPDATE users SET username = ?, email = ?, firstname = ?, lastname = ?, dob = ? WHERE id = ?`, [username, email, firstname, lastname, dob, id]);
        const user = await getUserById(id);
        res.json({ success: true, user });
    }
    catch (e) {
        console.error('update profile error', e);
        res.status(500).json({ error: 'Server error' });
    }
});
// create user
app.post('/api/users', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      dob,
      username,
      email,
      password,
    } = req.body ?? {};

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await pool.query(
      `
      INSERT INTO users
        (firstname, lastname, dob, username, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [firstname, lastname, dob ?? null, username, email, passwordHash]
    );

    // Respond with safe user object
    res.status(201).json({
      id: result.insertId,
      username,
      email,
    });
  } catch (err) {
    console.error('Create user error:', err);

    // MySQL duplicate key error (username/email unique constraint)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Username or email already exists',
      });
    }

    res.status(500).json({
      error: 'Server error',
    });
  }
});

//login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body ?? {};

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Identifier and password required',
      });
    }

    // Find user by username OR email
    const [rows] = await pool.query(
      `
      SELECT id, username, email, password
      FROM users
      WHERE username = ? OR email = ?
      LIMIT 1
      `,
      [identifier, identifier]
    );

    if (!rows.length) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const user = rows[0];

    // Compare password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Successful login
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Server error',
    });
  }
});


// imagekit
app.get('/api/imagekit/auth', (_req, res) => {
    res.json((0, imagekit_1.getAuthParams)());
});
app.post('/api/imagekit/upload-base64', async (_req, res) => {
    // body can be undefined if client sends no JSON, guard against that with ||
    const { base64, fileName, folder } = (_req.body || {});
    if (!base64)
        return res.status(400).json({ error: 'base64 is required' });
    const b64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(b64, 'base64');
    try {
        const result = await (0, imagekit_1.uploadBuffer)(buffer, { fileName, folder });
        res.status(201).json(result);
    }
    catch (e) {
        console.error('[IK] upload failed:', e);
        res.status(500).json({ error: 'Upload failed' });
    }
});
// serve Vite build (connect to client)
const distDir = path_1.default.join(process.cwd(), 'dist'); // Vite default outDir is "dist"
app.use(express_1.default.static(distDir));
app.get(/^\/(?!api).*/, (req, res) => {
    if (req.path.startsWith('/api'))
        return res.status(404).json({ error: 'Not found' });
    res.sendFile(path_1.default.join(distDir, 'index.html'));
});
if (process.env.NODE_ENV !== "test") {
    app.listen(process.env.PORT || 3002, () => {
        console.log(`ImageKit auth server listening on ${process.env.PORT || 3002}`);
    });
}
exports.default = app;
