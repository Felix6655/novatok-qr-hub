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
  QrCode,
  ArrowLeft,
  CreditCard,
  Coins,
  Image,
  Globe,
  Zap,
  Check,
  Copy,
  ExternalLink
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
      toast.error('User not authenticated (demo mode)');
      return;
    }

    fetch('/api/status')
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(() => setConfigStatus(null));
  }, []);

  const updateConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      destination_config: {
        ...prev.destination_config,
        [key]: value
      }
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
        return;
      }

      setCreatedQr(data);
      setStep(3);
      toast.success('QR code created!');
    } catch {
      toast.error('Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(createdQr?.qrUrl || '');
    toast.success('URL copied');
  };

  const renderConfigForm = () => {
    const config = formData.destination_config;

    switch (formData.type) {
      case 'fiat':
        return (
          <div className="space-y-4">
            <Label>Product Name</Label>
            <Input value={config.productName || ''} onChange={e => updateConfig('productName', e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Amount" onChange={e => updateConfig('amount', e.target.value)} />
              <Select onValueChange={v => updateConfig('currency', v)}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-4">
            <Input placeholder="Wallet Address" onChange={e => updateConfig('walletAddress', e.target.value)} />
            <Select onValueChange={v => updateConfig('currency', v)}>
              <SelectTrigger><SelectValue placeholder="Token" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'multi_option':
        return (
          <div className="space-y-4">
            <Input placeholder="Title" onChange={e => updateConfig('title', e.target.value)} />
            <Textarea placeholder="Description" onChange={e => updateConfig('description', e.target.value)} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen container mx-auto max-w-2xl py-8">
      <Link href="/dashboard" className="flex items-center gap-2 mb-6 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select QR Type</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {QR_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => {
                  setFormData({ ...formData, type: type.value });
                  setStep(2);
                }}
                className="p-4 border rounded-lg text-left hover:border-purple-500"
              >
                <p className="font-medium">{type.label}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure QR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              placeholder="QR Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            {renderConfigForm()}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleCreate} disabled={!formData.name || loading}>
                {loading ? 'Creating...' : 'Create QR'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && createdQr && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>QR Created</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <QRCodeSVG value={createdQr.qrUrl} size={200} />
            <Button onClick={copyUrl}><Copy className="w-4 h-4 mr-2" /> Copy URL</Button>
            <Link href={`/q/${createdQr.qr?.slug}`} target="_blank">
              <Button variant="outline"><ExternalLink className="w-4 h-4 mr-2" /> Test</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
