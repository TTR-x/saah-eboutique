
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoSpinner } from '@/components/logo-spinner';
import { Gift, PartyPopper, ChevronRight, Clock, CheckCircle2, Percent, PackageOpen, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getUserGifts, requestGift, hasPendingRequest } from '@/lib/gifts-service';
import { useToast } from '@/hooks/use-toast';

const GIFT_OPTIONS = [
    {
        id: 'remise_1',
        title: 'Remise de 10%',
        description: 'Valable sur votre prochain achat cash.',
        icon: <Percent className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-50'
    },
    {
        id: 'remise_2',
        title: 'Remise de 5 000 F',
        description: 'Réduction immédiate sur tout le catalogue.',
        icon: <Sparkles className="h-6 w-6 text-orange-500" />,
        color: 'bg-orange-50'
    },
    {
        id: 'article_gratuit',
        title: 'Article Gratuit',
        description: 'Tentez de gagner un article surprise.',
        icon: <PackageOpen className="h-6 w-6 text-green-500" />,
        color: 'bg-green-50'
    }
];

export default function GiftsPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [pending, setPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [userGifts, isPending] = await Promise.all([
        getUserGifts(user.uid),
        hasPendingRequest(user.uid)
      ]);
      setGifts(userGifts);
      setPending(isPending);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.replace('/signup?redirect=/dashboard/gifts');
    }
  }, [user, authLoading, router, mounted]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSelectGift = async (giftTitle: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        await requestGift(user.uid, user.displayName || 'Client', user.email || '', giftTitle);
        toast({
            title: "Choix enregistré !",
            description: `Vous avez choisi : ${giftTitle}. Nous validons cela rapidement.`,
        });
        fetchData();
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible d'enregistrer votre choix.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

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
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Gift className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Mes Cadeaux</h1>
        <p className="text-muted-foreground text-lg font-medium">
          {gifts.length > 0 ? "Félicitations ! Voici vos récompenses acquises." : "Choisissez le cadeau que vous aimeriez recevoir."}
        </p>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20"><LogoSpinner className="h-10 w-10 text-primary" /></div>
      ) : gifts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {gifts.map((gift) => (
            <Card key={gift.id} className="border-none shadow-xl rounded-2xl overflow-hidden bg-card relative group">
                <CardHeader className="p-8 pb-0">
                    <Badge className="w-fit bg-primary text-black font-black mb-4">RÉCOMPENSE VALIDÉE</Badge>
                    <CardTitle className="text-2xl font-black leading-tight">{gift.title}</CardTitle>
                    <CardDescription className="font-medium">Reçu le {new Date(gift.createdAt.toDate ? gift.createdAt.toDate() : gift.createdAt).toLocaleDateString('fr-FR')}</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="bg-muted/50 rounded-xl p-6 border mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Instructions</p>
                        <span className="text-base font-bold tracking-tight leading-relaxed">{gift.description}</span>
                    </div>
                    <Button asChild className="w-full h-12 rounded-xl bg-primary text-black font-black hover:bg-primary/90">
                        <Link href="/products">Utiliser maintenant</Link>
                    </Button>
                </CardContent>
            </Card>
          ))}
        </div>
      ) : pending ? (
        <div className="max-w-xl mx-auto">
            <Card className="border-none shadow-xl rounded-2xl bg-card flex flex-col items-center text-center p-12 border-2 border-dashed border-primary/20">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
                    <Clock className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="font-black text-2xl mb-4">Votre demande est en cours</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                    Nous avons bien reçu votre choix de cadeau. Nous sommes en train de valider cela spécialement pour vous !
                </p>
                <div className="space-y-3 mb-8 w-full text-left bg-muted/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Choix enregistré avec succès
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold opacity-50">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Validation par nous (en cours)
                    </div>
                </div>
                <Button variant="outline" asChild className="w-full h-12 rounded-xl font-bold border-2">
                    <Link href="/dashboard">Retour au tableau de bord</Link>
                </Button>
            </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
            {GIFT_OPTIONS.map((option) => (
                <Card key={option.id} className="border-none shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full bg-card">
                    <div className={`h-24 ${option.color} flex items-center justify-center`}>
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                            {option.icon}
                        </div>
                    </div>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="font-black text-xl">{option.title}</CardTitle>
                        <CardDescription className="text-xs font-medium">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto p-6 pt-2">
                        <Button 
                            className="w-full h-12 rounded-xl font-black bg-primary text-black"
                            onClick={() => handleSelectGift(option.title)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <LogoSpinner /> : "Choisir ce cadeau"}
                        </Button>
                    </CardContent>
                </Card>
            ))}
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
