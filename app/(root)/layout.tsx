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
            <div className="sticky top-0 z-40 border-b bg-background/95 px-4 py-2 backdrop-blur">
              <SidebarTrigger />
            </div>
            <div className="p-8 pt-6">{children}</div>
          </SidebarInset>
          <Toaster theme="dark" />
        </SidebarProvider>
      </section>
    </div>
  );
}
