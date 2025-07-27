
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
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LogoSpinner } from '@/components/logo-spinner';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
                // en mémorisant la page actuelle pour une redirection après connexion.
                router.replace(`/login?redirect=${pathname}`);
            } else if (user.email !== ADMIN_EMAIL) {
                // Si l'utilisateur est connecté mais n'est pas l'admin, le renvoyer à l'accueil.
                router.replace('/');
            }
        }
    }, [user, loading, router, pathname]);

    // Afficher un spinner de chargement tant que l'authentification est en cours
    // ou si l'utilisateur n'est pas encore identifié (pour éviter un flash de contenu).
    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <LogoSpinner className="h-12 w-12" />
            </div>
        );
    }
    
    // Si l'utilisateur connecté n'est pas l'administrateur, le layout ne rend rien
    // pendant que la redirection s'effectue.
    if (user.email !== ADMIN_EMAIL) {
      return null;
    }

    // Si tout est en ordre, afficher le tableau de bord.
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
