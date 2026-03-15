
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, Suspense, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';
import { Eye, EyeOff } from 'lucide-react';

const ADMIN_EMAIL = "saahbusiness2026@gmail.com";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Rediriger si déjà connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.email === ADMIN_EMAIL) {
          router.replace('/admin');
        } else {
          router.replace(redirectPath);
        }
      }
    });
    return () => unsubscribe();
  }, [auth, router, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Connexion réussie !",
        description: `Content de vous revoir.`,
      });
      
      if (user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      let description = "Une erreur est survenue lors de la connexion.";
      
      // Gestion détaillée des erreurs Firebase
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          description = "Email ou mot de passe incorrect.";
          break;
        case 'auth/user-disabled':
          description = "Ce compte a été désactivé.";
          break;
        case 'auth/too-many-requests':
          description = "Trop de tentatives échouées. Réessayez plus tard.";
          break;
        case 'auth/network-request-failed':
          description = "Problème de connexion internet.";
          break;
        case 'auth/operation-not-allowed':
          description = "La connexion par email n'est pas activée dans Firebase.";
          break;
        default:
          description = error.message || "Erreur inconnue.";
      }
      
      toast({
        title: "Échec de connexion",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="h-12 rounded-lg"
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <button 
                type="button" 
                className="text-[10px] font-bold text-primary hover:underline"
                onClick={() => toast({ title: "Info", description: "Veuillez contacter le support pour réinitialiser votre mot de passe." })}
            >
                Oublié ?
            </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-12 rounded-lg pr-10"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            title={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full h-12 rounded-lg font-black bg-primary text-black hover:bg-primary/90 shadow-lg shadow-yellow-100/50" disabled={isSubmitting}>
        {isSubmitting ? <LogoSpinner /> : 'Se connecter'}
      </Button>
    </form>
  );
}

function LoginFooter() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const signupUrl = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup';

  return (
    <div className="mt-6 text-center text-sm space-y-4">
      <p className="text-muted-foreground font-medium">
        Pas encore de compte ?{' '}
        <Link href={signupUrl} className="text-primary font-black hover:underline">
          S'inscrire
        </Link>
      </p>
      <Link href="/" className="block text-xs text-muted-foreground font-bold hover:text-primary transition-colors uppercase tracking-widest">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-2xl border-none rounded-2xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black">Connexion</CardTitle>
          <CardDescription className="font-medium">
            Heureux de vous revoir chez SAAH.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Suspense fallback={<div className="flex justify-center p-8"><LogoSpinner className="h-8 w-8 text-primary" /></div>}>
            <LoginForm />
            <LoginFooter />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
