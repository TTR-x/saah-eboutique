
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
import { Users, Phone, ArrowLeft, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import type { Product } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Checkbox } from '@/components/ui/checkbox';

export default function TontineCheckoutPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { productId } = useParams();
  
  const productRef = useMemo(() => {
    if (!db || !productId) return null;
    return doc(db, 'products', productId as string);
  }, [db, productId]);

  const { data: product, loading: productLoading } = useDoc<Product>(productRef as any);

  const [formData, setFormData] = useState({
    phone: '',
    neighborhood: '',
    isDelivery: false,
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signup?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, authLoading, router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !formData.phone) return;

    setIsSubmitting(true);
    const orderData = {
      userId: user.uid,
      userEmail: user.email || 'non-renseigné',
      userName: user.displayName || 'Client SAAH',
      userPhone: formData.phone,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      amount: product.tontineDailyRate || 0, // Premier versement du jour
      totalPrice: product.price,
      remainingAmount: product.price,
      paymentMode: 'tontine',
      status: 'pending',
      neighborhood: formData.neighborhood,
      isDelivery: formData.isDelivery,
      address: formData.address,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      router.push(`/dashboard/payment/${docRef.id}`);
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
        <p className="text-sm font-bold text-muted-foreground uppercase animate-pulse tracking-widest">Initialisation de votre plan tontine...</p>
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
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-tight">Rejoindre le Plan Tontine</h1>
            <p className="text-muted-foreground font-medium">Épargnez ensemble pour obtenir votre {product.name}.</p>
          </div>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-green-600 text-white p-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                <Users className="h-6 w-6" /> Cycle d'épargne collective
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-6 p-6 border-b">
                <div className="relative h-32 w-32 rounded-xl overflow-hidden border bg-white shrink-0 shadow-sm mx-auto sm:mx-0">
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2" sizes="128px" />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h2 className="font-black text-xl leading-tight">{product.name}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Valeur de l'article: {product.price.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x bg-green-50/50">
                <div className="p-6 text-center space-y-1">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Par jour</p>
                  <p className="text-2xl font-black text-green-700">{product.tontineDailyRate?.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="p-6 text-center space-y-1">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Durée cycle</p>
                  <p className="text-2xl font-black text-green-700">{product.tontineDuration || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-sm uppercase ml-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Numéro WhatsApp *
                </Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="Ex: 90 00 00 00" 
                  className="h-14 rounded-xl border-2 border-gray-100 bg-white shadow-sm focus:border-primary focus:ring-0 text-lg font-bold"
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="neighborhood" className="font-black text-sm uppercase ml-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Votre Quartier *
                </Label>
                <Input 
                  id="neighborhood" 
                  value={formData.neighborhood} 
                  onChange={e => setFormData({...formData, neighborhood: e.target.value})} 
                  placeholder="Ex: Baguida, Agoè, Hedzranawoé..." 
                  className="h-14 rounded-xl border-2 border-gray-100 bg-white shadow-sm focus:border-primary focus:ring-0 text-lg font-bold"
                  required 
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-dashed">
                <Checkbox 
                  id="isDelivery" 
                  checked={formData.isDelivery} 
                  onCheckedChange={checked => setFormData({...formData, isDelivery: !!checked})} 
                  className="h-6 w-6 rounded-md"
                />
                <div className="grid gap-0.5">
                    <Label htmlFor="isDelivery" className="font-black text-sm cursor-pointer">Je souhaite être livré</Label>
                    <p className="text-[10px] font-bold text-primary uppercase">Frais: {product.deliveryFees ? `${product.deliveryFees.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</p>
                </div>
              </div>

              {formData.isDelivery && (
                <div className="grid gap-2 animate-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="address" className="font-black text-sm uppercase ml-1">Adresse précise de livraison</Label>
                    <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="Précisez votre emplacement..." 
                        className="h-14 rounded-xl border-2 border-gray-100 bg-white shadow-sm focus:border-primary focus:ring-0 text-lg font-bold"
                        required 
                    />
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-3">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-xs font-bold text-green-800">Transparence SAAH Business</p>
                </div>
                <ul className="space-y-2 ml-8">
                    <li className="text-[10px] font-medium text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Suivi régulier de votre épargne
                    </li>
                    <li className="text-[10px] font-medium text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Remise de l'article garantie à la fin du cycle
                    </li>
                </ul>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.phone || !formData.neighborhood} 
              className="w-full h-16 rounded-xl bg-primary text-black font-black text-xl shadow-xl shadow-yellow-100 hover:bg-primary/90 transition-all active:scale-95"
            >
              {isSubmitting ? <LogoSpinner /> : "Confirmer ma participation"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              La tontine est un engagement solidaire. <br />
              Vous passerez ensuite à l'étape du premier versement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
