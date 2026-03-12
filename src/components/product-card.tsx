
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, Clock, Check, CreditCard, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { CheckoutDialog } from './checkout-dialog';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const { handleLinkClick } = useNavigation();
  const { items, addItem } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const isAdded = items.some(item => item.id === product.id);
  
  const timeAgo = product.createdAt 
    ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: fr })
    : 'Récemment';

  const handleAddToCart = () => {
    if (isAdded) return;
    addItem(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté.`,
    });
  };

  return (
    <Card className="flex flex-col h-full border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white group transition-all hover:shadow-md">
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block relative aspect-square w-full overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-orange-500 text-white border-none text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm">NOUVEAU</Badge>
            )}
            {product.isTontine && (
              <Badge className="bg-green-600 text-white border-none text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Users className="h-2 w-2 sm:h-3 sm:w-3" /> TONTINE
              </Badge>
            )}
          </div>
        </Link>

        <div className="p-2 sm:p-3 space-y-1.5">
          <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block">
            <h3 className="text-[13px] sm:text-[15px] font-medium text-gray-800 line-clamp-2 leading-tight hover:text-primary transition-colors min-h-[32px] sm:min-h-[40px]">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-black text-gray-900">
              {product.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-600">FCFA</span>
          </div>

          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1 truncate"><Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {timeAgo}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 pt-0 flex flex-col gap-2 mt-auto">
        {product.allowInstallments && (
          <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-1.5 flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-md text-white">
              <CreditCard className="h-3 w-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-blue-700 uppercase leading-none">Payer par tranche</span>
              <span className="text-[10px] font-bold text-blue-600 leading-tight">
                {product.installmentPrice?.toLocaleString('fr-FR')} F / mois
              </span>
            </div>
          </div>
        )}

        <div className="flex w-full gap-1.5 sm:gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className={cn(
              "rounded-lg transition-all h-9 w-9 sm:h-10 sm:w-10 shrink-0",
              isAdded 
                ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
            onClick={handleAddToCart}
            disabled={isAdded}
          >
            {isAdded ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          
          <Button 
            className="flex-1 rounded-lg bg-primary text-black font-black h-9 sm:h-10 hover:bg-primary/90 text-[11px] sm:text-[13px] shadow-sm transition-all"
            onClick={() => setIsCheckoutOpen(true)}
          >
            Payer
          </Button>
        </div>
      </CardFooter>

      <CheckoutDialog 
        product={product} 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen} 
      />
    </Card>
  );
}
