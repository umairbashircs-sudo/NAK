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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    try {
      await connectToDatabase();
      const newProgress = new Progress(data);
      await newProgress.save();
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Progress saved successfully', progress: newProgress })
      };
    } catch (dbError) {
      // Return 200 anyway so frontend fallback localstorage kicks in gracefully or handles it
      throw new Error("DB Error: " + dbError.message);
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
