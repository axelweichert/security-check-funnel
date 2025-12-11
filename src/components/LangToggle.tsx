import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentLang, useToggleLang } from "@/stores/useLangStore";
import { cn } from "@/lib/utils";
interface LangToggleProps {
  className?: string;
}
export function LangToggle({ className }: LangToggleProps) {
  const lang = useCurrentLang();
  const toggleLang = useToggleLang();
  return (
    <Button
      onClick={toggleLang}
      variant="ghost"
      size="icon"
      className={cn(
        "hover:scale-110 hover:rotate-12 transition-all duration-200 active:scale-90 z-50",
        className
      )}
      aria-label={`Switch to ${lang === 'de' ? 'English' : 'German'}`}
    >
      <Globe className="h-5 w-5" />
      <span className="absolute text-xs font-bold text-foreground/80 -bottom-0.5">{lang.toUpperCase()}</span>
    </Button>
  );
}