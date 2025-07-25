import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
      <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Votre panier est vide
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        On dirait que vous n'avez encore rien ajouté.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/products">Continuer mes achats</Link>
      </Button>
    </div>
  );
}
