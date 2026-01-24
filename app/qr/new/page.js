'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  QrCode, ArrowLeft, CreditCard, Coins, Image, Globe, Zap,
  Check, Copy, ExternalLink
} from 'lucide-react';

const QR_TYPES = [
  { value: 'fiat', label: 'Fiat Payment (Stripe)', icon: CreditCard, color: 'text-blue-400' },
  { value: 'crypto', label: 'Crypto Payment', icon: Coins, color: 'text-orange-400' },
  { value: 'nova', label: 'NOVA Token', icon: () => <span className="text-lg font-bold">N</span>, color: 'text-purple-400' },
  { value: 'nft_mint', label: 'NFT Mint', icon: Image, color: 'text-green-400' },
  { value: 'nft_listing', label: 'NFT Listing', icon: Globe, color: 'text-pink-400' },
  { value: 'multi_option', label: 'Multi-Option', icon: Zap, color: 'text-cyan-400' },
];

export default function CreateQRPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdQr, setCreatedQr] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    destination_config: {}
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('novatok_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setConfigStatus(data));
  }, []);

  const updateConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      destination_config: { ...prev.destination_config, [key]: value }
    }));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('novatok_token');
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setCreatedQr(data);
        setStep(3);
        toast.success('QR code created!');
      }
    } catch (error) {
      toast.error('Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(createdQr?.qrUrl || '');
    toast.success('URL copied!');
  };

  const renderConfigForm = () => {
    const config = formData.destination_config;
    
    switch (formData.type) {
      case 'fiat':
        return (
          <div className="space-y-4">
            {!configStatus?.stripe?.configured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-200">
                ⚠️ Stripe not configured. QR will show a warning when scanned.
              </div>
            )}
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="e.g., Premium Membership"
                value={config.productName || ''}
                onChange={(e) => updateConfig('productName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  value={config.amount || ''}
                  onChange={(e) => updateConfig('amount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={config.currency || 'usd'} onValueChange={(v) => updateConfig('currency', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Payment description..."
                value={config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'crypto':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Receiving Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={config.walletAddress || ''}
                onChange={(e) => updateConfig('walletAddress', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cryptocurrency</Label>
              <Select value={config.currency || 'ETH'} onValueChange={(v) => updateConfig('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (optional - leave empty for variable)</Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="0.01"
                value={config.amount || ''}
                onChange={(e) => updateConfig('amount', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'nova':
        return (
          <div className="space-y-4">
            {!configStatus?.web3?.novaTokenConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-200">
                ⚠️ NOVA token address not configured. Update NEXT_PUBLIC_NOVA_TOKEN_ADDRESS in .env
              </div>
            )}
            <div className="space-y-2">
              <Label>Receiving Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={config.walletAddress || ''}
                onChange={(e) => updateConfig('walletAddress', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>NOVA Amount (optional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="100"
                value={config.amount || ''}
                onChange={(e) => updateConfig('amount', e.target.value)}
              />
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-sm">
              <p className="text-purple-200">NOVA tokens will be sent directly from user's wallet to the receiving address. No custody involved.</p>
            </div>
          </div>
        );
        
      case 'nft_mint':
        return (
          <div className="space-y-4">
            {!configStatus?.web3?.nftContractConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-200">
                ⚠️ NFT contract address not configured. Update NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in .env
              </div>
            )}
            <div className="space-y-2">
              <Label>NFT Collection Name</Label>
              <Input
                placeholder="e.g., NovaTok Genesis"
                value={config.nftName || ''}
                onChange={(e) => updateConfig('nftName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>NFT Description</Label>
              <Textarea
                placeholder="Description of the NFT..."
                value={config.nftDescription || ''}
                onChange={(e) => updateConfig('nftDescription', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mint Price (ETH)</Label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.01"
                value={config.mintPrice || ''}
                onChange={(e) => updateConfig('mintPrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                placeholder="https://..."
                value={config.imageUrl || ''}
                onChange={(e) => updateConfig('imageUrl', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'nft_listing':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Listing ID / Token ID</Label>
              <Input
                placeholder="e.g., 1"
                value={config.listingId || ''}
                onChange={(e) => updateConfig('listingId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>NFT Name</Label>
              <Input
                placeholder="e.g., Rare NovaTok #42"
                value={config.nftName || ''}
                onChange={(e) => updateConfig('nftName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (ETH)</Label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.5"
                value={config.price || ''}
                onChange={(e) => updateConfig('price', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={config.imageUrl || ''}
                onChange={(e) => updateConfig('imageUrl', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'multi_option':
        return (
          <div className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-sm text-cyan-200">
              Multi-option QR shows users a choice of payment methods.
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Support NovaTok"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Choose your preferred payment method..."
                value={config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fiat Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={config.fiatAmount || ''}
                  onChange={(e) => updateConfig('fiatAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Crypto Amount (ETH)</Label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="0.005"
                  value={config.cryptoAmount || ''}
                  onChange={(e) => updateConfig('cryptoAmount', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Crypto Wallet Address</Label>
              <Input
                placeholder="0x..."
                value={config.walletAddress || ''}
                onChange={(e) => updateConfig('walletAddress', e.target.value)}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'nova-gradient text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Type */}
        {step === 1 && (
          <Card className="nova-card">
            <CardHeader>
              <CardTitle>Select QR Type</CardTitle>
              <CardDescription>What kind of QR code do you want to create?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {QR_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        setFormData({ ...formData, type: type.value });
                        setStep(2);
                      }}
                      className={`p-4 rounded-xl border border-border hover:border-purple-500/50 transition-all text-left ${
                        formData.type === type.value ? 'border-purple-500 bg-purple-500/10' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2 ${type.color}`}>
                        {typeof Icon === 'function' && Icon.prototype ? <Icon className="w-5 h-5" /> : <Icon />}
                      </div>
                      <p className="font-medium">{type.label}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <Card className="nova-card">
            <CardHeader>
              <CardTitle>Configure QR Code</CardTitle>
              <CardDescription>
                {QR_TYPES.find(t => t.value === formData.type)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>QR Code Name</Label>
                <Input
                  placeholder="e.g., Store Checkout, Event Ticket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              {renderConfigForm()}
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 nova-gradient border-0"
                  onClick={handleCreate}
                  disabled={loading || !formData.name}
                >
                  {loading ? 'Creating...' : 'Create QR Code'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && createdQr && (
          <Card className="nova-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl nova-gradient flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">QR Code Created!</CardTitle>
              <CardDescription>Your dynamic QR code is ready to use</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl mb-6">
                <QRCodeSVG value={createdQr.qrUrl} size={200} />
              </div>
              
              <div className="w-full bg-muted rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm truncate flex-1">{createdQr.qrUrl}</code>
                <Button variant="ghost" size="sm" onClick={copyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-4 w-full">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Back to Dashboard</Button>
                </Link>
                <Link href={`/q/${createdQr.qr?.slug}`} target="_blank" className="flex-1">
                  <Button className="w-full nova-gradient border-0">
                    <ExternalLink className="w-4 h-4 mr-2" /> Test QR
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
