import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { Star } from 'lucide-react';
import { Button } from './ui/button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block">
          <Image
            src={product.images[0]}
            alt={product.name}
            data-ai-hint={`${product.category} product`}
            width={400}
            height={400}
            className="w-full h-56 object-cover"
          />
        </Link>
        {product.tags?.includes('Offres flash') && (
            <Badge variant="destructive" className="absolute top-2 right-2">PROMO</Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-xs text-muted-foreground uppercase">{product.category}</p>
        <CardTitle className="text-lg mt-1 mb-2">
            <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                {product.name}
            </Link>
        </CardTitle>
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-primary fill-primary' : 'text-gray-300'}`}/>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">({product.reviews} avis)</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-foreground">
            {product.price.toFixed(2)}€
          </p>
          {product.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toFixed(2)}€
            </p>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/products/${product.id}`}>Voir</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
