'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLogout } from '@/hooks/useAdmin';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import {
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';

const items = [
  {
    title: 'Дашборд',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Пользователи',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Настройки',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) router.replace('/login');
  }, [router]);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/');
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-muted-foreground">
            Админ панель
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 space-y-1">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              tooltip="Выйти"
              className="text-muted-foreground hover:text-destructive"
            >
              {logout.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>Выход</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
