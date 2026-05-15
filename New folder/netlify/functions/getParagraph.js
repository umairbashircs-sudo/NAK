const axios = require('axios');
const cheerio = require('cheerio');

const levels = {
  1: ["ا س د ف گ", "ح ج ک ل", "ا س د ف گ ح ج ک ل", "د ف گ ک ل", "ا س ح ج"],
  2: ["ق و ع ر ت", "ی ء ا و پ", "ق و ع ر ت ی ء ا و پ", "ر ت ی ق و", "ع ر ا و پ"],
  3: ["ز خ ش غ ظ", "ط ب ن م", "ز خ ش غ ظ ط ب ن م", "ش غ ظ ب ن", "ز خ ط م"],
  4: ["آ ۂ ؤ ۃ ژ", "ض ص ث", "آ ۂ ؤ ۃ ژ ض ص ث", "ؤ ۃ ژ ص ث", "آ ۂ ض"],
  5: ["اب تب کب جب ہم تم", "یہ وہ اس ان جن", "کل چل پل مل دل", "سب رب کب تب اب"],
  6: ["کتاب قلم وقت", "سکول استاد محنت", "پانی کھانا سونا", "دنیا زمین آسمان"],
  7: ["یہ ایک خوبصورت کتاب ہے۔", "میں روزانہ سکول جاتا ہوں۔", "علم حاصل کرنا فرض ہے۔", "محنت میں عظمت ہے۔"],
  8: ["قرآنِ مجید ایک مُقَدَّس کتاب ہے۔", "پاکستان 14 اگست 1947 کو بنا۔", "میری عمر 25 سال ہے۔ (یہ سچ ہے!)"],
  9: [
    "اردو ہماری قومی زبان ہے۔ اس کی ترویج اور ترقی ہم سب کی ذمہ داری ہے۔ یہ زبان بہت میٹھی اور خوبصورت ہے۔",
    "علامہ اقبال نے نوجوانوں کو شاہین سے تشبیہ دی ہے۔ ان کا ماننا تھا کہ نوجوان قوم کا مستقبل ہیں۔",
    "تعلیم کسی بھی قوم کی ترقی کے لیے انتہائی ضروری ہے۔ یہ انسان کو شعور بخشتی ہے اور اندھیرے سے نکالتی ہے۔"
  ]
};

const newsSites = [
  'https://www.bbc.com/urdu',
  'https://urdu.geo.tv/',
  'https://www.dawnnews.tv/',
  'https://jang.com.pk/',
  'https://www.express.pk/',
  'https://www.nawaiwaqt.com.pk/',
  'https://www.dailyausaf.com/',
  'https://www.humsub.com.pk/'
];

async function scrapeNewsParagraph() {
  // Try up to 3 random sites to find a paragraph
  for (let i = 0; i < 3; i++) {
    const site = newsSites[Math.floor(Math.random() * newsSites.length)];
    try {
      const response = await axios.get(site, { timeout: 5000 });
      const $ = cheerio.load(response.data);
      const paragraphs = [];
      
      $('p').each((idx, el) => {
        const text = $(el).text().trim();
        // Urdu paragraphs usually have spaces and are long enough
        if (text.length > 80 && text.length < 500 && text.includes(' ')) {
          paragraphs.push(text);
        }
      });
      
      if (paragraphs.length > 0) {
        return paragraphs[Math.floor(Math.random() * paragraphs.length)];
      }
    } catch (err) {
      console.log(`Failed to scrape ${site}:`, err.message);
    }
  }
  throw new Error("Could not fetch from news sites");
}

exports.handler = async (event, context) => {
  try {
    const level = parseInt(event.queryStringParameters?.level || "1");
    let text = "";

    if (level >= 1 && level <= 9) {
      const options = levels[level];
      text = options[Math.floor(Math.random() * options.length)];
    } else if (level === 10) {
      try {
        text = await scrapeNewsParagraph();
      } catch (err) {
        // Fallback for level 10 if scraping fails
        text = "حالیہ خبروں کے مطابق، ملک بھر میں گرمی کی شدت میں اضافہ متوقع ہے۔ محکمہ موسمیات نے عوام کو احتیاطی تدابیر اختیار کرنے کی ہدایت کی ہے۔";
      }
    } else {
      text = levels[1][0];
    }

    // Multiply shorter texts so user has enough to type for a minute
    if (level >= 1 && level <= 6) {
      text = Array(15).fill(text).join(' ');
    } else if (level === 7 || level === 8) {
      text = Array(5).fill(text).join(' ');
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
