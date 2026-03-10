'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, LogOut, LogIn, Home, Package, Ship, LifeBuoy } from 'lucide-react';
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

  const navItems = [
    { name: 'Accueil', href: '/', icon: <Home className="h-6 w-6" /> },
    { name: 'Plans', href: '/products', icon: <Package className="h-6 w-6" /> },
    { name: 'Import', href: '/import', icon: <Ship className="h-6 w-6" /> },
    { name: 'Support', href: '/support', icon: <LifeBuoy className="h-6 w-6" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      {isLoading && <Progress value={100} className="absolute top-0 h-[2px] animate-pulse duration-1000 bg-primary" />}
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="flex items-center shrink-0" onClick={handleLinkClick}>
            <Logo />
          </Link>
          <form onSubmit={handleSearchSubmit} className="hidden lg:block ml-2 group">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#65676b]" />
              <Input 
                type="search" 
                placeholder="Rechercher sur SAAH..." 
                className="pl-9 h-10 w-64 bg-[#f0f2f5] border-none rounded-full focus:ring-1 focus:ring-primary text-sm placeholder:text-[#65676b]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full bg-[#f0f2f5] text-[#1c1e21]">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Center: Navigation Icons */}
        <nav className="hidden md:flex items-center justify-center flex-1 h-full gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`relative flex items-center justify-center w-24 h-full group transition-colors`}
                title={item.name}
              >
                <div className={`flex items-center justify-center w-full h-12 rounded-lg group-hover:bg-[#f2f3f5] transition-all ${isActive ? 'text-primary' : 'text-[#65676b]'}`}>
                  {item.icon}
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Right: User Actions */}
        <div className="flex items-center justify-end gap-2 flex-1">
          <Button asChild variant="ghost" size="icon" className="relative rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#1c1e21]">
            <Link href="/cart" onClick={handleLinkClick}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#1c1e21]" disabled={loading}>
                     {user ? <UserAvatar /> : <User className="h-5 w-5" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-none mt-2 p-2">
                {user ? (
                    <>
                         <DropdownMenuItem asChild className="rounded-lg">
                           <Link href={isAdmin ? "/admin" : "#"} onClick={isAdmin ? handleLinkClick : (e) => e.preventDefault()} className="flex items-center w-full p-2 cursor-pointer gap-3">
                              <UserAvatar />
                              <div className="flex flex-col items-start overflow-hidden">
                                  <p className="font-bold text-[#1c1e21] truncate w-full">{user.displayName || user.email?.split('@')[0]}</p>
                                  <p className="text-xs text-[#65676b]">Voir le profil {isAdmin && '(Admin)'}</p>
                              </div>
                           </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator className="my-2" />
                        <SignOutButton>
                            <DropdownMenuItem className="p-2 text-red-500 font-bold focus:text-red-500 focus:bg-red-50 cursor-pointer rounded-lg">
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </SignOutButton>
                    </>
                ) : (
                  <DropdownMenuItem className="p-3 font-bold text-[#1c1e21] cursor-default rounded-lg">
                     <div className="flex items-center w-full gap-2">
                      <LogIn className="h-5 w-5" />
                       Visiteur
                    </div>
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full bg-[#f0f2f5] text-[#1c1e21]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-none bg-[#f0f2f5]">
                <SheetHeader className="p-4 bg-white border-b text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="p-2 space-y-1">
                  {navItems.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-[#1c1e21] rounded-lg hover:bg-white transition-all shadow-sm border border-transparent hover:border-[#dddfe2]"
                    >
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
