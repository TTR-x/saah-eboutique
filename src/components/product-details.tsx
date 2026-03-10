
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ShieldCheck, Truck, Home, Share2, Wallet, Users } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useNavigation } from '@/hooks/use-navigation';
import { Card, CardContent } from '@/components/ui/card';

interface ProductDetailsProps {
    product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { handleLinkClick } = useNavigation();
  const [paymentMode, setPaymentPaymentMode] = useState<'cash' | 'installments' | 'tontine'>('cash');

  const handleAddToCart = () => {
    const finalName = paymentMode === 'cash' ? product.name : `${product.name} (${paymentMode === 'installments' ? 'Par tranches' : 'Tontine'})`;
    const finalPrice = paymentMode === 'installments' ? (product.installmentPrice || product.price) : product.price;
    
    addItem({
        ...product,
        name: finalName,
        price: finalPrice
    });
    
    toast({
      title: "Ajouté au panier !",
      description: `${finalName} est prêt.`,
    });
  };

  const handleBuyNow = () => {
    const phoneNumber = "22890101392";
    const modeLabel = paymentMode === 'cash' ? 'Cash' : (paymentMode === 'installments' ? 'Paiement par tranches' : 'Plan Tontine');
    const message = `Bonjour SAAH Business, je suis intéressé(e) par :

*Produit:* ${product.name}
*Mode choisi:* ${modeLabel}
*Lien:* ${window.location.href}

Merci de m'indiquer les modalités d'adhésion.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" onClick={handleLinkClick} className="hover:text-primary"><Home className="h-4 w-4"/></Link>
          <span>/</span>
          <Link href="/products" onClick={handleLinkClick} className="hover:text-primary">Produits</Link>
          <span>/</span>
          <span className="font-medium text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative rounded-2xl overflow-hidden border shadow-sm">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
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

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex-grow">
              <div className="flex gap-2 mb-2">
                {product.isTontine && <Badge className="bg-primary text-black">Tontine Disponible</Badge>}
                {product.allowInstallments && <Badge variant="secondary">Paiement échelonné</Badge>}
              </div>
              <h1 className="text-3xl font-extrabold">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 uppercase font-bold tracking-widest">{product.brand || 'SAAH Business'}</p>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                <span className="text-sm text-muted-foreground">Prix total cash</span>
              </div>

              <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>

              {/* Payment Options Selection */}
              <div className="mt-8 space-y-4">
                <h3 className="font-bold text-lg">Choisissez votre mode d'acquisition :</h3>
                <div className="grid gap-3">
                    {/* Option Cash */}
                    <Card 
                        className={`cursor-pointer transition-all border-2 ${paymentMode === 'cash' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:bg-muted'}`}
                        onClick={() => setPaymentPaymentMode('cash')}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-5 w-5" /></div>
                            <div className="flex-1">
                                <p className="font-bold">Paiement Cash</p>
                                <p className="text-xs text-muted-foreground">Règlement immédiat en une fois</p>
                            </div>
                            <div className="text-right font-bold">{product.price.toLocaleString('fr-FR')} FCFA</div>
                        </CardContent>
                    </Card>

                    {/* Option Tranches */}
                    {product.allowInstallments && (
                        <Card 
                            className={`cursor-pointer transition-all border-2 ${paymentMode === 'installments' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:bg-muted'}`}
                            onClick={() => setPaymentPaymentMode('installments')}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Truck className="h-5 w-5" /></div>
                                <div className="flex-1">
                                    <p className="font-bold">Payer par tranches</p>
                                    <p className="text-xs text-muted-foreground">{product.installmentMonths} versements mensuels</p>
                                </div>
                                <div className="text-right font-bold">{product.installmentPrice?.toLocaleString('fr-FR')} FCFA / mois</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Option Tontine */}
                    {product.isTontine && (
                        <Card 
                            className={`cursor-pointer transition-all border-2 ${paymentMode === 'tontine' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:bg-muted'}`}
                            onClick={() => setPaymentPaymentMode('tontine')}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Users className="h-5 w-5" /></div>
                                <div className="flex-1">
                                    <p className="font-bold">Plan Tontine Collective</p>
                                    <p className="text-xs text-muted-foreground">Épargne sur {product.tontineDuration}</p>
                                </div>
                                <div className="text-right font-bold text-green-600">Rejoindre</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
                <Button size="lg" className="w-full bg-primary text-black font-black h-14 text-lg rounded-xl hover:bg-primary/90 shadow-lg" onClick={handleBuyNow}>
                    Finaliser via WhatsApp
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" variant="outline" className="rounded-xl font-bold h-12" onClick={handleAddToCart}>
                        Ajouter au panier
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 gap-2" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({ title: "Lien copié !" });
                    }}>
                        <Share2 className="h-4 w-4" /> Partager
                    </Button>
                </div>
            </div>

            <div className="mt-10 border-t pt-6 grid grid-cols-2 gap-4 text-[13px] font-bold text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg"><CheckCircle className="h-4 w-4 text-green-500"/> Authentique</div>
              <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg"><ShieldCheck className="h-4 w-4 text-primary"/> Garantie SAAH</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-16" />

        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-4">Besoin d'aide ?</h2>
            <p className="text-muted-foreground mb-8">Nos conseillers sont disponibles pour vous guider dans le choix de votre plan d'épargne ou de tontine.</p>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-bold border-primary text-primary hover:bg-primary/5">
                <Link href="/support">Contacter le support</Link>
            </Button>
        </div>
      </div>
  );
}
