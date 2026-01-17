"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users, BarChart3, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) router.push("/login");
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        router.push("/login");
    };

    const navItems = [
        { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
        { href: "/dashboard/users", label: "Пользователи", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col fixed h-full">
                <div className="text-xl font-bold mb-8 text-primary px-2">Volshebny Admin</div>
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
                <Button variant="outline" className="w-full gap-2 text-red-500 hover:text-red-600" onClick={handleLogout}>
                    <LogOut size={18} />
                    Выход
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}