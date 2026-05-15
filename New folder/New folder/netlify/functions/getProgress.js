const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) throw new Error('No MONGODB_URI found');
  const db = await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  cachedDb = db;
  return db;
}

const progressSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  wpm: Number,
  cpm: Number,
  accuracy: Number,
  errors: Number
});

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

exports.handler = async (event, context) => {
  try {
    await connectToDatabase();
    
    // Get recent history, sorted by date descending
    const history = await Progress.find().sort({ date: -1 }).limit(50);
    
    return {
      statusCode: 200,
      body: JSON.stringify(history)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
