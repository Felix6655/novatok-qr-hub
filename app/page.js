'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { 
  QrCode, CreditCard, Coins, ArrowRight, Shield, Zap, 
  BarChart3, Smartphone, Globe, CheckCircle2 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <MarketingNav />

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Non-Custodial • Secure • Web3 Ready
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="nova-text-gradient">Create Dynamic QR Codes</span>
            <br />
            <span className="text-white">for Payments and NFTs</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Route customers to fiat payments, crypto wallets, or NFT mints with a single scan. 
            Perfect for creators, businesses, and events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="nova-gradient border-0 text-lg px-8 w-full sm:w-auto">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free tier available
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dynamic QR codes that adapt to your needs - accept payments, mint NFTs, or let users choose.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="nova-card hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle>Dynamic QR Codes</CardTitle>
              <CardDescription>
                Change where your QR points without reprinting. Update destinations in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Editable destinations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Pause/resume anytime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Custom slugs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle>Crypto + Fiat Payments</CardTitle>
              <CardDescription>
                Accept credit cards via Stripe or crypto directly to your wallet. Your choice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Stripe Checkout
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ETH, USDC, SOL
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Multi-option QR
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="nova-card hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                See who's scanning your codes. Track conversions without invasive tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Scan counts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Event tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Privacy-first
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Creators</h3>
              <p className="text-sm text-muted-foreground">Accept tips, sell merch, mint NFTs</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Businesses</h3>
              <p className="text-sm text-muted-foreground">Point-of-sale, invoices, donations</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Events</h3>
              <p className="text-sm text-muted-foreground">Tickets, check-ins, exclusive mints</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Web3 Projects</h3>
              <p className="text-sm text-muted-foreground">Token payments, NFT drops, airdrops</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold">Non-Custodial by Design</h2>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-8">
            NovaTok never holds your funds. All payments go directly from customers to you 
            via Stripe or blockchain wallets. We're just the routing layer.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold mb-2">No Custody</h3>
              <p className="text-sm text-muted-foreground">Funds go directly to recipients</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-semibold mb-2">No KYC</h3>
              <p className="text-sm text-muted-foreground">Sign up with just an email</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">You Own It</h3>
              <p className="text-sm text-muted-foreground">Export data anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="nova-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create your first dynamic QR code in under a minute. No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg" className="nova-gradient border-0 text-lg px-10">
                Start Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
