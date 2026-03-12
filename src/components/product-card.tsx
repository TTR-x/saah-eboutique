'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, CreditCard, MoreHorizontal, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { CheckoutDialog } from './checkout-dialog';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const { handleLinkClick } = useNavigation();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const timeAgo = product.createdAt 
    ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: fr })
    : 'Récemment';

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté avec succès.`,
    });
  };

  return (
    <Card className="flex flex-col h-full border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white mb-6 group transition-all hover:shadow-md">
      {/* Image Style Alibaba - Plus grande et nette */}
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block relative aspect-square w-full overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges sur l'image */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-orange-500 text-white border-none text-[10px] font-black px-2 py-0.5 rounded-sm">NOUVEAU</Badge>
            )}
            <Badge className="bg-primary text-black border-none text-[10px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1">
              <Zap className="h-3 w-3 fill-black" /> OFFICIEL
            </Badge>
          </div>

          <div className="absolute bottom-2 right-2 flex gap-1">
            {product.isTontine && <Badge className="bg-green-600 text-white border-none text-[9px] font-bold">TONTINE</Badge>}
            {product.allowInstallments && <Badge className="bg-blue-600 text-white border-none text-[9px] font-bold">TRANCHES</Badge>}
          </div>
        </Link>

        {/* Contenu textuel sous l'image - Style Alibaba */}
        <div className="p-3 space-y-2">
          {/* Titre du produit */}
          <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block">
            <h3 className="text-[15px] font-medium text-gray-800 line-clamp-2 leading-tight hover:text-primary transition-colors min-h-[40px]">
              {product.name}
            </h3>
          </Link>

          {/* Prix très saillant */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900">
              {product.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-[11px] font-bold text-gray-600">FCFA</span>
          </div>

          {/* Mention Paiement par tranche - Style "Promo Alibaba" */}
          <div className="flex items-center gap-1.5 py-1 px-2 bg-orange-50 rounded-md border border-orange-100">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[11px] font-black text-orange-700 uppercase tracking-tight">
              200f/jour ou 1000f/semaine
            </span>
          </div>

          {/* Info secondaire (Stock/Temps) */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo}</span>
            <span>Stock: {product.stock > 0 ? product.stock : 'Épuisé'}</span>
          </div>
        </div>
      </CardContent>

      {/* Pied de carte avec boutons d'action épurés */}
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 rounded-lg border-gray-200 text-gray-700 font-bold h-10 gap-2 hover:bg-gray-50 text-[13px] transition-all"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Panier</span>
        </Button>
        <Button 
          className="flex-[1.5] rounded-lg bg-primary text-black font-black h-10 gap-2 hover:bg-primary/90 text-[13px] shadow-sm transition-all"
          onClick={() => setIsCheckoutOpen(true)}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payer</span>
        </Button>
      </CardFooter>

      <CheckoutDialog 
        product={product} 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
      />
    </Card>
  );
}
