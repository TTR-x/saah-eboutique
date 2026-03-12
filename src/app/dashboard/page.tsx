
'use client';

import { useUser, useDoc } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { User, Package, Clock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = user ? doc(db, 'users', user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);

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

  // Si on n'a pas d'utilisateur, on ne rend rien car le useEffect va rediriger
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Bonjour, {profile?.displayName || user.displayName || 'Utilisateur'}
          </h1>
          <p className="text-muted-foreground">Bienvenue sur votre espace personnel SAAH Business.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">0</div>
            <p className="text-xs text-muted-foreground mt-1">Aucune commande en cours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" /> Versements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">0 F</div>
            <p className="text-xs text-muted-foreground mt-1">Paiements échelonnés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" /> Activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Récent</div>
            <p className="text-xs text-muted-foreground mt-1">Dernière connexion aujourd'hui</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="font-bold text-xl">Vous n'avez pas encore d'achats</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
          Explorez notre catalogue pour trouver les meilleurs articles high-tech, mode et maison disponibles au comptant ou par tranches.
        </p>
      </div>
    </div>
  );
}
