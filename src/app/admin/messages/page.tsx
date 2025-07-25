
'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Inbox } from "lucide-react";
import { getMessages } from "@/lib/messages-service";
import type { ContactMessage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LogoSpinner } from "@/components/logo-spinner";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages);
      setIsLoading(false);
    };
    fetchMessages();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Boîte de réception</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Messages des clients</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LogoSpinner className="h-8 w-8" />
            </div>
          ) : messages.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {messages.map((msg) => (
                <AccordionItem key={msg.id} value={msg.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-4">
                            {!msg.isRead && <Badge>Nouveau</Badge>}
                            <span className="font-semibold">{msg.name}</span>
                            <span className="text-sm text-muted-foreground">{msg.email}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString('fr-FR')}
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-muted/50 rounded-md">
                    {msg.phone && (
                        <p className="mb-2">
                            <strong>Téléphone:</strong> {msg.phone}
                        </p>
                    )}
                    <p>{msg.message}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Votre boîte de réception est vide.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
