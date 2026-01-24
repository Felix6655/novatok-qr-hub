// User Plans Helper Library
// Manages subscription plans (Free/Pro/Business) with Supabase integration

import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase';

// Plan types
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business'
};

// Plan limits (matches database plan_limits table)
export const PLAN_LIMITS = {
  [PLANS.FREE]: {
    maxQrCodes: 5,
    maxScansPerMonth: 1000,
    customDomains: false,
    analyticsRetentionDays: 7,
    prioritySupport: false,
    apiAccess: false,
    whiteLabel: false
  },
  [PLANS.PRO]: {
    maxQrCodes: 50,
    maxScansPerMonth: 50000,
    customDomains: true,
    analyticsRetentionDays: 90,
    prioritySupport: true,
    apiAccess: true,
    whiteLabel: false
  },
  [PLANS.BUSINESS]: {
    maxQrCodes: -1, // unlimited
    maxScansPerMonth: null, // unlimited
    customDomains: true,
    analyticsRetentionDays: 365,
    prioritySupport: true,
    apiAccess: true,
    whiteLabel: true
  }
};

// Demo mode plan storage
let demoUserPlans = new Map();

/**
 * Get user's plan information
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User plan object
 */
export async function getUserPlan(userId) {
  if (!userId) {
    return getDefaultPlan();
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // No plan found, return free plan
        return getDefaultPlan(userId);
      }

      // Check if subscription is still active for paid plans
      const effectivePlan = getEffectivePlan(data);

      return {
        userId: data.user_id,
        plan: data.plan,
        effectivePlan,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodEnd: data.current_period_end,
        isActive: isSubscriptionActive(data),
        limits: PLAN_LIMITS[effectivePlan],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user plan:', error);
      return getDefaultPlan(userId);
    }
  }

  // Demo mode
  const demoPlan = demoUserPlans.get(userId);
  if (demoPlan) {
    return demoPlan;
  }
  return getDefaultPlan(userId);
}

/**
 * Get the effective plan (considering expiration)
 */
function getEffectivePlan(planData) {
  if (planData.plan === PLANS.FREE) {
    return PLANS.FREE;
  }

  // For paid plans, check if subscription is still valid
  if (planData.current_period_end) {
    const endDate = new Date(planData.current_period_end);
    if (endDate < new Date()) {
      // Subscription expired
      return PLANS.FREE;
    }
  }

  return planData.plan;
}

/**
 * Check if subscription is active
 */
function isSubscriptionActive(planData) {
  if (planData.plan === PLANS.FREE) {
    return true; // Free is always "active"
  }

  if (!planData.current_period_end) {
    return false;
  }

  const endDate = new Date(planData.current_period_end);
  return endDate > new Date();
}

/**
 * Get default free plan
 */
function getDefaultPlan(userId = null) {
  return {
    userId,
    plan: PLANS.FREE,
    effectivePlan: PLANS.FREE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    isActive: true,
    limits: PLAN_LIMITS[PLANS.FREE],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create user plan on signup
 * @param {string} userId - User ID
 * @param {string} email - User email (optional, for Stripe customer creation later)
 * @returns {Promise<Object>} Created plan object
 */
export async function createUserPlan(userId, email = null) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // Check if plan already exists
      const { data: existing } = await supabaseAdmin
        .from('user_plans')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Plan already exists, return it
        return getUserPlan(userId);
      }

      // Create new plan
      const { data, error } = await supabaseAdmin
        .from('user_plans')
        .insert({
          user_id: userId,
          plan: PLANS.FREE
        })
        .select()
        .single();

      if (error) {
        // If duplicate key error, plan was created by trigger
        if (error.code === '23505') {
          return getUserPlan(userId);
        }
        throw error;
      }

      return {
        userId: data.user_id,
        plan: data.plan,
        effectivePlan: data.plan,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        isActive: true,
        limits: PLAN_LIMITS[data.plan],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating user plan:', error);
      throw error;
    }
  }

  // Demo mode
  const newPlan = getDefaultPlan(userId);
  demoUserPlans.set(userId, newPlan);
  return newPlan;
}

/**
 * Update user plan (for Stripe webhook handlers)
 * @param {string} userId - User ID
 * @param {Object} updates - Plan updates
 * @returns {Promise<Object>} Updated plan object
 */
export async function updateUserPlan(userId, updates) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const allowedUpdates = {};
  if (updates.plan && Object.values(PLANS).includes(updates.plan)) {
    allowedUpdates.plan = updates.plan;
  }
  if (updates.stripeCustomerId !== undefined) {
    allowedUpdates.stripe_customer_id = updates.stripeCustomerId;
  }
  if (updates.stripeSubscriptionId !== undefined) {
    allowedUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
  }
  if (updates.currentPeriodEnd !== undefined) {
    allowedUpdates.current_period_end = updates.currentPeriodEnd;
  }
  allowedUpdates.updated_at = new Date().toISOString();

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_plans')
        .update(allowedUpdates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const effectivePlan = getEffectivePlan(data);
      return {
        userId: data.user_id,
        plan: data.plan,
        effectivePlan,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodEnd: data.current_period_end,
        isActive: isSubscriptionActive(data),
        limits: PLAN_LIMITS[effectivePlan],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  }

  // Demo mode
  const existingPlan = demoUserPlans.get(userId) || getDefaultPlan(userId);
  const updatedPlan = {
    ...existingPlan,
    plan: updates.plan || existingPlan.plan,
    effectivePlan: updates.plan || existingPlan.effectivePlan,
    stripeCustomerId: updates.stripeCustomerId ?? existingPlan.stripeCustomerId,
    stripeSubscriptionId: updates.stripeSubscriptionId ?? existingPlan.stripeSubscriptionId,
    currentPeriodEnd: updates.currentPeriodEnd ?? existingPlan.currentPeriodEnd,
    updatedAt: new Date().toISOString()
  };
  updatedPlan.limits = PLAN_LIMITS[updatedPlan.effectivePlan];
  updatedPlan.isActive = updatedPlan.plan === PLANS.FREE || 
    (updatedPlan.currentPeriodEnd && new Date(updatedPlan.currentPeriodEnd) > new Date());
  
  demoUserPlans.set(userId, updatedPlan);
  return updatedPlan;
}

/**
 * Check if user can perform action based on plan limits
 * @param {string} userId - User ID
 * @param {string} action - Action type ('create_qr', 'scan', etc.)
 * @param {Object} context - Additional context (current counts, etc.)
 * @returns {Promise<Object>} { allowed: boolean, reason?: string }
 */
export async function checkPlanLimit(userId, action, context = {}) {
  const userPlan = await getUserPlan(userId);
  const limits = userPlan.limits;

  switch (action) {
    case 'create_qr':
      if (limits.maxQrCodes === -1) {
        return { allowed: true };
      }
      if (context.currentQrCount >= limits.maxQrCodes) {
        return { 
          allowed: false, 
          reason: `You've reached the maximum of ${limits.maxQrCodes} QR codes on the ${userPlan.effectivePlan} plan. Upgrade to create more.`
        };
      }
      return { allowed: true };

    case 'use_custom_domain':
      if (!limits.customDomains) {
        return { 
          allowed: false, 
          reason: 'Custom domains are not available on the free plan. Upgrade to Pro or Business.'
        };
      }
      return { allowed: true };

    case 'api_access':
      if (!limits.apiAccess) {
        return { 
          allowed: false, 
          reason: 'API access is not available on the free plan. Upgrade to Pro or Business.'
        };
      }
      return { allowed: true };

    case 'white_label':
      if (!limits.whiteLabel) {
        return { 
          allowed: false, 
          reason: 'White-label features are only available on the Business plan.'
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Get plan comparison data for pricing page
 */
export function getPlanComparison() {
  return {
    plans: [
      {
        id: PLANS.FREE,
        name: 'Free',
        price: 0,
        interval: 'month',
        description: 'Perfect for getting started',
        features: [
          '5 QR codes',
          '1,000 scans/month',
          '7 days analytics',
          'Basic support'
        ],
        limits: PLAN_LIMITS[PLANS.FREE]
      },
      {
        id: PLANS.PRO,
        name: 'Pro',
        price: 19,
        interval: 'month',
        description: 'For growing businesses',
        features: [
          '50 QR codes',
          '50,000 scans/month',
          '90 days analytics',
          'Custom domains',
          'API access',
          'Priority support'
        ],
        limits: PLAN_LIMITS[PLANS.PRO],
        popular: true
      },
      {
        id: PLANS.BUSINESS,
        name: 'Business',
        price: 99,
        interval: 'month',
        description: 'For large organizations',
        features: [
          'Unlimited QR codes',
          'Unlimited scans',
          '365 days analytics',
          'Custom domains',
          'API access',
          'White-label',
          'Priority support',
          'Dedicated account manager'
        ],
        limits: PLAN_LIMITS[PLANS.BUSINESS]
      }
    ]
  };
}

// Export for demo mode testing
export function resetDemoPlans() {
  demoUserPlans.clear();
}
