
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, Moon, Sun, Shield, LogOut, LogIn } from 'lucide-react';
import { Logo } from './logo';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { SignOutButton } from '../auth/sign-out-button';
import { UserAvatar } from '../auth/user-avatar';
import { useCart } from '@/hooks/use-cart';

const navLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Produits', href: '/products' },
  { name: 'Import', href: '/import' },
  { name: 'Support', href: '/support' },
];

export function Header() {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);


  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const newPath = new URL(e.currentTarget.href).pathname;
    if (newPath === pathname) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {isLoading && <Progress value={100} className="absolute top-0 h-1 animate-pulse duration-1000" />}
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6" onClick={handleLinkClick}>
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={handleLinkClick}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mb-8" onClick={handleLinkClick}>
                <Logo />
              </Link>
              <div className="flex flex-col space-y-4">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="text-lg font-medium transition-colors hover:text-foreground/80 text-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Rechercher..." className="pl-8 sm:w-40 md:w-64" />
              </div>
            </form>
          </div>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart" onClick={handleLinkClick}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Changer de thème</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Clair
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Sombre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                Système
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    {user ? <UserAvatar /> : <User className="h-5 w-5" />}
                    <span className="sr-only">Compte</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {user ? (
                    <>
                        <DropdownMenuItem asChild>
                            <div className="flex flex-col items-start p-2">
                                <p className="font-medium text-sm">{user.displayName || user.email}</p>
                            </div>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <SignOutButton>
                            <DropdownMenuItem>
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </SignOutButton>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                            <Link href="/admin" onClick={handleLinkClick}>
                                <Shield className="mr-2 h-4 w-4" />
                                Administration
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link href="/login" onClick={handleLinkClick}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Se connecter
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
