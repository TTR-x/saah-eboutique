import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ArrowRight, Star, MoreHorizontal, ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { LogoIcon } from './layout/logo-icon';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const { handleLinkClick } = useNavigation();
  const { addItem } = useCart();
  const { toast } = useToast();
  
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
      {/* Post Header */}
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-[#dddfe2]">
            <LogoIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-[#1c1e21] hover:underline cursor-pointer">SAAH Business</span>
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
        {/* Post Text */}
        <div className="px-4 pb-3">
            <CardTitle className="text-[15px] font-normal text-[#1c1e21] leading-normal line-clamp-3">
                {product.description}
            </CardTitle>
        </div>

        {/* Post Image */}
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
        </Link>

        {/* Post Info Bar */}
        <div className="px-4 py-3 border-b border-[#f0f2f5] flex items-center justify-between">
            <div className="flex items-center -space-x-1">
                <div className="h-5 w-5 rounded-full bg-[#1877f2] flex items-center justify-center ring-2 ring-white">
                    <Heart className="h-3 w-3 text-white fill-white" />
                </div>
                <div className="h-5 w-5 rounded-full bg-[#f02849] flex items-center justify-center ring-2 ring-white">
                    <Star className="h-3 w-3 text-white fill-white" />
                </div>
                <span className="ml-2 text-sm text-[#65676b] pl-2">{product.rating ? product.rating.toFixed(1) : '5.0'} • {product.reviews || 0} membres</span>
            </div>
            <div className="text-sm text-[#65676b] font-bold">
                {product.price.toLocaleString('fr-FR')} FCFA / mois
            </div>
        </div>
      </CardContent>

      {/* Post Actions */}
      <CardFooter className="p-1 flex items-center justify-between">
        <Button variant="ghost" className="flex-1 rounded-md text-[#65676b] font-bold h-10 gap-2 hover:bg-[#f2f3f5]">
            <Heart className="h-5 w-5" />
            <span>Intéressé</span>
        </Button>
        <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="flex-1">
            <Button variant="ghost" className="w-full rounded-md text-[#65676b] font-bold h-10 gap-2 hover:bg-[#f2f3f5]">
                <ArrowRight className="h-5 w-5" />
                <span>Détails</span>
            </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-md text-[#65676b] font-bold h-10 gap-2 hover:bg-[#f2f3f5]"
          onClick={handleAddToCart}
        >
            <ShoppingCart className="h-5 w-5" />
            <span>Panier</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
