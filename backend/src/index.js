const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookit';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const SlotSchema = new mongoose.Schema({
  date: Date,
  capacity: Number,
  bookedCount: { type: Number, default: 0 },
  priceAdjust: { type: Number, default: 0 } // cents
}, { _id: true });

const ExperienceSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  location: String,
  price: Number, // cents
  imageUrl: String,
  slots: [SlotSchema]
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  experienceId: mongoose.Types.ObjectId,
  slotId: mongoose.Types.ObjectId,
  name: String,
  email: String,
  phone: String,
  quantity: Number,
  amount: Number,
  promoCode: String,
  status: { type: String, default: 'CONFIRMED' }
}, { timestamps: true });

const Experience = mongoose.model('Experience', ExperienceSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Promo codes
const PROMOS = {
  SAVE10: { type: 'percent', value: 10 },
  FLAT100: { type: 'flat', value: 10000 } // cents
};

// Routes
app.get('/api/experiences', async (req, res) => {
  const exps = await Experience.find().lean();
  res.json(exps);
});

app.get('/api/experiences/:id', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id).lean();
    if (!exp) return res.status(404).json({ error: 'Not found' });
    res.json(exp);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

app.post('/api/promo/validate', (req, res) => {
  const code = (req.body.code || '').toUpperCase();
  const found = PROMOS[code];
  if (!found) return res.json({ valid: false });
  res.json({ valid: true, promo: found });
});

// Booking with transaction to prevent double-booking
app.post('/api/bookings', async (req, res) => {
  const { slotId, name, email, phone, quantity = 1, promoCode } = req.body;
  if (!slotId || !name || !email) return res.status(400).json({ error: 'Missing fields' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find experience containing the slot
    const exp = await Experience.findOne({ 'slots._id': slotId }).session(session);
    if (!exp) throw new Error('Slot not found');

    const slot = exp.slots.id(slotId);
    const available = slot.capacity - slot.bookedCount;
    if (available < quantity) throw new Error('Not enough capacity');

    // Calculate amount
    let amount = (exp.price + (slot.priceAdjust || 0)) * quantity; // cents
    const promo = PROMOS[(promoCode || '').toUpperCase()];
    if (promo) {
      if (promo.type === 'percent') amount = Math.max(0, Math.round(amount * (100 - promo.value) / 100));
      else amount = Math.max(0, amount - promo.value);
    }

    // increment bookedCount
    slot.bookedCount += quantity;
    await exp.save({ session });

    const booking = await Booking.create([{
      experienceId: exp._id,
      slotId,
      name,
      email,
      phone,
      quantity,
      amount,
      promoCode: promo ? promoCode.toUpperCase() : null,
      status: 'CONFIRMED'
    }], { session });

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, booking: booking[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log('Server listening on', PORT));
