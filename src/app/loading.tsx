import { Loader2 } from "lucide-react";

export default function Loading() {
  // This is a fallback, the main loading indicator is in the header.
  return (
    <div className="fixed inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-50">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
