import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabase, supabaseAdmin, getSupabaseStatus } from '@/lib/supabase';
import { isStripeConfigured, getStripe, getStripeStatus } from '@/lib/stripe';
import { getWeb3Status, NOVA_TOKEN_ADDRESS, NFT_CONTRACT_ADDRESS, CHAIN_ID } from '@/lib/web3-config';
import { generateSlug, QR_TYPES, validateDestinationConfig, buildQRUrl } from '@/lib/qr-utils';
import { getMongoDb, getMemoryStore, getDemoUser } from '@/lib/mongo-fallback';
import { getUserPlan, createUserPlan, updateUserPlan, checkPlanLimit, getPlanComparison, PLANS, PLAN_LIMITS } from '@/lib/user-plans';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to get path segments
function getPathSegments(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '').replace('/api', '');
  return path.split('/').filter(Boolean);
}

// Memory store for demo mode
let demoQrCodes = [];
let demoEvents = [];
let demoSession = null;
let demoUserPlans = new Map();

// =============================================
// HANDLERS
// =============================================

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  const segments = getPathSegments(request);
  const url = new URL(request.url);
  
  try {
    // GET /api/status - System status
    if (segments[0] === 'status') {
      return NextResponse.json({
        supabase: getSupabaseStatus(),
        stripe: getStripeStatus(),
        web3: getWeb3Status(),
        demo: !isSupabaseConfigured
      }, { headers: corsHeaders });
    }

    // GET /api/plans - Get plan comparison data
    if (segments[0] === 'plans' && !segments[1]) {
      return NextResponse.json(getPlanComparison(), { headers: corsHeaders });
    }

    // GET /api/user/plan - Get current user's plan
    if (segments[0] === 'user' && segments[1] === 'plan') {
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        const plan = await getUserPlan(user.id);
        return NextResponse.json({ plan }, { headers: corsHeaders });
      }
      // Demo mode
      if (demoSession) {
        const plan = await getUserPlan(demoSession.id);
        return NextResponse.json({ plan, isDemo: true }, { headers: corsHeaders });
      }
      return NextResponse.json({ error: 'Not logged in' }, { status: 401, headers: corsHeaders });
    }

    // GET /api/auth/session - Get current session
    if (segments[0] === 'auth' && segments[1] === 'session') {
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user) {
            return NextResponse.json({ user, isDemo: false }, { headers: corsHeaders });
          }
        }
        return NextResponse.json({ user: null }, { headers: corsHeaders });
      }
      // Demo mode
      return NextResponse.json({ 
        user: demoSession || null, 
        isDemo: true 
      }, { headers: corsHeaders });
    }

    // GET /api/qr - List user's QR codes
    if (segments[0] === 'qr' && !segments[1]) {
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return NextResponse.json({ qrCodes: data }, { headers: corsHeaders });
      }
      // Demo mode
      return NextResponse.json({ qrCodes: demoQrCodes, isDemo: true }, { headers: corsHeaders });
    }

    // GET /api/qr/[slug] - Get QR by slug (public)
    if (segments[0] === 'qr' && segments[1]) {
      const slug = segments[1];
      
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('qr_codes')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        
        if (error || !data) {
          return NextResponse.json({ error: 'QR code not found' }, { status: 404, headers: corsHeaders });
        }
        
        // Increment scan count
        await supabaseAdmin.rpc('increment_scan_count', { qr_slug: slug });
        
        return NextResponse.json({ qr: data }, { headers: corsHeaders });
      }
      // Demo mode
      const qr = demoQrCodes.find(q => q.slug === slug && q.is_active);
      if (!qr) {
        return NextResponse.json({ error: 'QR code not found' }, { status: 404, headers: corsHeaders });
      }
      qr.scan_count = (qr.scan_count || 0) + 1;
      return NextResponse.json({ qr, isDemo: true }, { headers: corsHeaders });
    }

    // GET /api/qr/[slug]/analytics - Get QR analytics
    if (segments[0] === 'qr' && segments[2] === 'analytics') {
      const slug = segments[1];
      
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        // Get QR code
        const { data: qr } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('slug', slug)
          .eq('user_id', user.id)
          .single();
        
        if (!qr) {
          return NextResponse.json({ error: 'QR code not found' }, { status: 404, headers: corsHeaders });
        }
        
        // Get events
        const { data: events } = await supabase
          .from('qr_events')
          .select('*')
          .eq('qr_code_id', qr.id)
          .order('created_at', { ascending: false })
          .limit(100);
        
        return NextResponse.json({ 
          qr, 
          events: events || [],
          stats: {
            totalScans: qr.scan_count || 0,
            recentEvents: events?.length || 0
          }
        }, { headers: corsHeaders });
      }
      // Demo mode
      const qr = demoQrCodes.find(q => q.slug === slug);
      const events = demoEvents.filter(e => e.qr_code_id === qr?.id);
      return NextResponse.json({ 
        qr, 
        events,
        stats: { totalScans: qr?.scan_count || 0, recentEvents: events.length },
        isDemo: true 
      }, { headers: corsHeaders });
    }

    // GET /api/nft/[id] - Get NFT details (mock for now)
    if (segments[0] === 'nft' && segments[1]) {
      const nftId = segments[1];
      // TODO: Fetch from contract or indexer
      return NextResponse.json({
        nft: {
          id: nftId,
          name: `NovaTok NFT #${nftId}`,
          description: 'A unique NovaTok collectible',
          image: `https://picsum.photos/seed/${nftId}/400/400`,
          contract: NFT_CONTRACT_ADDRESS,
          chainId: CHAIN_ID
        }
      }, { headers: corsHeaders });
    }

    // GET /api/marketplace/[id] - Get marketplace listing
    if (segments[0] === 'marketplace' && segments[1]) {
      const listingId = segments[1];
      // TODO: Fetch from marketplace contract or indexer
      return NextResponse.json({
        listing: {
          id: listingId,
          nftId: listingId,
          name: `NovaTok NFT #${listingId}`,
          description: 'Available on NovaTok Marketplace',
          image: `https://picsum.photos/seed/listing${listingId}/400/400`,
          price: '0.01',
          currency: 'ETH',
          seller: '0x0000...0000',
          contract: NFT_CONTRACT_ADDRESS,
          chainId: CHAIN_ID
        }
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  const segments = getPathSegments(request);
  
  try {
    const body = await request.json().catch(() => ({}));

    // POST /api/auth/signup - Sign up
    if (segments[0] === 'auth' && segments[1] === 'signup') {
      const { email, password } = body;
      
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
        }
        
        // Create user plan (in case trigger didn't fire or for safety)
        if (data.user) {
          try {
            await createUserPlan(data.user.id, email);
          } catch (planError) {
            console.log('Plan creation handled by trigger or already exists');
          }
        }
        
        return NextResponse.json({ 
          user: data.user, 
          session: data.session,
          message: 'Check your email for confirmation'
        }, { headers: corsHeaders });
      }
      // Demo mode - instant signup
      const userId = uuidv4();
      demoSession = {
        id: userId,
        email: email || 'demo@novatok.app',
        isDemo: true
      };
      
      // Create demo user plan
      await createUserPlan(userId, email);
      
      return NextResponse.json({ 
        user: demoSession, 
        session: { access_token: 'demo-token' },
        isDemo: true 
      }, { headers: corsHeaders });
    }

    // POST /api/auth/login - Login
    if (segments[0] === 'auth' && segments[1] === 'login') {
      const { email, password } = body;
      
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
        }
        
        return NextResponse.json({ 
          user: data.user, 
          session: data.session 
        }, { headers: corsHeaders });
      }
      // Demo mode - instant login
      demoSession = {
        id: uuidv4(),
        email: email || 'demo@novatok.app',
        isDemo: true
      };
      return NextResponse.json({ 
        user: demoSession, 
        session: { access_token: 'demo-token' },
        isDemo: true 
      }, { headers: corsHeaders });
    }

    // POST /api/auth/logout - Logout
    if (segments[0] === 'auth' && segments[1] === 'logout') {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      demoSession = null;
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // POST /api/qr - Create QR code
    if (segments[0] === 'qr' && !segments[1]) {
      const { name, type, destination_config } = body;
      
      // Validate
      if (!name || !type) {
        return NextResponse.json({ error: 'Name and type are required' }, { status: 400, headers: corsHeaders });
      }
      
      const validation = validateDestinationConfig(type, destination_config || {});
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: corsHeaders });
      }
      
      const slug = generateSlug();
      const qrUrl = buildQRUrl(slug, process.env.NEXT_PUBLIC_BASE_URL);
      
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        const { data, error } = await supabase
          .from('qr_codes')
          .insert({
            user_id: user.id,
            name,
            slug,
            type,
            destination_config: destination_config || {},
            is_active: true,
            scan_count: 0
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return NextResponse.json({ qr: data, qrUrl }, { status: 201, headers: corsHeaders });
      }
      // Demo mode
      const newQr = {
        id: uuidv4(),
        user_id: demoSession?.id || 'demo',
        name,
        slug,
        type,
        destination_config: destination_config || {},
        is_active: true,
        scan_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoQrCodes.unshift(newQr);
      return NextResponse.json({ qr: newQr, qrUrl, isDemo: true }, { status: 201, headers: corsHeaders });
    }

    // POST /api/qr/[slug]/event - Track event
    if (segments[0] === 'qr' && segments[2] === 'event') {
      const slug = segments[1];
      const { event_type, country, user_agent, metadata } = body;
      
      if (isSupabaseConfigured && supabaseAdmin) {
        // Get QR code ID
        const { data: qr } = await supabaseAdmin
          .from('qr_codes')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (qr) {
          await supabaseAdmin
            .from('qr_events')
            .insert({
              qr_code_id: qr.id,
              event_type: event_type || 'scan',
              country,
              user_agent,
              metadata: metadata || {}
            });
        }
      } else {
        // Demo mode
        const qr = demoQrCodes.find(q => q.slug === slug);
        if (qr) {
          demoEvents.push({
            id: uuidv4(),
            qr_code_id: qr.id,
            event_type: event_type || 'scan',
            country,
            user_agent,
            metadata: metadata || {},
            created_at: new Date().toISOString()
          });
        }
      }
      
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // POST /api/stripe/checkout - Create Stripe checkout session
    if (segments[0] === 'stripe' && segments[1] === 'checkout') {
      const stripe = await getStripe();
      
      if (!stripe) {
        return NextResponse.json({ 
          error: 'Stripe not configured',
          configured: false 
        }, { status: 400, headers: corsHeaders });
      }
      
      const { amount, currency, productName, successUrl, cancelUrl, qrSlug } = body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: productName || 'NovaTok Payment',
            },
            unit_amount: Math.round((amount || 1) * 100), // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pay/cancel`,
        metadata: {
          qr_slug: qrSlug || ''
        }
      });
      
      return NextResponse.json({ 
        sessionId: session.id, 
        url: session.url 
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request) {
  const segments = getPathSegments(request);
  
  try {
    const body = await request.json().catch(() => ({}));

    // PUT /api/qr/[id] - Update QR code
    if (segments[0] === 'qr' && segments[1]) {
      const id = segments[1];
      const { name, destination_config, is_active } = body;
      
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        const updates = { updated_at: new Date().toISOString() };
        if (name !== undefined) updates.name = name;
        if (destination_config !== undefined) updates.destination_config = destination_config;
        if (is_active !== undefined) updates.is_active = is_active;
        
        const { data, error } = await supabase
          .from('qr_codes')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return NextResponse.json({ qr: data }, { headers: corsHeaders });
      }
      // Demo mode
      const qrIndex = demoQrCodes.findIndex(q => q.id === id);
      if (qrIndex >= 0) {
        if (name !== undefined) demoQrCodes[qrIndex].name = name;
        if (destination_config !== undefined) demoQrCodes[qrIndex].destination_config = destination_config;
        if (is_active !== undefined) demoQrCodes[qrIndex].is_active = is_active;
        demoQrCodes[qrIndex].updated_at = new Date().toISOString();
        return NextResponse.json({ qr: demoQrCodes[qrIndex], isDemo: true }, { headers: corsHeaders });
      }
      return NextResponse.json({ error: 'QR code not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request) {
  const segments = getPathSegments(request);
  
  try {
    // DELETE /api/qr/[id] - Delete QR code
    if (segments[0] === 'qr' && segments[1]) {
      const id = segments[1];
      
      if (isSupabaseConfigured && supabase) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }
        
        const { error } = await supabase
          .from('qr_codes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        return NextResponse.json({ success: true }, { headers: corsHeaders });
      }
      // Demo mode
      demoQrCodes = demoQrCodes.filter(q => q.id !== id);
      return NextResponse.json({ success: true, isDemo: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
