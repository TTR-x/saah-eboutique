
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
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ImageIcon,
  Loader2,
  Package,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { UserAvatar } from '@/components/auth/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (loading) return; // Wait for auth state to be determined

    if (!user) {
      redirect('/login?redirect=/admin'); // Redirect to login if not authenticated
      return;
    }

    if (!isAdmin) {
      router.push('/'); // Redirect to home if not admin
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
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
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/orders">
                    <Package />
                    Commandes
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
                  <Link href="#">
                    <Users />
                    Clients
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
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger/>
            <h1 className="text-2xl font-bold">Espace Administration</h1>
            {isAdmin && <UserAvatar />}
          </header>
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
