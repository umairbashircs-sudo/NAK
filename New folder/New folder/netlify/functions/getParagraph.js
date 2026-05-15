const axios = require('axios');
const cheerio = require('cheerio');

const levels = {
  1: ["اب تب کب جب ہم تم", "یہ وہ اس ان جن", "کل چل پل مل دل", "سب رب کب تب اب"],
  2: ["یہ ایک خوبصورت کتاب ہے۔", "میں روزانہ سکول جاتا ہوں۔", "علم حاصل کرنا فرض ہے۔", "محنت میں عظمت ہے۔"],
  3: ["اردو ہماری قومی زبان ہے۔ یہ بہت میٹھی اور خوبصورت ہے۔ پاکستان میں اردو بولی اور سمجھی جاتی ہے۔"],
  4: ["علامہ اقبال نے نوجوانوں کو شاہین سے تشبیہ دی ہے۔ ان کا ماننا تھا کہ نوجوان ہی قوم کا اصل مستقبل اور سرمایہ ہیں۔"],
  5: ["تعلیم کسی بھی قوم کی ترقی کے لیے انتہائی ضروری ہے۔ یہ انسان کو شعور بخشتی ہے اور جہالت کے اندھیرے سے نکال کر روشنی کی طرف لاتی ہے۔"],
  6: ["پانی زندگی کی بنیادی ضرورت ہے۔ ہمیں پانی کو ضائع ہونے سے بچانا چاہیے تاکہ آنے والی نسلیں بھی اس نعمت سے فائدہ اٹھا سکیں۔"],
  7: ["کھیل کود انسانی صحت کے لیے بہت مفید ہیں۔ ان سے نہ صرف جسمانی فٹنس برقرار رہتی ہے بلکہ ذہنی تناؤ بھی کم ہوتا ہے۔"],
  8: ["انٹرنیٹ کی بدولت آج پوری دنیا ایک گلوبل ولیج بن چکی ہے۔ ہم سیکنڈوں میں دنیا کے کسی بھی کونے میں موجود معلومات تک رسائی حاصل کر سکتے ہیں۔"],
  9: ["موسمیاتی تبدیلی اس وقت دنیا کا سب سے بڑا مسئلہ ہے۔ درخت کاٹنا اور آلودگی پھیلانا ماحولیات کو تباہ کر رہا ہے۔ ہمیں مل کر اس کرہ ارض کو بچانے کے لیے زیادہ سے زیادہ درخت لگانے ہوں گے۔"]
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
    if (level === 1) {
      text = Array(15).fill(text).join(' ');
    } else if (level === 2) {
      text = Array(5).fill(text).join(' ');
    } else if (level >= 3 && level <= 5) {
      text = Array(3).fill(text).join(' ');
    } else if (level >= 6 && level <= 9) {
      text = Array(2).fill(text).join(' ');
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
