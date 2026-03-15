import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Image 
        src="/logo.png" 
        alt="Chargement..." 
        width={64} 
        height={64} 
        className="logo-pulse object-contain" 
      />
    </div>
  );
}
