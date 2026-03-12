
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, ShoppingCart, User, LogOut, LogIn, Home, Package, Ship, LifeBuoy, Trash2, Plus, Minus, LayoutGrid } from 'lucide-react';
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
import { useUser } from '@/firebase';
import { SignOutButton } from '../auth/sign-out-button';
import { UserAvatar } from '../auth/user-avatar';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { useState } from 'react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = "saahbusiness2026@gmail.com";

export function Header() {
  const { user, loading } = useUser();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { isLoading, handleLinkClick: originalHandleLinkClick } = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    originalHandleLinkClick(e);
    setIsMenuOpen(false);
  };

  const handleCheckout = () => {
    const phoneNumber = "22890101392";
    const cartDetails = items.map(item => 
      `- ${item.name} (x${item.quantity}) : ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`
    ).join('\n');

    const message = `Bonjour SAAH Business, je souhaite passer commande pour :\n\n${cartDetails}\n\n*Total : ${total.toLocaleString('fr-FR')} FCFA*\n\nMerci de m'indiquer la marche à suivre.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsCartOpen(false);
  };

  const navItems = [
    { name: 'Accueil', href: '/', icon: <Home className="h-6 w-6" /> },
    { name: 'Boutique', href: '/products', icon: <Package className="h-6 w-6" /> },
    { name: 'Import Chine', href: '/import', icon: <Ship className="h-6 w-6" /> },
    { name: 'Centre d\'Aide', href: '/support', icon: <LifeBuoy className="h-6 w-6" /> },
  ];

  // Desktop navigation items including Dashboard if user is logged in
  const desktopNavItems = [...navItems];
  if (user) {
    desktopNavItems.push({
        name: 'Dashboard',
        href: isAdmin ? '/admin' : '/dashboard',
        icon: <LayoutGrid className="h-6 w-6" />
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {isLoading && <Progress value={100} className="absolute top-0 h-[3px] animate-pulse duration-1000 bg-primary" />}
      
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center shrink-0" onClick={handleLinkClick}>
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {desktopNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-gray-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 border-none rounded-l-3xl shadow-2xl">
              <SheetHeader className="p-6 border-b bg-white">
                <SheetTitle className="text-xl font-black flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Mon Panier ({itemCount})
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-hidden">
                {items.length > 0 ? (
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted border shrink-0">
                            <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-primary font-black text-sm">{item.price.toLocaleString('fr-FR')} F</p>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-md"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-md"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <p className="font-bold text-gray-500">Votre panier est vide</p>
                    <Button variant="link" onClick={() => setIsCartOpen(false)} className="text-primary font-bold mt-2">
                      Continuer mes achats
                    </Button>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t bg-gray-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm uppercase">Total</span>
                    <span className="text-2xl font-black text-primary">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="grid gap-2">
                    <Button onClick={handleCheckout} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg shadow-xl">
                      Commander sur WhatsApp
                    </Button>
                    <Button variant="ghost" onClick={clearCart} className="text-muted-foreground text-xs font-bold uppercase tracking-widest h-10">
                      Vider le panier
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800" disabled={loading}>
                     {user ? <UserAvatar /> : <User className="h-5 w-5" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl border-none mt-2 p-2">
                {user ? (
                    <>
                         <DropdownMenuItem asChild className="rounded-xl">
                           <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={handleLinkClick} className="flex items-center w-full p-2 cursor-pointer gap-3">
                              <UserAvatar />
                              <div className="flex flex-col items-start overflow-hidden">
                                  <p className="font-bold text-gray-900 truncate w-full">{user.displayName || user.email?.split('@')[0]}</p>
                                  <p className="text-xs text-gray-500">Mon Tableau de bord {isAdmin && '(Admin)'}</p>
                              </div>
                           </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator className="my-2" />
                        <SignOutButton>
                            <DropdownMenuItem className="p-2 text-red-500 font-bold focus:text-red-500 focus:bg-red-50 cursor-pointer rounded-xl">
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </SignOutButton>
                    </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/login" onClick={handleLinkClick} className="flex items-center w-full p-3 font-bold text-gray-900 cursor-pointer gap-2">
                        <LogIn className="h-5 w-5 text-primary" />
                        Se connecter
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/signup" onClick={handleLinkClick} className="flex items-center w-full p-3 font-bold text-gray-900 cursor-pointer gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Créer un compte
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full bg-gray-100 text-gray-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 border-none bg-gray-50">
                <SheetHeader className="p-4 bg-white border-b text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  <nav className="space-y-1">
                    {navItems.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl transition-all shadow-sm border border-transparent hover:bg-white hover:border-gray-200",
                          pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-800"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-full",
                          pathname === item.href ? "bg-primary text-black" : "bg-primary/10 text-primary"
                        )}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    ))}
                    {user && (
                      <Link
                        href={isAdmin ? "/admin" : "/dashboard"}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-blue-600 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent"
                      >
                        <div className="p-2 rounded-full bg-blue-50">
                          <LayoutGrid className="h-6 w-6" />
                        </div>
                        Tableau de bord
                      </Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
