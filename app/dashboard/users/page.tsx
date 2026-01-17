"use client";

import { useState } from "react";
import { useUsers, useBlockUser, useUnblockUser, useGiveTokens } from "@/hooks/useAdmin";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ShieldAlert, ShieldCheck, Coins } from "lucide-react";

export default function UsersPage() {
    const { data: users, isLoading } = useUsers();
    const blockUser = useBlockUser();
    const unblockUser = useUnblockUser();
    const giveTokens = useGiveTokens();

    const [searchTerm, setSearchTerm] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredUsers = users?.filter((u: any) =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGiveTokens = () => {
        if (selectedUserId && tokenAmount) {
            giveTokens.mutate({ userId: selectedUserId, amount: Number(tokenAmount), reason: "Админ панель" });
            setTokenAmount("");
            setIsDialogOpen(false);
        }
    };

    if (isLoading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Пользователи</h1>
                <Input
                    placeholder="Поиск по email или username..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Баланс</TableHead>
                            <TableHead>Роль</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers?.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="font-bold text-primary">{user.tokens} ✦</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? "default" : "secondary"}>{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.isBlocked ? (
                                        <Badge variant="destructive">Заблокирован</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-600">Активен</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Dialog open={isDialogOpen && selectedUserId === user.id} onOpenChange={(open) => { setIsDialogOpen(open); if (open) setSelectedUserId(user.id); }}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="outline" title="Начислить токены">
                                                <Coins className="h-4 w-4 text-yellow-500" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Начислить токены: {user.username}</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <Input
                                                    type="number"
                                                    placeholder="Количество"
                                                    value={tokenAmount}
                                                    onChange={(e) => setTokenAmount(e.target.value)}
                                                />
                                                <Button onClick={handleGiveTokens} className="w-full">Отправить</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {user.isBlocked ? (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="border-green-500 hover:bg-green-50"
                                            title="Разблокировать"
                                            onClick={() => unblockUser.mutate(user.id)}
                                        >
                                            <ShieldCheck className="h-4 w-4 text-green-600" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="border-red-200 hover:bg-red-50"
                                            title="Заблокировать"
                                            onClick={() => blockUser.mutate(user.id)}
                                        >
                                            <ShieldAlert className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}