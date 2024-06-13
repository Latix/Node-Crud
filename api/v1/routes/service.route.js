const router = require('express').Router();
const axios = require('axios');

router.get('/', (req, res) => {
    res.send("Welcome to services!")
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