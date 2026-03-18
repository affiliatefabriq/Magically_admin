'use client';
import { usePlans, useTariffStats } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Coins, Users, Trash2 } from 'lucide-react';

type AdminPlanUiConfig = {
  themeKey: string;
  cardBackground: string;
  headerGradientFrom: string;
  headerGradientTo: string;
  buttonGradientFrom: string;
  buttonGradientTo: string;
  flaskIcon: string;
  pointIcon: string;
  energyBonus: number;
  bottomTitle: string;
  bottomSubtitle: string;
};

type AdminPlan = {
  id: string;
  name: string;
  description: string | null;
  tokenAmount: number;
  price: number;
  type: 'package' | 'subscription' | 'topup';
  periodDays: number | null;
  isActive: boolean;
  currency: string;
  uiConfig?: Partial<AdminPlanUiConfig> | null;
};

export default function TariffsPage() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: stats, isLoading: statsLoading } = useTariffStats();
  const qc = useQueryClient();

  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    tokenAmount: 0,
    price: 0,
    type: 'subscription',
    periodDays: 30,
    isActive: true,
    currency: 'RUB',
    uiConfig: {
      themeKey: 'green',
      cardBackground: '#0A0A0A',
      headerGradientFrom: '#AAFF00',
      headerGradientTo: '#268660',
      buttonGradientFrom: '#AAFF00',
      buttonGradientTo: '#268660',
      flaskIcon: '/assets/flask_green.svg',
      pointIcon: '/assets/point_green.svg',
      energyBonus: 0,
      bottomTitle: '',
      bottomSubtitle: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        tokenAmount: Number(form.tokenAmount),
        price: Number(form.price),
        type: form.type,
        periodDays: form.periodDays,
        isActive: form.isActive,
        currency: form.currency,
        uiConfig: {
          themeKey: form.uiConfig.themeKey,
          cardBackground: form.uiConfig.cardBackground,
          headerGradient: [form.uiConfig.headerGradientFrom, form.uiConfig.headerGradientTo],
          buttonGradient: [form.uiConfig.buttonGradientFrom, form.uiConfig.buttonGradientTo],
          flaskIcon: form.uiConfig.flaskIcon,
          pointIcon: form.uiConfig.pointIcon,
          energyBonus: form.uiConfig.energyBonus,
          bottomTitle: form.uiConfig.bottomTitle || undefined,
          bottomSubtitle: form.uiConfig.bottomSubtitle || undefined,
        },
      };
      if (editingPlan?.id) {
        return api.put(`/admin/plans/${editingPlan.id}`, payload);
      }
      return api.post('/admin/plans', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      setEditingPlan(null);
      setIsDialogOpen(false);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.put(`/admin/plans/${planId}`, {
        isActive:
          !plans?.find((p: any) => p.id === planId)?.isActive,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/admin/plans/${planId}?hard=true`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      setPlanToDelete(null);
    },
  });

  const formatPrice = (plan: any) => {
    const value = Number(plan.price) || 0;
    const currency = (plan.currency || 'RUB').toUpperCase();
    const symbol =
      currency === 'RUB'
        ? '₽'
        : currency === 'BYN'
          ? 'Br'
          : currency;
    return `${symbol}${value}`;
  };

  const openCreate = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
    setForm({
      name: '',
      description: '',
      tokenAmount: 0,
      price: 0,
      type: 'subscription',
      periodDays: 30,
      isActive: true,
      currency: 'RUB',
      uiConfig: {
        themeKey: 'green',
        cardBackground: '#0A0A0A',
        headerGradientFrom: '#AAFF00',
        headerGradientTo: '#268660',
        buttonGradientFrom: '#AAFF00',
        buttonGradientTo: '#268660',
        flaskIcon: '/assets/flask_green.svg',
        pointIcon: '/assets/point_green.svg',
        energyBonus: 0,
        bottomTitle: '',
        bottomSubtitle: '',
      },
    });
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
    const ui = plan.uiConfig || {};
    const headerGradient = Array.isArray(ui.headerGradient) ? ui.headerGradient : ['#AAFF00', '#268660'];
    const buttonGradient = Array.isArray(ui.buttonGradient) ? ui.buttonGradient : ['#AAFF00', '#268660'];
    setForm({
      name: plan.name,
      description: plan.description || '',
      tokenAmount: plan.tokenAmount,
      price: plan.price,
      type: plan.type,
      periodDays: plan.periodDays,
      isActive: plan.isActive,
      currency: plan.currency || 'RUB',
      uiConfig: {
        themeKey: ui.themeKey || 'green',
        cardBackground: ui.cardBackground || '#0A0A0A',
        headerGradientFrom: headerGradient[0],
        headerGradientTo: headerGradient[1],
        buttonGradientFrom: buttonGradient[0],
        buttonGradientTo: buttonGradient[1],
        flaskIcon: ui.flaskIcon || '/assets/flask_green.svg',
        pointIcon: ui.pointIcon || '/assets/point_green.svg',
        energyBonus: ui.energyBonus ?? 0,
         bottomTitle: ui.bottomTitle || '',
         bottomSubtitle: ui.bottomSubtitle || '',
      },
    });
  };

  if (plansLoading || statsLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Тарифы и Статистика</h1>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPlan(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" onClick={openCreate}>
            Создать тариф
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan?.id ? 'Редактировать тариф' : 'Создать тариф'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Токены</Label>
                <Input
                  type="number"
                  value={form.tokenAmount}
                  onChange={(e) =>
                    setForm({ ...form, tokenAmount: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип тарифа</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({ ...form, type: value as 'package' | 'subscription' | 'topup' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Подписка</SelectItem>
                    <SelectItem value="package">Пакет</SelectItem>
                    <SelectItem value="topup">Пополнение</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Валюта</Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) => setForm({ ...form, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Валюта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="BYN">BYN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Длительность (дней)</Label>
                <Input
                  type="number"
                  value={form.periodDays ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      periodDays: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        isActive: Boolean(checked),
                      })
                    }
                  />
                  <Label htmlFor="isActive">Активен</Label>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">UI конфиг</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Тема (slug)</Label>
                  <Input
                    value={form.uiConfig.themeKey}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: { ...form.uiConfig, themeKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Фон карточки</Label>
                  <Input
                    value={form.uiConfig.cardBackground}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          cardBackground: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Градиент заголовка From</Label>
                  <Input
                    value={form.uiConfig.headerGradientFrom}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          headerGradientFrom: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Градиент заголовка To</Label>
                  <Input
                    value={form.uiConfig.headerGradientTo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          headerGradientTo: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Градиент кнопки From</Label>
                  <Input
                    value={form.uiConfig.buttonGradientFrom}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          buttonGradientFrom: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Градиент кнопки To</Label>
                  <Input
                    value={form.uiConfig.buttonGradientTo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          buttonGradientTo: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Иконка колбы</Label>
                  <Input
                    value={form.uiConfig.flaskIcon}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          flaskIcon: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Иконка поинта</Label>
                  <Input
                    value={form.uiConfig.pointIcon}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          pointIcon: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Бонус энергии</Label>
                  <Input
                    type="number"
                    value={form.uiConfig.energyBonus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          energyBonus: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Нижний заголовок</Label>
                  <Input
                    value={form.uiConfig.bottomTitle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          bottomTitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Нижний подзаголовок</Label>
                  <Input
                    value={form.uiConfig.bottomSubtitle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uiConfig: {
                          ...form.uiConfig,
                          bottomSubtitle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!planToDelete}
        onOpenChange={(open) => {
          if (!open) setPlanToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить тариф?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Тариф «{planToDelete?.name}» будет удалён безвозвратно. Пользователи,
            у которых он был активен, не потеряют историю, но новый покупку
            оформить нельзя будет. Продолжить?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlanToDelete(null)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                planToDelete && deleteMutation.mutate(planToDelete.id)
              }
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные подписки
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeSubscriptions || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Доход с тарифов
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список планов */}
      <h2 className="text-xl font-medium mt-8 mb-4">Доступные планы</h2>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Токены</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-40 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan: any) => (
              <TableRow key={plan.id} className="cursor-pointer">
                <TableCell
                  className="font-medium"
                  onClick={() => openEdit(plan)}
                >
                  {plan.name}
                </TableCell>
                <TableCell onClick={() => openEdit(plan)}>
                  {formatPrice(plan)}
                </TableCell>
                <TableCell onClick={() => openEdit(plan)}>
                  {plan.tokenAmount} / мес
                </TableCell>
                <TableCell onClick={() => openEdit(plan)}>
                  {plan.isActive ? 'Активен' : 'Архив'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deactivateMutation.isPending}
                    onClick={() => deactivateMutation.mutate(plan.id)}
                  >
                    {plan.isActive ? 'Выключить' : 'Включить'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deleteMutation.isPending}
                    onClick={() => setPlanToDelete(plan)}
                    className="ml-1 align-middle"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
