'use client';

import { Button } from './ui/button';
import Link from 'next/link';

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.3-.4.1-.2.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.1 1.5.7 3.5 2.6.5.4.9.7 1.2.9.5.2.9.2 1.2.1.4-.1 1.5-1 1.7-1.9.2-.9.2-1.7.1-1.9-.1-.2-.3-.3-.5-.4zm-4.6 7.4h-.1c-2.1 0-4.1-1-5.6-2.8L6 18.6l-3.3.9.9-3.2-.2-.3c-1.8-1.5-2.8-3.5-2.8-5.6 0-4.9 4-8.9 8.9-8.9 2.4 0 4.6 1 6.3 2.6 1.7 1.7 2.6 3.9 2.6 6.3 0 4.9-4 8.9-8.9 8.9zm8.5-13.2c-2-2-4.6-3.1-7.4-3.1-5.7 0-10.4 4.6-10.4 10.4 0 2.2.7 4.3 2 6l-2.1 7.6 7.8-2.1c1.6.9 3.5 1.5 5.5 1.5h.1c5.7 0 10.4-4.6 10.4-10.4.1-2.8-1-5.4-3.1-7.4z"></path>
      </svg>
    );
}

export function WhatsAppButton() {
    const phoneNumber = "22890101392";
    const message = "Bonjour ! J'ai une question concernant vos produits.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <Button
            asChild
            size="icon"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:bg-[#128C7E] hover:scale-110"
        >
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Contacter sur WhatsApp">
                <WhatsappIcon className="h-8 w-8" />
            </Link>
        </Button>
    );
}
