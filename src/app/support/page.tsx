'use client'

import { LifeBuoy, Send, Bot, MessageCircle, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqContent } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { addMessage } from '@/lib/messages-service';
import { usePathname, useRouter } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';
import { askFaq } from '@/ai/flows/faq-flow';

const SECRET_CODE = "SAAH1000000@connectme";

export default function SupportPage() {
  const faqs = faqContent
    .split('\n\n')
    .map(pair => {
      const lines = pair.split('\n');
      return {
        question: lines[0]?.replace('Q: ', '') || '',
        answer: lines[1]?.replace('R: ', '') || '',
      };
    }).filter(f => f.question !== '');

  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // IA State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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
       toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    setAiAnswer(null);
    try {
      const result = await askFaq({ question: aiQuestion });
      setAiAnswer(result.answer);
    } catch (error) {
      toast({
        title: "IA indisponible",
        description: "Le service d'assistance intelligente est temporairement saturé.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value === SECRET_CODE) {
        router.push('/login');
        return;
    }
    setContactForm(prev => ({...prev, [name]: value}));
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-black shadow-xl shadow-yellow-100 mb-6">
            <LifeBuoy className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl mb-4">
          Besoin d'aide ?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Retrouvez nos réponses rapides ou posez votre question à notre assistant intelligent SAAH.
        </p>
      </div>

      {/* IA ASSISTANCE SECTION */}
      <section className="mb-20">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100">
            <CardHeader className="bg-white border-b border-dashed p-8">
                <div className="flex items-center gap-3 text-primary mb-2">
                    <div className="bg-primary/10 p-2 rounded-full"><Sparkles className="h-5 w-5" /></div>
                    <span className="font-black text-xs uppercase tracking-widest">Assistant Intelligent</span>
                </div>
                <CardTitle className="text-3xl font-black">Posez votre question</CardTitle>
                <CardDescription className="text-base font-medium">Notre IA parcourt notre base de connaissances pour vous répondre instantanément.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleAiAsk} className="flex gap-2">
                    <Input 
                        placeholder="Ex: Comment fonctionnent les paiements par tranches ?" 
                        className="h-14 rounded-xl border-2 focus:border-primary bg-white shadow-sm"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                    />
                    <Button type="submit" disabled={isAiLoading} className="h-14 w-14 rounded-xl bg-black text-white hover:bg-gray-800 shrink-0">
                        {isAiLoading ? <LogoSpinner className="h-6 w-6" /> : <Send className="h-6 w-6" />}
                    </Button>
                </form>

                {aiAnswer && (
                    <div className="mt-8 p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-300">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-black shrink-0 shadow-lg">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="space-y-4">
                                <p className="font-bold text-gray-800 leading-relaxed">{aiAnswer}</p>
                                <div className="pt-2 border-t border-primary/10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Réponse générée par SAAH AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </section>
      
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" /> Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-none bg-white rounded-xl shadow-sm px-6 overflow-hidden">
                    <AccordionTrigger className="text-base font-black hover:no-underline py-5 text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground pb-5 font-medium leading-relaxed">
                    {faq.answer}
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
          </div>
        </div>
        
        <div>
          <Card className="border-none shadow-xl rounded-2xl bg-white sticky top-24 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black">Message Direct</CardTitle>
              <CardDescription className="font-medium">Pour une assistance personnalisée, notre équipe vous répond sous 24h.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold ml-1">Nom</Label>
                  <Input id="name" name="name" placeholder="Votre nom complet" value={contactForm.name} onChange={handleInputChange} className="h-12 rounded-lg bg-gray-50 border-none" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold ml-1">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="votre@email.com" value={contactForm.email} onChange={handleInputChange} className="h-12 rounded-lg bg-gray-50 border-none" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold ml-1">Téléphone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="WhatsApp (conseillé)" value={contactForm.phone} onChange={handleInputChange} className="h-12 rounded-lg bg-gray-50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="font-bold ml-1">Message</Label>
                  <Textarea id="message" name="message" placeholder="Votre question..." rows={4} value={contactForm.message} onChange={handleInputChange} className="rounded-lg bg-gray-50 border-none" required />
                </div>
                <Button type="submit" className="w-full h-14 rounded-xl bg-primary text-black font-black text-lg shadow-lg hover:bg-primary/90 mt-4" disabled={isSubmitting}>
                  {isSubmitting ? <LogoSpinner className="mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                  Envoyer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}