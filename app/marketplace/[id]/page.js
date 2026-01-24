'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, ExternalLink, AlertCircle, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

function MarketplaceContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params.id;
  const slug = searchParams.get('slug');
  
  const [listing, setListing] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [web3Status, setWeb3Status] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    fetchData();
    checkWeb3();
    checkConnection();
  }, [listingId, slug]);

  const fetchData = async () => {
    try {
      // Fetch listing
      const listingRes = await fetch(`/api/marketplace/${listingId}`);
      const listingData = await listingRes.json();
      if (listingData.listing) {
        setListing(listingData.listing);
      }
      
      // Fetch QR if slug provided
      if (slug) {
        const qrRes = await fetch(`/api/qr/${slug}`);
        const qrData = await qrRes.json();
        if (qrData.qr) {
          setQr(qrData.qr);
        }
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

  const buyNFT = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }

    // Track click event
    if (slug) {
      await fetch(`/api/qr/${slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'clicked' })
      }).catch(() => {});
    }

    setBuying(true);
    try {
      // In production, this would interact with a marketplace contract
      // For now, we show a placeholder message
      toast.info('Marketplace integration coming soon!');
      
      // Track attempted purchase
      if (slug) {
        await fetch(`/api/qr/${slug}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'paid', metadata: { listingId } })
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Purchase failed');
    } finally {
      setBuying(false);
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
  const displayData = {
    name: config.nftName || listing?.name || 'NovaTok NFT',
    image: config.imageUrl || listing?.image,
    price: config.price || listing?.price || '0.01',
    description: listing?.description || 'Available on NovaTok Marketplace'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-transparent to-purple-900/20" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center p-0">
          {displayData.image ? (
            <img 
              src={displayData.image} 
              alt={displayData.name}
              className="w-full h-64 object-cover rounded-t-xl"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-t-xl flex items-center justify-center">
              <ImageIcon className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl">{displayData.name}</CardTitle>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                #{listingId}
              </Badge>
            </div>
            <CardDescription>{displayData.description}</CardDescription>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">{displayData.price} ETH</p>
            </div>
            <Badge variant="outline" className="text-xs">Sepolia</Badge>
          </div>
          
          {connected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
              <p className="text-green-200">
                <strong>Connected:</strong> {account?.slice(0, 6)}...{account?.slice(-4)}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full nova-gradient border-0 h-12 text-lg" 
            onClick={buyNFT}
            disabled={buying}
          >
            {buying ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : connected ? (
              <><ShoppingCart className="w-5 h-5 mr-2" /> Buy Now</>
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
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Powered by NovaTok Marketplace • Non-custodial
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
