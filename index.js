require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const STORE_NAME = process.env.STORE_NAME || "The Store";

const STORE_INFO = `You are a helpful WhatsApp customer service assistant for ${STORE_NAME}.

STORE DETAILS:
- Name: ${STORE_NAME}
- Hours: Monday-Saturday 9am-6pm, Sunday 10am-4pm
- Location: Kingston, Jamaica
- Phone: Available on WhatsApp
- We sell: Wholesale goods
- Return policy: 7 days with receipt, unworn items only
- Delivery: Available islandwide, 2-3 business days
- Payment: Cash, card, bank transfer accepted

RULES:
- Be friendly, warm, and professional
- Keep responses SHORT (2-4 sentences max) - this is WhatsApp, not email
- If you don't know something specific, say you'll check and ask them to hold on
- Always end with a helpful follow-up question or offer
- Use emojis sparingly (1-2 max per message)
- Write in a natural, conversational tone`;

// ─── WEBHOOK VERIFICATION ─────────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    res.status(200).send(challenge);
  } else {
    console.error("❌ Webhook verification failed");
    res.sendStatus(403);
  }
});

// ─── RECEIVE MESSAGES ─────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== "whatsapp_business_account") return res.sendStatus(404);

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return res.sendStatus(200);

    const message = messages[0];
    const from = message.from;
    const msgType = message.type;

    if (msgType !== "text") {
      await sendWhatsAppMessage(from, "Hi! 👋 I can only read text messages right now. Type your question and I'll help you out!");
      return res.sendStatus(200);
    }

    const userText = message.text.body;
    console.log(`📩 Message from ${from}: ${userText}`);

    const aiReply = await getAIResponse(userText);
    console.log(`🤖 AI reply: ${aiReply}`);

    await sendWhatsAppMessage(from, aiReply);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error handling message:", err.message);
    res.sendStatus(500);
  }
});

// ─── SEND WHATSAPP MESSAGE ────────────────────────────────────────────────────
async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ─── GET AI RESPONSE FROM GROQ (FREE) ────────────────────────────────────────
async function getAIResponse(userMessage) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        messages: [
          { role: "system", content: STORE_INFO },
          { role: "user", content: userMessage }
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("❌ Groq API error:", err.response?.data || err.message);
    return "Sorry, I'm having a little trouble right now. Please call or WhatsApp us directly and we'll sort you out! 😊";
  }
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "✅ WhatsApp AI Bot is running!", store: STORE_NAME });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));