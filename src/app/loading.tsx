
import { LogoIcon } from "@/components/layout/logo-icon";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LogoIcon className="h-16 w-16 logo-pulse" />
    </div>
  );
}
