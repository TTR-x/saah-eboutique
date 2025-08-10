
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck, Home, Share2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';

function ReviewStars({ rating, readOnly = false }: { rating: number, readOnly?: boolean }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        return (
          <Star
            key={i}
            className={`h-5 w-5 ${isFilled ? 'text-primary fill-primary' : 'text-gray-300'} ${!readOnly ? 'cursor-pointer' : ''}`}
          />
        )
      })}
    </div>
  )
}

interface ProductDetailsProps {
    product: Product;
    initialReviews: Review[];
}

export function ProductDetails({ product, initialReviews }: ProductDetailsProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  
  const { toast } = useToast();
  const { addItem } = useCart();
  const { handleLinkClick } = useNavigation();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Produit ajouté !",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const handleBuyNow = () => {
    const phoneNumber = "22890101392";
    const message = `Bonjour, je suis intéressé(e) par ce produit :

*Produit:* ${product.name}
*Prix:* ${product.price.toLocaleString('fr-FR')} FCFA
*Description:* ${product.description}

Merci de me donner plus d'informations.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
        title: product.name,
        text: product.description,
        url: window.location.href,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ title: 'Partagé !', description: 'Le produit a été partagé avec succès.' });
      } catch (error) {
        console.error('Error sharing:', error);
        // L'erreur est normale si l'utilisateur annule le partage, donc pas de toast ici.
      }
    } else {
      // Fallback pour les navigateurs de bureau : copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Copié !', description: 'Le lien du produit a été copié dans le presse-papiers.' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({ title: 'Erreur', description: 'Impossible de copier le lien.', variant: 'destructive' });
      }
    }
  };

  return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" onClick={handleLinkClick} className="hover:text-primary"><Home className="h-4 w-4"/></Link>
          <span>/</span>
          <Link href="/products" onClick={handleLinkClick} className="hover:text-primary">Produits</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{product.name}</span>
        </div>
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

          <div className="flex flex-col">
            <div className="flex-grow">
              {product.brand && <p className="text-sm font-medium text-primary uppercase tracking-wider">{product.brand}</p>}
              <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{product.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <ReviewStars rating={product.rating} readOnly />
                <p className="text-sm text-muted-foreground">({product.reviews} avis)</p>
              </div>

              <p className="mt-6 text-3xl font-bold text-foreground">{product.price.toLocaleString('fr-FR')} FCFA</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-md text-muted-foreground line-through">Prix d'origine: {product.originalPrice.toLocaleString('fr-FR')} FCFA</p>
              )}

              <p className="mt-6 text-muted-foreground">{product.longDescription || product.description}</p>

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
            
            <div className="mt-8 grid grid-cols-1 gap-2">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleBuyNow} disabled={product.stock === 0}>
                    Acheter maintenant
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
                        Ajouter au panier
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={handleShare}>
                        <Share2 className="mr-2 h-5 w-5" />
                        Partager
                    </Button>
                </div>
            </div>


            <div className="mt-8 border-t pt-6 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5"/>
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5"/>
                <span>Qualité</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-12" />

      </div>
  );
}
