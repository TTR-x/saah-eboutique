
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/types';
import { Wallet, Truck, Users, User, MapPin, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CheckoutDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'payment' | 'personal' | 'delivery' | 'summary';

export function CheckoutDialog({ product, open, onOpenChange }: CheckoutDialogProps) {
  const [step, setStep] = useState<Step>('payment');
  const [formData, setFormData] = useState({
    paymentMode: 'cash' as 'cash' | 'installments' | 'tontine',
    name: '',
    phone: '',
    email: '',
    isDelivery: true,
    address: '',
  });

  const nextStep = () => {
    if (step === 'payment') setStep('personal');
    else if (step === 'personal') setStep('delivery');
    else if (step === 'delivery') setStep('summary');
  };

  const prevStep = () => {
    if (step === 'summary') setStep('delivery');
    else if (step === 'delivery') setStep('personal');
    else if (step === 'personal') setStep('payment');
  };

  const handleFinish = () => {
    const phoneNumber = "22890101392";
    const modeLabel = formData.paymentMode === 'cash' ? 'Paiement Cash' : 
                     (formData.paymentMode === 'installments' ? 'Paiement par tranches' : 'Plan Tontine');
    
    const deliveryInfo = formData.isDelivery 
      ? `✅ Livraison demandée\n📍 Adresse: ${formData.address}\n🚚 Frais: ${product.deliveryFees || 0} FCFA`
      : `🏪 Retrait en boutique (Lomé, Deckon)`;

    const totalToPay = formData.isDelivery && product.deliveryFees 
      ? (formData.paymentMode === 'installments' ? product.installmentPrice! + product.deliveryFees : product.price + product.deliveryFees)
      : (formData.paymentMode === 'installments' ? product.installmentPrice! : product.price);

    const message = `Bonjour SAAH Business, je souhaite finaliser ma commande :

*PRODUIT:* ${product.name}
*MODE:* ${modeLabel}
${formData.paymentMode === 'installments' ? `💰 Mensualité: ${product.installmentPrice?.toLocaleString('fr-FR')} FCFA x ${product.installmentMonths} mois` : ''}

*CLIENT:*
👤 ${formData.name}
📞 ${formData.phone}
📧 ${formData.email}

*LIVRAISON:*
${deliveryInfo}

*TOTAL ESTIMÉ:* ${totalToPay.toLocaleString('fr-FR')} FCFA

Merci de m'envoyer les instructions de paiement.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
    // Reset after closing
    setTimeout(() => setStep('payment'), 500);
  };

  const isStepValid = () => {
    if (step === 'personal') return formData.name && formData.phone;
    if (step === 'delivery' && formData.isDelivery) return formData.address;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'payment' && <><Wallet className="h-5 w-5 text-primary" /> Mode de paiement</>}
            {step === 'personal' && <><User className="h-5 w-5 text-primary" /> Vos informations</>}
            {step === 'delivery' && <><MapPin className="h-5 w-5 text-primary" /> Livraison ou Retrait</>}
            {step === 'summary' && <><CheckCircle2 className="h-5 w-5 text-green-500" /> Résumé de commande</>}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Bar */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
            {(['payment', 'personal', 'delivery', 'summary'] as Step[]).map((s, i) => {
              const steps: Step[] = ['payment', 'personal', 'delivery', 'summary'];
              const isActive = steps.indexOf(step) >= i;
              return (
                <div key={s} className={`relative z-10 h-4 w-4 rounded-full border-2 ${isActive ? 'bg-primary border-primary' : 'bg-background border-muted'}`} />
              );
            })}
          </div>

          {/* STEP 1: PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">Comment souhaitez-vous acquérir cet article ?</p>
              <div className="grid gap-3">
                <Card 
                  className={`cursor-pointer border-2 transition-all ${formData.paymentMode === 'cash' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                  onClick={() => setFormData({...formData, paymentMode: 'cash'})}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Wallet className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">Paiement Cash</p>
                      <p className="text-xs text-muted-foreground">Règlement en une fois</p>
                    </div>
                    <div className="text-right font-bold text-sm">{product.price.toLocaleString('fr-FR')} FCFA</div>
                  </CardContent>
                </Card>

                {product.allowInstallments && (
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${formData.paymentMode === 'installments' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                    onClick={() => setFormData({...formData, paymentMode: 'installments'})}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Truck className="h-5 w-5" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">Par tranches</p>
                        <p className="text-xs text-muted-foreground">{product.installmentMonths} mensualités</p>
                      </div>
                      <div className="text-right font-bold text-sm">{product.installmentPrice?.toLocaleString('fr-FR')} FCFA / mois</div>
                    </CardContent>
                  </Card>
                )}

                {product.isTontine && (
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${formData.paymentMode === 'tontine' ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                    onClick={() => setFormData({...formData, paymentMode: 'tontine'})}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Users className="h-5 w-5" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">Plan Tontine</p>
                        <p className="text-xs text-muted-foreground">Épargne collective sur {product.tontineDuration}</p>
                      </div>
                      <div className="text-right font-bold text-sm text-green-600">Choisir</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFO */}
          {step === 'personal' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom Complet</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Jean Dupont" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro WhatsApp</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ex: 90 00 00 00" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (facultatif)</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="votre@email.com" />
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY */}
          {step === 'delivery' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isDelivery" 
                  checked={formData.isDelivery} 
                  disabled={!product.allowDelivery}
                  onCheckedChange={checked => setFormData({...formData, isDelivery: !!checked})} 
                />
                <Label htmlFor="isDelivery" className="font-bold">Je souhaite être livré {!product.allowDelivery && "(Non disponible)"}</Label>
              </div>

              {formData.isDelivery && product.allowDelivery ? (
                <div className="grid gap-2 pl-6 border-l-2 border-primary">
                  <Label htmlFor="address">Adresse de livraison complète</Label>
                  <Input 
                    id="address" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="Quartier, Rue, Maison, Ville..." 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">Frais de livraison : <strong>{product.deliveryFees ? `${product.deliveryFees.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</strong></p>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="font-bold text-sm">Retrait en boutique gratuit</p>
                  <p className="text-xs text-muted-foreground">Lieu: Lomé, Immeuble SAAH (Près de Deckon)</p>
                  <p className="text-xs text-muted-foreground">Horaires: Lun-Sam (08h00 - 18h00)</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 'summary' && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                <h4 className="font-bold text-sm mb-2 text-primary">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produit:</span>
                    <span className="font-medium text-right ml-4">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paiement:</span>
                    <span className="font-medium">{formData.paymentMode === 'cash' ? 'Cash' : (formData.paymentMode === 'installments' ? 'Tranches' : 'Tontine')}</span>
                  </div>
                  {formData.isDelivery && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Livraison:</span>
                        <span className="font-medium">{product.deliveryFees?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                    <span>Total {formData.paymentMode === 'installments' ? '(Initiale + Livraison)' : ''}:</span>
                    <span className="text-primary">
                      {((formData.paymentMode === 'installments' ? product.installmentPrice! : product.price) + (formData.isDelivery ? (product.deliveryFees || 0) : 0)).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground italic text-center px-4">
                En cliquant sur "Confirmer", vous serez redirigé vers WhatsApp pour finaliser le paiement avec un conseiller.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-4 pt-4 border-t">
          {step !== 'payment' ? (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          
          {step === 'summary' ? (
            <Button onClick={handleFinish} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
              Confirmer et Payer
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!isStepValid()} className="flex-1 font-bold">
              Continuer <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
