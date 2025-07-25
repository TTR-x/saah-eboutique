import { SmartFAQClient } from '@/components/smart-faq-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mt-4">
            Aide & Support
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Nous sommes là pour vous aider.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SmartFAQClient />
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contactez-nous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>Pour toute question, notre équipe est disponible.</p>
                <a href="mailto:support@saah.com" className="flex items-center gap-2 hover:text-primary">
                  <Mail className="h-4 w-4" />
                  support@saah.com
                </a>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +33 1 23 45 67 89
                </p>
                <p className="text-sm">(Lundi-Vendredi, 9h-18h)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Politique de Retour</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Vous n'êtes pas satisfait ? Vous disposez de 30 jours pour nous retourner votre article.
                  Consultez notre politique de retour pour plus de détails.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
