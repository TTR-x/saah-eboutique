
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';
import { useAuth } from '@/hooks/use-auth';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const handleSuccess = (user: User) => {
    if (user.email === ADMIN_EMAIL) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
        handleSuccess(user);
    }
  }, [user, authLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Connexion réussie !" });
      handleSuccess(credential.user);
    } catch (error: any) {
      toast({
        title: `Erreur de connexion`,
        description: "Vérifiez vos identifiants ou réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <LogoSpinner className="h-16 w-16" />
      </div>
    );
  }

  // If user is already logged in, redirect them
  if (user) {
    // This part is tricky because it might cause the redirect loop.
    // A simple approach is to show a message or a button to go to dashboard/home.
    return (
        <div className="flex items-center justify-center py-12 px-4">
             <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Déjà connecté</CardTitle>
                    <CardDescription>
                        Vous êtes déjà connecté en tant que {user.email}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {user.email === ADMIN_EMAIL ? (
                        <Button onClick={() => router.push('/admin')}>
                            Aller au tableau de bord
                        </Button>
                    ) : (
                         <Button onClick={() => router.push('/')}>
                            Retour à l'accueil
                        </Button>
                    )}
                </CardContent>
             </Card>
        </div>
    )
  }


  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
