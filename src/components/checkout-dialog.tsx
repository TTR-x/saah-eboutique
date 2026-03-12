'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/lib/types';
import { Wallet, Truck, User, CheckCircle2, ChevronLeft, ArrowRight, MessageSquare, FileEdit } from 'lucide-react';
import { Card, CardContent } from '@/components/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CheckoutDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'payment' | 'choice' | 'details' | 'summary';

export function CheckoutDialog({ product, open, onOpenChange }: CheckoutDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [step, setStep] = useState<Step>('payment');
  const [formData, setFormData] = useState({
    paymentMode: 'cash' as 'cash' | 'installments',
    name: '',
    phone: '',
    email: '',
    isDelivery: true,
    address: '',
  });

  const handleModeSelect = (mode: 'cash' | 'installments') => {
    setFormData({ ...formData, paymentMode: mode });
    setStep('choice');
  };

  const prevStep = () => {
    if (step === 'choice') setStep('payment');
    else if (step === 'details') setStep('choice');
    else if (step === 'summary') setStep('details');
  };

  const saveOrderToFirestore = (totalToPay: number) => {
    const orderData = {
      userId: user?.uid || 'guest',
      userEmail: formData.email || user?.email || 'non-renseigné',
      userName: formData.name || user?.displayName || 'Visiteur SAAH',
      userPhone: formData.phone || '',
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      amount: totalToPay,
      paymentMode: formData.paymentMode,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, 'orders'), orderData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDirectWhatsApp = () => {
    const phoneNumber = "22890101392";
    const modeLabel = formData.paymentMode === 'cash' ? 'Paiement Cash' : 'Paiement par tranches';
    
    const totalEstimate = formData.paymentMode === 'cash' ? product.price : (product.installmentPrice || 0);
    saveOrderToFirestore(totalEstimate);

    const message = `Bonjour SAAH Business, je suis intéressé par l'article : *${product.name}*
Mode de paiement souhaité : *${modeLabel}*

Merci de m'indiquer la marche à suivre pour finaliser mon achat rapidement.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
    setTimeout(() => setStep('payment'), 500);
  };

  const handleFinish = () => {
    const phoneNumber = "22890101392";
    const modeLabel = formData.paymentMode === 'cash' ? 'Paiement Cash' : 'Paiement par tranches';
    
    const deliveryInfo = formData.isDelivery 
      ? `✅ Livraison demandée\n📍 Adresse: ${formData.address}\n🚚 Frais: ${product.deliveryFees || 0} FCFA`
      : `🏪 Retrait en boutique (Lomé, Deckon)`;

    const totalToPay = formData.isDelivery && product.deliveryFees 
      ? (formData.paymentMode === 'installments' ? (product.installmentPrice || 0) + product.deliveryFees : product.price + product.deliveryFees)
      : (formData.paymentMode === 'installments' ? (product.installmentPrice || 0) : product.price);

    saveOrderToFirestore(totalToPay);

    const message = `Bonjour SAAH Business, voici ma commande détaillée :

*PRODUIT:* ${product.name}
*MODE:* ${modeLabel}
${formData.paymentMode === 'installments' ? `💰 Mensualité: ${product.installmentPrice?.toLocaleString('fr-FR')} FCFA x ${product.installmentMonths} mois` : ''}

*CLIENT:*
👤 ${formData.name}
📞 ${formData.phone}
${formData.email ? `📧 ${formData.email}` : ''}

*LIVRAISON:*
${deliveryInfo}

*TOTAL ESTIMÉ:* ${totalToPay.toLocaleString('fr-FR')} FCFA

Merci de valider ma commande.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
    setTimeout(() => setStep('payment'), 500);
  };

  const isDetailsValid = () => {
    return formData.name && formData.phone && (!formData.isDelivery || formData.address);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if(!isOpen) setTimeout(() => setStep('payment'), 500);
    }}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto p-0 border-none rounded-2xl shadow-2xl">
        <DialogHeader className="p-6 border-b bg-white">
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            {step === 'payment' && <><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-5 w-5" /></div> Mode de paiement</>}
            {step === 'choice' && <><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ArrowRight className="h-5 w-5" /></div> Comment commander ?</>}
            {step === 'details' && <><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User className="h-5 w-5" /></div> Vos informations</>}
            {step === 'summary' && <><div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 className="h-5 w-5" /></div> Résumé</>}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {step === 'payment' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-4">
                <div 
                  className="group cursor-pointer border-2 rounded-xl p-5 flex items-center gap-4 transition-all hover:border-primary hover:bg-primary/5 border-gray-100 bg-white shadow-sm"
                  onClick={() => handleModeSelect('cash')}
                >
                    <div className="h-12 w-12 rounded-lg bg-gray-100 group-hover:bg-primary/20 flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-base">Paiement Cash</p>
                      <p className="text-xs text-muted-foreground">Règlement immédiat</p>
                    </div>
                    <div className="text-right font-black text-primary">{product.price.toLocaleString('fr-FR')} F</div>
                </div>

                {product.allowInstallments && (
                  <div 
                    className="group cursor-pointer border-2 rounded-xl p-5 flex items-center gap-4 transition-all hover:border-blue-500 hover:bg-blue-50/50 border-gray-100 bg-white shadow-sm"
                    onClick={() => handleModeSelect('installments')}
                  >
                      <div className="h-12 w-12 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-base">Par tranches</p>
                        <p className="text-xs text-muted-foreground">{product.installmentMonths} mois</p>
                      </div>
                      <div className="text-right font-black text-blue-600">{product.installmentPrice?.toLocaleString('fr-FR')} F/m</div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold mt-4">Sélectionnez une option pour continuer</p>
            </div>
          )}

          {step === 'choice' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-4">
                    <Button 
                        onClick={handleDirectWhatsApp}
                        className="h-20 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-start px-6 gap-4 border-none shadow-lg shadow-green-100"
                    >
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-base">Direct sur WhatsApp</p>
                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-tighter">Rapide et sans formulaire</p>
                        </div>
                    </Button>

                    <Button 
                        variant="outline"
                        onClick={() => setStep('details')}
                        className="h-20 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 flex items-center justify-start px-6 gap-4 transition-all"
                    >
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:text-primary">
                            <FileEdit className="h-6 w-6" />
                        </div>
                        <div className="text-left text-gray-800">
                            <p className="font-black text-base">Remplir le formulaire</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Pour un devis avec livraison</p>
                        </div>
                    </Button>
                </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-bold text-xs uppercase text-muted-foreground">Nom Complet *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jean Dupont" className="h-12 rounded-lg border-gray-100 bg-gray-50 focus:ring-primary" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-bold text-xs uppercase text-muted-foreground">Numéro WhatsApp *</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="90 00 00 00" className="h-12 rounded-lg border-gray-100 bg-gray-50 focus:ring-primary" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-bold text-xs uppercase text-muted-foreground">Adresse Email (Optionnel)</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="votre@email.com" className="h-12 rounded-lg border-gray-100 bg-gray-50 focus:ring-primary" />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Checkbox 
                      id="isDelivery" 
                      checked={formData.isDelivery} 
                      disabled={!product.allowDelivery}
                      onCheckedChange={checked => setFormData({...formData, isDelivery: !!checked})} 
                      className="h-5 w-5 rounded-md"
                    />
                    <Label htmlFor="isDelivery" className="font-black text-sm cursor-pointer">Je souhaite être livré</Label>
                  </div>

                  {formData.isDelivery && product.allowDelivery && (
                    <div className="mt-3 grid gap-2 pl-4 border-l-2 border-primary animate-in slide-in-from-top-2 duration-200">
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="Quartier, Maison, Ville..." 
                        className="h-12 rounded-lg border-gray-100 bg-white focus:ring-primary"
                        required 
                      />
                      <p className="text-[10px] font-bold text-primary uppercase">Frais: {product.deliveryFees ? `${product.deliveryFees.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</p>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => setStep('summary')} 
                disabled={!isDetailsValid()} 
                className="w-full h-14 rounded-xl font-black text-lg shadow-xl bg-primary text-black hover:bg-primary/90 mt-4"
              >
                Voir le résumé <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-start border-b border-dashed pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Article</p>
                    <p className="font-black text-sm leading-tight">{product.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Mode</p>
                    <p className="font-black text-sm text-primary uppercase">{formData.paymentMode === 'cash' ? 'Cash' : 'Tranches'}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Prix article</span>
                    <span>{(formData.paymentMode === 'installments' ? product.installmentPrice : product.price)?.toLocaleString('fr-FR')} F</span>
                  </div>
                  {formData.isDelivery && (
                    <div className="flex justify-between font-medium">
                        <span className="text-muted-foreground">Livraison</span>
                        <span>{product.deliveryFees?.toLocaleString('fr-FR') || 0} F</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                    <span className="font-black text-lg">TOTAL</span>
                    <span className="font-black text-xl text-primary">
                      {((formData.paymentMode === 'installments' ? (product.installmentPrice || 0) : product.price) + (formData.isDelivery ? (product.deliveryFees || 0) : 0)).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleFinish} className="w-full h-16 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-lg shadow-xl shadow-green-200 transition-all active:scale-95">
                Confirmer sur WhatsApp
              </Button>
            </div>
          )}
        </div>

        {step !== 'payment' && (
          <DialogFooter className="p-4 bg-gray-50/50 border-t flex flex-row items-center justify-start">
            <Button variant="ghost" onClick={prevStep} className="font-bold text-muted-foreground hover:bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}