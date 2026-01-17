import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// Получение списка пользователей
export const useUsers = () => {
    return useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const { data } = await api.get("/admin/users");
            return data.data; // Предполагаем формат { success: true, data: [...] }
        },
    });
};

// Блокировка
export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            return api.put(`/admin/users/${userId}/block`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            toast.success("Пользователь заблокирован");
        },
    });
};

// Разблокировка
export const useUnblockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            return api.put(`/admin/users/${userId}/unblock`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            toast.success("Пользователь разблокирован");
        },
    });
};

// Выдача токенов
export const useGiveTokens = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
            return api.post(`/admin/users/${userId}/tokens`, { amount, reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            toast.success("Токены начислены");
        },
        onError: () => {
            toast.error("Ошибка начисления");
        }
    });
};

// Аналитика
export const useAnalytics = () => {
    return useQuery({
        queryKey: ["admin", "analytics"],
        queryFn: async () => {
            const { data } = await api.get("/admin/analytics");
            return data.data;
        },
    });
};