const axios = require('axios');
const cheerio = require('cheerio');

const levels = {
  1: ["اب تب کب جب ہم تم", "یہ وہ اس ان جن", "کل چل پل مل دل", "سب رب کب تب اب"],
  2: ["یہ ایک خوبصورت کتاب ہے۔", "میں روزانہ سکول جاتا ہوں۔", "علم حاصل کرنا فرض ہے۔", "محنت میں عظمت ہے۔"]
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
  for (let i = 0; i < 4; i++) {
    const site = newsSites[Math.floor(Math.random() * newsSites.length)];
    try {
      const response = await axios.get(site, { timeout: 8000 });
      const $ = cheerio.load(response.data);
      const validParagraphs = [];
      
      $('p').each((idx, el) => {
        const text = $(el).text().trim();
        // Look for actual Urdu text content
        if (text.length > 50 && text.includes(' ')) {
          validParagraphs.push(text);
        }
      });
      
      // Shuffle the paragraphs to get a random mix
      validParagraphs.sort(() => 0.5 - Math.random());
      
      // Concatenate paragraphs to make a HUGE text block so they never run out
      let combinedText = "";
      for (const p of validParagraphs) {
        combinedText += p + " ";
        if (combinedText.length > 2500) break;
      }
      
      if (combinedText.length > 200) {
        return combinedText.trim();
      }
    } catch (err) {
      console.log(`Failed to scrape ${site}:`, err.message);
    }
  }
  throw new Error("Could not fetch enough text from news sites");
}

exports.handler = async (event, context) => {
  try {
    const level = parseInt(event.queryStringParameters?.level || "1");
    let text = "";

    if (level === 1 || level === 2) {
      const options = levels[level];
      text = options[Math.floor(Math.random() * options.length)];
      // Multiply text until it's very long
      while (text.length < 2000) {
        text += " " + options[Math.floor(Math.random() * options.length)];
      }
    } else {
      // Levels 3 to 10 all use lengthy news paragraphs
      try {
        text = await scrapeNewsParagraph();
        // If it's still somehow short, duplicate it
        while (text.length > 0 && text.length < 2000) {
          text += " " + text;
        }
      } catch (err) {
        text = "حالیہ خبروں کے مطابق ملک بھر میں گرمی کی شدت میں اضافہ متوقع ہے۔ محکمہ موسمیات نے عوام کو احتیاطی تدابیر اختیار کرنے کی ہدایت کی ہے۔ حکومت کی جانب سے نئے ترقیاتی منصوبوں کا اعلان کیا گیا ہے جس سے ملکی معیشت کو سہارا ملے گا۔";
        while (text.length < 2000) {
          text += " " + text;
        }
      }
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
