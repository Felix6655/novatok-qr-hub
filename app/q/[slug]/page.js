'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CreditCard, Coins, Image, Globe, Zap, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export default function QRResolverPage() {
  const params = useParams();
  const router = useRouter();
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQR();
  }, [params.slug]);

  const fetchQR = async () => {
    try {
      // Track scan event
      await fetch(`/api/qr/${params.slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'scan',
          user_agent: navigator.userAgent
        })
      }).catch(() => {});

      const res = await fetch(`/api/qr/${params.slug}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setQr(data.qr);
        // Auto-redirect based on type
        handleRedirect(data.qr);
      }
    } catch (err) {
      setError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (qrData) => {
    const config = qrData.destination_config;
    
    switch (qrData.type) {
      case 'fiat':
        router.push(`/pay/fiat?slug=${params.slug}`);
        break;
      case 'crypto':
        router.push(`/pay/crypto?slug=${params.slug}`);
        break;
      case 'nova':
        router.push(`/pay/nova?slug=${params.slug}`);
        break;
      case 'nft_mint':
        router.push(`/mint/${params.slug}`);
        break;
      case 'nft_listing':
        router.push(`/marketplace/${config.listingId || params.slug}?slug=${params.slug}`);
        break;
      case 'multi_option':
        // Stay on this page to show options
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="nova-card max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">QR Code Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multi-option display
  if (qr?.type === 'multi_option') {
    const config = qr.destination_config;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        
        <Card className="nova-card max-w-md w-full relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl nova-gradient flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{config.title || qr.name}</CardTitle>
            <CardDescription>{config.description || 'Choose your payment method'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.fiatAmount && (
              <Button
                variant="outline"
                className="w-full h-auto py-4 justify-start"
                onClick={() => router.push(`/pay/fiat?slug=${params.slug}`)}
              >
                <CreditCard className="w-6 h-6 mr-4 text-blue-400" />
                <div className="text-left">
                  <p className="font-medium">Pay with Card</p>
                  <p className="text-sm text-muted-foreground">${config.fiatAmount} USD</p>
                </div>
              </Button>
            )}
            
            {config.cryptoAmount && config.walletAddress && (
              <Button
                variant="outline"
                className="w-full h-auto py-4 justify-start"
                onClick={() => router.push(`/pay/crypto?slug=${params.slug}`)}
              >
                <Coins className="w-6 h-6 mr-4 text-orange-400" />
                <div className="text-left">
                  <p className="font-medium">Pay with Crypto</p>
                  <p className="text-sm text-muted-foreground">{config.cryptoAmount} ETH</p>
                </div>
              </Button>
            )}
            
            {config.walletAddress && (
              <Button
                variant="outline"
                className="w-full h-auto py-4 justify-start"
                onClick={() => router.push(`/pay/nova?slug=${params.slug}`)}
              >
                <div className="w-6 h-6 mr-4 rounded nova-gradient flex items-center justify-center">
                  <span className="text-xs font-bold text-white">N</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Pay with NOVA</p>
                  <p className="text-sm text-muted-foreground">NOVA Token</p>
                </div>
              </Button>
            )}
            
            <p className="text-xs text-center text-muted-foreground mt-6">
              Powered by NovaTok • Non-custodial payments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
