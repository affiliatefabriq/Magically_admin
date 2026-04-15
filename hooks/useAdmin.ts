import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
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

  if (range && 'preset' in range) {
    params.preset = range.preset || 'week';
  } else if (range && 'from' in range) {
    params.from = range.from!;
    params.to = range.to!;
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
  lkTextsEn: {
    exploreCommunityTitle: string;
    exploreCommunityDescription: string;
    payTitle: string;
    payDescription: string;
    payAmountLabel: string;
    payButtonLabel: string;
    payCreateNewButton: string;
    profileTitle: string;
    profileDescription: string;
  };
  lkTextsRu: {
    exploreCommunityTitle: string;
    exploreCommunityDescription: string;
    payTitle: string;
    payDescription: string;
    payAmountLabel: string;
    payButtonLabel: string;
    payCreateNewButton: string;
    profileTitle: string;
    profileDescription: string;
  };
  photoEffectsCollections: EffectCollection[];
  videoEffectsCollections: EffectCollection[];
  effectRouting: {
    photo_effect: { models: string[] };
    video_effect: { models: string[] };
    live_photo_template: { models: string[] };
  };
  imageCost: number;
  videoCost: number;
  photoEffectCost: number;
  videoEffectCost: number;
  aiCost1K: number;
  aiCost2K: number;
  systemPrompt: string;
  nanoBananaSystemPrompt: string;
  fluxSystemPrompt: string;
  trialTokens: number;
  trialPeriodDays: number;
  subscriptionGracePeriodDays: number;
  titlesEn: {
    guest: [];
    noModel: [];
    hasModel: [];
  };
  titlesRu: {
    guest: [];
    noModel: [];
    hasModel: [];
  };
}

export type AdminEffectTemplateType =
  | 'photo_effect'
  | 'video_effect'
  | 'live_photo_template';

export interface AdminEffectTemplate {
  id: string;
  name: string;
  description?: string | null;
  type: AdminEffectTemplateType;
  provider: string;
  coverUrl?: string | null;
  modelParams?: Record<string, unknown> | null;
  defaultPrompt?: string | null;
  costTokens?: number | null;
  isActive: boolean;
  sortOrder: number;
  publishToTrends?: boolean;
  trendGender?: 'male' | 'female' | 'both';
  trendIsHot?: boolean;
  trendCoverText?: string;
  trendContent?: string;
  trendImageSetUrls?: string[];
}

export interface EffectCollection {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  effectIds: string[];
  sortOrder: number;
  isActive: boolean;
  displayTargets?: string[];
  options?: Record<string, string>;
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

export const useEffectTemplates = (type?: AdminEffectTemplateType) =>
  useQuery({
    queryKey: ['admin', 'effect-templates', type],
    queryFn: async () => {
      const { data } = await api.get('/admin/effect-templates', {
        params: type ? { type } : undefined,
      });
      return data.data as AdminEffectTemplate[];
    },
  });

export const useCreateEffectTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AdminEffectTemplate>) =>
      api.post('/admin/effect-templates', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'effect-templates'] });
      toast.success('Шаблон создан');
    },
    onError: () => toast.error('Ошибка создания шаблона'),
  });
};

export const useUpdateEffectTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminEffectTemplate>;
    }) => api.put(`/admin/effect-templates/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'effect-templates'] });
      toast.success('Шаблон обновлен');
    },
    onError: () => toast.error('Ошибка обновления шаблона'),
  });
};

export const useDeleteEffectTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/admin/effect-templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'effect-templates'] });
      toast.success('Шаблон удален');
    },
    onError: () => toast.error('Ошибка удаления шаблона'),
  });
};

export const useUploadEffectCover = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/uploads/effect-cover', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data?.data?.url as string;
    },
    onError: () => toast.error('Ошибка загрузки изображения'),
  });

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
export type AdminPlan = {
  id: string;
  name: string;
  description: string | null;
  tokenAmount: number;
  price: number;
  type: 'package' | 'subscription' | 'topup';
  periodDays: number | null;
  isActive: boolean;
  currency: string;
  uiConfig?: Record<string, unknown> | null;
};

export const usePlans = () =>
  useQuery<AdminPlan[]>({
    queryKey: ['admin', 'plans'],
    queryFn: async () =>
      (await api.get('/admin/plans')).data.data.plans as AdminPlan[],
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
  useInfiniteQuery({
    queryKey: ['admin', 'trends', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/admin/trends', {
        params: { page: pageParam, limit: 20 },
      });
      return res.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

/** Один тренд по id */
export const useTrend = (id: string) =>
  useQuery({
    queryKey: ['admin', 'trends', id],
    queryFn: async () => (await api.get(`/admin/trends/${id}`)).data.data,
    enabled: !!id,
  });

export const useCreateTrend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post('/admin/trends', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trends'] });
      toast.success('Тренд создан');
    },
    onError: () => toast.error('Ошибка создания тренда'),
  });
};

export const useUpdateTrend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      api.put(`/admin/trends/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trends'] });
      toast.success('Тренд обновлен');
    },
    onError: () => toast.error('Ошибка обновления тренда'),
  });
};

export const useDeleteTrend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/trends/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trends'] });
      toast.success('Тренд удален');
    },
    onError: () => toast.error('Ошибка удаления тренда'),
  });
};
