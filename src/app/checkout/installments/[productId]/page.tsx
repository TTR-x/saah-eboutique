
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
import { CreditCard, Phone, ArrowLeft, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import type { Product } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Checkbox } from '@/components/ui/checkbox';

export default function InstallmentCheckoutPage() {
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
      amount: Number(product.installmentPrice || 0),
      // INITIALISATION CRUCIALE
      totalPrice: Number(product.price),
      remainingAmount: Number(product.price),
      paymentMode: 'installments',
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
        <p className="text-sm font-bold text-muted-foreground uppercase animate-pulse">Initialisation...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-bold text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-3xl font-black tracking-tight">Finaliser ma demande</h1>

          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-blue-600 text-white p-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <CreditCard className="h-6 w-6" /> Plan par tranches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-6 p-6 border-b">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden border bg-white shrink-0 shadow-sm mx-auto sm:mx-0">
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2" sizes="96px" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-black text-lg">{product.name}</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Valeur: {product.price.toLocaleString('fr-FR')} F</p>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x bg-blue-50/50">
                <div className="p-6 text-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase">Mensualité</p>
                  <p className="text-2xl font-black text-blue-700">{product.installmentPrice?.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase">Durée</p>
                  <p className="text-2xl font-black text-blue-700">{product.installmentMonths} mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-xs uppercase ml-1">Numéro WhatsApp *</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="90 00 00 00" className="h-14 rounded-xl text-lg font-bold" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="neighborhood" className="font-black text-xs uppercase ml-1">Quartier *</Label>
                <Input id="neighborhood" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} placeholder="Ex: Deckon, Adidogomé..." className="h-14 rounded-xl" required />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-dashed">
                <Checkbox id="isDelivery" checked={formData.isDelivery} onCheckedChange={checked => setFormData({...formData, isDelivery: !!checked})} className="h-6 w-6 rounded-md" />
                <Label htmlFor="isDelivery" className="font-black text-sm cursor-pointer">Livraison à domicile</Label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || !formData.phone || !formData.neighborhood} className="w-full h-16 rounded-xl bg-primary text-black font-black text-xl shadow-xl">
              {isSubmitting ? <LogoSpinner /> : "Confirmer mon engagement"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
