'use client';
import { usePlans, useTariffStats } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Coins, Users } from 'lucide-react';

export default function TariffsPage() {
    const { data: plans, isLoading: plansLoading } = usePlans();
    const { data: stats, isLoading: statsLoading } = useTariffStats();

    if (plansLoading || statsLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Тарифы и Статистика</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Активные подписки</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Доход с тарифов</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans?.map((plan: any) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>${plan.price}</TableCell>
                                <TableCell>{plan.tokens} / мес</TableCell>
                                <TableCell>{plan.isActive ? 'Активен' : 'Архив'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}