import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigation } from '@/hooks/use-navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.createdAt && (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const { handleLinkClick } = useNavigation();

  return (
    <Card className="flex flex-col h-full border-none shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="block aspect-video w-full overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={225}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
                <Badge className="bg-[#1877f2] text-white border-none text-[10px] font-bold px-2 py-0.5">NOUVEAU</Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex items-center gap-1 mb-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-[10px] font-bold text-[#65676b]">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
        </div>
        <CardTitle className="text-base font-bold text-[#1c1e21] mb-2 leading-snug h-10 overflow-hidden">
            <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="hover:text-primary transition-colors line-clamp-2">
                {product.name}
            </Link>
        </CardTitle>
        <p className="text-sm font-black text-[#1c1e21] mt-auto">
            {product.price.toLocaleString('fr-FR')} FCFA
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild size="sm" variant="secondary" className="w-full rounded-lg font-bold bg-[#f2f3f5] text-[#1c1e21] hover:bg-[#ebedf0] group">
          <Link href={`/products/${product.id}`} onClick={handleLinkClick} className="flex items-center justify-center">
            Détails <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}