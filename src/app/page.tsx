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
import { ArrowRight, Star, PlusCircle, Send, Wallet, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';
import { getSlides } from '@/lib/slides-service';
import { getProducts } from '@/lib/products-service';
import { getTestimonials, addTestimonial } from '@/lib/testimonials-service';
import type { Slide, Product, Testimonial } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LogoIcon } from '@/components/layout/logo-icon';

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

    try {
       await addTestimonial(newReview);
       toast({ title: 'Avis ajouté !', description: 'Merci pour votre retour.' });
       const updatedTestimonials = await getTestimonials();
       setTestimonials(updatedTestimonials);
       setIsReviewDialogOpen(false);
       setNewReview({ name: '', role: '', comment: '', rating: 0 });
    } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'avis.', variant: 'destructive'});
    } finally {
        setIsSubmittingReview(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
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
              ) : slides.length > 0 ? (
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
                          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">{slide.title}</h1>
                          <p className="mt-4 text-lg md:text-xl drop-shadow-md">{slide.subtitle}</p>
                          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={"/products"} onClick={handleLinkClick}>Rejoindre une Tontine</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-white p-6">
                    <div className="text-center">
                      <h1 className="text-4xl md:text-6xl font-extrabold mb-4">L'épargne collective simplifiée</h1>
                      <p className="text-xl">Sécurisez votre avenir avec SAAH Tontine.</p>
                      <Button asChild size="lg" variant="secondary" className="mt-8">
                         <Link href="/products" onClick={handleLinkClick}>Voir nos plans</Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </section>
        
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 space-y-24">
          
          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-none text-center p-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Sécurisé</h3>
              <p className="text-muted-foreground text-sm">Vos fonds sont gérés avec une transparence totale et des garanties de sécurité strictes.</p>
            </Card>
            <Card className="border-none shadow-none text-center p-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Communauté de Confiance</h3>
              <p className="text-muted-foreground text-sm">Rejoignez des groupes d'épargne vérifiés et bâtissez votre avenir ensemble.</p>
            </Card>
            <Card className="border-none shadow-none text-center p-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flexibilité Totale</h3>
              <p className="text-muted-foreground text-sm">Choisissez le plan qui correspond à votre budget et à vos objectifs financiers.</p>
            </Card>
          </section>

          {/* New Tontine Plans Section (Replacing New Arrivals) */}
          <section>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold">Nos Plans de Tontine</h2>
              <Button asChild variant="link" className="text-primary">
                <Link href="/products" onClick={handleLinkClick}>
                  Tout voir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><LogoSpinner className="h-12 w-12"/></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
          
          {/* Persuasive PWA / Utility Section */}
          <section className="bg-muted -mx-4 px-4 py-16 md:py-24 rounded-3xl overflow-hidden relative">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl font-black leading-tight">Votre Tontine, partout avec vous.</h2>
                <p className="text-lg text-muted-foreground">
                  Installez SAAH Tontine sur votre téléphone en un clic. Suivez vos cotisations, recevez vos gains et gérez vos plans sans même avoir besoin de connexion internet permanente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-primary text-primary-foreground font-bold shadow-xl hover:scale-105 transition-transform">
                    Comment installer l'App ?
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/support" onClick={handleLinkClick}>Besoin d'aide ?</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                  <LogoIcon className="h-64 w-64 md:h-80 md:w-80 text-primary relative z-10 animate-pulse" />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials">
            <h2 className="text-3xl font-bold text-center mb-12">Ils nous font confiance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="bg-card shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                       <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                        <ReviewStars rating={testimonial.rating || 5} readOnly />
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{testimonial.comment}"</p>
                  </CardContent>
                </Card>
              ))}
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer border-dashed border-2 flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-all group">
                        <PlusCircle className="h-10 w-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                        <h3 className="font-bold">Donnez votre avis</h3>
                        <p className="text-xs text-muted-foreground mt-1">Votre retour nous aide</p>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Partagez votre expérience</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="review-name">Nom complet</Label>
                            <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Jean Dupont" required />
                        </div>
                        <div>
                          <Label>Note</Label>
                          <div className="mt-1">
                            <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                          </div>
                        </div>
                        <div>
                            <Label htmlFor="review-comment">Message</Label>
                            <Textarea id="review-comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Qu'avez-vous pensé de nos plans de tontine ?" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                                {isSubmittingReview ? <LogoSpinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                                Envoyer mon témoignage
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