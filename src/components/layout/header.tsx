'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, LogOut, LogIn } from 'lucide-react';
import { Logo } from './logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { SignOutButton } from '../auth/sign-out-button';
import { UserAvatar } from '../auth/user-avatar';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { useState } from 'react';

const baseNavLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Plans', href: '/products' },
  { name: 'Import', href: '/import' },
  { name: 'Support', href: '/support' },
];

const ADMIN_EMAIL = "sabbataka02@gmail.com";

export function Header() {
  const { user, loading } = useAuth();
  const { items } = useCart();
  const { isLoading, handleLinkClick: originalHandleLinkClick } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    originalHandleLinkClick(e);
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      {isLoading && <Progress value={100} className="absolute top-0 h-[2px] animate-pulse duration-1000 bg-primary" />}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-6 w-6 text-[#1c1e21]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2">
                  {baseNavLinks.map(link => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={handleLinkClick}
                      className="flex items-center px-4 py-3 text-base font-bold text-[#1c1e21] rounded-lg hover:bg-[#f2f3f5] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          <Link href="/" className="flex items-center" onClick={handleLinkClick}>
            <Logo />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {baseNavLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              className={`px-4 py-2 text-sm font-bold transition-all rounded-full ${pathname === link.href ? 'text-primary bg-primary/10' : 'text-[#65676b] hover:bg-[#f2f3f5] hover:text-[#1c1e21]'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearchSubmit} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#65676b]" />
              <Input 
                type="search" 
                placeholder="Rechercher..." 
                className="pl-9 h-9 w-40 md:w-64 bg-[#f0f2f5] border-none rounded-full focus:ring-1 focus:ring-primary text-sm" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <Button asChild variant="ghost" size="icon" className="relative rounded-full hover:bg-[#f2f3f5]">
            <Link href="/cart" onClick={handleLinkClick}>
              <ShoppingCart className="h-5 w-5 text-[#1c1e21]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#f2f3f5]" disabled={loading}>
                     {user ? <UserAvatar /> : <div className="bg-[#f0f2f5] p-2 rounded-full"><User className="h-5 w-5 text-[#1c1e21]" /></div>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-none mt-2">
                {user ? (
                    <>
                         <DropdownMenuItem asChild>
                           <Link href={isAdmin ? "/admin" : "#"} onClick={isAdmin ? handleLinkClick : (e) => e.preventDefault()} className="flex items-center w-full p-3 cursor-pointer">
                              <div className="flex flex-col items-start overflow-hidden">
                                  <p className="font-bold text-[#1c1e21] truncate w-full">{user.displayName || user.email}</p>
                                  {isAdmin && <p className="text-xs font-semibold text-primary">Tableau de bord</p>}
                              </div>
                           </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <SignOutButton>
                            <DropdownMenuItem className="p-3 text-red-500 font-bold focus:text-red-500 focus:bg-red-50 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </SignOutButton>
                    </>
                ) : (
                  <DropdownMenuItem className="p-3 font-bold text-[#1c1e21] cursor-default">
                     <div className="flex items-center w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                       Visiteur
                    </div>
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
