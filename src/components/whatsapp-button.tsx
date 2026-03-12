
'use client';

import { Button } from './ui/button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
    const phoneNumber = "22890101392";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600 whatsapp-pulse z-50"
        >
            <Link href={whatsappUrl} target="_blank" aria-label="Discuter sur WhatsApp">
                <MessageCircle className="h-5 w-5" />
            </Link>
        </Button>
    );
}
