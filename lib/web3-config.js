// Web3 Configuration for NovaTok QR Hub

export const CHAIN_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Contract Addresses (from env)
export const NOVA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_NOVA_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');

// WalletConnect config
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
export const isWalletConnectConfigured = !!WALLETCONNECT_PROJECT_ID;

// Check if contracts are configured (not zero address)
export const isNovaTokenConfigured = NOVA_TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000';
export const isNFTContractConfigured = NFT_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

// ERC-20 ABI (minimal for token transfers)
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

// ERC-721 ABI (minimal for NFT minting)
export const ERC721_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}],
    "name": "mint",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Get Web3 status for UI
export function getWeb3Status() {
  return {
    walletConnectConfigured: isWalletConnectConfigured,
    novaTokenConfigured: isNovaTokenConfigured,
    nftContractConfigured: isNFTContractConfigured,
    chainId: CHAIN_ID,
    novaAddress: NOVA_TOKEN_ADDRESS,
    nftAddress: NFT_CONTRACT_ADDRESS
  };
}
