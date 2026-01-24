'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

export function MarketingNav() {
  const pathname = usePathname();
  
  const isActive = (path) => pathname === path;
  
  return (
    <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl nova-gradient flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold nova-text-gradient">NovaTok</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-6">
        <Link 
          href="/pricing" 
          className={`text-sm font-medium transition-colors ${
            isActive('/pricing') ? 'text-white' : 'text-muted-foreground hover:text-white'
          }`}
        >
          Pricing
        </Link>
        <Link 
          href="/about" 
          className={`text-sm font-medium transition-colors ${
            isActive('/about') ? 'text-white' : 'text-muted-foreground hover:text-white'
          }`}
        >
          About
        </Link>
      </div>
      
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">Login</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="nova-gradient border-0">Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg nova-gradient flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">NovaTok QR Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Create dynamic QR codes for payments and NFTs. Non-custodial by design - 
              we never hold your funds.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/signup" className="hover:text-white">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">App</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/setup" className="hover:text-white">Setup Guide</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 NovaTok. All payments executed by third-party providers or user wallets.
          </p>
          <p className="text-xs text-muted-foreground">
            Non-custodial • No KYC • Privacy-first
          </p>
        </div>
      </div>
    </footer>
  );
}
