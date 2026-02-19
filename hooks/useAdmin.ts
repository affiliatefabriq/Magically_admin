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
  systemPrompt: string;
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
