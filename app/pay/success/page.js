'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-purple-900/20" />
      
      <Card className="nova-card max-w-md w-full relative z-10">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your payment. Your transaction has been processed successfully.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}
          <Link href="/">
            <Button className="nova-gradient border-0">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
