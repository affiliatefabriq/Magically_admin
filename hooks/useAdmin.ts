import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { adminLogout } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// --- Types ---
export interface TimeRange {
  preset?: 'day' | 'week' | 'month';
  from?: string;
  to?: string;
}

// --- Users ---
export const useUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.data;
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      api.put(`/admin/users/${userId}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Пользователь заблокирован');
    },
    onError: () => toast.error('Ошибка блокировки'),
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      api.put(`/admin/users/${userId}/unblock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Пользователь разблокирован');
    },
    onError: () => toast.error('Ошибка разблокировки'),
  });
};

export const useGiveTokens = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      reason,
    }: {
      userId: string;
      amount: number;
      reason: string;
    }) => api.post(`/admin/users/${userId}/tokens`, { amount, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Токены начислены');
    },
    onError: () => toast.error('Ошибка начисления'),
  });
};

// --- Analytics ---
export const useAnalytics = (range?: TimeRange) => {
  const params: Record<string, string> = {};
  if (range?.preset) {
    params.preset = range.preset;
  } else if (range?.from && range?.to) {
    params.from = range.from;
    params.to = range.to;
  }

  return useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics', { params });
      return data.data;
    },
  });
};

// --- Settings ---
export interface Settings {
  imageCost: number;
  videoCost: number;
  aiCost1K: number;
  aiCost2K: number;
  systemPrompt: string;
  trialTokens: number;
  trialPeriodDays: number;
  subscriptionGracePeriodDays: number;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data.data as Settings;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) =>
      api.put('/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Настройки сохранены');
    },
    onError: () => toast.error('Ошибка сохранения настроек'),
  });
};

// --- Auth ---
export const useLogout = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      router.push('/login');
    },
  });
};

// Тарифы
export const usePlans = () =>
  useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => (await api.get('/admin/plans')).data.data.plans,
  });

export const useTariffStats = () =>
  useQuery({
    queryKey: ['admin', 'tariffStats'],
    queryFn: async () => (await api.get('/admin/statistics/tariffs')).data.data,
  });

// Модерация Публикаций
export const useAdminPublications = () =>
  useQuery({
    queryKey: ['admin', 'publications'],
    queryFn: async () => (await api.get('/admin/publications')).data.data,
  });
export const useDeletePublication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/publications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'publications'] });
      toast.success('Удалено');
    },
  });
};

// Тренды
export const useTrends = () =>
  useQuery({
    queryKey: ['admin', 'trends'],
    queryFn: async () => (await api.get('/admin/trends')).data.data,
  });
export const useCreateTrend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/trends', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trends'] });
      toast.success('Тренд создан');
    },
  });
};
