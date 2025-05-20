const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage for transactions
const transactions = [];

function parseTransaction(input) {
  let index = 0;
  let network = '';
  let amount = '';
  let merchant = '';

  while (index < input.length) {
    const tag = input[index];
    const lengthStr = input.slice(index + 1, index + 3);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length) || length <= 0) {
      index += 3;
      continue;
    }

    const valueStart = index + 3;
    const valueEnd = valueStart + length;
    const value = input.slice(valueStart, valueEnd);

    switch (tag) {
      case '1':
        network = value;
        break;
      case '2':
        amount = value;
        break;
      case '3':
        merchant = value.length > 10 ? value.substring(0, 10) : value;
        break;
      default:
        // Ignore unknown tags
        break;
    }

    index = valueEnd;
  }

  if (!network || !amount || !merchant) {
    throw new Error('Invalid transaction format - missing required fields');
  }

  // Process amount
  const amountInCents = amount.replace('.', '').replace(/^0+/, '') || '0';

  // Process transaction descriptor
  let transactionDescriptor = '';
  if (network === 'VISA') {
    transactionDescriptor = amountInCents.padStart(8, '0');
  } else {
    transactionDescriptor = network.substring(0, 2) + 'FFFF';
  }

  return {
    version: '0.1',
    transaction_id: uuidv4(),
    amount: amountInCents,
    network,
    transaction_descriptor: transactionDescriptor,
    merchant,
    raw_message: input,
  };
}

app.post('/processTransaction', (req, res) => {
  try {
    const { transaction } = req.body;
    if (!transaction || typeof transaction !== 'string') {
      return res.status(400).json({ error: 'Transaction string is required' });
    }

    const parsedTransaction = parseTransaction(transaction);
    transactions.push(parsedTransaction);
    res.json(parsedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid transaction format' });
  }
});

app.get('/transactions', (req, res) => {
  res.json(transactions);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;