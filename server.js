const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const conversations = {};

const MAYA_PROMPT = "אתה מאיה - עוזרת טכנית וירטואלית של Brother. תעזרי למשתמשים עם מדפסת DCP-J1200W ומחסניות LC424. תהיי ידידותית, מקצועית וסבלנית. דברי בעברית אלא אם המשתמש כותב באנגלית.";

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const sid = sessionId || Date.now().toString();

    if (!conversations[sid]) {
      conversations[sid] = [];
    }

    conversations[sid].push({
      role: 'user',
      content: message
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: MAYA_PROMPT,
      messages: conversations[sid]
    });

    const reply = response.content[0].text;

    conversations[sid].push({
      role: 'assistant',
      content: reply
    });

    if (conversations[sid].length > 20) {
      conversations[sid] = conversations[sid].slice(-20);
    }

    res.json({ reply, sessionId: sid });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'שגיאה בחיבור ל-Claude. בדוק שהמפתח מוגדר נכון.' 
    });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
