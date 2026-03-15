'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { History, ArrowLeft, Calendar, ShoppingBag, BadgeEuro, CreditCard, Users, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function GlobalHistoryPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [db, user]);

  const { data: orders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  // Aplatir tous les historiques de paiements de toutes les commandes
  const allTransactions = useMemo(() => {
    if (!orders) return [];
    
    const transactions: any[] = [];
    orders.forEach(order => {
      if (order.paymentHistory && order.paymentHistory.length > 0) {
        order.paymentHistory.forEach((payment: any) => {
          transactions.push({
            ...payment,
            productName: order.productName,
            paymentMode: order.paymentMode,
            orderId: order.id
          });
        });
      }
    });

    // Trier par date (plus récent en premier)
    return transactions.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
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
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500 pb-20">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard')} 
        className="mb-6 font-bold text-muted-foreground hover:bg-transparent pl-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour au tableau de bord
      </Button>

      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <History className="h-8 w-8 text-primary" /> Historique des Paiements
        </h1>
        <p className="text-muted-foreground font-medium">Retrouvez ici la trace de tous vos versements validés.</p>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center py-20">
          <LogoSpinner className="h-10 w-10 text-primary" />
        </div>
      ) : allTransactions.length > 0 ? (
        <div className="space-y-4">
          {allTransactions.map((tx, idx) => {
            const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
            return (
              <Card key={idx} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-card">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      tx.paymentMode === 'cash' ? "bg-primary/10 text-primary" :
                      tx.paymentMode === 'installments' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                    )}>
                      {tx.paymentMode === 'cash' ? <BadgeEuro className="h-6 w-6" /> :
                       tx.paymentMode === 'installments' ? <CreditCard className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base truncate">{tx.productName}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(txDate, 'dd MMMM yyyy', { locale: fr })}
                        </span>
                        <Badge variant="outline" className="text-[9px] h-4 font-mono border-gray-100 bg-gray-50">
                          ID: {tx.transferId || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-primary">{tx.amount.toLocaleString('fr-FR')} F</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-green-600 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Validé
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
          <History className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-black text-xl">Aucun historique</h3>
          <p className="text-muted-foreground mt-2">
            Vos versements apparaîtront ici une fois qu'ils seront validés par l'administrateur.
          </p>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
