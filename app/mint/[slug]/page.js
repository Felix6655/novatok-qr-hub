'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, ExternalLink, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function MintPage() {
  const params = useParams();
  const slug = params.slug;
  
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [web3Status, setWeb3Status] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    fetchQR();
    checkWeb3();
    checkConnection();
  }, [slug]);

  const fetchQR = async () => {
    try {
      const res = await fetch(`/api/qr/${slug}`);
      const data = await res.json();
      if (data.qr) {
        setQr(data.qr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkWeb3 = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setWeb3Status(data.web3);
    } catch (err) {
      console.error(err);
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnected(true);
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or another Web3 wallet');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnected(true);
      setAccount(accounts[0]);
      toast.success('Wallet connected!');
    } catch (err) {
      toast.error('Failed to connect wallet');
    }
  };

  const mint = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }

    // Track click event
    await fetch(`/api/qr/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'clicked' })
    }).catch(() => {});

    setMinting(true);
    try {
      const nftAddress = web3Status?.nftAddress;
      const config = qr?.destination_config || {};
      const mintPrice = config.mintPrice ? parseFloat(config.mintPrice) : 0;

      if (!nftAddress || nftAddress === '0x0000000000000000000000000000000000000000') {
        toast.error('NFT contract not configured');
        setMinting(false);
        return;
      }

      // Check network (Sepolia)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          toast.error('Please switch to Sepolia network');
          setMinting(false);
          return;
        }
      }

      // Simple mint function call
      // mint(address to) - function signature: 0x6a627842
      const mintData = `0x6a627842${account.slice(2).padStart(64, '0')}`;
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: nftAddress,
          data: mintData,
          value: mintPrice > 0 ? '0x' + BigInt(mintPrice * 1e18).toString(16) : '0x0',
        }],
      });

      toast.success('NFT Minted Successfully!');
      
      // Track mint event
      await fetch(`/api/qr/${slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'minted', metadata: { txHash } })
      }).catch(() => {});

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Minting failed');
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  const config = qr?.destination_config || {};

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-purple-900/20" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          {config.imageUrl ? (
            <img 
              src={config.imageUrl} 
              alt={config.nftName}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-2xl">{config.nftName || qr?.name || 'NovaTok NFT'}</CardTitle>
          <CardDescription>{config.nftDescription || 'Mint your unique NFT'}</CardDescription>
          <Badge className="mx-auto mt-2 bg-green-500/20 text-green-300 border-green-500/30">
            Sepolia Testnet
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {!web3Status?.nftContractConfigured && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-200">NFT Contract Not Configured</p>
                <p className="text-sm text-yellow-200/70">Update NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in .env</p>
              </div>
            </div>
          )}
          
          {config.mintPrice && (
            <div className="text-center py-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Mint Price</p>
              <p className="text-3xl font-bold">{config.mintPrice} ETH</p>
            </div>
          )}
          
          {connected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
              <p className="text-green-200">
                <strong>Connected:</strong> {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full nova-gradient border-0 h-12 text-lg" 
            onClick={mint}
            disabled={minting || !web3Status?.nftContractConfigured}
          >
            {minting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Minting...</>
            ) : connected ? (
              <><ImageIcon className="w-5 h-5 mr-2" /> Mint NFT</>
            ) : (
              <><Wallet className="w-5 h-5 mr-2" /> Connect Wallet</>
            )}
          </Button>
          
          <div className="flex justify-center">
            <a 
              href={`https://sepolia.etherscan.io/address/${web3Status?.nftAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
            >
              View Contract <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Powered by NovaTok • Non-custodial minting
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
