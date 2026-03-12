# Règles de Développement pour SAAH Business

Ce document définit les règles strictes que Gemini doit suivre pour ne pas casser le site et maintenir sa cohérence.

## 🎨 Design & UI
- **Style "Pro Simpliste"** : Inspiré de Facebook et WhatsApp (fond `#f0f2f5`, cartes blanches arrondies).
- **Composants** : Utiliser EXCLUSIVEMENT ShadCN UI et Tailwind CSS.
- **Couleurs** : Ne jamais utiliser de classes de couleurs fixes (ex: `text-yellow-500`). Utiliser les variables du thème (`text-primary`, `bg-primary`).
- **Navigation PC** : Les liens principaux doivent rester dans le Header. Ne pas créer de barre latérale redondante sur la page d'accueil pour les liens déjà présents en haut.

## 🖼 Gestion des Images
- **Source** : Toutes les images de remplacement (placeholders) doivent être définies dans `src/app/lib/placeholder-images.json`.
- **Format** : Utiliser `next/image` avec les attributs `width`, `height` ou `fill`.
- **Pertinence** : Toujours ajouter un `data-ai-hint` avec deux mots-clés précis pour la recherche d'images réelles (ex: `gift box`).

## 🛠 Stack Technique
- **Framework** : Next.js 15 (App Router).
- **Base de données** : Firebase Firestore (Hooks `useCollection`, `useDoc`).
- **Auth** : Firebase Auth (Hook `useUser`).
- **IA** : Genkit v1.x (uniquement côté serveur via `use server`).

## ⚠️ Sécurité & Robustesse
- **Mutation Firestore** : Ne jamais utiliser `await` devant `addDoc`, `setDoc` or `updateDoc`. Utiliser `.catch()` pour gérer les erreurs via `errorEmitter`.
- **Hydratation** : Utiliser `useEffect` pour toute valeur dynamique (dates, nombres aléatoires) afin d'éviter les erreurs de rendu serveur/client.
- **Admin** : Vérifier systématiquement l'email `saahbusiness2026@gmail.com` pour l'accès aux routes `/admin`.
