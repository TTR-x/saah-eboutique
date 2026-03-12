'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { Gift, Sparkles, CheckCircle2, ChevronRight, PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import placeholders from '@/app/lib/placeholder-images.json';

export default function GiftsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef);

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.replace('/signup?redirect=/dashboard/gifts');
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
      <div className="flex flex-col items-center text-center mb-12">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
            <Gift className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Félicitations !</h1>
        <p className="text-muted-foreground text-lg font-medium">
          {profile?.displayName || 'Cher client'}, voici vos récompenses SAAH Business.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Main Welcome Gift */}
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black text-white relative group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <PartyPopper className="h-20 w-20 text-primary rotate-12" />
            </div>
            <CardHeader className="p-8 pb-0">
                <Badge className="w-fit bg-primary text-black font-black mb-4">CADEAU DE BIENVENUE</Badge>
                <CardTitle className="text-3xl font-black leading-tight">Coupon de Réduction de 5%</CardTitle>
                <CardDescription className="text-gray-400 font-medium text-base">Valable sur votre prochain achat cash.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Votre Code Promo</p>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-black tracking-tighter">SAAH-WELCOME-2024</span>
                        <Button variant="ghost" className="text-primary font-black hover:bg-primary/10" onClick={() => {
                            navigator.clipboard.writeText("SAAH-WELCOME-2024");
                            alert("Code copié !");
                        }}>Copier</Button>
                    </div>
                </div>
                <Button asChild className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg hover:bg-primary/90">
                    <Link href="/products">Utiliser maintenant</Link>
                </Button>
            </CardContent>
        </Card>

        {/* Exclusive Offer */}
        <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 flex flex-col justify-center p-8 border-2 border-primary/20">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-black text-xl">Accès VIP Tontine</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Offre Limitée</p>
                </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                En tant que nouveau membre, vous bénéficiez d'une priorité de 24h sur toutes nos nouvelles tontines d'articles High-Tech. Soyez le premier à être servi !
            </p>
            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Pas de frais de dossier
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Validation de dossier express
                </div>
            </div>
            <Button variant="outline" asChild className="w-full h-12 rounded-xl font-bold border-2">
                <Link href="/support">En savoir plus</Link>
            </Button>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground font-medium mb-4">Ces offres sont réservées exclusivement aux membres de la communauté SAAH Business.</p>
        <Link href="/dashboard" className="text-primary font-black hover:underline flex items-center justify-center gap-2">
            Retour à mon tableau de bord <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
