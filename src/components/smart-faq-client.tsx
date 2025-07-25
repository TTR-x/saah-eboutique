'use client';

import { useState } from 'react';
import { smartFAQ } from '@/ai/flows/smart-faq';
import { faqContent } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function SmartFAQClient() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const result = await smartFAQ({ question, faq: faqContent });
      setAnswer(result.answer);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          FAQ Intelligente
        </CardTitle>
        <CardDescription>
          Posez votre question et notre assistant intelligent trouvera la réponse dans notre FAQ.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Ex: Quels sont vos délais de livraison ?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading || !question.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recherche...
              </>
            ) : (
              'Obtenir une réponse'
            )}
          </Button>
        </CardFooter>
      </form>

      <div className="px-6 pb-6 mt-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {answer && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Réponse</AlertTitle>
            <AlertDescription className="prose dark:prose-invert">
              <p>{answer}</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
