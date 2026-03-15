
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, ShoppingBag, Clock, ChevronRight, Gift, CheckCircle2, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef);

  // 1. Charger les Commandes
  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('userId', '==', user.uid));
  }, [db, user]);
  const { data: rawOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  // 2. Charger les COPIES de paiements pour le calcul de la somme payée
  const paymentsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'payments'), where('userId', '==', user.uid));
  }, [db, user]);
  const { data: allPayments } = useCollection<any>(paymentsQuery);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
  }, [rawOrders]);

  // UN ARTICLE EST CONFIRMÉ s'il a au moins un document de paiement associé (une copie) ou s'il est explicitement validé
  const confirmedOrders = useMemo(() => {
    return orders.filter(o => {
        const hasValidatedPayment = allPayments?.some(p => p.orderId === o.id);
        return hasValidatedPayment || o.status === 'validated' || o.status === 'completed';
    });
  }, [orders, allPayments]);

  // UNE INTENTION est un article qui n'a encore AUCUNE copie de paiement validée
  const newIntentions = useMemo(() => {
    return orders.filter(o => {
        const hasValidatedPayment = allPayments?.some(p => p.orderId === o.id);
        const isAlreadyConfirmed = o.status === 'validated' || o.status === 'completed';
        return !hasValidatedPayment && !isAlreadyConfirmed && o.status !== 'cancelled';
    });
  }, [orders, allPayments]);

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.replace('/login');
    }
  }, [user, authLoading, router, mounted]);

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LogoSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500 pb-20">
      {/* HEADER PROFIL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-yellow-100">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {profile?.displayName || user.displayName || 'Client SAAH'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Compte vérifié</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl font-black text-primary border-primary/20">
                <Link href="/dashboard/gifts"><Gift className="h-4 w-4 mr-2" /> Mes Cadeaux</Link>
            </Button>
        </div>
      </div>

      {/* SECTION DES INTENTIONS */}
      {newIntentions.length > 0 && (
        <div id="intentions-section" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" /> Validation en attente ({newIntentions.length})
            </h2>
            <div className="grid gap-4">
                {newIntentions.map((order: any) => {
                    const isPending = order.status === 'payment_pending';
                    const isRejected = order.status === 'rejected';
                    
                    return (
                        <Link key={order.id} href={`/dashboard/payment/${order.id}`} className="block transition-transform active:scale-[0.98]">
                            <Card className="border-none shadow-sm rounded-2xl bg-orange-50/50 border-orange-100 overflow-hidden hover:shadow-md transition-all">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border shrink-0 mx-auto sm:mx-0">
                                        {order.productImage && <Image src={order.productImage} alt="" fill className="object-cover" sizes="56px" />}
                                    </div>
                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <h3 className="font-bold text-sm truncate">{order.productName}</h3>
                                        <Badge className={cn("mt-1 uppercase text-[8px]", isPending ? 'bg-orange-500' : isRejected ? 'bg-red-500' : 'bg-gray-400')}>
                                            {isPending ? 'Vérification...' : isRejected ? 'Refusé' : 'À finaliser'}
                                        </Badge>
                                    </div>
                                    <div className={cn("rounded-lg font-black text-xs h-9 px-4 flex items-center justify-center shrink-0", isPending ? "bg-orange-500 text-white" : "bg-primary text-black")}>
                                        {isPending ? 'Statut' : isRejected ? 'Réessayer' : 'Payer'} <ChevronRight className="h-3 w-3 ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
      )}

      {/* SECTION DES ARTICLES CONFIRMÉS */}
      <div id="confirmed-section" className="scroll-mt-24 mb-16">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" /> Mes Achats & Plans Confirmés
        </h2>

        {ordersLoading ? (
            <div className="flex justify-center py-12"><LogoSpinner className="h-8 w-8 text-primary" /></div>
        ) : confirmedOrders.length > 0 ? (
            <div className="grid gap-4">
            {confirmedOrders.map((order: any) => {
                // CALCUL ROBUSTE via la collection 'payments'
                const orderPayments = allPayments?.filter(p => p.orderId === order.id) || [];
                const paidSum = orderPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                const totalPrice = Number(order.totalPrice || order.amount || 0);
                const remaining = Math.max(0, totalPrice - paidSum);
                const progress = totalPrice > 0 ? (paidSum / totalPrice) * 100 : 0;
                const isPendingVerif = order.status === 'payment_pending';

                return (
                <Link key={order.id} href={`/dashboard/payment/${order.id}`} className="block transition-transform active:scale-[0.98]">
                    <Card className="border-none shadow-sm rounded-2xl bg-card overflow-hidden hover:shadow-md transition-all">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden border shrink-0 mx-auto sm:mx-0 bg-muted">
                            {order.productImage && <Image src={order.productImage} alt="" fill className="object-cover" sizes="64px" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black text-sm sm:text-base truncate pr-2">{order.productName}</h3>
                                <Badge className={cn("uppercase text-[9px]", order.status === 'completed' ? 'bg-green-500' : 'bg-blue-500')}>
                                    {order.status === 'completed' ? 'Payé ✅' : 'En cours ⚡'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground mb-3">
                                <span className="text-primary font-black">{totalPrice.toLocaleString('fr-FR')} F</span>
                                <span>•</span>
                                <span className="uppercase">{order.paymentMode}</span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase">
                                    <span className="text-blue-600">Somme Payée: {paidSum.toLocaleString('fr-FR')} F</span>
                                    <span className="text-muted-foreground">Reste: {remaining.toLocaleString('fr-FR')} F</span>
                                </div>
                                <Progress value={progress} className="h-1.5 bg-gray-100" />
                            </div>
                        </div>

                        <div className={cn("rounded-lg font-black text-xs px-4 h-9 shadow-sm transition-all flex items-center justify-center shrink-0", isPendingVerif ? "bg-orange-500 text-white" : "bg-primary text-black")}>
                            {isPendingVerif ? "Statut" : "Nouveau versement"} <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                        </CardContent>
                    </Card>
                </Link>
                );
            })}
            </div>
        ) : (
            <div className="bg-card rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                <h3 className="font-black text-lg">Aucun plan confirmé</h3>
                <p className="text-muted-foreground text-sm mt-2">Dès que votre premier paiement est validé, il apparaîtra ici.</p>
            </div>
        )}
      </div>

      {/* BOUTON HISTORIQUE GLOBAL */}
      <div className="flex justify-center border-t pt-10">
        <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black gap-3 hover:bg-primary hover:border-primary transition-all">
          <Link href="/dashboard/history"><History className="h-5 w-5" /> Voir mes copies de paiement</Link>
        </Button>
      </div>
    </div>
  );
}
