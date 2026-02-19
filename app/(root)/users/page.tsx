'use client';

import { useState } from 'react';
import {
  useUsers,
  useBlockUser,
  useUnblockUser,
  useGiveTokens,
} from '@/hooks/useAdmin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, ShieldAlert, ShieldCheck, Coins, Search } from 'lucide-react';

const Page = () => {
  const { data: users, isLoading } = useUsers();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const giveTokens = useGiveTokens();

  const [search, setSearch] = useState('');
  const [tokenDialogUser, setTokenDialogUser] = useState<any>(null);
  const [tokenAmount, setTokenAmount] = useState('');

  const filtered = users?.filter(
    (u: any) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleGiveTokens = () => {
    if (tokenDialogUser && tokenAmount) {
      giveTokens.mutate({
        userId: tokenDialogUser.id,
        amount: Number(tokenAmount),
        reason: 'Начислено из панели администратора',
      });
      setTokenAmount('');
      setTokenDialogUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Пользователи
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {users?.length ?? 0}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по email или логину..."
            className="h-9 rounded-md border border-input bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs">Пользователь</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Баланс</TableHead>
              <TableHead className="text-xs">Роль</TableHead>
              <TableHead className="text-xs">Статус</TableHead>
              <TableHead className="text-xs text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((user: any) => (
              <TableRow key={user.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground uppercase">
                      {user.username?.[0] ?? '?'}
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-primary">
                    {user.tokens} ✦
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isBlocked ? (
                    <Badge variant="destructive" className="text-xs">
                      Заблокирован
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs border-emerald-600/40 text-emerald-500 bg-emerald-500/5"
                    >
                      Активен
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {/* Give tokens */}
                    <button
                      onClick={() => setTokenDialogUser(user)}
                      className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:border-amber-400/40 hover:bg-amber-400/5 transition-colors"
                      title="Начислить токены"
                    >
                      <Coins className="h-3.5 w-3.5" />
                    </button>

                    {/* Block/Unblock */}
                    {user.isBlocked ? (
                      <button
                        onClick={() => unblockUser.mutate(user.id)}
                        disabled={unblockUser.isPending}
                        className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-colors disabled:opacity-50"
                        title="Разблокировать"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => blockUser.mutate(user.id)}
                        disabled={blockUser.isPending}
                        className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/5 transition-colors disabled:opacity-50"
                        title="Заблокировать"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground text-sm py-12"
                >
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Token Dialog */}
      <Dialog
        open={!!tokenDialogUser}
        onOpenChange={(open) => {
          if (!open) {
            setTokenDialogUser(null);
            setTokenAmount('');
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Начислить токены — {tokenDialogUser?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Количество</label>
              <input
                type="number"
                min={1}
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="100"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleGiveTokens}
              disabled={!tokenAmount || giveTokens.isPending}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {giveTokens.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Начислить'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
