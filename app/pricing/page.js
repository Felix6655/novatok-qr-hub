'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketingNav, MarketingFooter } from '@/components/marketing-nav';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <MarketingNav />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Start Free, Scale as You Grow
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No transaction cuts. Just straightforward pricing for dynamic QR codes.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <Card className="nova-card relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying things out</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span><strong>3</strong> dynamic QR codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>Basic routing (fiat, crypto, NFT)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span><strong>7-day</strong> analytics retention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>1,000 scans/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>NovaTok branding on pages</span>
                  </li>
                </ul>
                
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="nova-card relative border-purple-500/50 shadow-lg shadow-purple-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="nova-gradient border-0 px-4">
                  <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For creators and small businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-sm text-muted-foreground mt-1">or $19/month billed monthly</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> QR codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span>All routing types</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>90-day</strong> analytics retention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>50,000</strong> scans/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Remove NovaTok branding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Custom domains</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                
                <Link href="/signup" className="block">
                  <Button className="w-full nova-gradient border-0">
                    Start Pro Trial <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="nova-card relative">
              <CardHeader>
                <CardTitle className="text-2xl">Business</CardTitle>
                <CardDescription>For teams and enterprises</CardDescription>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-muted-foreground">Coming Soon</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>Team management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>365-day analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full" disabled>
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-card/30">
          <div className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">Do you take a cut of payments?</h3>
                <p className="text-muted-foreground text-sm">
                  No. Payments go directly to you via Stripe or your wallet. We only charge for the QR service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes. Cancel your subscription anytime. You'll keep access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens when I hit my scan limit?</h3>
                <p className="text-muted-foreground text-sm">
                  Your QR codes keep working. We'll notify you when you're close and suggest upgrading.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do I need to configure Stripe myself?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you connect your own Stripe account. This keeps you in control of your funds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
