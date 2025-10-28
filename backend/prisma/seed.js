// Simple seed script to create experiences + slots
const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookit';

const SlotSchema = new mongoose.Schema({
  date: Date,
  capacity: Number,
  bookedCount: { type: Number, default: 0 },
  priceAdjust: { type: Number, default: 0 }
}, { _id: true });

const ExperienceSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  location: String,
  price: Number,
  imageUrl: String,
  slots: [SlotSchema]
}, { timestamps: true });

const Experience = mongoose.model('Experience', ExperienceSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected for seeding');
  await Experience.deleteMany({});

  const data = [
    {
      title: 'Sunset Kayak Tour',
      slug: 'sunset-kayak',
      description: 'Enjoy kayaking at sunset through mangroves.',
      location: 'Goa, India',
      price: 2500 * 100,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      slots: [
        { date: new Date(Date.now() + 7*24*60*60*1000), capacity: 8, priceAdjust: 0 },
        { date: new Date(Date.now() + 14*24*60*60*1000), capacity: 8, priceAdjust: 0 }
      ]
    },
    {
      title: 'Mountain Sunrise Trek',
      slug: 'mountain-trek',
      description: 'Early morning trek to witness a spectacular sunrise.',
      location: 'Mahabaleshwar, India',
      price: 1800 * 100,
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
      slots: [
        { date: new Date(Date.now() + 3*24*60*60*1000), capacity: 12, priceAdjust: 0 },
        { date: new Date(Date.now() + 10*24*60*60*1000), capacity: 12, priceAdjust: 0 }
      ]
    }
  ];

  await Experience.insertMany(data);
  console.log('Seed data inserted');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
