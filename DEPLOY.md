# Deploy to Render — Step by Step

## STEP 1 — Push to GitHub
1. Go to github.com → New repository → name it `whatsapp-bot` → Create
2. Upload all files (drag & drop the folder contents)
3. Make sure .env is NOT uploaded (it's in .gitignore)

## STEP 2 — Deploy on Render
1. Go to render.com → Sign up free
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Name: whatsapp-bot
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"
6. Wait ~2 mins — you'll get a URL like: https://whatsapp-bot-xxxx.onrender.com

## STEP 3 — Add Environment Variables on Render
Go to your service → Environment → Add these:

| Key | Value |
|-----|-------|
| WHATSAPP_TOKEN | Your EAAB... token from Meta |
| PHONE_NUMBER_ID | Your number ID from Meta |
| VERIFY_TOKEN | mystore2024 (or whatever you chose) |
| ANTHROPIC_API_KEY | Your sk-ant-... key |
| STORE_NAME | Client's store name |

After adding, Render will redeploy automatically.

## STEP 4 — Connect Webhook on Meta Dashboard
1. Go to Meta Developer Dashboard
2. WhatsApp → Configuration → Webhook
3. Click "Edit"
4. Callback URL: `https://your-render-url.onrender.com/webhook`
5. Verify Token: `mystore2024` (must match what you set)
6. Click "Verify and Save"
7. Subscribe to: `messages`

## STEP 5 — Test It!
1. On Meta dashboard → API Setup → "To" field
2. Enter YOUR WhatsApp number
3. Send a test message
4. You should get a reply from the AI within seconds!

## CUSTOMIZE THE BOT
Edit the STORE_INFO section in index.js to match the client's:
- Store name
- Hours
- Location  
- Products they sell
- Return policy
- Delivery info
- Payment methods

## GOING LIVE (after demo is approved)
- Add client's real WhatsApp Business number to Meta app
- Generate a permanent token (the test one expires in 24hrs)
- Upgrade Meta app from Development to Live mode
