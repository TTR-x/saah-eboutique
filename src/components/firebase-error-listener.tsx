
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // Throw the error so it's captured by the global error boundary/Next.js overlay
      // during development, or logged appropriately.
      throw error;
    });
    return () => unsubscribe();
  }, []);

  return null;
}
