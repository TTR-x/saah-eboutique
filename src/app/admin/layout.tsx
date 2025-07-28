
'use client'

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  ShoppingBag,
  Users,
  LogOut,
  ImageIcon,
  Package,
  MessageSquare,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { UserAvatar } from '@/components/auth/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Progress } from '@/components/ui/progress';
import { getUnreadMessagesCount } from '@/lib/messages-service';
import { getUnreadImportOrdersCount } from '@/lib/import-orders-service';


const ADMIN_EMAIL = "sabbataka02@gmail.com";

function AdminHeader() {
  const { isLoading } = useNavigation();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4">
       {isLoading && <Progress value={100} className="absolute top-0 left-0 right-0 h-1 animate-pulse duration-1000" />}
      <SidebarTrigger/>
      <h1 className="text-2xl font-bold">Espace Administration</h1>
      <UserAvatar />
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadOrders, setUnreadOrders] = useState(0);

    useEffect(() => {
        if (!loading) {
          if (!user) {
            router.replace(`/login?redirect=${pathname}`);
          } else if (user.email !== ADMIN_EMAIL) {
            router.replace('/');
          } else {
            setIsAuthCheckComplete(true);
          }
        }
    }, [user, loading, router, pathname]);
    
    useEffect(() => {
        if(isAuthCheckComplete) {
            const fetchUnreadCounts = async () => {
                const [messagesCount, ordersCount] = await Promise.all([
                    getUnreadMessagesCount(),
                    getUnreadImportOrdersCount()
                ]);
                setUnreadMessages(messagesCount);
                setUnreadOrders(ordersCount);
            };
            fetchUnreadCounts();
            
            // Re-fetch counts every 30 seconds
            const interval = setInterval(fetchUnreadCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthCheckComplete]);

    if (loading || !isAuthCheckComplete) {
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <LogoSpinner className="h-12 w-12" />
        </div>
      );
    }

    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <LayoutGrid />
                      Tableau de bord
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/messages">
                      <MessageSquare />
                      Messages
                      {unreadMessages > 0 && <SidebarMenuBadge>{unreadMessages}</SidebarMenuBadge>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/orders">
                      <Package />
                      Commandes
                      {unreadOrders > 0 && <SidebarMenuBadge>{unreadOrders}</SidebarMenuBadge>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/products">
                      <ShoppingBag />
                      Produits
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/slides">
                      <ImageIcon />
                      Slides
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/security">
                      <Shield />
                      Sécurité
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
               <SidebarMenu>
                  <SidebarMenuItem>
                      <SignOutButton>
                          <SidebarMenuButton>
                              <LogOut/>
                              Déconnexion
                          </SidebarMenuButton>
                      </SignOutButton>
                  </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <LogOut />
                      Retour au site
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
               </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <AdminHeader />
            <main className="p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
}
