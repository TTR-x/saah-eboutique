
'use client';

import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { Gift, PartyPopper, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getUserGifts } from '@/lib/gifts-service';

export default function GiftsPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.replace('/signup?redirect=/dashboard/gifts');
    }
  }, [user, authLoading, router, mounted]);

  useEffect(() => {
    if (user) {
      const fetchGifts = async () => {
        setLoadingGifts(true);
        try {
          const userGifts = await getUserGifts(user.uid);
          setGifts(userGifts);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingGifts(false);
        }
      };
      fetchGifts();
    }
  }, [user]);

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
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Mes Cadeaux</h1>
        <p className="text-muted-foreground text-lg font-medium">
          Retrouvez ici toutes les récompenses que SAAH Business vous a réservées.
        </p>
      </div>

      {loadingGifts ? (
        <div className="flex justify-center py-20"><LogoSpinner className="h-10 w-10 text-primary" /></div>
      ) : gifts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {gifts.map((gift) => (
            <Card key={gift.id} className="border-none shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black text-white relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <PartyPopper className="h-20 w-20 text-primary rotate-12" />
                </div>
                <CardHeader className="p-8 pb-0">
                    <Badge className="w-fit bg-primary text-black font-black mb-4">RÉCOMPENSE</Badge>
                    <CardTitle className="text-3xl font-black leading-tight">{gift.title}</CardTitle>
                    <CardDescription className="text-gray-400 font-medium text-base">Reçu le {new Date(gift.createdAt.toDate ? gift.createdAt.toDate() : gift.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Détails du cadeau</p>
                        <div className="flex flex-col gap-2">
                            <span className="text-xl font-bold tracking-tight leading-relaxed">{gift.description}</span>
                            <Button variant="ghost" className="w-fit px-0 text-primary font-black hover:bg-transparent h-auto" onClick={() => {
                                navigator.clipboard.writeText(gift.description);
                                alert("Copié !");
                            }}>Copier le texte</Button>
                        </div>
                    </div>
                    <Button asChild className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg hover:bg-primary/90">
                        <Link href="/products">Utiliser maintenant</Link>
                    </Button>
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
            <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 flex flex-col items-center text-center p-12 border-2 border-dashed border-primary/20">
                <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-6">
                    <Clock className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="font-black text-2xl mb-4">Votre demande est en cours</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                    Nous avons bien reçu votre demande de cadeau. Nous sommes en train de préparer une surprise spécialement pour vous !
                </p>
                <div className="space-y-3 mb-8 w-full text-left">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Demande transmise avec succès
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Validation par nous
                    </div>
                </div>
                <Button variant="outline" asChild className="w-full h-12 rounded-xl font-bold border-2">
                    <Link href="/dashboard">Retour au tableau de bord</Link>
                </Button>
            </Card>
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground font-medium mb-4">Les cadeaux sont soumis aux conditions d'utilisation de SAAH Business.</p>
        <Link href="/dashboard" className="text-primary font-black hover:underline flex items-center justify-center gap-2">
            Retour à mon tableau de bord <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
