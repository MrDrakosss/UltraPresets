import React, { useState } from 'react';
import axios from 'axios';

function App() {
  return (
    <div>
      <h1>SimplePay System</h1>
      <PaymentForm />
      <hr />
      <PaymentStatus />
      <hr />
      <RefundForm />
    </div>
  );
}

function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customerEmail, setCustomerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/start', {
        amount,
        currency,
        customerEmail,
        description,
      });

      if (response.data.success) {
        setPaymentUrl(response.data.paymentUrl);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Error initiating payment. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Payment Form</h2>
      {paymentUrl ? (
        <div>
          <p>Payment initialized successfully!</p>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
            Complete Payment
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Currency:
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <br />
          <label>
            Customer Email:
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Start Payment</button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function PaymentStatus() {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const handleCheckStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/query', {
        params: { transactionId },
      });

      if (response.data.success) {
        setStatus(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Error querying payment status.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Payment Status</h2>
      <label>
        Transaction ID:
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </label>
      <button onClick={handleCheckStatus}>Check Status</button>
      {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function RefundForm() {
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRefund = async () => {
    try {
      const response = await axios.post('http://localhost:5000/refund', {
        transactionId,
        amount,
      });

      if (response.data.success) {
        setMessage('Refund processed successfully!');
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Error processing refund.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Refund Form</h2>
      <label>
        Transaction ID:
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </label>
      <br />
      <label>
        Refund Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleRefund}>Process Refund</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
