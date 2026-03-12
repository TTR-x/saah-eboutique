'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, CreditCard, MoreHorizontal } from 'lucide-react';
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
    <Card className="flex flex-col h-full border border-[#dddfe2] shadow-sm rounded-xl overflow-hidden bg-white mb-4">
      {/* En-tête : Titre et Badge */}
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="font-bold text-sm text-[#1c1e21] hover:underline">
                  {product.name}
                </Link>
                <Badge className="bg-[#1877f2] text-white border-none text-[8px] h-4 px-1">OFFICIEL</Badge>
            </div>
            <span className="text-[12px] text-[#65676b]">{timeAgo}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-[#65676b]">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Image du Post */}
        <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block relative aspect-video w-full overflow-hidden bg-[#f0f2f5] border-y border-[#dddfe2]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="w-full h-full object-cover"
          />
          {isNew && (
            <div className="absolute top-3 left-3">
                <Badge className="bg-[#1877f2] text-white border-none text-[10px] font-bold px-2 py-0.5">NOUVEAU PLAN</Badge>
            </div>
          )}
          {(product.isTontine || product.allowInstallments) && (
            <div className="absolute bottom-3 right-3 flex gap-1">
                {product.isTontine && <Badge className="bg-green-500 text-white border-none text-[10px]">TONTINE</Badge>}
                {product.allowInstallments && <Badge className="bg-blue-500 text-white border-none text-[10px]">TRANCHES</Badge>}
            </div>
          )}
        </Link>

        {/* Barre d'info sous l'image */}
        <div className="px-4 py-2 border-b border-[#f0f2f5] flex items-center justify-end">
            <div className="text-sm text-primary font-black">
                {product.price.toLocaleString('fr-FR')} FCFA
            </div>
        </div>
      </CardContent>

      {/* Mention Paiement par tranche et Actions */}
      <CardFooter className="p-1 flex flex-col gap-1">
        <div className="w-full px-3 py-2 text-[12px] font-bold text-[#1877f2] bg-blue-50/50 rounded-lg text-center mb-1">
            payer par tranche 200f par jour et 1000f par semaine
        </div>
        <div className="flex w-full items-center justify-between gap-1">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-md text-[#65676b] font-bold h-10 gap-2 hover:bg-[#f2f3f5] text-[13px]"
              onClick={handleAddToCart}
            >
                <ShoppingCart className="h-4 w-4" />
                <span>Panier</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 rounded-md text-[#65676b] font-bold h-10 gap-2 hover:bg-[#f2f3f5] text-[13px]"
              onClick={() => setIsCheckoutOpen(true)}
            >
                <CreditCard className="h-4 w-4" />
                <span>Payer</span>
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
