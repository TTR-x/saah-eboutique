
'use client'

import { LifeBuoy, Send } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqContent } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { addMessage } from '@/lib/messages-service';
import { usePathname, useRouter } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';

const SECRET_CODE = "SAAH1000000@connectme";

export default function SupportPage() {
  const faqs = faqContent
    .split('\n\n')
    .map(pair => {
      const [question, answer] = pair.split('\n');
      return {
        question: question.replace('Q: ', ''),
        answer: answer.replace('R: ', ''),
      };
    });

  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Reset form if path changes
    setContactForm({ name: '', email: '', phone: '', message: '' });
  }, [pathname]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Email, Message).",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addMessage(contactForm);
      toast({
        title: "Message envoyé !",
        description: "Merci de nous avoir contactés. Nous vous répondrons bientôt.",
      });
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
       let errorMessage = "Une erreur est survenue lors de l'envoi du message.";
       if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('offline'))) {
            errorMessage = "La connexion au serveur a échoué. Veuillez vérifier votre connexion internet.";
       }
       toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'message' && value === SECRET_CODE) {
        router.push('/login');
        setContactForm({ name: '', email: '', phone: '', message: '' });
        return;
    }

    setContactForm(prev => ({...prev, [name]: value}));
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col items-center text-center mb-12">
        <LifeBuoy className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Centre d'aide
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Nous sommes là pour vous aider. Trouvez des réponses à vos questions ci-dessous ou contactez-nous directement.
        </p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Questions Fréquemment Posées</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Contactez-nous</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" placeholder="Votre nom complet" value={contactForm.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="votre@email.com" value={contactForm.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (facultatif)</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="Votre numéro de téléphone" value={contactForm.phone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Comment pouvons-nous vous aider ?" rows={5} value={contactForm.message} onChange={handleInputChange} required />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}
                  Envoyer le message <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
