import { Router } from 'express';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

const router = Router();

// GET /api/products — list all
router.get('/', async (_req, res) => {
  try {
    const products = await getDb().collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res) => {
  try {
    const product = await getDb().collection('products').findOne({
      $or: [
        { _id: ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null },
        { id: Number(req.params.id) },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — add product (admin)
router.post('/', async (req, res) => {
  try {
    const product = { ...req.body, id: Date.now(), createdAt: new Date().toISOString() };
    await getDb().collection('products').insertOne(product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — update product (admin)
router.put('/:id', async (req, res) => {
  try {
    const { _id, ...updates } = req.body;
    const result = await getDb().collection('products').findOneAndUpdate(
      { $or: [
        { _id: ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null },
        { id: Number(req.params.id) },
      ]},
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — delete product (admin)
router.delete('/:id', async (req, res) => {
  try {
    const result = await getDb().collection('products').deleteOne({
      $or: [
        { _id: ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null },
        { id: Number(req.params.id) },
      ],
    });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
