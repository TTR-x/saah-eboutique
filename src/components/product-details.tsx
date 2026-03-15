'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ShieldCheck, 
  Home, 
  Share2, 
  Wallet, 
  Users, 
  CreditCard, 
  Truck,
  Calendar,
  Zap
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { CheckoutDialog } from './checkout-dialog';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast();
  const { addItem, items } = useCart();
  const { handleLinkClick } = useNavigation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAdded = items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    if (isAdded) return;
    addItem(product);
    toast({
      title: "Ajouté au panier !",
      description: `${product.name} est prêt dans votre panier.`,
    });
  };

  return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8 overflow-hidden whitespace-nowrap">
          <Link href="/" onClick={handleLinkClick} className="hover:text-primary shrink-0"><Home className="h-3 w-3"/></Link>
          <span className="opacity-30">/</span>
          <Link href="/products" onClick={handleLinkClick} className="hover:text-primary shrink-0">Produits</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Section Gauche: Images */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative rounded-2xl overflow-hidden bg-white border shadow-sm">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                    <CarouselPrevious className="left-4 bg-white/80 border-none shadow-md" />
                    <CarouselNext className="right-4 bg-white/80 border-none shadow-md" />
                </>
              )}
            </Carousel>
            
            {/* Badges de statut rapide */}
            <div className="flex flex-wrap gap-2 pt-2">
                {product.isTontine && <Badge className="bg-green-600 text-white border-none font-black px-3 py-1 rounded-lg">PLAN TONTINE</Badge>}
                {product.allowInstallments && <Badge className="bg-blue-600 text-white border-none font-black px-3 py-1 rounded-lg">TRANCHES DISPONIBLES</Badge>}
                {product.allowDelivery ? (
                    <Badge variant="outline" className="border-primary text-primary font-black px-3 py-1 rounded-lg flex items-center gap-1">
                        <Truck className="h-3 w-3" /> LIVRAISON POSSIBLE
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground font-black px-3 py-1 rounded-lg">RETRAIT EN BOUTIQUE</Badge>
                )}
            </div>
          </div>

          {/* Section Droite: Infos & Actions */}
          <div className="flex flex-col">
            <div className="flex-grow">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.brand || 'SAAH Business'}</p>
                <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">{product.name}</h1>
              </div>
              
              <div className="mt-8 p-6 rounded-2xl bg-card border shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prix Total Cash</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-primary">{product.price.toLocaleString('fr-FR')}</span>
                        <span className="text-lg font-black text-primary/60">FCFA</span>
                    </div>
                </div>
              </div>

              {/* MODES D'ACQUISITION ORDONNÉS */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Options de paiement
                </h3>
                
                <div className="grid gap-3">
                    {/* Paiement Cash */}
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50 group">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Paiement Cash</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Règlement immédiat à la commande</p>
                            </div>
                        </div>
                        <span className="font-black text-xs text-primary">{product.price.toLocaleString('fr-FR')} F</span>
                    </div>

                    {/* Paiement par Tranches */}
                    {product.allowInstallments && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Par tranches</p>
                                    <p className="text-[10px] text-blue-600/70 font-medium uppercase">Sur une durée de {product.installmentMonths} mois</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xs text-blue-600">{product.installmentPrice?.toLocaleString('fr-FR')} F</p>
                                <p className="text-[8px] font-bold text-blue-400 uppercase">/ MOIS</p>
                            </div>
                        </div>
                    )}

                    {/* Plan Tontine */}
                    {product.isTontine && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-green-100 bg-green-50/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Plan Tontine</p>
                                    <p className="text-[10px] text-green-600/70 font-medium uppercase">Cycle de {product.tontineDuration || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xs text-green-600">{product.tontineDailyRate?.toLocaleString('fr-FR')} F</p>
                                <p className="text-[8px] font-bold text-green-400 uppercase">/ JOUR</p>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-10 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Description de l'article</h3>
                <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-line bg-muted/20 p-6 rounded-2xl border border-dashed">
                    {product.description}
                </p>
              </div>
            </div>
            
            {/* ACTIONS */}
            <div className="mt-10 flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full bg-primary text-black font-black h-16 text-xl rounded-xl hover:bg-primary/90 shadow-xl shadow-yellow-100 transition-all active:scale-[0.98]" 
                  onClick={() => setIsCheckoutOpen(true)}
                >
                    Commander l'article
                </Button>
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className={cn(
                            "rounded-xl font-bold h-12 transition-all",
                            isAdded ? "bg-green-50 border-green-200 text-green-600" : "hover:bg-primary/5"
                        )} 
                        onClick={handleAddToCart}
                        disabled={isAdded}
                    >
                        {isAdded ? "Dans le panier" : "Ajouter au panier"}
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 gap-2 hover:bg-muted" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Lien copié !", description: "Vous pouvez maintenant le partager." });
                    }}>
                        <Share2 className="h-4 w-4" /> Partager
                    </Button>
                </div>
            </div>

            {/* GARANTIES SAAH */}
            <div className="mt-12 border-t pt-8 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-white text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2"/> 
                <span className="text-[10px] font-black uppercase tracking-widest">Produit Authentique</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-white text-center">
                <ShieldCheck className="h-6 w-6 text-primary mb-2"/> 
                <span className="text-[10px] font-black uppercase tracking-widest">Garantie SAAH</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-20" />

        {/* Aide footer */}
        <div className="max-w-3xl mx-auto text-center space-y-6 pb-20">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Calendar className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Une question sur cet article ?</h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                Nos conseillers SAAH Business sont à votre écoute pour vous aider à choisir le mode de paiement le plus adapté à votre budget.
            </p>
            <div className="pt-4">
                <Button asChild variant="outline" size="lg" className="rounded-xl px-10 h-14 font-black border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all">
                    <Link href="/support">Contacter le service client</Link>
                </Button>
            </div>
        </div>

        <CheckoutDialog 
          product={product} 
          open={isCheckoutOpen} 
          onOpenChange={setIsCheckoutOpen} 
        />
      </div>
  );
}
