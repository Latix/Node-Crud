const router = require('express').Router();
const axios = require('axios');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
var postmark = require("postmark");
const handlebars = require('handlebars');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get('/', (req, res) => {
  res.send("Welcome to services!")
});

router.get('/email', async (req, res) => {
  // Read the HTML content from the file
  const emailTemplatePath = path.join(__dirname, 'email.html');
  const htmlContent = fs.readFileSync(emailTemplatePath, 'utf-8');

  // Compile the Handlebars template
  const template = handlebars.compile(htmlContent);

  // Define your dynamic variables
  const variables = {
    name: 'John Doe',
    actionUrl: 'http://example.com'
  };

  // Replace the placeholders with actual values
  const htmlToSend = template(variables);

  // Send an email using Postmark
  const client = new postmark.ServerClient("2e9aa992-b951-4de8-8ee8-cac79a0ad590");

  await client.sendEmail({
    "From": "kamsi@infiuss.com",
    "To": "kamsi@infiuss.com",
    "Subject": "Hello from Postmark",
    "HtmlBody": htmlToSend,
    "TextBody": "Hello from Postmark!",
    "MessageStream": "outbound"
  });

  res.send("Mail Sent!");
});

// Endpoint to upload file and get summary
router.post('/summary', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Use OpenAI to summarize the file content
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
        { role: 'user', content: `Summarize the following content:\n\n${fileContent}` },
      ],
    });

    const summary = response.data.choices[0].message.content;

    // Return the summary
    res.json({ summary });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process the file and generate summary.' });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
  }
});

// Endpoint to initialize a payment
router.post('/pay', async (req, res) => {
    const { email, amount } = req.body;
  
    try {
      const response = await axios.post('https://api.paystack.co/transaction/initialize', 
        {
          email,
          amount: amount * 100 // Paystack accepts amounts in kobo (1 Naira = 100 Kobo)
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          }
        }
      );
  
      res.json({
        status: response.data.status,
        message: response.data.message,
        data: response.data.data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
  // Endpoint to verify a payment
router.get('/verify/:reference', async (req, res) => {
    const { reference } = req.params;
  
    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, 
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          }
        }
      );
  
      res.json({
        status: response.data.status,
        message: response.data.message,
        data: response.data.data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;