// Types for the rewards system
export type RewardTier = 'first' | 'second' | 'third' | 'mostActive';

export interface Reward {
  id: string;
  tier: RewardTier;
  amount: number;
  name: string;
  description: string;
  requirements: {
    minRank?: number;
    maxRank?: number;
    minParticipation?: number;
    minStreak?: number;
  };
}

export interface RewardClaim {
  id: string;
  userId: string;
  rewardId: string;
  claimedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
}
