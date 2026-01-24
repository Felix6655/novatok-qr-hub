'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function NovaPaymentContent() {
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
      toast.error('Failed to load QR');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    const address = qr?.destination_config?.walletAddress;
    if (!address) return;

    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied');

    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * ✅ WALLET LAUNCHER (THE MISSING PIECE)
   * Opens MetaMask / Trust / Rainbow / WalletConnect-compatible wallets
   */
  const openWallet = async () => {
    const config = qr?.destination_config;

    if (!config?.walletAddress) {
      toast.error('Wallet address missing');
      return;
    }

    // Track click
    fetch(`/api/qr/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'clicked' }),
    }).catch(() => {});

    const address = config.walletAddress;
    const amount = config.amount;

    // EIP-681 ethereum payment URI
    const uri = `ethereum:${address}${amount ? `?value=${amount}` : ''}`;

    window.location.href = uri;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="nova-card max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-muted-foreground">QR not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = qr.destination_config || {};

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/30" />

      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl nova-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">N</span>
          </div>

          <CardTitle className="text-2xl">
            {qr.name || 'NOVA Payment'}
          </CardTitle>

          <CardDescription>
            Send cryptocurrency directly to the recipient
          </CardDescription>

          <Badge className="mx-auto mt-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Ethereum / NOVA
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            {config.amount ? (
              <p className="text-4xl font-bold nova-text-gradient">
                {config.amount} NOVA
              </p>
            ) : (
              <p className="text-muted-foreground">Variable amount</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Send to address:</p>
            <div className="bg-muted rounded-lg p-4">
              <p className="font-mono text-sm break-all">
                {config.walletAddress}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyAddress}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
          </div>

          {/* Open Wallet */}
          <div className="border-t border-border pt-4">
            <Button
              className="w-full nova-gradient border-0 h-12 text-lg"
              onClick={openWallet}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Open Wallet
            </Button>
          </div>

          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm">
            <p className="text-purple-200">
              <strong>Non-custodial:</strong> Payment goes directly from your
              wallet to the recipient. NovaTok does not hold funds.
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

export default function NovaPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        </div>
      }
    >
      <NovaPaymentContent />
    </Suspense>
  );
}
