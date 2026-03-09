'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, PlusCircle, Send, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products-service';
import { getTestimonials, addTestimonial } from '@/lib/testimonials-service';
import type { Product, Testimonial } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LogoIcon } from '@/components/layout/logo-icon';
import { Card, CardContent } from '@/components/ui/card';

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
            className={`h-4 w-4 ${isFilled ? 'text-primary fill-primary' : 'text-gray-300'} ${!readOnly ? 'cursor-pointer' : ''}`}
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
        const [fetchedProducts, fetchedTestimonials] = await Promise.all([
          getProducts(),
          getTestimonials()
        ]);
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
    <div className="flex flex-col min-h-screen bg-[#f0f2f5]">
      <main className="flex-1 pb-12">
        {/* Hero Section Simpliste - Style Facebook */}
        <section className="bg-white border-b py-12 md:py-20 mb-8">
          <div className="container mx-auto px-4 text-center space-y-6">
            <LogoIcon className="h-24 w-24 mx-auto mb-4 text-primary logo-pulse hover:scale-110 transition-transform cursor-pointer" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1c1e21]">
              SAAH Business
            </h1>
            <p className="text-xl text-[#65676b] max-w-2xl mx-auto font-medium">
              L'épargne collective réinventée pour vous. Sécurité, transparence et croissance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 shadow-sm transition-transform active:scale-95">
                <Link href="/products" onClick={handleLinkClick}>Explorer les plans</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-bold border-[#dddfe2] text-[#4b4f56] hover:bg-[#f2f3f5]">
                <Link href="/support" onClick={handleLinkClick}>Comment ça marche ?</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 md:px-6 space-y-12">
          
          {/* Features Grid - Style Facebook */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#e7f3ff] p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-[#1877f2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c1e21]">Garanti & Sécurisé</h3>
                  <p className="text-sm text-[#65676b] mt-1">Transparence totale sur chaque cycle de cotisation.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#e7f3ff] p-3 rounded-full">
                  <Users className="h-6 w-6 text-[#1877f2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c1e21]">Réseau de Confiance</h3>
                  <p className="text-sm text-[#65676b] mt-1">Rejoignez une communauté de membres vérifiés.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#e7f3ff] p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-[#1877f2]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c1e21]">Épargne Flexible</h3>
                  <p className="text-sm text-[#65676b] mt-1">Des plans adaptés à votre rythme et vos objectifs.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Featured Plans */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1c1e21]">Nos Plans de Tontine</h2>
              <Link href="/products" onClick={handleLinkClick} className="text-sm font-semibold text-[#1877f2] hover:underline flex items-center">
                Voir tout <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10"><LogoSpinner className="h-8 w-8 text-[#1877f2]"/></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
          
          {/* Testimonials - Style WhatsApp Chats */}
          <section id="testimonials">
            <h2 className="text-2xl font-bold text-[#1c1e21] mb-6">Témoignages de membres</h2>
            <div className="space-y-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="border-none shadow-sm rounded-2xl overflow-hidden max-w-2xl">
                  <CardContent className="p-4 flex gap-3">
                     <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-[#1c1e21] font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-[#f0f2f5] p-3 rounded-2xl rounded-tl-none">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-sm text-[#1c1e21]">{testimonial.name}</p>
                          <ReviewStars rating={testimonial.rating || 5} readOnly />
                        </div>
                        <p className="text-sm text-[#4b4f56] italic">"{testimonial.comment}"</p>
                      </div>
                  </CardContent>
                </Card>
              ))}
              
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full max-w-2xl py-8 border-2 border-dashed border-[#dddfe2] rounded-2xl hover:bg-white transition-colors group">
                    <PlusCircle className="mr-2 h-5 w-5 text-[#65676b] group-hover:text-primary" />
                    <span className="text-[#65676b] font-bold">Ajouter un avis</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Partagez votre expérience</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="review-name" className="text-sm font-bold">Votre nom complet</Label>
                            <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Jean Dupont" className="rounded-lg" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Votre note</Label>
                          <div className="mt-1">
                            <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-comment" className="text-sm font-bold">Votre témoignage</Label>
                            <Textarea id="review-comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Dites-nous ce que vous pensez de nos plans..." className="rounded-lg min-h-[100px]" required />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full bg-primary font-bold rounded-lg" disabled={isSubmittingReview}>
                                {isSubmittingReview ? <LogoSpinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                Envoyer mon avis
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          {/* New PWA/Brand section with Large LogoIcon */}
          <section className="py-20 flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-3xl shadow-sm border border-[#dddfe2]">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <LogoIcon className="h-64 w-64 md:h-96 md:w-96 text-primary relative z-10 hover:scale-105 transition-transform duration-500 cursor-pointer drop-shadow-xl" />
             </div>
             <div className="max-w-xl px-4">
                <h2 className="text-3xl font-black text-[#1c1e21]">SAAH Business dans votre poche</h2>
                <p className="text-[#65676b] mt-4 text-lg">
                  Installez notre application pour suivre vos cotisations et gérer vos plans de tontine en un clic, directement depuis votre écran d'accueil.
                </p>
                <Button size="lg" className="mt-8 rounded-full px-10 font-bold bg-[#1877f2] hover:bg-[#166fe5]">
                  Installer l'application
                </Button>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}
