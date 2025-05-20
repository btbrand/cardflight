import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Mock the fetch API globally
global.fetch = jest.fn();

describe('Transaction Processor App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
  });

  test('renders the initial form correctly', async () => {
    // Mock initial fetch call for transactions
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByText('Transaction Processor')).toBeInTheDocument();
    expect(screen.getByLabelText('Transaction String:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Transaction History' })).toBeInTheDocument();
  });

  test('handles successful transaction submission', async () => {
    const mockTransaction = {
      version: '0.1',
      transaction_id: 'test-id-123',
      amount: '2200',
      network: 'VISA',
      transaction_descriptor: '00002200',
      merchant: 'TEST_MERCHANT',
      raw_message: '104VISA20522.00310BURGERBARN'
    };

    // Mock responses:
    // 1. Initial empty transactions list
    // 2. Successful processTransaction response
    // 3. Updated transactions list
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransaction,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTransaction],
      });

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Transaction String:'), {
        target: { value: '104VISA20522.00310BURGERBARN' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Current Transaction')).toBeInTheDocument();
      expect(screen.getByText('TEST_MERCHANT')).toBeInTheDocument();
    });

    // Check that VISA appears in the details (more specific query)
    const networkElements = screen.getAllByText('VISA');
    expect(networkElements.length).toBeGreaterThan(0);
  });

  test('handles transaction submission error', async () => {
    // Mock responses:
    // 1. Initial empty transactions list
    // 2. Failed processTransaction response
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid transaction format' }),
      });

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Transaction String:'), {
        target: { value: 'invalid-input' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid transaction format')).toBeInTheDocument();
    });
  });

  test('toggles transaction history visibility', async () => {
    const mockTransactions = [{
      version: '0.1',
      transaction_id: 'test-id-1',
      amount: '2200',
      network: 'VISA',
      transaction_descriptor: '00002200',
      merchant: 'MERCHANT_1',
      raw_message: '104VISA20522.00310BURGERBARN'
    }];

    // Mock successful transactions response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockTransactions,
    });

    await act(async () => {
      render(<App />);
    });

    // Initially history should be hidden
    expect(screen.queryByText('Transaction History')).not.toBeInTheDocument();

    // Show history
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Show Transaction History' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('MERCHANT_1')).toBeInTheDocument();
    });

    // Hide history
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Hide Transaction History' }));
    });
    
    expect(screen.queryByText('Transaction History')).not.toBeInTheDocument();
  });

  test('allows selecting transactions from history', async () => {
    const mockTransactions = [
      {
        version: '0.1',
        transaction_id: 'test-id-1',
        amount: '2200',
        network: 'VISA',
        transaction_descriptor: '00002200',
        merchant: 'MERCHANT_1',
        raw_message: '104VISA20522.00310BURGERBARN'
      },
      {
        version: '0.1',
        transaction_id: 'test-id-2',
        amount: '10095',
        network: 'DISCOVER',
        transaction_descriptor: 'DIFFFF',
        merchant: 'MERCHANT_2',
        raw_message: '309SMAINFRMR108DISCOVER2070100.95'
      }
    ];

    // Mock successful transactions response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockTransactions,
    });

    await act(async () => {
      render(<App />);
    });

    // Show history
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Show Transaction History' }));
    });

    await waitFor(() => {
      expect(screen.getByText('MERCHANT_1')).toBeInTheDocument();
    });

    // Select transaction from history
    await act(async () => {
      fireEvent.click(screen.getByText('MERCHANT_1'));
    });

    // Verify the transaction details are displayed
    await waitFor(() => {
      expect(screen.getByText('Current Transaction')).toBeInTheDocument();
      // Use getAllByText since VISA appears in both details and table
      const visaElements = screen.getAllByText('VISA');
      expect(visaElements.length).toBe(2);
      expect(screen.getByText('2200')).toBeInTheDocument();
    });
  });

  test('shows empty state when no transactions exist', async () => {
    // Mock empty transactions response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(<App />);
    });

    // Show history
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Show Transaction History' }));
    });

    await waitFor(() => {
      expect(screen.getByText('No transactions processed yet')).toBeInTheDocument();
    });
  });
});