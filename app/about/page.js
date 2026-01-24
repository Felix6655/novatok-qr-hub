'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { QrCode, ArrowRight, Shield, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <MarketingNav />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              About NovaTok
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              QR Codes That Work
              <br />
              <span className="nova-text-gradient">The Way You Do</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              NovaTok QR Hub is a simple tool for creators and businesses who need 
              dynamic QR codes without the complexity. Point customers to payments, 
              NFTs, or custom pages — and change where they go anytime.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="border-y border-border bg-card/30">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Why We Built This</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Most QR generators are either too basic (static only) or too complicated 
                      (enterprise dashboards with 50 features you will never use).
                    </p>
                    <p>
                      We wanted something in between: <strong className="text-foreground">dynamic QR codes 
                      that are easy to set up</strong>, support both traditional payments and crypto, 
                      and do not lock you into a platform.
                    </p>
                    <p>
                      That is NovaTok. Create a QR, point it somewhere, change it later if you need to. 
                      No fees on your payments, no complex setup.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="nova-card p-6 rounded-xl">
                    <QrCode className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="font-semibold mb-1">Dynamic</h3>
                    <p className="text-sm text-muted-foreground">Change destinations without reprinting</p>
                  </div>
                  <div className="nova-card p-6 rounded-xl">
                    <Shield className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="font-semibold mb-1">Non-Custodial</h3>
                    <p className="text-sm text-muted-foreground">We never hold your funds</p>
                  </div>
                  <div className="nova-card p-6 rounded-xl">
                    <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                    <h3 className="font-semibold mb-1">Fast</h3>
                    <p className="text-sm text-muted-foreground">Create a QR in under a minute</p>
                  </div>
                  <div className="nova-card p-6 rounded-xl">
                    <Heart className="w-8 h-8 text-pink-400 mb-3" />
                    <h3 className="font-semibold mb-1">Simple</h3>
                    <p className="text-sm text-muted-foreground">No bloat, just what you need</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full nova-gradient flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Create a QR Code</h3>
                  <p className="text-muted-foreground">
                    Choose what type of QR you need: fiat payment, crypto payment, NFT mint, 
                    or a multi-option page that lets users pick.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full nova-gradient flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Configure the Destination</h3>
                  <p className="text-muted-foreground">
                    Enter your Stripe details, wallet address, or NFT contract info. 
                    NovaTok generates a unique URL for your QR.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full nova-gradient flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Print & Share</h3>
                  <p className="text-muted-foreground">
                    Download your QR code and use it anywhere — business cards, flyers, 
                    product packaging, event tickets, or digital posts.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full nova-gradient flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Update Anytime</h3>
                  <p className="text-muted-foreground">
                    Need to change where it points? Update the destination in your dashboard. 
                    The QR stays the same — no reprinting needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Our Principles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Non-Custodial</h3>
                  <p className="text-sm text-muted-foreground">
                    Your money goes directly to you. We never hold, process, or have access to your funds.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Privacy-First</h3>
                  <p className="text-sm text-muted-foreground">
                    Minimal data collection. No invasive tracking. We only store what is needed to run the service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Transparent</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear pricing, no hidden fees. We make money from subscriptions, not from your payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="nova-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to Try It?</h2>
              <p className="text-muted-foreground mb-8">
                Create your first dynamic QR code for free. No credit card required.
              </p>
              <Link href="/signup">
                <Button size="lg" className="nova-gradient border-0 text-lg px-10">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
