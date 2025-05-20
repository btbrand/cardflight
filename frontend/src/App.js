import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchAllTransactions = async () => {
    try {
      const response = await fetch('http://localhost:4000/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setAllTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/processTransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transaction');
      }

      const data = await response.json();
      setTransaction(data);
      fetchAllTransactions(); // Refresh the transaction list
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Transaction Processor</h1>
      
      <div className="main-content">
        <div className="transaction-form-container">
          <form onSubmit={handleSubmit} className="transaction-form">
            <label htmlFor="transaction-input">Transaction String:</label>
            <input
              id="transaction-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 104VISA20522.00310BURGERBARN"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {transaction && (
            <div className="transaction-result">
              <h2>Current Transaction</h2>
              <div className="transaction-details">
                <p><strong>Version:</strong> {transaction.version}</p>
                <p><strong>Transaction ID:</strong> {transaction.transaction_id}</p>
                <p><strong>Amount (cents):</strong> {transaction.amount}</p>
                <p><strong>Network:</strong> {transaction.network}</p>
                <p><strong>Descriptor:</strong> {transaction.transaction_descriptor}</p>
                <p><strong>Merchant:</strong> {transaction.merchant}</p>
                <p><strong>Raw Message:</strong> <code>{transaction.raw_message}</code></p>
              </div>
            </div>
          )}
        </div>

        <div className="transaction-history">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="history-toggle"
          >
            {showHistory ? 'Hide Transaction History' : 'Show Transaction History'}
          </button>
          
          {showHistory && (
            <div className="history-list">
              <h2>Transaction History</h2>
              {allTransactions.length === 0 ? (
                <p>No transactions processed yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Network</th>
                      <th>Amount</th>
                      <th>Merchant</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((tx, index) => (
                      <tr 
                        key={tx.transaction_id} 
                        className={transaction?.transaction_id === tx.transaction_id ? 'highlighted' : ''}
                        onClick={() => setTransaction(tx)}
                      >
                        <td>{tx.transaction_id.substring(0, 8)}...</td>
                        <td>{tx.network}</td>
                        <td>${(parseInt(tx.amount)/100).toFixed(2)}</td>
                        <td>{tx.merchant}</td>
                        <td>{new Date().toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;