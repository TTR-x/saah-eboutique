
'use client';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function SignOutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Déconnexion réussie' });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de la déconnexion.";
      if (error.code === 'auth/network-request-failed') {
          errorMessage = "Veuillez vérifier votre connexion internet.";
      }
      toast({
        title: 'Erreur de déconnexion',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return <div onClick={handleSignOut} className="cursor-pointer">{children}</div>;
}
