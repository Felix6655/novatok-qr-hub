'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function NovaPaymentContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [web3Status, setWeb3Status] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchQR();
    } else {
      setLoading(false);
    }
    checkWeb3();
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

  const copyAddress = () => {
    const config = qr?.destination_config || {};
    navigator.clipboard.writeText(config.walletAddress || '');
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const connectAndPay = async () => {
    // Track click event
    await fetch(`/api/qr/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'clicked' })
    }).catch(() => {});

    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or another Web3 wallet');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const fromAddress = accounts[0];

      const config = qr?.destination_config || {};
      const toAddress = config.walletAddress;
      const novaTokenAddress = web3Status?.novaAddress;

      if (!novaTokenAddress || novaTokenAddress === '0x0000000000000000000000000000000000000000') {
        toast.error('NOVA token contract not configured');
        return;
      }

      // Check network (Sepolia)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chain ID
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          toast.error('Please switch to Sepolia network');
          return;
        }
      }

      // ERC-20 transfer function signature
      const amount = config.amount ? BigInt(parseFloat(config.amount) * 1e18).toString(16) : '0';
      const transferData = `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${amount.padStart(64, '0')}`;

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: novaTokenAddress,
          data: transferData,
        }],
      });

      toast.success('Transaction submitted!');
      
      // Track payment event
      await fetch(`/api/qr/${slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'paid', metadata: { txHash } })
      }).catch(() => {});

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Transaction failed');
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/30" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl nova-gradient flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <CardTitle className="text-2xl">{qr?.name || 'NOVA Payment'}</CardTitle>
          <CardDescription>Send NOVA tokens directly</CardDescription>
          <Badge className="mx-auto mt-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Sepolia Testnet
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {!web3Status?.novaTokenConfigured && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-200">NOVA Token Not Configured</p>
                <p className="text-sm text-yellow-200/70">Update NEXT_PUBLIC_NOVA_TOKEN_ADDRESS in .env</p>
              </div>
            </div>
          )}
          
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
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Recipient Address:</p>
            <div className="bg-muted rounded-lg p-4">
              <p className="font-mono text-sm break-all">{config.walletAddress || 'No address configured'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={copyAddress}>
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
          </div>
          
          <div className="border-t border-border pt-4">
            <Button 
              className="w-full nova-gradient border-0 h-12 text-lg" 
              onClick={connectAndPay}
              disabled={!web3Status?.novaTokenConfigured}
            >
              <Wallet className="w-5 h-5 mr-2" /> Connect Wallet & Pay
            </Button>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm">
            <p className="text-purple-200">
              <strong>Non-Custodial:</strong> NOVA tokens are sent directly from your wallet to the recipient. No escrow or custody involved.
            </p>
          </div>
          
          <div className="flex justify-center">
            <a 
              href={`https://sepolia.etherscan.io/token/${web3Status?.novaAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
            >
              View NOVA Token <ExternalLink className="w-3 h-3" />
            </a>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    }>
      <NovaPaymentContent />
    </Suspense>
  );
}
