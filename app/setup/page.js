'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QrCode, ArrowLeft, CheckCircle2, XCircle, Database, CreditCard,
  Wallet, Link as LinkIcon, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const StatusBadge = ({ configured }) => (
    configured ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Configured
      </Badge>
    ) : (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <XCircle className="w-3 h-3 mr-1" /> Not Configured
      </Badge>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl nova-gradient flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Setup Guide</h1>
            <p className="text-muted-foreground">Configure your NovaTok QR Hub</p>
          </div>
        </div>

        {/* Status Overview */}
        <Card className="nova-card mb-8">
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>Current state of your integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span>Supabase</span>
                </div>
                <StatusBadge configured={status?.supabase?.configured} />
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span>Stripe</span>
                </div>
                <StatusBadge configured={status?.stripe?.configured} />
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-orange-400" />
                  <span>WalletConnect</span>
                </div>
                <StatusBadge configured={status?.web3?.walletConnectConfigured} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Tabs */}
        <Tabs defaultValue="supabase">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="wallet">WalletConnect</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>

          {/* Supabase Tab */}
          <TabsContent value="supabase">
            <Card className="nova-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Supabase Setup
                  </CardTitle>
                  <StatusBadge configured={status?.supabase?.configured} />
                </div>
                <CardDescription>Database and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">1. Create a Supabase Project</h4>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Supabase Dashboard
                    </Button>
                  </a>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">2. Add Environment Variables</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <code className="text-sm block">NEXT_PUBLIC_SUPABASE_URL=your_project_url</code>
                    <code className="text-sm block">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</code>
                    <code className="text-sm block">SUPABASE_SERVICE_ROLE_KEY=your_service_key</code>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">3. Run SQL Migrations</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy the SQL from <code className="bg-muted px-1 rounded">supabase-migrations.sql</code> and run it in the Supabase SQL Editor.
                  </p>
                  <a href="/supabase-migrations.sql" target="_blank">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" /> View Migrations
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stripe Tab */}
          <TabsContent value="stripe">
            <Card className="nova-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Stripe Setup
                  </CardTitle>
                  <StatusBadge configured={status?.stripe?.configured} />
                </div>
                <CardDescription>Fiat payment processing (TEST MODE)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">1. Get Stripe API Keys</h4>
                  <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Stripe Dashboard
                    </Button>
                  </a>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">2. Add Environment Variables</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <code className="text-sm block">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</code>
                    <code className="text-sm block">STRIPE_SECRET_KEY=sk_test_...</code>
                    <code className="text-sm block">STRIPE_WEBHOOK_SECRET=whsec_... (optional)</code>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    <strong>Test Mode:</strong> Use Stripe test keys during development. Card number 4242 4242 4242 4242 works for testing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WalletConnect Tab */}
          <TabsContent value="wallet">
            <Card className="nova-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-400" />
                    WalletConnect Setup
                  </CardTitle>
                  <StatusBadge configured={status?.web3?.walletConnectConfigured} />
                </div>
                <CardDescription>Web3 wallet integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">1. Create WalletConnect Project</h4>
                  <a href="https://cloud.walletconnect.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open WalletConnect Cloud
                    </Button>
                  </a>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">2. Add Environment Variable</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <code className="text-sm">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id</code>
                  </div>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-sm text-orange-200">
                    <strong>Note:</strong> MetaMask works out of the box. WalletConnect enables additional wallet support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <Card className="nova-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-purple-400" />
                    Smart Contracts
                  </CardTitle>
                </div>
                <CardDescription>Sepolia testnet configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Configuration</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Chain ID</span>
                      <code className="text-sm">{status?.web3?.chainId || 11155111} (Sepolia)</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">NOVA Token</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{status?.web3?.novaAddress?.slice(0, 10)}...</code>
                        <StatusBadge configured={status?.web3?.novaTokenConfigured} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">NFT Contract</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{status?.web3?.nftAddress?.slice(0, 10)}...</code>
                        <StatusBadge configured={status?.web3?.nftContractConfigured} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Update Contract Addresses</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <code className="text-sm block">NEXT_PUBLIC_CHAIN_ID=11155111</code>
                    <code className="text-sm block">NEXT_PUBLIC_NOVA_TOKEN_ADDRESS=0x...</code>
                    <code className="text-sm block">NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...</code>
                  </div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-sm text-purple-200">
                    <strong>Mainnet:</strong> When ready for production, update CHAIN_ID to 1 (Ethereum) and deploy your contracts to mainnet.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Notice */}
        <Card className="nova-card mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">⚠️ Legal Disclaimers</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• NovaTok does not process or custody any funds</p>
              <p>• All payments are executed by third-party providers (Stripe) or user wallets</p>
              <p>• NovaTok is a QR routing and software platform only</p>
              <p>• Users are responsible for their own wallet security and transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
