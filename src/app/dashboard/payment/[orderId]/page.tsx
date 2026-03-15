
'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Store, Smartphone, CheckCircle2, ArrowRight, MessageSquare, Copy, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const orderRef = useMemo(() => {
    if (!db || !orderId) return null;
    return doc(db, 'orders', orderId as string);
  }, [db, orderId]);

  const { data: order, loading } = useDoc<Order>(orderRef as any);
  
  const [paymentType, setPaymentType] = useState<'online' | 'store' | null>(null);
  const [transferId, setTransferId] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le numéro a été copié dans votre presse-papier." });
  };

  const handleAlreadySent = () => {
    const phoneNumber = "22890101392";
    const message = `Bonjour SAAH Business, je viens d'effectuer mon versement Tmoney pour ma commande :
    
*ARTICLE:* ${order?.productName}
*MONTANT ENVOYÉ:* ${order?.amount.toLocaleString('fr-FR')} FCFA
*NUMÉRO DE TRANSFERT:* ${transferId}

Merci de valider mon paiement.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LogoSpinner className="h-12 w-12 text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Chargement de votre plan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Commande introuvable</h1>
        <Button onClick={() => router.push('/dashboard')} variant="link" className="mt-4">Retour au tableau de bord</Button>
      </div>
    );
  }

  const totalPrice = order.totalPrice || order.amount;
  const remainingAmount = order.remainingAmount || totalPrice;
  const amountToPayNow = order.amount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-8">
        <div className="text-center space-y-2">
            <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase px-3">Engagement Validé</Badge>
            <h1 className="text-3xl font-black tracking-tight">C'est parti ! 🚀</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
                Vous venez de commencer votre paiement {order.paymentMode === 'tontine' ? 'par tontine' : 'par tranches'} pour <strong>{order.productName}</strong>.
            </p>
        </div>

        {/* RECAPITULATIF FINANCIER */}
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
                <div className="p-6 text-center space-y-1 bg-primary/5">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">À payer aujourd'hui</p>
                    <p className="text-2xl font-black text-primary">{amountToPayNow.toLocaleString('fr-FR')} F</p>
                </div>
            </div>
        </Card>

        {/* CHOIX DU MODE DE PAIEMENT */}
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-center text-muted-foreground">Comment souhaitez-vous régler ?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={() => setPaymentType('online')}
                    className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group ${paymentType === 'online' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${paymentType === 'online' ? 'bg-primary text-black' : 'bg-muted text-gray-400 group-hover:bg-gray-100'}`}>
                        <Smartphone className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg">En Ligne</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Tmoney</p>
                    </div>
                </button>

                <button 
                    onClick={() => setPaymentType('store')}
                    className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group ${paymentType === 'store' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${paymentType === 'store' ? 'bg-white/20 text-white' : 'bg-muted text-gray-400 group-hover:bg-gray-100'}`}>
                        <Store className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg">En Boutique</p>
                        <p className="text-[10px] font-bold uppercase tracking-tight opacity-60">agoè échangeur</p>
                    </div>
                </button>
            </div>
        </div>

        {/* INSTRUCTIONS EN LIGNE */}
        {paymentType === 'online' && (
            <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-primary p-8 text-black text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-black/10 p-3 rounded-full"><Smartphone className="h-8 w-8" /></div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tighter">92 39 20 62</CardTitle>
                    <CardDescription className="text-black/70 font-bold uppercase text-xs tracking-widest mt-2">
                        Envoyez <span className="text-black font-black underline">{amountToPayNow.toLocaleString('fr-FR')} F</span> sur notre Tmoney
                    </CardDescription>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy('92392062')} className="mt-4 bg-white/20 hover:bg-white/30 text-black font-black border-none">
                        Copier le numéro
                    </Button>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="transferId" className="font-black text-[10px] uppercase text-muted-foreground ml-1">Numéro du transfert (ou ID de transaction) *</Label>
                            <Input 
                                id="transferId" 
                                value={transferId} 
                                onChange={e => setTransferId(e.target.value)}
                                placeholder="Saisissez ici le numéro ou code reçu..." 
                                className="h-14 rounded-xl border-2 border-gray-100 bg-gray-50 focus:ring-primary font-bold text-lg"
                            />
                        </div>
                        <Button 
                            onClick={handleAlreadySent}
                            disabled={!transferId}
                            className="w-full h-16 rounded-xl bg-black text-white hover:bg-gray-800 font-black text-xl shadow-xl transition-all active:scale-95"
                        >
                            <CheckCircle2 className="mr-2 h-6 w-6" /> Valider mon paiement
                        </Button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground font-medium italic">Une fois validé, votre dossier sera mis à jour sous 30 minutes.</p>
                </CardContent>
            </Card>
        )}

        {/* INSTRUCTIONS BOUTIQUE */}
        {paymentType === 'store' && (
            <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white animate-in slide-in-from-right-4 duration-300">
                <CardHeader className="bg-primary p-8 text-black text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-black/10 p-3 rounded-full"><MapPin className="h-8 w-8" /></div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight uppercase">Rendez-vous en agence</CardTitle>
                    <CardDescription className="text-black/70 font-bold uppercase text-xs tracking-widest mt-2">
                        Agoè échangeur (Lomé)
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="bg-muted/30 p-6 rounded-2xl text-center space-y-3 border border-dashed border-primary/30">
                        <p className="font-black text-gray-800 leading-tight text-xl">
                            Nous sommes à 150m de l'échangeur d'agoè.
                        </p>
                        <p className="text-primary font-black uppercase text-sm tracking-widest animate-pulse">
                            On se revoit tout de suite !
                        </p>
                    </div>
                    
                    <div className="grid gap-4">
                        <Button asChild className="w-full h-16 rounded-xl bg-black text-white hover:bg-gray-800 font-black text-lg shadow-xl transition-all active:scale-95">
                            <Link href="https://maps.app.goo.gl/HSZCvJGxY1CfpUNp8" target="_blank">
                                <MapPin className="mr-2 h-6 w-6" /> Voir la localisation
                            </Link>
                        </Button>
                        
                        <Button asChild variant="outline" className="w-full h-16 rounded-xl border-2 border-gray-100 hover:border-primary font-black text-lg transition-all">
                            <Link href={`https://wa.me/22890101392?text=Bonjour, je souhaite passer en boutique pour régler ma commande ${orderId}`} target="_blank">
                                <MessageSquare className="mr-2 h-6 w-6 text-green-600" /> Écrivez-nous
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 space-y-2 text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest">
                        <p className="flex items-center justify-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Ouvert de 08h00 à 18h30</p>
                        <p className="flex items-center justify-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Commande N° : {orderId?.toString().slice(0, 8)}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="text-center pt-8 border-t border-dashed">
            <Button variant="link" onClick={() => router.push('/dashboard')} className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                Terminer plus tard et retourner au dashboard
            </Button>
        </div>
      </div>
    </div>
  );
}
