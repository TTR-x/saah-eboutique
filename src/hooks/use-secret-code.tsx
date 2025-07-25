
'use client'

import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useState, ReactNode } from "react";

const SECRET_CODE = "SAAH1000000@connectme";

const SecretCodeContext = createContext<undefined>(undefined);

export function SecretCodeProvider({ children }: { children: ReactNode }) {
    const [input, setInput] = useState("");
    const router = useRouter();

    const onKeyPress = useCallback((event: KeyboardEvent) => {
        setInput((prevInput) => {
            const newInput = prevInput + event.key;
            if (SECRET_CODE.startsWith(newInput)) {
                if (newInput === SECRET_CODE) {
                    router.push('/login');
                    return ""; // Reset after successful code
                }
                return newInput;
            } else {
                 // If the new char doesn't match the sequence, reset unless it's the start of the code again
                return event.key === SECRET_CODE[0] ? event.key : "";
            }
        });
    }, [router]);
    
    useEffect(() => {
        document.addEventListener("keydown", onKeyPress);
        return () => {
            document.removeEventListener("keydown", onKeyPress);
        };
    }, [onKeyPress]);


    return (
        <SecretCodeContext.Provider value={undefined}>
            {children}
        </SecretCodeContext.Provider>
    );
}
