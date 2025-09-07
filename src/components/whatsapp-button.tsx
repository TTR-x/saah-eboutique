
'use client';

import { Button } from './ui/button';
import Link from 'next/link';
import { Phone } from 'lucide-react';

export function WhatsAppButton() {
    const phoneNumber = "22890101392";
    const callUrl = `tel:${phoneNumber}`;

    return (
        <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 animate-pulse"
            style={{ animationDuration: '2s' }}
        >
            <Link href={callUrl} aria-label="Appeler maintenant">
                <Phone className="h-8 w-8" />
            </Link>
        </Button>
    );
}
