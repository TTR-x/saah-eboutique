import { LogoIcon } from "./logo-icon";

export function Logo() {
  return (
    <div className="flex items-center justify-center font-bold text-2xl tracking-wider group">
      <LogoIcon className="h-8 w-8 mr-2" />
      <div>
        <span className="text-primary transition-all duration-300 ease-in-out group-hover:tracking-widest">SAAH</span>
        <span className="text-foreground">&nbsp;Business</span>
        <span className="text-foreground">&nbsp;228</span>
      </div>
    </div>
  );
}
