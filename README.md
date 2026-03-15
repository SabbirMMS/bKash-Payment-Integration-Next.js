# bKash Payment Integration for Next.js

A professional, feature-rich bKash Tokenized Checkout integration for Next.js 14+ (App Router). This project provides a seamless experience for both developers and users, featuring a premium UI with glassmorphism and real-time environment switching.

## 🚀 Features

- **Dual Environment Support**: Toggle between bKash **Sandbox** and **Live** modes with a single click.
- **Next.js 15+ & TypeScript**: Built with the latest Next.js features and full type safety.
- **Premium UI/UX**: Stunning design with dynamic color themes (Blue for Sandbox, Pink for Live).
- **Secure Backend**: robust `BkashService` ported from Laravel with advanced error handling and logging.
- **Comprehensive Testing**: Includes sandbox credentials and primary test wallets for successful and failed test cases.

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- bKash Merchant Credentials (Sandbox or Live)

### 2. Installation
```bash
git clone https://github.com/SabbirMMS/bKash-Payment-Integration-Next.js
cd bkash-payment
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` or `.env.local` and fill in your credentials.

```bash
cp .env.example .env
```

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🧪 Testing in Sandbox

Use the following details to simulate various payment scenarios in the Sandbox environment:

### Test Credentials
- **PIN**: `12121`
- **OTP**: `123456`

### Active Test Wallets (Success)
- `01770618575`
- `01929918378`
- `01770618576`
- `01877722345`
- `01619777282`
- `01619777283`

### Special Case Wallets (Failure)
- **Insufficient Balance**: `01823074817`
- **Debit Block**: `01823074818`

> [!NOTE]
> When testing on browsers, you may need to disable CORS security or ensure your callback URL matches the base URL configured in bKash settings.

## 📡 API Reference (CURL Examples)

### 1. Grant Token (Sandbox)
```bash
curl --location 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant' \
--header 'username: sandboxTokenizedUser02' \
--header 'password: sandboxTokenizedUser02@12345' \
--header 'Content-Type: application/json' \
--data '{
    "app_key":"4f6o0cjiki2rfm34kfdadl1eqq",
    "app_secret":"2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b"
}'
```

### 2. Create Payment (Live)
```bash
curl --location 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create' \
--header 'Authorization: <YOUR_ID_TOKEN>' \
--header 'X-APP-Key: <YOUR_APP_KEY>' \
--header 'Content-Type: application/json' \
--data '{
  "mode": "0011",
  "amount": 500,
  "payerReference": "4839201746",
  "currency": "BDT",
  "intent": "sale",
  "merchantInvoiceNumber": "INV-1001",
  "callbackURL": "http://localhost:3000/api/bkash/callback"
}'
```

### 3. Execute Payment (Sandbox)
Once your callback receives a `paymentID` and a `status=success`, you must execute the payment to complete the transaction.

```bash
curl --location 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute' \
--header 'Authorization: <YOUR_ID_TOKEN>' \
--header 'X-APP-Key: 4f6o0cjiki2rfm34kfdadl1eqq' \
--header 'Content-Type: application/json' \
--data '{
  "paymentID": "TR0011pPDmbc81773563864436"
}'
```

## 🔄 Payment Verification Flow

1. **Initiate**: Frontend calls `/api/bkash/create`.
2. **Redirect**: User completes payment on bKash UI.
3. **Callback**: bKash redirects to `/api/bkash/callback`. 
   - Backend calls `executePayment` to finalize.
   - Backend calls `handlePostPayment` to simulate DB updates.
4. **Finalize**: User is redirected to `/status` with `trxID`, `amount`, and `paymentID` in the URL.

## 📂 Project Structure

- `src/services/bkashService.ts`: Core logic for API interaction.
- `src/app/api/bkash/`: Server-side routes for creating and handling callbacks.
- `src/app/page.tsx`: Home screen with Premium Mode Switcher.
- `src/app/products//`: Dummy product listing with payable items.
- `src/app/status//`: Success/Fail status feedback pages.


> Private Note: OG Credentials are stored on `keep` app of professional email, it's ISP project's Credentials holding for live test!