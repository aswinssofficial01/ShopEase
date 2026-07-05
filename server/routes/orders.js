import { Router } from 'express';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

const router = Router();

// POST /api/orders — create order
router.post('/', async (req, res) => {
  try {
    const order = {
      ...req.body,
      id: Date.now(),
      status: 'Processing',
      createdAt: new Date().toISOString(),
    };
    await getDb().collection('orders').insertOne(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — all orders (admin)
router.get('/', async (_req, res) => {
  try {
    const orders = await getDb().collection('orders').find().sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/user/:email — orders for a specific user
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await getDb()
      .collection('orders')
      .find({ 'user.email': req.params.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id — update order status (admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await getDb().collection('orders').findOneAndUpdate(
      { $or: [
        { _id: ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null },
        { id: Number(req.params.id) },
      ]},
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
