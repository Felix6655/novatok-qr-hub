'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  QrCode, Plus, LogOut, Copy, ExternalLink, Eye, Trash2,
  CreditCard, Coins, Image, Globe, Zap, BarChart3, Settings
} from 'lucide-react';

const TYPE_ICONS = {
  fiat: CreditCard,
  crypto: Coins,
  nova: () => <span className="text-lg font-bold">N</span>,
  nft_mint: Image,
  nft_listing: Globe,
  multi_option: Zap
};

const TYPE_COLORS = {
  fiat: 'bg-blue-500/20 text-blue-400',
  crypto: 'bg-orange-500/20 text-orange-400',
  nova: 'bg-purple-500/20 text-purple-400',
  nft_mint: 'bg-green-500/20 text-green-400',
  nft_listing: 'bg-pink-500/20 text-pink-400',
  multi_option: 'bg-cyan-500/20 text-cyan-400'
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    // Check auth
    const storedUser = localStorage.getItem('novatok_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    
    // Fetch config status
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setConfigStatus(data));
    
    // Fetch QR codes
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const token = localStorage.getItem('novatok_token');
      const res = await fetch('/api/qr', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setQrCodes(data.qrCodes || []);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('novatok_token');
    localStorage.removeItem('novatok_user');
    router.push('/');
  };

  const copyQrUrl = (slug) => {
    const url = `${window.location.origin}/q/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('QR URL copied!');
  };

  const toggleQrActive = async (qr) => {
    try {
      const token = localStorage.getItem('novatok_token');
      await fetch(`/api/qr/${qr.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ is_active: !qr.is_active })
      });
      fetchQrCodes();
      toast.success(`QR code ${!qr.is_active ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error('Failed to update QR code');
    }
  };

  const deleteQr = async (id) => {
    if (!confirm('Delete this QR code?')) return;
    try {
      const token = localStorage.getItem('novatok_token');
      await fetch(`/api/qr/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchQrCodes();
      toast.success('QR code deleted');
    } catch (error) {
      toast.error('Failed to delete QR code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl nova-gradient flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold nova-text-gradient">NovaTok</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            {user?.isDemo && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">Demo</Badge>
            )}
            <Link href="/setup">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Config Warnings */}
      {configStatus && (
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2">
            {!configStatus.supabase?.configured && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                Supabase: Demo Mode
              </Badge>
            )}
            {!configStatus.stripe?.configured && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                Stripe: Not Configured
              </Badge>
            )}
            {!configStatus.web3?.walletConnectConfigured && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                WalletConnect: Not Configured
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your dynamic QR codes</p>
          </div>
          <Link href="/qr/new">
            <Button className="nova-gradient border-0">
              <Plus className="w-4 h-4 mr-2" /> Create QR Code
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="nova-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total QR Codes</p>
                  <p className="text-3xl font-bold">{qrCodes.length}</p>
                </div>
                <QrCode className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="nova-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Codes</p>
                  <p className="text-3xl font-bold">{qrCodes.filter(q => q.is_active).length}</p>
                </div>
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="nova-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-3xl font-bold">{qrCodes.reduce((acc, q) => acc + (q.scan_count || 0), 0)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Codes Grid */}
        {qrCodes.length === 0 ? (
          <Card className="nova-card">
            <CardContent className="py-16 text-center">
              <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No QR codes yet</h3>
              <p className="text-muted-foreground mb-4">Create your first dynamic QR code</p>
              <Link href="/qr/new">
                <Button className="nova-gradient border-0">
                  <Plus className="w-4 h-4 mr-2" /> Create QR Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => {
              const Icon = TYPE_ICONS[qr.type] || QrCode;
              const colorClass = TYPE_COLORS[qr.type] || 'bg-gray-500/20 text-gray-400';
              const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${qr.slug}`;
              
              return (
                <Card key={qr.id} className={`nova-card ${!qr.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                          {typeof Icon === 'function' && Icon.prototype ? <Icon className="w-5 h-5" /> : <Icon />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{qr.name}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">{qr.type}</Badge>
                        </div>
                      </div>
                      <Switch
                        checked={qr.is_active}
                        onCheckedChange={() => toggleQrActive(qr)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCodeSVG value={qrUrl} size={80} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Scans</p>
                        <p className="text-2xl font-bold">{qr.scan_count || 0}</p>
                        <p className="text-xs text-muted-foreground truncate mt-2">/q/{qr.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => copyQrUrl(qr.slug)}>
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Link href={`/q/${qr.slug}`} target="_blank" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-3 h-3 mr-1" /> View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => deleteQr(qr.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
