
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { History, ArrowLeft, Calendar, BadgeEuro, CreditCard, Users, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function GlobalHistoryPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lecture des copies de paiements certifiées (Sous-collection de l'utilisateur)
  const paymentsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'payments'),
      orderBy('date', 'desc')
    );
  }, [db, user]);

  const { data: payments, loading: paymentsLoading } = useCollection<any>(paymentsQuery);

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
          <History className="h-8 w-8 text-primary" /> Copies Certifiées
        </h1>
        <p className="text-muted-foreground font-medium">Retrouvez ici toutes les preuves de vos versements validés.</p>
      </div>

      {paymentsLoading ? (
        <div className="flex justify-center py-20">
          <LogoSpinner className="h-10 w-10 text-primary" />
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((tx, idx) => {
            const txDate = tx.date?.toDate ? tx.date.toDate() : (tx.date ? new Date(tx.date) : new Date());
            return (
              <Card key={tx.id || idx} className="border-none shadow-sm rounded-2xl overflow-hidden bg-card">
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
                        <Badge variant="outline" className="text-[9px] font-mono bg-gray-50">
                          ID: {tx.transferId || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-primary">{tx.amount.toLocaleString('fr-FR')} F</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-green-600 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Archivé
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
          <h3 className="font-black text-xl">Historique vide</h3>
          <p className="text-muted-foreground mt-2">
            Vos preuves de paiement apparaîtront ici dès validation par l'admin.
          </p>
        </div>
      )}
    </div>
  );
}
