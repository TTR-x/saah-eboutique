
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
  Package,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { UserAvatar } from '@/components/auth/user-avatar';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Ne rien faire pendant que les informations d'authentification se chargent
    if (loading) {
      return;
    }

    // Si le chargement est terminé et qu'il n'y a pas d'utilisateur 
    // ou si l'utilisateur n'est pas l'administrateur, rediriger vers la page d'accueil.
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Pendant le chargement ou si l'utilisateur n'est pas l'administrateur,
  // afficher un écran de chargement pour empêcher l'affichage du contenu de l'administration.
  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <LogoSpinner className="h-16 w-16" />
      </div>
    );
  }

  // Si l'utilisateur est bien l'administrateur, afficher la mise en page de l'administration.
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
            <UserAvatar />
          </header>
          <main className="p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
