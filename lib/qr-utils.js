import { v4 as uuidv4 } from 'uuid';

// Generate a unique slug for QR codes
export function generateSlug() {
  // Generate a short, URL-friendly slug
  const uuid = uuidv4().replace(/-/g, '');
  return uuid.substring(0, 8);
}

// QR Code Types
export const QR_TYPES = {
  FIAT: 'fiat',
  CRYPTO: 'crypto',
  NOVA: 'nova',
  NFT_MINT: 'nft_mint',
  NFT_LISTING: 'nft_listing',
  MULTI_OPTION: 'multi_option'
};

// QR Type Labels
export const QR_TYPE_LABELS = {
  [QR_TYPES.FIAT]: 'Fiat Payment (Stripe)',
  [QR_TYPES.CRYPTO]: 'Crypto Payment',
  [QR_TYPES.NOVA]: 'NOVA Token Payment',
  [QR_TYPES.NFT_MINT]: 'NFT Mint',
  [QR_TYPES.NFT_LISTING]: 'NFT Listing',
  [QR_TYPES.MULTI_OPTION]: 'Multi-Option'
};

// Crypto currencies supported
export const CRYPTO_CURRENCIES = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
  { symbol: 'SOL', name: 'Solana', icon: '◎' }
];

// Validate destination config based on type
export function validateDestinationConfig(type, config) {
  switch (type) {
    case QR_TYPES.FIAT:
      if (!config.amount || !config.currency || !config.productName) {
        return { valid: false, error: 'Fiat payments require amount, currency, and product name' };
      }
      break;
    case QR_TYPES.CRYPTO:
      if (!config.walletAddress || !config.currency) {
        return { valid: false, error: 'Crypto payments require wallet address and currency' };
      }
      break;
    case QR_TYPES.NOVA:
      if (!config.walletAddress) {
        return { valid: false, error: 'NOVA payments require receiving wallet address' };
      }
      break;
    case QR_TYPES.NFT_MINT:
      if (!config.nftName) {
        return { valid: false, error: 'NFT mint requires NFT name' };
      }
      break;
    case QR_TYPES.NFT_LISTING:
      if (!config.listingId || !config.price) {
        return { valid: false, error: 'NFT listing requires listing ID and price' };
      }
      break;
  }
  return { valid: true };
}

// Build QR URL
export function buildQRUrl(slug, baseUrl) {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${base}/q/${slug}`;
}
