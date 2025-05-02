
import { Button } from "@/components/ui/button";

interface ExitFullscreenButtonProps {
  toggleFullScreen: () => void;
  isVisible: boolean;
}

export function ExitFullscreenButton({ 
  toggleFullScreen, 
  isVisible 
}: ExitFullscreenButtonProps) {
  if (!isVisible) return null;
  
  return (
    <Button 
      variant="outline" 
      className="absolute top-4 right-4 transition-all duration-200"
      onClick={toggleFullScreen}
    >
      Exit Fullscreen
    </Button>
  );
}
