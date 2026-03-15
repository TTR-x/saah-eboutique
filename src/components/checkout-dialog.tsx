
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/lib/types';
import { Wallet, Truck, User, CheckCircle2, ChevronLeft, ArrowRight, MessageSquare, FileEdit, CreditCard, Users } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

interface CheckoutDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: 'cash' | 'installments' | 'tontine';
}

type Step = 'payment' | 'choice' | 'details' | 'summary';

export function CheckoutDialog({ product, open, onOpenChange, initialMode }: CheckoutDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [step, setStep] = useState<Step>('payment');
  const [formData, setFormData] = useState({
    paymentMode: 'cash' as 'cash' | 'installments' | 'tontine',
    name: '',
    phone: '',
    email: '',
    isDelivery: true,
    address: '',
  });

  useEffect(() => {
    if (open && initialMode) {
      if (initialMode === 'installments' || initialMode === 'tontine') {
          handleModeSelect(initialMode);
      } else {
          setFormData(prev => ({ ...prev, paymentMode: initialMode }));
          setStep('choice');
      }
    }
  }, [open, initialMode]);

  const handleModeSelect = (mode: 'cash' | 'installments' | 'tontine') => {
    if (mode === 'installments' || mode === 'tontine') {
      const checkoutUrl = `/checkout/${mode}/${product.id}`;
      if (!user) {
        router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`);
      } else {
        router.push(checkoutUrl);
      }
      onOpenChange(false);
      return;
    }
    setFormData({ ...formData, paymentMode: mode });
    setStep('choice');
  };

  const prevStep = () => {
    if (step === 'choice') setStep('payment');
    else if (step === 'details') setStep('choice');
    else if (step === 'summary') setStep('details');
  };

  const saveOrderToFirestore = (currentAmount: number) => {
    const orderData = {
      userId: user?.uid || 'guest',
      userEmail: formData.email || user?.email || 'non-renseigné',
      userName: formData.name || user?.displayName || 'Visiteur SAAH',
      userPhone: formData.phone || '',
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      amount: currentAmount,
      // INITIALISATION CRUCIALE
      totalPrice: Number(product.price),
      remainingAmount: Number(product.price),
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
    const modeLabel = formData.paymentMode === 'cash' ? 'Paiement Cash' : (formData.paymentMode === 'installments' ? 'Paiement par tranches' : 'Plan Tontine');
    
    // On fixe le montant du premier versement prévu
    let firstAmount = product.price;
    if (formData.paymentMode === 'installments') firstAmount = product.installmentPrice || 0;
    if (formData.paymentMode === 'tontine') firstAmount = product.tontineDailyRate || 0;

    saveOrderToFirestore(firstAmount);

    const message = `Bonjour SAAH Business, je suis intéressé par l'article : *${product.name}* (Ref: ${product.sku || product.id})
Mode de paiement souhaité : *${modeLabel}*

Merci de m'indiquer la marche à suivre pour finaliser mon achat rapidement.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
    setTimeout(() => setStep('payment'), 500);
  };

  const handleFinish = () => {
    const phoneNumber = "22890101392";
    const modeLabel = formData.paymentMode === 'cash' ? 'Paiement Cash' : (formData.paymentMode === 'installments' ? 'Paiement par tranches' : 'Plan Tontine');
    
    let baseAmount = product.price;
    if (formData.paymentMode === 'installments') baseAmount = product.installmentPrice || 0;
    if (formData.paymentMode === 'tontine') baseAmount = product.tontineDailyRate || 0;

    const totalToPay = formData.isDelivery && product.deliveryFees 
      ? baseAmount + product.deliveryFees
      : baseAmount;

    saveOrderToFirestore(baseAmount); // On enregistre le montant de base sans livraison dans 'amount'

    const message = `Bonjour SAAH Business, voici ma commande détaillée :

*PRODUIT:* ${product.name} (Ref: ${product.sku || product.id})
*MODE:* ${modeLabel}
👤 ${formData.name}
📞 ${formData.phone}

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
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto p-0 border-none rounded-md shadow-2xl">
        <DialogHeader className="p-6 border-b bg-white">
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            {step === 'payment' && <><div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-5 w-5" /></div> Mode de paiement</>}
            {step === 'choice' && <><div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary"><ArrowRight className="h-5 w-5" /></div> Action</>}
            {step === 'details' && <><div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary"><User className="h-5 w-5" /></div> Informations</>}
            {step === 'summary' && <><div className="h-8 w-8 rounded-sm bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle2 className="h-5 w-5" /></div> Résumé</>}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {step === 'payment' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-4">
                <div 
                  className="group cursor-pointer border-2 rounded-md p-5 flex items-center gap-4 transition-all hover:border-primary hover:bg-primary/5 border-gray-100 bg-white"
                  onClick={() => handleModeSelect('cash')}
                >
                    <div className="h-12 w-12 rounded-sm bg-gray-100 group-hover:bg-primary/20 flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-base">Paiement Cash</p>
                      <p className="text-xs text-muted-foreground">Tout payé maintenant</p>
                    </div>
                    <div className="text-right font-black text-primary">{product.price.toLocaleString('fr-FR')} F</div>
                </div>

                {product.allowInstallments && (
                  <div 
                    className="group cursor-pointer border-2 rounded-md p-5 flex items-center gap-4 transition-all hover:border-blue-500 hover:bg-blue-50/50 border-gray-100 bg-white"
                    onClick={() => handleModeSelect('installments')}
                  >
                      <div className="h-12 w-12 rounded-sm bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-base">Par tranches</p>
                        <p className="text-xs text-muted-foreground">{product.installmentMonths} mensualités</p>
                      </div>
                      <div className="text-right font-black text-blue-600">{product.installmentPrice?.toLocaleString('fr-FR')} F</div>
                  </div>
                )}

                {product.isTontine && (
                  <div 
                    className="group cursor-pointer border-2 rounded-md p-5 flex items-center gap-4 transition-all hover:border-green-500 hover:bg-green-50/50 border-gray-100 bg-white"
                    onClick={() => handleModeSelect('tontine')}
                  >
                      <div className="h-12 w-12 rounded-sm bg-gray-100 group-hover:bg-green-100 flex items-center justify-center text-gray-600 group-hover:text-green-600 transition-colors">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-base">Plan Tontine</p>
                        <p className="text-xs text-muted-foreground">Épargne collective</p>
                      </div>
                      <div className="text-right font-black text-green-600">{product.tontineDailyRate?.toLocaleString('fr-FR')} F</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'choice' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <Button 
                    onClick={handleDirectWhatsApp}
                    className="w-full h-20 rounded-md bg-green-600 hover:bg-green-700 text-white flex items-center justify-start px-6 gap-4"
                >
                    <MessageSquare className="h-6 w-6" />
                    <div className="text-left">
                        <p className="font-black text-base">WhatsApp Direct</p>
                        <p className="text-[10px] opacity-80 uppercase">Le plus rapide</p>
                    </div>
                </Button>

                <Button 
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="w-full h-20 rounded-md border-2 border-gray-100 hover:border-primary flex items-center justify-start px-6 gap-4"
                >
                    <FileEdit className="h-6 w-6 text-gray-400" />
                    <div className="text-left">
                        <p className="font-black text-base text-gray-800">Remplir le formulaire</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Pour livraison précise</p>
                    </div>
                </Button>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">Nom Complet *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jean Dupont" className="h-12 rounded-sm border-gray-100 bg-gray-50" required />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">Numéro WhatsApp *</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="90 00 00 00" className="h-12 rounded-sm border-gray-100 bg-gray-50" required />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-sm border border-gray-100">
                    <Checkbox 
                      id="isDelivery" 
                      checked={formData.isDelivery} 
                      disabled={!product.allowDelivery}
                      onCheckedChange={checked => setFormData({...formData, isDelivery: !!checked})} 
                    />
                    <Label htmlFor="isDelivery" className="font-black text-sm cursor-pointer">Je souhaite être livré</Label>
                  </div>

                  {formData.isDelivery && (
                    <div className="mt-3 grid gap-2 pl-4 border-l-2 border-primary">
                      <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="Quartier, Maison..." 
                        className="h-12 rounded-sm"
                        required 
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={() => setStep('summary')} disabled={!isDetailsValid()} className="w-full h-14 rounded-md font-black text-lg bg-primary text-black">
                Voir le résumé <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start border-b border-dashed pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Article</p>
                    <p className="font-black text-sm leading-tight">{product.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Mode</p>
                    <p className="font-black text-sm text-primary uppercase">{formData.paymentMode}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-t pt-3 mt-3">
                    <span className="font-black text-lg">TOTAL À PAYER</span>
                    <span className="font-black text-xl text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleFinish} className="w-full h-16 rounded-md bg-green-600 hover:bg-green-700 text-white font-black text-lg">
                Confirmer ma commande
              </Button>
            </div>
          )}
        </div>

        {step !== 'payment' && (
          <DialogFooter className="p-4 bg-gray-50/50 border-t flex flex-row items-center justify-start">
            <Button variant="ghost" onClick={prevStep} className="font-bold text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
