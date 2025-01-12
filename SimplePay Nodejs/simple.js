const express = require('express');
const axios = require('axios'); // For HTTP requests (e.g., SimplePay API)
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Environment Variables (e.g., API keys, endpoints)
const SIMPLEPAY_API_URL = "https://api.simplepay.com";
const API_KEY = "your-simplepay-api-key";
const MERCHANT_ID = "your-merchant-id";

/**
 * POST /start
 * Initialize a new payment
 */
app.post('/start', async (req, res) => {
  const { amount, currency, customerEmail, description } = req.body;

  try {
    const payload = {
      merchant_id: MERCHANT_ID,
      amount,
      currency,
      customer_email: customerEmail,
      description,
      api_key: API_KEY,
    };

    const response = await axios.post(`${SIMPLEPAY_API_URL}/start-payment`, payload);

    if (response.data.success) {
      res.json({
        success: true,
        paymentUrl: response.data.payment_url,
      });
    } else {
      res.status(400).json({ success: false, error: response.data.error });
    }
  } catch (error) {
    console.error('Error starting payment:', error.message);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

/**
 * POST /finish
 * Complete a payment after redirection
 */
app.post('/finish', async (req, res) => {
  const { transactionId } = req.body;

  try {
    const response = await axios.post(`${SIMPLEPAY_API_URL}/verify-payment`, {
      transaction_id: transactionId,
      api_key: API_KEY,
    });

    if (response.data.success) {
      res.json({
        success: true,
        transactionDetails: response.data.transaction_details,
      });
    } else {
      res.status(400).json({ success: false, error: response.data.error });
    }
  } catch (error) {
    console.error('Error finishing payment:', error.message);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

/**
 * GET /query
 * Query the status of a payment
 */
app.get('/query', async (req, res) => {
  const { transactionId } = req.query;

  try {
    const response = await axios.post(`${SIMPLEPAY_API_URL}/query-payment`, {
      transaction_id: transactionId,
      api_key: API_KEY,
    });

    if (response.data.success) {
      res.json({
        success: true,
        status: response.data.status,
        transactionDetails: response.data.transaction_details,
      });
    } else {
      res.status(400).json({ success: false, error: response.data.error });
    }
  } catch (error) {
    console.error('Error querying payment:', error.message);
    res.status(500).json({ success: false, error: 'Query failed' });
  }
});

/**
 * POST /refund
 * Process a refund
 */
app.post('/refund', async (req, res) => {
  const { transactionId, amount } = req.body;

  try {
    const response = await axios.post(`${SIMPLEPAY_API_URL}/refund-payment`, {
      transaction_id: transactionId,
      amount,
      api_key: API_KEY,
    });

    if (response.data.success) {
      res.json({ success: true, message: 'Refund processed successfully' });
    } else {
      res.status(400).json({ success: false, error: response.data.error });
    }
  } catch (error) {
    console.error('Error processing refund:', error.message);
    res.status(500).json({ success: false, error: 'Refund failed' });
  }
});

/**
 * POST /ipn
 * Handle IPN notifications
 */
app.post('/ipn', (req, res) => {
  const ipnData = req.body;

  try {
    // Process IPN data as per your application logic
    console.log('IPN Received:', ipnData);

    res.json({ success: true, message: 'IPN processed successfully' });
  } catch (error) {
    console.error('Error processing IPN:', error.message);
    res.status(500).json({ success: false, error: 'IPN handling failed' });
  }
});

/**
 * POST /transaction-cancel
 * Handle payment cancellations
 */
app.post('/transaction-cancel', (req, res) => {
  const { transactionId } = req.body;

  try {
    console.log(`Transaction ${transactionId} canceled by user.`);
    res.json({ success: true, message: 'Transaction canceled successfully' });
  } catch (error) {
    console.error('Error handling cancellation:', error.message);
    res.status(500).json({ success: false, error: 'Cancellation failed' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
