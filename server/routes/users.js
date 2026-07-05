import { Router } from 'express';
import { getDb } from '../db.js';
import bcrypt from 'bcryptjs';

const router = Router();

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await getDb().collection('users').findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: Date.now(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedEmail === 'admin@shopease.com' ? 'admin' : 'user',
      joinedAt: new Date().toISOString(),
      loginHistory: [],
    };

    await getDb().collection('users').insertOne(newUser);

    const { password: _, _id, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const foundUser = await getDb().collection('users').findOne({ email: normalizedEmail });
    if (!foundUser) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const passwordMatches = bcrypt.compareSync(password, foundUser.password);
    if (!passwordMatches) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const now = new Date().toISOString();
    const loginHistory = (foundUser.loginHistory || []).concat(now);

    // Ensure admin@shopease.com always has admin role
    const role = normalizedEmail === 'admin@shopease.com' ? 'admin' : foundUser.role;

    await getDb().collection('users').updateOne(
      { _id: foundUser._id },
      { $set: { lastLogin: now, loginHistory, role } }
    );

    const { password: _, _id, ...userWithoutPassword } = foundUser;
    res.json({ success: true, user: { ...userWithoutPassword, lastLogin: now, loginHistory, role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users — all users (admin)
router.get('/', async (_req, res) => {
  try {
    const users = await getDb()
      .collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
