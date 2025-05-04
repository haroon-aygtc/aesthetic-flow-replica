
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { WidgetSettings } from "@/utils/widgetService";
import { ColorPicker } from "./color-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppearanceTabProps {
  settings: WidgetSettings;
  onChange: (newSettings: Partial<WidgetSettings>) => void;
}

export function AppearanceTab({ settings, onChange }: AppearanceTabProps) {
  const [localSettings, setLocalSettings] = useState<Partial<WidgetSettings>>({
    primaryColor: settings.primaryColor || "#4f46e5",
    secondaryColor: settings.secondaryColor || "#4f46e5",
    fontFamily: settings.fontFamily || "Inter",
    borderRadius: settings.borderRadius || 8,
    chatIconSize: settings.chatIconSize || 50,
    position: settings.position || "bottom-right",
    avatar: settings.avatar || {
      enabled: false,
      imageUrl: "",
      fallbackInitial: "A"
    }
  });

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev) => {
      const updated = { ...prev, [key]: value };
      onChange(updated);
      return updated;
    });
  };

  const handleAvatarChange = (key: string, value: any) => {
    setLocalSettings((prev) => {
      const updatedAvatar = { 
        ...(prev.avatar || {}), 
        [key]: value 
      };
      
      const updated = { ...prev, avatar: updatedAvatar };
      onChange(updated);
      return updated;
    });
  };
  
  return (
    <CardContent className="space-y-6 pt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <ColorPicker 
            color={localSettings.primaryColor || "#4f46e5"} 
            onChange={(color) => handleChange("primaryColor", color)} 
          />
          <p className="text-xs text-muted-foreground">
            This color will be used for the chat button and header background.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <ColorPicker 
            color={localSettings.secondaryColor || "#4f46e5"} 
            onChange={(color) => handleChange("secondaryColor", color)} 
          />
          <p className="text-xs text-muted-foreground">
            This color will be used for accents and assistant message bubbles.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select 
            value={localSettings.fontFamily} 
            onValueChange={(value) => handleChange("fontFamily", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="system-ui">System UI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="borderRadius">Border Radius: {localSettings.borderRadius}px</Label>
          </div>
          <Slider
            id="borderRadius"
            min={0}
            max={20}
            step={1}
            value={[localSettings.borderRadius || 8]}
            onValueChange={(value) => handleChange("borderRadius", value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="chatIconSize">Chat Icon Size: {localSettings.chatIconSize}px</Label>
          </div>
          <Slider
            id="chatIconSize"
            min={30}
            max={80}
            step={5}
            value={[localSettings.chatIconSize || 50]}
            onValueChange={(value) => handleChange("chatIconSize", value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Select 
            value={localSettings.position} 
            onValueChange={(value) => handleChange("position", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="top-left">Top Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-medium">Avatar Settings</h3>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="avatarEnabled"
            checked={localSettings.avatar?.enabled || false}
            onChange={(e) => handleAvatarChange("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="avatarEnabled">Enable Avatar</Label>
        </div>
        
        {localSettings.avatar?.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="avatarImage">Avatar Image URL</Label>
              <Input
                id="avatarImage"
                value={localSettings.avatar?.imageUrl || ""}
                onChange={(e) => handleAvatarChange("imageUrl", e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatarFallback">Fallback Initial</Label>
              <Input
                id="avatarFallback"
                value={localSettings.avatar?.fallbackInitial || ""}
                onChange={(e) => handleAvatarChange("fallbackInitial", e.target.value)}
                placeholder="A"
                maxLength={1}
              />
              <p className="text-xs text-muted-foreground">
                Single character to display when avatar image is not available.
              </p>
            </div>
          </>
        )}
      </div>
    </CardContent>
  );
}
