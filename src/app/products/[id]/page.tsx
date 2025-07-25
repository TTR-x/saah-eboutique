import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
           <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square relative rounded-lg overflow-hidden border">
                    <Image
                      src={img}
                      alt={`${product.name} - image ${index + 1}`}
                      data-ai-hint={`${product.category} product`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <div className="flex flex-col">
          <div className="flex-grow">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < product.rating ? 'text-primary fill-primary' : 'text-gray-300'}`}/>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">({product.reviews} avis)</p>
            </div>

            <p className="mt-6 text-3xl font-bold text-foreground">{product.price.toFixed(2)}€</p>
            {product.originalPrice && (
              <p className="text-md text-muted-foreground line-through">Prix d'origine: {product.originalPrice.toFixed(2)}€</p>
            )}

            <p className="mt-6 text-muted-foreground">{product.longDescription}</p>

            {product.attributes && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Caractéristiques</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-sm">{key}: {value}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-md font-medium text-muted-foreground">
                {product.stock > 0 ? `${product.stock} en stock` : 'Indisponible'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={product.stock === 0}>
              Acheter maintenant
            </Button>
            <Button size="lg" variant="outline" className="w-full" disabled={product.stock === 0}>
              Ajouter au panier
            </Button>
          </div>

          <div className="mt-8 border-t pt-6 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5"/>
              <span>Livraison rapide 2-5 jours</span>
            </div>
             <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5"/>
              <span>Garantie 2 ans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
