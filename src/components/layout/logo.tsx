import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center justify-center font-bold text-2xl tracking-wider group">
      <Image 
        src="/logo.png" 
        alt="SAAH Business Logo" 
        width={32} 
        height={32} 
        className="mr-2 object-contain"
      />
      <div>
        <span className="text-primary transition-all duration-300 ease-in-out group-hover:tracking-widest">SAAH</span>
        <span className="text-foreground">&nbsp;Business</span>
      </div>
    </div>
  );
}
