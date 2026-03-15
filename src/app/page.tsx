'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Search,
  ChevronRight,
  Zap,
  Wallet,
  MessageCircle,
  Info
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products-service';
import { getSlides } from '@/lib/slides-service';
import type { Product, Slide } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import placeholders from '@/app/lib/placeholder-images.json';
import { requestGift } from '@/lib/gifts-service';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const { handleLinkClick } = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedSlides] = await Promise.all([
          getProducts(),
          getSlides()
        ]);
        setProducts(fetchedProducts);
        setSlides(fetchedSlides);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleClaimGift = async () => {
    if (user) {
      try {
        await requestGift(user.uid, user.displayName || 'Client', user.email || '');
        toast({
          title: "Demande envoyée !",
          description: "Nous avons bien reçu votre demande. Vérifiez votre page cadeaux bientôt.",
        });
        router.push('/dashboard/gifts');
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer la demande.",
          variant: "destructive"
        });
      }
    } else {
      router.push('/signup?redirect=/dashboard/gifts');
    }
  };

  const newArrivals = products.slice(0, 4);
  const trendingProducts = products.filter(p => p.reviews > 0).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-card dark:bg-zinc-950 mb-8 border-b">
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative group w-full mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        type="search" 
                        placeholder="Rechercher un article, une marque..." 
                        className="pl-12 h-14 w-full rounded-lg border-2 border-primary/20 focus:border-primary shadow-sm bg-background font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-2 h-10 px-4 rounded-md bg-primary text-black font-black hover:bg-primary/90 transition-colors">
                        Trouver
                    </button>
                </form>

                {/* Carousel */}
                {slides.length > 0 ? (
                    <Carousel 
                        className="w-full rounded-lg overflow-hidden shadow-2xl border-none"
                        plugins={[Autoplay({ delay: 5000 })]}
                    >
                        <CarouselContent>
                            {slides.map((slide) => (
                                <CarouselItem key={slide.id}>
                                    <div className="relative aspect-[21/9] w-full bg-muted">
                                        <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                                            <h2 className="text-2xl md:text-5xl font-black mb-1 max-w-xl leading-tight uppercase">{slide.title}</h2>
                                            <p className="text-sm md:text-xl font-medium max-w-md opacity-90">{slide.subtitle}</p>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                        <CarouselNext className="right-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                    </Carousel>
                ) : (
                    <div className="w-full aspect-[21/9] rounded-lg bg-muted animate-pulse flex items-center justify-center">
                        <LogoSpinner className="h-10 w-10 text-primary" />
                    </div>
                )}
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
        
        {/* Main Flux */}
        <div className="lg:col-span-3 space-y-12">
          
          <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-orange-500 flex items-center justify-center text-white"><Zap className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-black">Nouveautés</h2>
                </div>
                <Link href="/products" className="text-primary font-black text-sm hover:underline flex items-center gap-1">Tout voir <ChevronRight className="h-4 w-4" /></Link>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-12"><LogoSpinner /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
          </section>

          {/* Banner: Surprise Mobile */}
          <section className="lg:hidden relative rounded-lg overflow-hidden bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="relative h-48 w-48 shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Image 
                  src={placeholders.tontine_gift.url} 
                  data-ai-hint={placeholders.tontine_gift.hint} 
                  alt="Cadeau" 
                  width={placeholders.tontine_gift.width} 
                  height={placeholders.tontine_gift.height} 
                  className="object-contain relative z-10" 
                />
            </div>
            <div className="text-center md:text-left space-y-4">
                <Badge className="bg-primary text-black font-black border-none px-4 py-1">OFFRE EXCLUSIVE</Badge>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Gagnez un cadeau incroyable !</h2>
                <p className="text-gray-400 font-medium max-w-xl text-lg">Cliquez ci-dessous pour découvrir votre surprise et la réclamer dès maintenant.</p>
                <div className="flex wrap gap-4 justify-center md:justify-start pt-4">
                    <Button onClick={handleClaimGift} size="lg" className="rounded-md h-14 bg-white text-black font-black hover:bg-gray-100">
                        Réclamer mon cadeau
                    </Button>
                </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center text-white"><TrendingUp className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-black">Articles Tendances</h2>
                </div>
                <Link href="/products" className="text-primary font-black text-sm hover:underline flex items-center gap-1">Découvrir <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12"><LogoSpinner /></div>
                ) : trendingProducts.length > 0 ? (
                    trendingProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    products.slice(4, 8).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
          </section>
        </div>

        {/* Right Sidebar Sticky (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-1 relative">
          <div className="sticky top-24 space-y-8 h-fit">
            <section className="relative rounded-lg overflow-hidden bg-black text-white p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
                <div className="relative h-40 w-40 shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <Image 
                      src={placeholders.tontine_gift.url} 
                      data-ai-hint={placeholders.tontine_gift.hint} 
                      alt="Cadeau" 
                      width={placeholders.tontine_gift.width} 
                      height={placeholders.tontine_gift.height} 
                      className="object-contain relative z-10" 
                    />
                </div>
                <div className="space-y-4">
                    <Badge className="bg-primary text-black font-black border-none px-4 py-1">OFFRE EXCLUSIVE</Badge>
                    <h2 className="text-2xl font-black tracking-tight leading-tight">Gagnez un Cadeau Incroyable !</h2>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed">
                    C'est votre jour de chance. Cliquez ici pour obtenir votre récompense spéciale SAAH Business.
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={handleClaimGift} size="lg" className="rounded-md h-12 bg-white text-black font-black hover:bg-gray-100 w-full">
                            Réclamer mon cadeau
                        </Button>
                    </div>
                </div>
            </section>

            <div className="px-4 py-6 text-center space-y-2 opacity-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} SAAH Business</p>
                <p className="text-[10px] text-muted-foreground">Votre partenaire de confiance.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* About SAAH & How it works */}
      <section className="bg-white dark:bg-zinc-900 py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            
            {/* Concept Description */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                  <Info className="h-4 w-4" /> Notre concept
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-tight">C'est quoi SAAH Business ?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  SAAH Business est une plateforme simple et moderne pour acheter vos articles préférés (téléphones, vêtements, maison) sans vous ruiner. 
                  <br /><br />
                  Notre mission est de rendre le shopping accessible à tous au Togo. Nous vous aidons à obtenir ce que vous voulez, même si vous n'avez pas tout l'argent tout de suite, grâce à des solutions de paiement souples et sécurisées.
                </p>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl border-4 border-white dark:border-zinc-800 bg-white">
                <Image 
                  src="/logo.png" 
                  alt="Logo SAAH Business" 
                  fill 
                  className="object-contain p-8"
                />
              </div>
            </div>

            <hr className="opacity-10" />

            {/* Steps */}
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight">Comment ça fonctionne ?</h2>
                <p className="text-muted-foreground font-medium mt-2">Acheter chez nous est un jeu d'enfant.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="group p-8 rounded-lg bg-background border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="h-14 w-14 bg-primary/10 rounded-md flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Search className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-xl mb-3">1. Je choisis</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Je parcours le catalogue sur le site et je trouve l'article qui me plaît (iPhone, console, sac, etc.).
                  </p>
                </div>

                <div className="group p-8 rounded-lg bg-background border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="h-14 w-14 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-xl mb-3">2. Je décide</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Je choisis comment payer : tout d'un coup (Cash), par petits morceaux chaque mois (Tranches), ou via une épargne de groupe (Tontine).
                  </p>
                </div>

                <div className="group p-8 rounded-lg bg-background border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="h-14 w-14 bg-green-500/10 rounded-md flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-xl mb-3">3. Je valide</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Je clique sur "Payer" pour discuter avec un conseiller sur WhatsApp. On s'occupe de tout pour la livraison à Lomé et partout au Togo !
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
