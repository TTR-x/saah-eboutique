import { LogoSpinner } from "@/components/logo-spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-50">
      <LogoSpinner className="h-16 w-16" />
    </div>
  );
}
