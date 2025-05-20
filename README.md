# Transaction Processor Application

![Transaction Processor Screenshot](./screenshot.png)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)


## Features
- Process transaction strings in tag-length-value format
- View parsed transaction details
- Browse transaction history
- Responsive web interface
- Comprehensive error handling

## Installation

### Prerequisites
- Node.js (v14+)
- npm (v6+)

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Usage
### Running the Application
1. Start backend server:
```bash
cd backend
npm start
```
2. Start frontend:
```bash
cd frontend
npm start
```
3. Open http://localhost:3000 in your browser

## API Documentation
### Process Transaction
#### Endpoint: POST /processTransaction
Request:
```bash
{
  "transaction": "104VISA20522.00310BURGERBARN"
}
```
Response:
```bash
{
  "version": "0.1",
  "transaction_id": "97a85330-ad60-4784-8b0e-30b4485d3885",
  "amount": "2200",
  "network": "VISA",
  "transaction_descriptor": "00002200",
  "merchant": "BURGERBARN",
  "raw_message": "20522.00104VISA310BURGERBARN"
}
```
### Get All Transactions
#### Endpoint: GET /transactions
Response:
```bash
[
  {
    "version": "0.1",
    "transaction_id": "97a85330-ad60-4784-8b0e-30b4485d3885",
    "amount": "2200",
    "network": "VISA",
    "transaction_descriptor": "00002200",
    "merchant": "BURGERBARN",
    "raw_message": "20522.00104VISA310BURGERBARN"
  }
]
```

## Testing
Run backend tests:
```bash
cd backend
npm test
```
Run frontend tests:
```bash
cd frontend
npm test
```

