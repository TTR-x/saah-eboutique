
'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  if (items.length === 0) {
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Votre Panier</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <Link href={`/products/${item.id}`} className="font-semibold hover:underline">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">{item.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-20 text-center"
                  />
                  <p className="font-semibold w-24 text-right">
                    {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
           <Button variant="outline" onClick={clearCart} className="mt-6">
            Vider le panier
          </Button>
        </div>
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-card sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>
            <div className="flex justify-between mb-2">
              <span>Sous-total</span>
              <span>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <Button size="lg" className="w-full mt-6">Passer à la caisse</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
