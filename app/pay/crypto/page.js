'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Loader2, Copy, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';

function CryptoPaymentContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchQR();
    } else {
      setLoading(false);
    }
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

  const copyAddress = () => {
    const config = qr?.destination_config || {};
    navigator.clipboard.writeText(config.walletAddress || '');
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openWallet = async () => {
    // Track click event
    await fetch(`/api/qr/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'clicked' })
    }).catch(() => {});

    const config = qr?.destination_config || {};
    const address = config.walletAddress;
    const amount = config.amount;
    const currency = config.currency || 'ETH';
    
    // Try to open wallet with deep link
    if (currency === 'ETH' || currency === 'USDC') {
      // Ethereum deep link
      const url = amount 
        ? `ethereum:${address}?value=${parseFloat(amount) * 1e18}`
        : `ethereum:${address}`;
      window.location.href = url;
    } else if (currency === 'SOL') {
      // Solana Pay URL
      const url = amount
        ? `solana:${address}?amount=${amount}`
        : `solana:${address}`;
      window.location.href = url;
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
  const currencyIcons = {
    ETH: '⟠',
    USDC: '💵',
    SOL: '◎'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-purple-900/20" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-2xl">{qr?.name || 'Crypto Payment'}</CardTitle>
          <CardDescription>Send cryptocurrency directly to the recipient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <Badge className="mb-4 text-lg px-4 py-1">
              <span className="mr-2">{currencyIcons[config.currency] || '⟠'}</span>
              {config.currency || 'ETH'}
            </Badge>
            {config.amount && (
              <p className="text-4xl font-bold">
                {config.amount} {config.currency || 'ETH'}
              </p>
            )}
            {!config.amount && (
              <p className="text-muted-foreground">Variable amount</p>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Send to this address:</p>
            <div className="bg-muted rounded-lg p-4">
              <p className="font-mono text-sm break-all">{config.walletAddress || 'No address configured'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={copyAddress}>
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
          </div>
          
          <div className="border-t border-border pt-4">
            <Button className="w-full nova-gradient border-0 h-12" onClick={openWallet}>
              <Wallet className="w-5 h-5 mr-2" /> Open Wallet
            </Button>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-sm">
            <p className="text-orange-200">
              <strong>Non-Custodial:</strong> This payment goes directly from your wallet to the recipient. NovaTok does not process or custody any funds.
            </p>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Powered by NovaTok • Non-custodial payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CryptoPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    }>
      <CryptoPaymentContent />
    </Suspense>
  );
}
