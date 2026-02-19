import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/layout/AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <section className="flex-1 min-h-screen">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SidebarTrigger />
            <div className="p-8">{children}</div>
          </SidebarInset>
          <Toaster theme="dark" />
        </SidebarProvider>
      </section>
    </div>
  );
}
