
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, ShoppingBag, Clock, ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
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

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [db, user]);

  const { data: rawOrders, loading: ordersLoading } = useCollection(ordersQuery);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
  }, [rawOrders]);

  // UN ARTICLE EST CONFIRMÉ s'il est validé, complété ou s'il a au moins un versement dans l'historique
  const confirmedOrders = useMemo(() => {
    return orders.filter(o => 
        o.status === 'completed' || 
        o.status === 'validated' || 
        (o.paymentHistory && o.paymentHistory.length > 0)
    );
  }, [orders]);

  // UNE INTENTION est un article avec 0 versement validé (historique vide et pas de statut validé)
  const newIntentions = useMemo(() => {
    return orders.filter(o => 
        !(o.status === 'completed' || o.status === 'validated' || (o.paymentHistory && o.paymentHistory.length > 0)) &&
        o.status !== 'cancelled'
    );
  }, [orders]);

  const pendingPaymentsCount = useMemo(() => {
    return orders.filter(o => o.status === 'payment_pending').length;
  }, [orders]);

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
            <p className="text-muted-foreground text-sm font-medium">Espace Personnel</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                    "rounded-lg font-black transition-all",
                    pendingPaymentsCount > 0 
                        ? "bg-primary text-black animate-pulse shadow-md" 
                        : "text-gray-400 bg-muted/50"
                )}
                onClick={() => {
                    if (pendingPaymentsCount > 0) {
                        const el = document.getElementById('intentions-section') || document.getElementById('confirmed-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        toast({ title: "Information", description: "Aucun paiement en cours de vérification." });
                    }
                }}
            >
                <Clock className="h-4 w-4 mr-2" /> 
                Paiements en attente {pendingPaymentsCount > 0 && `(${pendingPaymentsCount})`}
            </Button>

            <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary font-black">
                <Link href="/dashboard/gifts"><Gift className="h-4 w-4 mr-2" /> Mes Cadeaux</Link>
            </Button>
        </div>
      </div>

      {/* SECTION DES INTENTIONS : Uniquement les nouveaux articles (0 versement) */}
      {newIntentions.length > 0 && (
        <div id="intentions-section" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" /> Mes demandes à finaliser ({newIntentions.length})
            </h2>
            <div className="grid gap-4">
                {newIntentions.map((order: any) => (
                    <Link key={order.id} href={`/dashboard/payment/${order.id}`} className="block transition-transform active:scale-[0.98] group">
                        <Card className="border-none shadow-sm rounded-2xl bg-orange-50/50 border-orange-100 overflow-hidden group-hover:shadow-md transition-all">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border shrink-0 mx-auto sm:mx-0">
                                    {order.productImage && <Image src={order.productImage} alt="" fill className="object-cover" sizes="56px" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm truncate">{order.productName}</h3>
                                        <Badge className={cn(
                                            "font-black uppercase text-[8px] px-2 h-4",
                                            order.status === 'payment_pending' ? 'bg-orange-500 text-white animate-pulse' : 
                                            order.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                                        )}>
                                            {order.status === 'payment_pending' ? 'En vérification' : order.status === 'rejected' ? 'Refusé' : 'À régler'}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                        Mode: {order.paymentMode === 'installments' ? 'Tranches' : order.paymentMode === 'tontine' ? 'Tontine' : 'Cash'} • {order.amount.toLocaleString('fr-FR')} F
                                    </p>
                                </div>
                                <div className="rounded-lg font-black text-xs h-9 px-4 bg-orange-500 text-white flex items-center justify-center shrink-0 group-hover:bg-orange-600 transition-colors">
                                    Finaliser l'achat <ChevronRight className="h-3 w-3 ml-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      )}

      {/* SECTION DES ARTICLES CONFIRMÉS */}
      <div id="confirmed-section" className="scroll-mt-24">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" /> Mes Achats & Plans Confirmés
        </h2>

        {ordersLoading ? (
            <div className="flex justify-center py-12">
                <LogoSpinner className="h-8 w-8 text-primary" />
            </div>
        ) : confirmedOrders.length > 0 ? (
            <div className="grid gap-4">
            {confirmedOrders.map((order: any) => {
                const totalPrice = order.totalPrice || order.amount || 0;
                const remaining = order.remainingAmount ?? totalPrice;
                const paidSum = totalPrice - remaining;
                const progress = (paidSum / totalPrice) * 100;
                const isPendingVerif = order.status === 'payment_pending';

                return (
                <Link key={order.id} href={`/dashboard/payment/${order.id}`} className="block transition-transform active:scale-[0.98] group">
                    <Card className="border-none shadow-sm rounded-2xl bg-card overflow-hidden group-hover:shadow-md transition-all">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-800 border shrink-0 mx-auto sm:mx-0">
                            {order.productImage ? (
                            <Image src={order.productImage} alt={order.productName} fill className="object-cover" sizes="64px" />
                            ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                            <h3 className="font-black text-sm sm:text-base truncate pr-2">{order.productName}</h3>
                            <div className="flex gap-2">
                                {isPendingVerif && (
                                    <Badge className="bg-orange-500 text-white font-bold uppercase text-[8px] animate-pulse">Vérification...</Badge>
                                )}
                                <Badge className={cn(
                                    "font-bold uppercase text-[9px] px-2 h-5",
                                    order.status === 'completed' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                )}>
                                    {order.status === 'completed' ? 'Payé / Livré ✅' : 'Cycle Actif ⚡'}
                                </Badge>
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-3">
                            <span className="text-primary font-black">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                            <span className="opacity-30">•</span>
                            <span className={order.paymentMode !== 'cash' ? 'text-blue-600' : ''}>
                                {order.paymentMode === 'installments' ? 'Tranches' : order.paymentMode === 'tontine' ? 'Tontine' : 'Cash'}
                            </span>
                            </div>

                            {(order.paymentMode === 'installments' || order.paymentMode === 'tontine') && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black uppercase">
                                        <span className="text-blue-600">Payé: {paidSum.toLocaleString('fr-FR')} F</span>
                                        <span className="text-muted-foreground">Reste: {remaining.toLocaleString('fr-FR')} F</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5 bg-gray-100" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                            <div className={cn(
                                "rounded-lg font-black text-xs px-4 h-9 shadow-sm transition-all flex items-center justify-center",
                                isPendingVerif 
                                    ? "bg-orange-500 text-white" 
                                    : order.status === 'completed' ? "bg-gray-100 text-gray-600 border border-gray-200" : "bg-primary text-black"
                            )}>
                                {isPendingVerif ? "Suivre ma validation" : order.status === 'completed' ? "Voir détails" : "Nouveau versement"} 
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </Link>
                );
            })}
            </div>
        ) : (
            <div className="bg-card rounded-2xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="font-black text-xl">Aucun achat confirmé</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
                Vos articles validés apparaîtront ici. Commencez par effectuer votre premier versement.
            </p>
            <Button asChild className="mt-6 rounded-xl font-bold bg-primary text-black" size="lg">
                <Link href="/products">Découvrir le catalogue</Link>
            </Button>
            </div>
        )}
      </div>
    </div>
  );
}
