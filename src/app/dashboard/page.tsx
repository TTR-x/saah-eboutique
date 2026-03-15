
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, Package, Clock, CreditCard, ShoppingBag, ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
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
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

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

  const activeInstallments = orders?.filter(o => (o.paymentMode === 'installments' || o.paymentMode === 'tontine') && o.status !== 'completed').length || 0;
  const totalValue = orders?.reduce((acc, o) => acc + (o.totalPrice || o.amount), 0) || 0;

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
            <p className="text-muted-foreground text-sm font-medium">UID: <span className="font-mono text-xs opacity-50">{user.uid.slice(0, 8)}...</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <Badge variant="outline" className="border-none font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-3">Compte Actif</Badge>
            <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary font-black">
                <Link href="/dashboard/gifts"><Gift className="h-4 w-4 mr-2" /> Mes Cadeaux</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-primary" /> Achats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{orders?.length || 0}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Articles commandés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-blue-500" /> Valeur Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{totalValue.toLocaleString('fr-FR')} F</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Engagé sur la plateforme</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3 text-orange-500" /> Plans Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-500">{activeInstallments}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Tranches & Tontines</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-black mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" /> Mes Commandes & Suivi
      </h2>

      {ordersLoading ? (
        <div className="flex justify-center py-12">
            <LogoSpinner className="h-8 w-8 text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order: any) => {
            const totalPrice = order.totalPrice || order.amount;
            const remaining = order.remainingAmount ?? totalPrice;
            const progress = ((totalPrice - remaining) / totalPrice) * 100;
            const isWaitingValidation = order.status === 'payment_pending';

            return (
              <Card key={order.id} className={cn(
                "border-none shadow-sm rounded-2xl bg-card overflow-hidden hover:shadow-md transition-all group",
                isWaitingValidation && "ring-2 ring-orange-100 dark:ring-orange-900/20"
              )}>
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
                      <Badge className={cn(
                          "font-bold uppercase text-[9px] px-2 h-5",
                          order.status === 'completed' ? 'bg-green-500 text-white' : 
                          order.status === 'validated' ? 'bg-blue-500 text-white' : 
                          order.status === 'payment_pending' ? 'bg-orange-500 text-white animate-pulse' :
                          order.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-gray-100 text-gray-600 border-none'
                      )}>
                          {order.status === 'pending' ? 'À régler' : 
                           order.status === 'payment_pending' ? 'En vérification' :
                           order.status === 'validated' ? 'Actif' :
                           order.status === 'rejected' ? 'Refusé' :
                           order.status}
                      </Badge>
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
                                <span className="text-blue-600">Payé: {(totalPrice - remaining).toLocaleString('fr-FR')} F</span>
                                <span className="text-muted-foreground">Reste: {remaining.toLocaleString('fr-FR')} F</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-gray-100" />
                        </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                    {order.status !== 'completed' && (
                        <Button asChild size="sm" className={cn(
                            "rounded-lg font-black text-xs px-4 h-9 shadow-sm transition-all active:scale-95",
                            isWaitingValidation ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-primary text-black hover:bg-primary/90"
                        )}>
                            <Link href={`/dashboard/payment/${order.id}`}>
                                {order.status === 'payment_pending' ? 'Suivre validation' : 'Effectuer versement'} <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                        </Button>
                    )}
                    {order.status === 'completed' && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase">Terminé</span>
                        </div>
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
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="font-black text-xl">Aucune commande</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
            Vos intentions d'achat apparaîtront ici.
          </p>
          <Button asChild className="mt-6 rounded-xl font-bold bg-primary text-black" size="lg">
            <Link href="/products">Découvrir le catalogue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
