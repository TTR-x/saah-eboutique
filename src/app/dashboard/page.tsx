
'use client';

import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, Package, Clock, CreditCard, ShoppingBag, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

  const totalSpent = orders?.reduce((acc, order) => acc + (order.amount || 0), 0) || 0;
  const activeInstallments = orders?.filter(o => o.paymentMode === 'installments' && o.status !== 'completed').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center text-black shadow-lg shadow-yellow-100">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {profile?.displayName || user.displayName || 'Client SAAH'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">UID: <span className="font-mono text-xs opacity-50">{user.uid.slice(0, 8)}...</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <Badge variant="outline" className="border-none font-bold text-green-600 bg-green-50 px-3">Compte Actif</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-3 w-3 text-primary" /> Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{orders?.length || 0}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Articles demandés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-blue-500" /> Total Engagé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{totalSpent.toLocaleString('fr-FR')} F</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Valeur de vos achats</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3 text-orange-500" /> Tranches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-500">{activeInstallments}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Cycles en cours</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-black mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" /> Mes Articles
      </h2>

      {ordersLoading ? (
        <div className="flex justify-center py-12">
            <LogoSpinner className="h-8 w-8 text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-md transition-all group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gray-50 border shrink-0">
                  {order.productImage ? (
                    <Image src={order.productImage} alt={order.productName} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-sm sm:text-base truncate pr-2">{order.productName}</h3>
                    <Badge className={
                        order.status === 'completed' ? 'bg-green-500' : 
                        order.status === 'validated' ? 'bg-blue-500' : 
                        'bg-gray-200 text-gray-600 border-none'
                    }>
                        {order.status === 'pending' ? 'En attente' : order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                    <span className="text-primary">{order.amount.toLocaleString('fr-FR')} FCFA</span>
                    <span>•</span>
                    <span className={order.paymentMode === 'installments' ? 'text-blue-600' : ''}>
                        {order.paymentMode === 'installments' ? 'Paiement par tranches' : 'Paiement Cash'}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Le {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="font-black text-xl">Aucun achat enregistré</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
            Vos intentions d'achat apparaîtront ici une fois que vous aurez cliqué sur "Payer" depuis le catalogue.
          </p>
          <Button asChild className="mt-6 rounded-2xl font-bold bg-primary text-black" size="lg">
            <Link href="/products">Explorer le catalogue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
