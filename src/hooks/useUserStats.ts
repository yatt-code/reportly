'use client';

import { useState, useEffect } from 'react';
import { getUserStats } from '@/app/actions/user/getUserStats';

interface UserStats {
  xp: number;
  level: number;
  lastUpdated: string;
}

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user XP and level stats
 */
export function useUserStats(): UseUserStatsResult {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserStats();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
