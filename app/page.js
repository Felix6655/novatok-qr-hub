'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CreditCard, Coins, Image, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(() => setConfigStatus({ error: true }));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl nova-gradient flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold nova-text-gradient">NovaTok</span>
          </div>
          <div className="flex gap-3">
            <Link href="/setup">
              <Button variant="ghost" size="sm">Setup</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="nova-gradient border-0">Dashboard</Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Non-Custodial • Secure • Decentralized
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="nova-text-gradient">Dynamic QR Codes</span>
            <br />
            <span className="text-white">for the Web3 Era</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create QR codes that route to fiat payments, crypto wallets, NOVA tokens, 
            NFT mints, and marketplace listings. You control your funds.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="nova-gradient border-0 text-lg px-8">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/setup">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Setup
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Config Status Banner */}
      {configStatus && !configStatus.supabase?.configured && (
        <div className="bg-yellow-500/10 border-y border-yellow-500/20 py-3">
          <div className="container mx-auto px-4 text-center">
            <span className="text-yellow-400 text-sm">
              ⚠️ Running in demo mode. <Link href="/setup" className="underline">Configure Supabase</Link> for full functionality.
            </span>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Payment Types</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="nova-card hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle>Fiat Payments</CardTitle>
              <CardDescription>
                Stripe Checkout with Credit/Debit, Apple Pay, Google Pay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Instant checkout experience</li>
                <li>• Multiple payment methods</li>
                <li>• No payment data stored</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2">
                <Coins className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle>Crypto Payments</CardTitle>
              <CardDescription>
                ETH, USDC, SOL - Direct to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Non-custodial transfers</li>
                <li>• Fixed or variable amounts</li>
                <li>• Wallet connection support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-colors border-purple-500/30">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg nova-gradient flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-white">N</span>
              </div>
              <CardTitle>NOVA Token</CardTitle>
              <CardDescription>
                Native NOVA token payments on Sepolia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• ERC-20 token transfers</li>
                <li>• Direct wallet payments</li>
                <li>• No escrow required</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                <Image className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle>NFT Minting</CardTitle>
              <CardDescription>
                QR codes that open mint pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Connect wallet & mint</li>
                <li>• ERC-721 support</li>
                <li>• Event & physical QR ready</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-pink-400" />
              </div>
              <CardTitle>NFT Marketplace</CardTitle>
              <CardDescription>
                Link to specific marketplace listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Show NFT details</li>
                <li>• Price & buy button</li>
                <li>• NovaTok Explorer ready</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle>Multi-Option</CardTitle>
              <CardDescription>
                Let users choose their payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Fiat + Crypto options</li>
                <li>• User choice at scan</li>
                <li>• Flexible payments</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold">Non-Custodial by Design</h2>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-8">
              NovaTok never holds, processes, or has access to your funds. All payments 
              are executed directly by third-party providers (Stripe) or user wallets. 
              We are a QR routing and software platform only.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="text-2xl mb-2">🔐</div>
                <h3 className="font-semibold mb-1">No Custody</h3>
                <p className="text-sm text-muted-foreground">Funds go directly to recipients</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="text-2xl mb-2">🚫</div>
                <h3 className="font-semibold mb-1">No Balances</h3>
                <p className="text-sm text-muted-foreground">We don't store any balances</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="text-2xl mb-2">✅</div>
                <h3 className="font-semibold mb-1">No KYC</h3>
                <p className="text-sm text-muted-foreground">Privacy-first approach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg nova-gradient flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">NovaTok QR Hub</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            NovaTok does not process or custody funds. All payments executed by third-party providers or user wallets.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/setup" className="hover:text-white">Setup</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
