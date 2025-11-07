/**
 * PhinAccords Subscription and Pricing Management
 * Heavenkeys Ltd
 * 
 * Pricing tiers matching industry standards:
 * - Basic: CA$2.25/month (CA$27/year)
 * - Premium: CA$4/month (CA$48/year)
 * - Premium + Toolkit: CA$1.25/month first year (CA$144), then CA$72/year
 */

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'premium_toolkit';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  firstYearPrice?: number; // For special first-year pricing
  currency: string;
  features: string[];
  limitations?: {
    uploadsPerMonth?: number;
    maxFileSize?: number;
    maxDuration?: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Access to basic features',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'CAD',
    features: [
      'Guitar, piano, ukulele, mandolin chords',
      'Available on web, iOS and Android',
      'Find songs with the chords you know',
      'Sing along with lyrics',
      'Basic chord diagrams',
    ],
    limitations: {
      uploadsPerMonth: 0,
      maxFileSize: 0,
      maxDuration: 0,
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Unlimited access to songs with all Premium benefits',
    monthlyPrice: 2.25,
    yearlyPrice: 27,
    currency: 'CAD',
    features: [
      'Unlimited access to songs',
      'All Premium benefits',
      'Complete access to the Toolkit',
      'Guitar, piano, ukulele, mandolin chords',
      'Available on web, iOS and Android',
      'Find songs with the chords you know',
      'Sing along with lyrics',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'All the benefits of Basic, plus advanced features',
    monthlyPrice: 4,
    yearlyPrice: 48,
    currency: 'CAD',
    features: [
      'No commercial advertising',
      'Transpose in one click',
      'Download chord MIDI files',
      'Chord diagrams and sheets in PDF',
      'Change the tempo',
      'Setlists to organize songs',
      'Loop parts of a song',
      'Digital capo',
      'Count-off for perfect timing',
      'Song and chords volume',
      'Upload your own music files',
      'Complete access to the Toolkit',
    ],
    limitations: {
      uploadsPerMonth: 50,
      maxFileSize: 32 * 1024 * 1024, // 32MB
      maxDuration: 20 * 60, // 20 minutes
    },
  },
  premium_toolkit: {
    id: 'premium_toolkit',
    name: 'Premium + Toolkit',
    description: 'Complete access to all features including advanced Toolkit',
    monthlyPrice: 1.25, // First year special pricing
    yearlyPrice: 72, // After first year
    firstYearPrice: 144, // First year special
    currency: 'CAD',
    features: [
      'Tuner with advanced functions',
      'Metronome with drumbeat',
      'Learn and practice all chords',
      'Detect what chord is playing (Live Chord Detection)',
      'No commercial advertising',
      'Transpose in one click',
      'Download chord MIDI files',
      'Chord diagrams and sheets in PDF',
      'Change the tempo',
      'Setlists to organize songs',
      'Loop parts of a song',
      'Digital capo',
      'Count-off for perfect timing',
      'Song and chords volume',
      'Upload your own music files',
    ],
    limitations: {
      uploadsPerMonth: 100,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxDuration: 20 * 60, // 20 minutes
    },
  },
};

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date | null;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  cancelAtPeriodEnd?: boolean;
  isFirstYear?: boolean; // For Premium + Toolkit first year pricing
}

export const FEATURE_FLAGS: Record<SubscriptionTier, Record<string, boolean>> = {
  free: {
    viewChords: true,
    viewLyrics: true,
    searchSongs: true,
    transpose: false,
    capo: false,
    tempo: false,
    loop: false,
    midiExport: false,
    pdfExport: false,
    setlists: false,
    upload: false,
    tuner: false,
    metronome: false,
    liveDetection: false,
    practiceChords: false,
    noAds: false,
    countOff: false,
    volumeControl: false,
  },
  basic: {
    viewChords: true,
    viewLyrics: true,
    searchSongs: true,
    transpose: true,
    capo: true,
    tempo: true,
    loop: true,
    midiExport: true,
    pdfExport: true,
    setlists: true,
    upload: true,
    tuner: true,
    metronome: true,
    liveDetection: true,
    practiceChords: true,
    noAds: true,
    countOff: true,
    volumeControl: true,
  },
  premium: {
    viewChords: true,
    viewLyrics: true,
    searchSongs: true,
    transpose: true,
    capo: true,
    tempo: true,
    loop: true,
    midiExport: true,
    pdfExport: true,
    setlists: true,
    upload: true,
    tuner: true,
    metronome: true,
    liveDetection: false, // Requires Toolkit
    practiceChords: false, // Requires Toolkit
    noAds: true,
    countOff: true,
    volumeControl: true,
  },
  premium_toolkit: {
    viewChords: true,
    viewLyrics: true,
    searchSongs: true,
    transpose: true,
    capo: true,
    tempo: true,
    loop: true,
    midiExport: true,
    pdfExport: true,
    setlists: true,
    upload: true,
    tuner: true,
    metronome: true,
    liveDetection: true,
    practiceChords: true,
    noAds: true,
    countOff: true,
    volumeControl: true,
  },
};

export function hasFeature(
  tier: SubscriptionTier,
  feature: string
): boolean {
  return FEATURE_FLAGS[tier]?.[feature] ?? false;
}

export function canUpload(
  tier: SubscriptionTier,
  fileSize: number,
  duration: number
): { allowed: boolean; reason?: string } {
  const plan = SUBSCRIPTION_PLANS[tier];
  
  if (tier === 'free') {
    return { allowed: false, reason: 'Upload requires Basic, Premium, or Premium + Toolkit subscription' };
  }
  
  if (plan.limitations) {
    if (plan.limitations.maxFileSize && fileSize > plan.limitations.maxFileSize) {
      return {
        allowed: false,
        reason: `File size exceeds limit of ${plan.limitations.maxFileSize / (1024 * 1024)}MB`,
      };
    }
    
    if (plan.limitations.maxDuration && duration > plan.limitations.maxDuration) {
      return {
        allowed: false,
        reason: `Duration exceeds limit of ${plan.limitations.maxDuration / 60} minutes`,
      };
    }
  }
  
  return { allowed: true };
}

export function formatPrice(price: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(price);
}

export function getYearlySavings(tier: SubscriptionTier): number {
  const plan = SUBSCRIPTION_PLANS[tier];
  const monthlyTotal = plan.monthlyPrice * 12;
  return monthlyTotal - plan.yearlyPrice;
}

export function getYearlySavingsPercentage(tier: SubscriptionTier): number {
  const plan = SUBSCRIPTION_PLANS[tier];
  const monthlyTotal = plan.monthlyPrice * 12;
  if (monthlyTotal === 0) return 0;
  return Math.round((getYearlySavings(tier) / monthlyTotal) * 100);
}

