import { LifeBuoy } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqContent } from '@/lib/data';

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

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col items-center text-center mb-12">
        <LifeBuoy className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Centre d'aide
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Nous sommes là pour vous aider. Trouvez des réponses à vos questions ci-dessous.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
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
    </div>
  );
}
