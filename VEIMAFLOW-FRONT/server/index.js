require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5173';

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  })
);

// In-memory "database" (for demo purposes only)
const users = [];
let nextId = 1;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'VEIMANFLOW API (exemplo)' });
});

// Register
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nextId++, name, email: email.toLowerCase(), passwordHash };
  users.push(user);
  const token = signToken({ id: user.id });
  return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id });
  return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

// Authentication middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing Authorization' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /auth/me
app.get('/auth/me', requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.listen(PORT, () => {
  console.log(`VEIMANFLOW API (exemplo) rodando na porta ${PORT}`);
});
