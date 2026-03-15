
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, Package, Clock, CreditCard, ShoppingBag, ChevronRight, Gift, CheckCircle2, AlertCircle } from 'lucide-react';
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

  // LOGIQUE ROBUSTE : Un achat est "Confirmé" s'il a au moins UN versement validé dans son historique
  // ou s'il est déjà complété.
  const confirmedOrders = useMemo(() => {
    return orders.filter(o => 
        o.status === 'completed' || 
        (o.paymentHistory && o.paymentHistory.some((h: any) => h.status === 'validated'))
    );
  }, [orders]);

  // Les "Demandes à finaliser" sont uniquement les articles qui n'ont AUCUN versement validé à ce jour.
  const newIntentions = useMemo(() => {
    return orders.filter(o => 
        o.status !== 'completed' && 
        o.status !== 'cancelled' &&
        (!o.paymentHistory || !o.paymentHistory.some((h: any) => h.status === 'validated'))
    );
  }, [orders]);

  // Compteur de paiements en attente de vérification
  const pendingPaymentsCount = useMemo(() => {
    return orders.filter(o => o.status === 'payment_pending').length;
  }, [orders]);

  // CALCUL DES STATISTIQUES : Somme réelle de TOUS les versements validés dans TOUS les documents
  const totalValuePaid = useMemo(() => {
    return orders.reduce((total, order: any) => {
        const historySum = (order.paymentHistory || [])
            .filter((h: any) => h.status === 'validated')
            .reduce((sum: number, h: any) => sum + h.amount, 0);
        return total + historySum;
    }, 0);
  }, [orders]);

  const activePlansCount = confirmedOrders.filter(o => o.status !== 'completed').length;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
                        document.getElementById('intentions-section')?.scrollIntoView({ behavior: 'smooth' });
                        document.getElementById('confirmed-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        toast({ title: "Information", description: "Aucun versement en attente de vérification." });
                    }
                }}
            >
                <Clock className="h-4 w-4 mr-2" /> 
                Vérifications {pendingPaymentsCount > 0 && `(${pendingPaymentsCount})`}
            </Button>

            <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary font-black">
                <Link href="/dashboard/gifts"><Gift className="h-4 w-4 mr-2" /> Mes Cadeaux</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-primary" /> Achats Confirmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{confirmedOrders.length}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Cycles en cours ou terminés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-blue-500" /> Valeur Validée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{totalValuePaid.toLocaleString('fr-FR')} F</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Argent réellement encaissé</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3 text-orange-500" /> Plans Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-500">{activePlansCount}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Articles non encore finis</p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION DES INTENTIONS : Nouveaux articles JAMAIS validés */}
      {newIntentions.length > 0 && (
        <div id="intentions-section" className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" /> Mes demandes à finaliser ({newIntentions.length})
            </h2>
            <div className="grid gap-4">
                {newIntentions.map((order: any) => (
                    <Card key={order.id} className="border-none shadow-sm rounded-2xl bg-orange-50/50 border-orange-100 overflow-hidden hover:shadow-md transition-all">
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
                            <Button asChild size="sm" className="rounded-lg font-black text-xs h-9 bg-orange-500 hover:bg-orange-600 text-white">
                                <Link href={`/dashboard/payment/${order.id}`}>Finaliser l'achat <ChevronRight className="h-3 w-3 ml-1" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}

      {/* SECTION DES ARTICLES CONFIRMÉS : Au moins une validation dans l'historique */}
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
                <Card key={order.id} className="border-none shadow-sm rounded-2xl bg-card overflow-hidden hover:shadow-md transition-all group">
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
                        {order.status !== 'completed' ? (
                            <Button asChild size="sm" className={cn(
                                "rounded-lg font-black text-xs px-4 h-9 shadow-sm transition-all",
                                isPendingVerif 
                                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                                    : "bg-primary text-black hover:bg-primary/90"
                            )}>
                                <Link href={`/dashboard/payment/${order.id}`}>
                                    {isPendingVerif ? "Suivre ma validation" : "Nouvel versement"} 
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild variant="outline" size="sm" className="rounded-lg font-black text-xs h-9 border-2">
                                <Link href={`/dashboard/payment/${order.id}`}>Historique & Détails</Link>
                            </Button>
                        )}
                    </div>
                    </CardContent>
                </Card>
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
