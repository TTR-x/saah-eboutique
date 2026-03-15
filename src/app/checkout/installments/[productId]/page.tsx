'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoSpinner } from '@/components/logo-spinner';
import { CreditCard, Phone, ArrowLeft, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function InstallmentCheckoutPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { productId } = useParams();
  
  // Correction : Mémoïser la référence pour éviter les boucles de rendu infinies
  const productRef = useMemo(() => {
    if (!db || !productId) return null;
    return doc(db, 'products', productId as string);
  }, [db, productId]);

  const { data: product, loading: productLoading } = useDoc<Product>(productRef as any);

  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signup?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, authLoading, router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !phone) return;

    setIsSubmitting(true);
    const orderData = {
      userId: user.uid,
      userEmail: user.email || 'non-renseigné',
      userName: user.displayName || 'Client SAAH',
      userPhone: phone,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      amount: product.installmentPrice || 0,
      paymentMode: 'installments',
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      
      const message = `Bonjour SAAH Business, j'ai validé ma demande de paiement par tranches sur le site :
      
*PRODUIT:* ${product.name}
*MENSUALITÉ:* ${product.installmentPrice?.toLocaleString('fr-FR')} FCFA x ${product.installmentMonths} mois
*PRIX TOTAL:* ${product.price.toLocaleString('fr-FR')} FCFA

*CLIENT:*
👤 ${user.displayName || 'Client'}
📞 ${phone}

Merci de me contacter pour la validation finale.`;

      const whatsappUrl = `https://wa.me/22890101392?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      router.push('/dashboard');
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: 'orders',
        operation: 'create',
        requestResourceData: orderData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || productLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LogoSpinner className="h-12 w-12 text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase animate-pulse tracking-widest">Préparation de votre dossier...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Produit introuvable</h1>
        <Button onClick={() => router.push('/products')} variant="link" className="mt-4">Retour au catalogue</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 font-bold text-muted-foreground hover:bg-transparent pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Finaliser ma demande de tranches</h1>
            <p className="text-muted-foreground font-medium">Vérifiez les détails et confirmez votre engagement.</p>
          </div>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-blue-600 text-white p-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                <CreditCard className="h-6 w-6" /> Plan de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-6 p-6 border-b">
                <div className="relative h-32 w-32 rounded-xl overflow-hidden border bg-white shrink-0 shadow-sm">
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2" sizes="128px" />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="font-black text-xl leading-tight">{product.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Prix Cash: {product.price.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x bg-blue-50/50">
                <div className="p-6 text-center space-y-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mensualité</p>
                  <p className="text-2xl font-black text-blue-700">{product.installmentPrice?.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="p-6 text-center space-y-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Durée</p>
                  <p className="text-2xl font-black text-blue-700">{product.installmentMonths} mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-sm uppercase ml-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Votre numéro WhatsApp *
                </Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Ex: 90 00 00 00" 
                  className="h-14 rounded-xl border-2 border-gray-100 bg-white shadow-sm focus:border-primary focus:ring-0 text-lg font-bold"
                  required 
                />
                <p className="text-[10px] text-muted-foreground font-medium italic">Nous vous contacterons sur ce numéro pour finaliser le dossier.</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-xs font-bold text-green-800">Engagement sécurisé SAAH Business</p>
                </div>
                <ul className="space-y-2 ml-8">
                    <li className="text-[10px] font-medium text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Étude de dossier rapide sous 24h
                    </li>
                    <li className="text-[10px] font-medium text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Aucun frais caché sur les mensualités
                    </li>
                </ul>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !phone} 
              className="w-full h-16 rounded-xl bg-primary text-black font-black text-xl shadow-xl shadow-yellow-100 hover:bg-primary/90 transition-all active:scale-95"
            >
              {isSubmitting ? <LogoSpinner /> : <><MessageSquare className="mr-2 h-6 w-6" /> Confirmer sur WhatsApp</>}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              En cliquant sur confirmer, vous envoyez une intention d'achat sérieuse. <br />
              Un conseiller prendra contact avec vous pour les modalités de paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
