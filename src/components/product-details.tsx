
'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getReviewsForProduct, addReview } from '@/lib/reviews-service';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck, Send, Home } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function ReviewStars({ rating, onRatingChange, readOnly = false }: { rating: number, onRatingChange?: (rating: number) => void, readOnly?: boolean }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverRating || rating);
        return (
          <Star
            key={i}
            className={`h-5 w-5 ${isFilled ? 'text-primary fill-primary' : 'text-gray-300'} ${!readOnly ? 'cursor-pointer' : ''}`}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
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
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const { toast } = useToast();
  const { addItem } = useCart();
  const { handleLinkClick } = useNavigation();

  const fetchReviews = async () => {
    const foundReviews = await getReviewsForProduct(product.id);
    setReviews(foundReviews);
  };

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Produit ajouté !",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || newReviewRating === 0 || !newReviewComment.trim()) {
      toast({ title: "Erreur", description: "Veuillez renseigner votre nom, une note et un commentaire.", variant: 'destructive' });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview(product.id, {
        rating: newReviewRating,
        comment: newReviewComment,
        userName: newReviewName,
      });
      toast({ title: "Avis envoyé !", description: "Merci pour votre contribution." });
      setNewReviewName('');
      setNewReviewRating(0);
      setNewReviewComment('');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de soumettre l'avis.", variant: 'destructive' });
    } finally {
      setIsSubmittingReview(false);
    }
  }

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
              <p className="text-sm font-medium text-primary uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{product.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <ReviewStars rating={product.rating} readOnly />
                <p className="text-sm text-muted-foreground">({product.reviews} avis)</p>
              </div>

              <p className="mt-6 text-3xl font-bold text-foreground">{product.price.toLocaleString('fr-FR')} FCFA</p>
              {product.originalPrice && (
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
            
            <div className="mt-8 space-y-4">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={product.stock === 0}>
                Acheter maintenant
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
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
        
        <Separator className="my-12" />

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Avis des clients ({reviews.length})</h2>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                  reviews.map(review => (
                      <div key={review.id} className="flex gap-4">
                          <Avatar>
                              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                              <div className="flex items-center justify-between">
                                  <p className="font-semibold">{review.userName}</p>
                                  <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <ReviewStars rating={review.rating} readOnly />
                              <p className="mt-2 text-muted-foreground">{review.comment}</p>
                          </div>
                      </div>
                  ))
              ) : (
                  <p className="text-muted-foreground">Aucun avis pour ce produit pour le moment. Soyez le premier !</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Laisser un avis</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input 
                        id="name" 
                        value={newReviewName} 
                        onChange={(e) => setNewReviewName(e.target.value)} 
                        placeholder="Votre nom" 
                        required
                      />
                  </div>
                  <div>
                      <Label>Votre note</Label>
                      <ReviewStars rating={newReviewRating} onRatingChange={setNewReviewRating} />
                  </div>
                  <div>
                      <Label htmlFor="comment">Votre commentaire</Label>
                      <Textarea 
                        id="comment"
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Partagez votre expérience avec ce produit..."
                        rows={4}
                        required
                      />
                  </div>
                  <Button type="submit" disabled={isSubmittingReview}>
                      {isSubmittingReview && <LogoSpinner className="mr-2 h-4 w-4" />}
                      Envoyer l'avis <Send className="ml-2 h-4 w-4" />
                  </Button>
              </form>
          </div>
        </div>
      </div>
  );
}
