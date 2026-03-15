
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Store, Smartphone, CheckCircle2, ArrowRight, MessageSquare, Copy, MapPin, Clock, RefreshCw, AlertCircle, Sparkles, History, Calendar, CheckCircle, BookmarkCheck, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  
  const orderRef = useMemo(() => {
    if (!db || !orderId) return null;
    return doc(db, 'orders', orderId as string);
  }, [db, orderId]);

  const { data: order, loading } = useDoc<Order>(orderRef as any);
  
  const [paymentType, setPaymentType] = useState<'online' | 'store' | null>(null);
  const [transferId, setTransferId] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Initialiser le montant avec le montant de la commande
  useEffect(() => {
    if (order && customAmount === 0) {
      setCustomAmount(order.amount);
    }
  }, [order]);

  // Scroll automatique quand on choisit un mode de paiement
  useEffect(() => {
    if (paymentType) {
      setTimeout(() => {
        paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [paymentType]);

  const totalPrice = order?.totalPrice || order?.amount || 0;
  const remainingAmount = order?.remainingAmount ?? totalPrice;

  // Syntaxe Tmoney Marchand: *145*5*MONTANT*1155686#
  const tmoneySyntax = `*145*5*${customAmount}*1155686#`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le code a été copié dans votre presse-papier." });
  };

  const handleRegisterForStore = async () => {
    if (!orderRef) return;
    setIsRegistering(true);
    try {
      await updateDoc(orderRef, {
        isStoreRegistered: true,
        updatedAt: serverTimestamp()
      });
      toast({ 
        title: "Produit enregistré !", 
        description: "L'admin verra cet article en priorité à votre arrivée." 
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer.", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAlreadySent = async () => {
    if (!orderRef || !transferId || !order) return;
    
    setIsSubmitting(true);
    try {
      await updateDoc(orderRef, {
        transferId: transferId,
        status: 'payment_pending',
        updatedAt: serverTimestamp()
      });

      toast({ 
        title: "Demande envoyée", 
        description: "Votre preuve de paiement a été transmise." 
      });

      // Ouvrir WhatsApp pour informer l'admin
      const phoneNumber = "22890101392";
      const message = `Bonjour SAAH Business, je viens d'effectuer mon versement Tmoney pour ma commande :
    
*ARTICLE:* ${order.productName}
*MONTANT:* ${customAmount.toLocaleString('fr-FR')} FCFA
*ID TRANSFERT:* ${transferId}

Merci de valider mon paiement.`;

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryAfterReject = async () => {
    if (!orderRef) return;
    await updateDoc(orderRef, { status: 'pending' });
    setPaymentType(null);
    setTransferId('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LogoSpinner className="h-12 w-12 text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Chargement...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Commande introuvable</h1>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-primary font-bold underline">Retour au tableau de bord</button>
      </div>
    );
  }

  // --- ÉCRANS DE STATUT (COMPLÉTÉ / REJETÉ / EN ATTENTE) ---
  if (order.status === 'completed') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in duration-500">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white text-center">
          <div className="bg-green-500 p-12 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-green-600 shadow-xl">
              <CheckCircle2 className="h-14 w-14" />
            </div>
          </div>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Félicitations ! 🥳</h1>
              <p className="text-muted-foreground font-medium text-lg">Cet article est désormais entièrement payé.</p>
            </div>
            <Button asChild className="w-full h-16 rounded-2xl bg-black text-white hover:bg-gray-800 font-black text-xl shadow-xl transition-all">
              <Link href="/dashboard">Voir mon tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in duration-500">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white text-center">
          <div className="bg-red-500 p-12 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-red-600 shadow-xl">
              <AlertCircle className="h-14 w-14" />
            </div>
          </div>
          <CardContent className="p-10 space-y-6">
            <h1 className="text-3xl font-black tracking-tight">Paiement Refusé ❌</h1>
            <p className="text-muted-foreground font-medium">Nous n'avons pas pu confirmer votre transfert Tmoney.</p>
            <div className="bg-red-50 p-6 rounded-2xl border border-dashed border-red-200 text-left">
              <p className="text-sm font-bold text-red-800 leading-relaxed">Veuillez vérifier vos reçus et recommencer la soumission de l'ID.</p>
            </div>
            <Button onClick={handleRetryAfterReject} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl shadow-xl transition-all">
              <RefreshCw className="mr-2 h-6 w-6" /> Réessayer maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status === 'payment_pending') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in duration-500">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white text-center">
          <div className="bg-orange-500 p-12 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white relative">
              <Clock className="h-12 w-12 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin" />
            </div>
          </div>
          <CardContent className="p-10 space-y-6">
            <h1 className="text-3xl font-black tracking-tight mb-2">Validation en attente</h1>
            <p className="text-muted-foreground font-medium">Nous vérifions votre versement Tmoney...</p>
            <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-orange-200">
              <p className="text-sm font-bold text-orange-700 mb-1">ID de transaction :</p>
              <code className="text-lg font-black tracking-widest">{order.transferId}</code>
            </div>
            <Button asChild variant="outline" className="w-full h-14 rounded-xl border-2 border-gray-100 font-black text-lg">
              <Link href={`https://wa.me/22890101392?text=${encodeURIComponent(`Bonjour, je relance ma validation Tmoney ID: ${order.transferId}`)}`} target="_blank">
                  <MessageSquare className="mr-2 h-6 w-6 text-green-600" /> Nous relancer sur WhatsApp
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- INTERFACE DE PAIEMENT (PENDING ou VALIDATED) ---
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-8">
        
        {order.status === 'validated' && (
            <div className="bg-green-500 text-white rounded-2xl p-6 flex items-center gap-4 shadow-lg shadow-green-100">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <p className="font-black text-lg leading-none">Dernier versement validé ! 🥳</p>
                    <p className="text-xs font-bold opacity-90 mt-1 uppercase">Prêt pour le prochain versement ci-dessous.</p>
                </div>
            </div>
        )}

        <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Effectuer un versement</h1>
            <p className="text-muted-foreground font-medium">Choisissez votre mode de paiement pour <strong>{order.productName}</strong>.</p>
        </div>

        <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b">
                <div className="p-6 text-center space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prix Total</p>
                    <p className="text-xl font-black">{totalPrice.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="p-6 text-center space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reste à payer</p>
                    <p className="text-xl font-black text-blue-600">{remainingAmount.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="p-6 text-center space-y-2 bg-primary/5 flex flex-col justify-center items-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">À payer maintenant</p>
                    <div className="p-2 px-4 rounded-lg bg-white border-2 border-primary text-primary font-black text-xl">
                        {customAmount.toLocaleString('fr-FR')} F
                    </div>
                </div>
            </div>
        </Card>

        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-center text-muted-foreground">Comment souhaitez-vous régler ?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={() => setPaymentType('online')}
                    className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all ${paymentType === 'online' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${paymentType === 'online' ? 'bg-primary text-black' : 'bg-muted text-gray-400'}`}>
                        <Smartphone className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg">En Ligne</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Tmoney</p>
                    </div>
                </button>

                <button 
                    onClick={() => setPaymentType('store')}
                    className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all ${paymentType === 'store' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${paymentType === 'store' ? 'bg-white/20 text-white' : 'bg-muted text-gray-400'}`}>
                        <Store className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg">En Boutique</p>
                        <p className="text-[10px] font-bold uppercase tracking-tight opacity-60">agoè échangeur</p>
                    </div>
                </button>
            </div>
        </div>

        <div ref={paymentSectionRef} className="scroll-mt-20">
            {paymentType === 'online' && (
                <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white animate-in zoom-in-95 duration-300">
                    <CardHeader className="bg-primary p-8 text-black text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-black/10 p-3 rounded-full"><PhoneCall className="h-8 w-8" /></div>
                        </div>
                        <p className="text-black/70 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Composez ce code sur votre téléphone</p>
                        <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight break-all">
                            {tmoneySyntax}
                        </CardTitle>
                        <CardDescription className="text-black font-bold text-xs mt-4">
                            Paiement Marchand SAAH Business
                        </CardDescription>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(tmoneySyntax)} className="mt-6 bg-black/10 hover:bg-black/20 text-black font-black h-12 px-6 rounded-xl border border-black/10">
                            <Copy className="mr-2 h-4 w-4" /> Copier le code
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                Une fois le transfert effectué, veuillez saisir le <strong>numéro de transaction</strong> (ou l'ID de transfert) reçu par SMS ci-dessous.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="transferId" className="font-black text-[10px] uppercase text-muted-foreground ml-1">ID de transaction (Reçu par SMS) *</Label>
                                <Input id="transferId" value={transferId} onChange={e => setTransferId(e.target.value)} placeholder="Ex: 12345678" className="h-14 rounded-xl border-2 border-gray-100 bg-gray-50 font-bold text-lg" />
                            </div>
                            <Button onClick={handleAlreadySent} disabled={!transferId || isSubmitting} className="w-full h-16 rounded-xl bg-black text-white hover:bg-gray-800 font-black text-xl shadow-xl">
                                {isSubmitting ? <LogoSpinner /> : <><CheckCircle2 className="mr-2 h-6 w-6" /> Valider mon paiement</>}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {paymentType === 'store' && (
                <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white animate-in slide-in-from-right-4 duration-300">
                    <CardHeader className="bg-primary p-8 text-black text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-black/10 p-3 rounded-full"><MapPin className="h-8 w-8" /></div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight uppercase">Rendez-vous en boutique</CardTitle>
                        <CardDescription className="text-black/70 font-bold uppercase text-xs tracking-widest mt-2">Agoè échangeur (Lomé)</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* SECTION ENREGISTREMENT PHOTO ARTICLE - UNIQUEMENT SI PAS ENCORE VALIDÉ */}
                        {order.status === 'pending' && (
                          <>
                            {!order.isStoreRegistered ? (
                              <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center gap-4">
                                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border bg-white shadow-sm">
                                      <Image src={order.productImage} alt="" fill className="object-cover" />
                                  </div>
                                  <div className="text-center">
                                      <p className="font-black text-sm">{order.productName}</p>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Reste: {remainingAmount.toLocaleString('fr-FR')} F</p>
                                  </div>
                                  <Button 
                                      onClick={handleRegisterForStore}
                                      disabled={isRegistering}
                                      className="w-full h-12 rounded-xl font-black text-sm bg-black text-white"
                                  >
                                      {isRegistering ? <LogoSpinner /> : "Enregistrer le produit pour boutique"}
                                  </Button>
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase text-center leading-tight">
                                      Cliquez sur ce bouton pour que l'admin retrouve <br/> votre article instantanément en boutique.
                                  </p>
                              </div>
                            ) : (
                              <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200 flex flex-col items-center gap-2">
                                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                                      <BookmarkCheck className="h-6 w-6" />
                                  </div>
                                  <p className="font-black text-green-700 text-sm">Produit déjà enregistré</p>
                                  <p className="text-[10px] font-bold text-green-600 uppercase text-center">L'administrateur vous attend pour l'encaissement.</p>
                              </div>
                            )}
                          </>
                        )}

                        <div className="bg-muted/30 p-6 rounded-2xl text-center space-y-3 border border-dashed border-primary/30">
                            <p className="font-black text-gray-800 leading-tight text-xl">Nous sommes à 150m de l'échangeur d'agoè.</p>
                        </div>
                        
                        <div className="grid gap-4">
                            <Button asChild className="w-full h-16 rounded-xl bg-black text-white font-black text-lg shadow-xl">
                                <Link href="https://maps.app.goo.gl/HSZCvJGxY1CfpUNp8" target="_blank">
                                    <MapPin className="mr-2 h-6 w-6" /> Voir la localisation
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full h-16 rounded-xl border-2 border-gray-100 font-black text-lg">
                                <Link href={`https://wa.me/22890101392?text=${encodeURIComponent(`Bonjour, je souhaite passer en boutique pour un versement de ${customAmount} F pour l'article ${order.productName}`)}`} target="_blank">
                                    <MessageSquare className="mr-2 h-6 w-6 text-green-600" /> Écrivez-nous sur WhatsApp
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* SECTION HISTORIQUE */}
        {order.paymentHistory && order.paymentHistory.length > 0 && (
            <div className="pt-10">
                <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Historique des versements</h3>
                </div>
                <div className="space-y-3">
                    {order.paymentHistory.map((item, idx) => (
                        <div key={idx} className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm">{item.amount.toLocaleString('fr-FR')} FCFA</p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {item.date?.toDate ? format(item.date.toDate(), 'dd MMMM yyyy', { locale: fr }) : format(new Date(item.date), 'dd MMMM yyyy', { locale: fr })}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="font-mono text-[9px] bg-gray-50 border-gray-100">
                                    ID: {item.transferId}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="text-center pt-8 border-t border-dashed">
            <Button variant="link" onClick={() => router.push('/dashboard')} className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                Retourner au dashboard
            </Button>
        </div>
      </div>
    </div>
  );
}
