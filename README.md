# NovaTok QR Hub

Dynamic QR codes for payments, crypto, NOVA tokens, and NFTs - **Non-custodial**.

## 🎯 Overview

NovaTok QR Hub is a Next.js web application that allows users to generate dynamic QR codes that route to:

- **Fiat Payments** (Stripe Checkout) - Credit/Debit, Apple Pay, Google Pay
- **Crypto Payments** (Non-custodial) - ETH, USDC, SOL
- **NOVA Token Payments** - ERC-20 token transfers on Sepolia
- **NFT Mint Pages** - Connect wallet and mint ERC-721 NFTs
- **NFT Marketplace Listings** - View and purchase NFTs
- **Multi-Option Pages** - Let users choose their payment method

**Important:** NovaTok does NOT custody funds. All payments are executed by external providers (Stripe) or user wallets.

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd /app
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

The app runs in **demo mode** if no external services are configured.

### 3. Start Development Server

```bash
yarn dev
```

Visit `http://localhost:3000`

## 🔧 Configuration

### Supabase (Auth + Database)

1. Create a project at [supabase.com](https://supabase.com/dashboard)
2. Add to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```
3. Run migrations from `supabase-migrations.sql` in the SQL Editor

### Stripe (Fiat Payments)

1. Get API keys from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Add to `.env`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (optional)
   ```

### WalletConnect (Web3)

1. Create project at [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Add to `.env`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

### Smart Contracts (Sepolia)

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NOVA_TOKEN_ADDRESS=0x...  # Your ERC-20 token
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...  # Your ERC-721 contract
```

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js    # All API endpoints
│   ├── page.js                      # Landing page
│   ├── layout.js                    # Root layout
│   ├── login/page.js                # Auth page
│   ├── dashboard/page.js            # User dashboard
│   ├── setup/page.js                # Configuration guide
│   ├── qr/new/page.js               # Create QR code
│   ├── q/[slug]/page.js             # QR resolver
│   ├── pay/
│   │   ├── fiat/page.js             # Stripe checkout
│   │   ├── crypto/page.js           # Crypto payment
│   │   ├── nova/page.js             # NOVA token payment
│   │   ├── success/page.js          # Payment success
│   │   └── cancel/page.js           # Payment cancelled
│   ├── mint/[slug]/page.js          # NFT mint page
│   └── marketplace/[id]/page.js     # NFT listing page
├── lib/
│   ├── supabase.js                  # Supabase client
│   ├── stripe.js                    # Stripe config
│   ├── web3-config.js               # Blockchain config
│   ├── qr-utils.js                  # QR code utilities
│   └── mongo-fallback.js            # Demo mode fallback
├── components/ui/                    # shadcn/ui components
├── .env.example                      # Environment template
├── supabase-migrations.sql          # Database schema
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get session

### QR Codes
- `GET /api/qr` - List user's QR codes
- `POST /api/qr` - Create QR code
- `GET /api/qr/[slug]` - Get QR by slug (public)
- `PUT /api/qr/[id]` - Update QR code
- `DELETE /api/qr/[id]` - Delete QR code
- `POST /api/qr/[slug]/event` - Track analytics event

### Payments
- `POST /api/stripe/checkout` - Create Stripe checkout session

### Status
- `GET /api/status` - System configuration status

## 🎨 QR Code Types

| Type | Description | Destination |
|------|-------------|-------------|
| `fiat` | Stripe Checkout | Credit cards, Apple Pay, Google Pay |
| `crypto` | Crypto wallet | ETH, USDC, SOL |
| `nova` | NOVA token | ERC-20 transfer |
| `nft_mint` | NFT minting | Connect wallet & mint |
| `nft_listing` | Marketplace | View & buy NFT |
| `multi_option` | Multi-payment | User chooses method |

## ⚖️ Legal Disclaimers

- **NovaTok does NOT process or custody any funds**
- All payments are executed by third-party providers (Stripe) or user wallets
- NovaTok is a QR routing and software platform only
- No KYC required
- Users are responsible for their own wallet security

## 🔐 Security

- Non-custodial design
- No payment data stored
- Supabase Row Level Security (RLS)
- Environment variables for sensitive data
- Privacy-first analytics

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Update these for mainnet:
```
NEXT_PUBLIC_CHAIN_ID=1  # Ethereum Mainnet
NEXT_PUBLIC_NOVA_TOKEN_ADDRESS=0x...  # Mainnet address
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...  # Mainnet address
```

Use production Stripe keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## 📝 License

MIT License - See LICENSE file for details.

---

Built with ❤️ by NovaTok
