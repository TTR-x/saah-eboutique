
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, Review, ReviewInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck, Home, Share2, PlusCircle, Send } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LogoSpinner } from '@/components/logo-spinner';
import { addReview } from '@/lib/reviews-service';

function ReviewStars({ rating, onRatingChange, readOnly = false, className }: { rating: number, onRatingChange?: (rating: number) => void, readOnly?: boolean, className?: string }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex items-center", className)}>
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
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 0 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
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
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Copié !', description: 'Le lien du produit a été copié dans le presse-papiers.' });
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({ title: 'Erreur', description: 'Impossible de copier le lien.', variant: 'destructive' });
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || newReview.rating === 0) {
      toast({ title: 'Erreur', description: 'Veuillez renseigner votre nom et une note.', variant: 'destructive'});
      return;
    }
    setIsSubmittingReview(true);
    
    const reviewInput: ReviewInput = {
      userName: newReview.name,
      rating: newReview.rating,
      comment: '', // Pas de commentaire
      productName: product.name,
    };

    try {
       await addReview(product.id, reviewInput);
       toast({ title: 'Avis ajouté !', description: 'Merci pour votre retour.' });
       setIsReviewDialogOpen(false);
       setNewReview({ name: '', rating: 0 });
       // We might want to optimistically update the product rating here or refetch it
    } catch (error) {
        console.error("Review submission error:", error);
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'avis pour le moment.', variant: 'destructive'});
    } finally {
        setIsSubmittingReview(false);
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
                 <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Donner mon avis
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Évaluer ce produit</DialogTitle>
                             <DialogDescription>
                                Partagez votre opinion sur le produit {product.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="review-name" className="text-right">Votre nom</Label>
                                <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Ex: Jean Dupont" required />
                            </div>
                            <div>
                              <Label>Votre note</Label>
                              <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmittingReview}>
                                    {isSubmittingReview && <LogoSpinner className="mr-2 h-4 w-4" />}
                                    Envoyer <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
