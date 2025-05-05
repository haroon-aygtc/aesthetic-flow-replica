
import { Button } from "@/components/ui/button";
import { Fullscreen, Monitor, Smartphone, Tablet } from "lucide-react";

interface DevicePreviewControlsProps {
  devicePreview: "desktop" | "tablet" | "mobile";
  setDevicePreview: (device: "desktop" | "tablet" | "mobile") => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

export function DevicePreviewControls({
  devicePreview,
  setDevicePreview,
  isFullScreen,
  toggleFullScreen,
}: DevicePreviewControlsProps) {
  return (
    <div className={`mb-4 flex justify-center gap-2 ${isFullScreen ? '' : 'absolute -top-14 right-0'}`}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setDevicePreview("mobile")}
        className={`transition-all duration-200 ${devicePreview === "mobile" ? "bg-primary text-primary-foreground" : ""}`}
      >
        <Smartphone className="h-4 w-4" />
        <span className="sr-only">Mobile view</span>
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setDevicePreview("tablet")}
        className={`transition-all duration-200 ${devicePreview === "tablet" ? "bg-primary text-primary-foreground" : ""}`}
      >
        <Tablet className="h-4 w-4" />
        <span className="sr-only">Tablet view</span>
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setDevicePreview("desktop")}
        className={`transition-all duration-200 ${devicePreview === "desktop" ? "bg-primary text-primary-foreground" : ""}`}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">Desktop view</span>
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleFullScreen}
        className="ml-2 transition-all duration-200"
      >
        <Fullscreen className="h-4 w-4" />
        <span className="sr-only">Full screen</span>
      </Button>
    </div>
  );
}
