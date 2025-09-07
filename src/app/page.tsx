
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, PlusCircle, Send, ShoppingBag, Ship } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState, useTransition } from 'react';
import { getSlides } from '@/lib/slides-service';
import { getProducts } from '@/lib/products-service';
import { getTestimonials, addTestimonial } from '@/lib/testimonials-service';
import type { Slide, Product, Testimonial, Review } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/layout/logo';


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

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', comment: '', rating: 0 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const { handleLinkClick } = useNavigation();
  const { toast } = useToast();
  const [_, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedSlides, fetchedProducts, fetchedTestimonials] = await Promise.all([
          getSlides(),
          getProducts(),
          getTestimonials()
        ]);
        setSlides(fetchedSlides);
        setProducts(fetchedProducts);
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment || newReview.rating === 0) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive'});
      return;
    }
    setIsSubmittingReview(true);

    const optimisticTestimonial: Testimonial = {
      id: `optimistic-${Date.now()}`,
      createdAt: new Date(),
      ...newReview
    };

    setTestimonials(prev => [optimisticTestimonial, ...prev]);
    setIsReviewDialogOpen(false);
    setNewReview({ name: '', role: '', comment: '', rating: 0 });

    try {
       await addTestimonial(newReview);
       toast({ title: 'Avis ajouté !', description: 'Merci pour votre retour.' });
       // Re-fetch testimonials to get the new one from the server
       const updatedTestimonials = await getTestimonials();
       setTestimonials(updatedTestimonials);
    } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'avis.', variant: 'destructive'});
        // Revert optimistic update
        setTestimonials(prev => prev.filter(t => t.id !== optimisticTestimonial.id));
    } finally {
        setIsSubmittingReview(false);
    }
  }

  const newArrivals = products
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
    
  const flashSales = products.filter(p => p.tags?.includes('Offres flash')).slice(0, 4);
  const trendingProducts = products.sort((a,b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
          >
            <CarouselContent>
              {isLoading && slides.length === 0 ? (
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] bg-muted flex items-center justify-center">
                    <LogoSpinner className="h-12 w-12"/>
                  </div>
                </CarouselItem>
              ) : (
                slides.map((slide, index) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative h-[50vh] md:h-[70vh]">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 flex items-end justify-start">
                        <div className="text-left text-white p-4 pb-8 md:p-12 md:pb-16 lg:p-24 lg:pb-24 max-w-2xl">
                          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>{slide.title}</h1>
                          <p className="mt-4 text-lg md:text-xl" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{slide.subtitle}</p>
                          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={"/products"} onClick={handleLinkClick}>{slide.buttonText || "Explorer"}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          </Carousel>
        </section>
        
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 space-y-16">
          {isLoading ? (
            <div className="flex justify-center"><LogoSpinner className="h-12 w-12"/></div>
          ) : (
            <>
              <ProductSection title="Nouveautés" products={newArrivals} href="/products?sort=newest" />
              
              <section className="bg-muted -mx-4 -my-4 px-4 py-12 md:py-20 rounded-lg">
                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                    <h2 className="text-3xl font-bold mb-4">Plus qu'une Boutique, un Partenaire</h2>
                    <p className="text-muted-foreground mb-6">
                      Chez SAAH Business, nous allons au-delà de la simple vente. Nous sommes votre allié pour trouver les meilleurs produits, que ce soit dans notre catalogue ou directement depuis la Chine grâce à notre service d'importation sur mesure.
                    </p>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-3">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Boutique en Ligne Variée</h3>
                          <p className="text-sm text-muted-foreground">Parcourez nos sélections de produits high-tech, mode, et maison, choisis pour leur qualité et leur innovation.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-3">
                          <Ship className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Service d'Import sur Mesure</h3>
                          <p className="text-sm text-muted-foreground">Besoin d'un produit spécifique en quantité ? Confiez-nous votre projet et nous nous occupons de tout, de la recherche à la livraison.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg">
                        <Link href="/products" onClick={handleLinkClick}>Explorer nos produits</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link href="/import" onClick={handleLinkClick}>Demander un devis d'import</Link>
                      </Button>
                    </div>
                  </div>
                   <div className="order-1 md:order-2 flex items-center justify-center p-8">
                      <div className="scale-[2.5] transform">
                        <Logo />
                      </div>
                   </div>
                </div>
              </section>

              <ProductSection title="Offres Flash" products={flashSales} href="/products?tag=Offres+flash" />
              <ProductSection title="Produits Tendance" products={trendingProducts} href="/products?sort=trending" />
            </>
          )}

          <section id="testimonials">
            <h2 className="text-3xl font-bold text-center mb-10">Ce que nos clients disent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={testimonial.id || index} className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                       <Avatar className="h-12 w-12 mr-4">
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-2">
                        <ReviewStars rating={testimonial.rating || 5} readOnly />
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                  </CardContent>
                </Card>
              ))}
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer bg-card h-full flex flex-col items-center justify-center text-center p-6 hover:bg-muted transition-colors">
                        <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold">Ajouter votre avis</h3>
                        <p className="text-sm text-muted-foreground">Partagez votre expérience</p>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Partagez votre expérience</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="review-name">Votre nom</Label>
                            <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Ex: Jean Dupont" required />
                        </div>
                        <div>
                            <Label htmlFor="review-role">Votre rôle (facultatif)</Label>
                            <Input id="review-role" value={newReview.role} onChange={(e) => setNewReview({...newReview, role: e.target.value})} placeholder="Ex: Client vérifié" />
                        </div>
                        <div>
                          <Label>Votre note</Label>
                          <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                        </div>
                        <div>
                            <Label htmlFor="review-comment">Votre avis</Label>
                            <Textarea id="review-comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Décrivez votre expérience..." required />
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
          </section>
        </div>
      </main>
    </div>
  );
}

const ProductSection = ({ title, products: productList, href }: { title: string; products: any[]; href: string }) => {
  if (!productList || productList.length === 0) return null;
  const { handleLinkClick } = useNavigation();

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button asChild variant="link" className="text-accent">
          <Link href={href} onClick={handleLinkClick}>
            Voir plus <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

    

    

    