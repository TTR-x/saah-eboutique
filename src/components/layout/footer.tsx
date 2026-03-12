
'use client';

import Link from 'next/link';
import { Logo } from './logo';
import { useNavigation } from '@/hooks/use-navigation';
import { usePathname } from 'next/navigation';

export function Footer() {
  const { handleLinkClick } = useNavigation();
  const pathname = usePathname();

  // Masquer le footer sur le dashboard client et l'espace administration
  if (pathname === '/dashboard' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col items-start">
            <Link href="/" className="mb-4" onClick={handleLinkClick}>
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground">
              Votre destination unique pour le high-tech, la mode, la maison et plus.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" onClick={handleLinkClick} className="text-sm text-muted-foreground hover:text-primary">Accueil</Link></li>
              <li><Link href="/products" onClick={handleLinkClick} className="text-sm text-muted-foreground hover:text-primary">Produits</Link></li>
              <li><Link href="/import" onClick={handleLinkClick} className="text-sm text-muted-foreground hover:text-primary">Import</Link></li>
              <li><Link href="/support" onClick={handleLinkClick} className="text-sm text-muted-foreground hover:text-primary">Support</Link></li>
              <li><Link href="/cart" onClick={handleLinkClick} className="text-sm text-muted-foreground hover:text-primary">Panier</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Conditions Générales de Vente</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Politique de Confidentialité</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Politique de Retour</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Tiktok" className="text-muted-foreground hover:text-primary">
                <TiktokIcon className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary">
                <InstagramIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SAAH Business. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm2.24 10.38h-1.62v4.94h-2.1v-4.94h-1.04v-1.88h1.04v-1.26c0-1.2.58-1.92 1.92-1.92h1.44v1.88h-.88c-.35 0-.42.17-.42.41v.9h1.3l-.18 1.88z" />
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.15-4.52-1.74-7.05.32-1.95 1.58-3.63 3.19-4.73 1.66-1.14 3.61-1.72 5.59-1.71.02 1.59-.01 3.18-.01 4.77-.58-.04-1.15-.08-1.73-.08-1.07 0-2.14.31-3.08.85-.93.53-1.63 1.39-1.94 2.45-.33 1.11-.31 2.38.05 3.48.38 1.14 1.09 2.12 2.12 2.68 1.03.56 2.23.75 3.42.59.01-2.19.01-4.38.01-6.57 0-2.26 0-4.52-.02-6.78l.02-.02Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6a3.6 3.6 0 0 0-3.6-3.6H7.6zM12 6.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4m0 2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5-2.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
    </svg>
  );
}
