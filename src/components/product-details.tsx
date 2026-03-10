
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck, Home, Share2, Wallet, Users, CreditCard } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckoutDialog } from './checkout-dialog';

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { handleLinkClick } = useNavigation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Ajouté au panier !",
      description: `${product.name} est prêt.`,
    });
  };

  return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" onClick={handleLinkClick} className="hover:text-primary"><Home className="h-4 w-4"/></Link>
          <span>/</span>
          <Link href="/products" onClick={handleLinkClick} className="hover:text-primary">Produits</Link>
          <span>/</span>
          <span className="font-medium text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative rounded-2xl overflow-hidden border shadow-sm">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex-grow">
              <div className="flex gap-2 mb-2">
                {product.isTontine && <Badge className="bg-primary text-black">Tontine Disponible</Badge>}
                {product.allowInstallments && <Badge variant="secondary">Paiement échelonné</Badge>}
              </div>
              <h1 className="text-3xl font-extrabold">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 uppercase font-bold tracking-widest">{product.brand || 'SAAH Business'}</p>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                <span className="text-sm text-muted-foreground">Prix total cash</span>
              </div>

              <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>

              <div className="mt-8 grid gap-4 p-4 bg-muted/20 rounded-xl border">
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Modes d'acquisition
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">✅ Paiement Cash immédiat</li>
                  {product.allowInstallments && (
                    <li className="flex items-center gap-2">✅ Par tranches : {product.installmentPrice?.toLocaleString('fr-FR')} FCFA x {product.installmentMonths} mois</li>
                  )}
                  {product.isTontine && (
                    <li className="flex items-center gap-2">✅ Plan Tontine : Cycle de {product.tontineDuration}</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full bg-primary text-black font-black h-14 text-lg rounded-xl hover:bg-primary/90 shadow-lg" 
                  onClick={() => setIsCheckoutOpen(true)}
                >
                    Acheter maintenant
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" variant="outline" className="rounded-xl font-bold h-12" onClick={handleAddToCart}>
                        Ajouter au panier
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 gap-2" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Lien copié !" });
                    }}>
                        <Share2 className="h-4 w-4" /> Partager
                    </Button>
                </div>
            </div>

            <div className="mt-10 border-t pt-6 grid grid-cols-2 gap-4 text-[13px] font-bold text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg"><CheckCircle className="h-4 w-4 text-green-500"/> Authentique</div>
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg"><ShieldCheck className="h-4 w-4 text-primary"/> Garantie SAAH</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-16" />

        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-4">Besoin d'aide ?</h2>
            <p className="text-muted-foreground mb-8">Nos conseillers sont disponibles pour vous guider dans le choix de votre plan d'épargne ou de tontine.</p>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-bold border-primary text-primary hover:bg-primary/5">
                <Link href="/support">Contacter le support</Link>
            </Button>
        </div>

        <CheckoutDialog 
          product={product} 
          open={isCheckoutOpen} 
          onOpenChange={setIsCheckoutOpen} 
        />
      </div>
  );
}
