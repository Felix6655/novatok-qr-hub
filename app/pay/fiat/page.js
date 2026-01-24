'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';

function FiatPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchQR();
    }
    checkStripe();
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

  const checkStripe = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStripeConfigured(data.stripe?.configured || false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    if (!stripeConfigured) {
      toast.error('Stripe is not configured');
      return;
    }

    setProcessing(true);
    try {
      const config = qr?.destination_config || {};
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: config.amount || 10,
          currency: config.currency || 'usd',
          productName: config.productName || qr?.name || 'NovaTok Payment',
          qrSlug: slug
        })
      });

      const data = await res.json();
      
      if (data.url) {
        // Track payment click
        await fetch(`/api/qr/${slug}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'clicked' })
        }).catch(() => {});
        
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl">{config.productName || qr?.name || 'Payment'}</CardTitle>
          <CardDescription>{config.description || 'Secure payment via Stripe'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!stripeConfigured && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-200">Stripe Not Configured</p>
                <p className="text-sm text-yellow-200/70">Add STRIPE_SECRET_KEY to .env to enable payments.</p>
              </div>
            </div>
          )}
          
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p className="text-5xl font-bold">
              {config.currency === 'eur' ? '€' : config.currency === 'gbp' ? '£' : '$'}
              {config.amount || '0.00'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{(config.currency || 'USD').toUpperCase()}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Secure payment processed by Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-green-400" />
              <span>NovaTok does not store payment data</span>
            </div>
          </div>
          
          <Button
            className="w-full nova-gradient border-0 h-12 text-lg"
            onClick={handlePayment}
            disabled={processing || !stripeConfigured}
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><CreditCard className="w-5 h-5 mr-2" /> Pay Now</>
            )}
          </Button>
          
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">Credit Card</Badge>
            <Badge variant="outline" className="text-xs">Apple Pay</Badge>
            <Badge variant="outline" className="text-xs">Google Pay</Badge>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Powered by NovaTok • Non-custodial payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FiatPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    }>
      <FiatPaymentContent />
    </Suspense>
  );
}
