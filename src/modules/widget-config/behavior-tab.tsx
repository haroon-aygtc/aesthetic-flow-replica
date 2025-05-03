
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WidgetSettings } from "@/utils/widgetService";

interface BehaviorTabProps {
  settings: WidgetSettings;
  onChange: (newSettings: Partial<WidgetSettings>) => void;
}

export function BehaviorTab({ settings, onChange }: BehaviorTabProps) {
  const [localSettings, setLocalSettings] = useState<Partial<WidgetSettings>>({
    autoOpenDelay: settings.autoOpenDelay || 0,
    mobileBehavior: settings.mobileBehavior || "responsive",
    persistSession: settings.persistSession !== false,
    requireGuestInfo: settings.requireGuestInfo || false,
    showNotifications: settings.showNotifications !== false
  });

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev) => {
      const updated = { ...prev, [key]: value };
      onChange(updated);
      return updated;
    });
  };
  
  return (
    <CardContent className="space-y-6 pt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="autoOpenDelay">
              Auto-Open Delay: {localSettings.autoOpenDelay ? `${localSettings.autoOpenDelay} seconds` : 'Disabled'}
            </Label>
          </div>
          <Slider
            id="autoOpenDelay"
            min={0}
            max={60}
            step={5}
            value={[localSettings.autoOpenDelay || 0]}
            onValueChange={(value) => handleChange("autoOpenDelay", value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Automatically open the chat after this delay (in seconds). Set to 0 to disable.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mobileBehavior">Mobile Behavior</Label>
          <Select 
            value={localSettings.mobileBehavior} 
            onValueChange={(value) => handleChange("mobileBehavior", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mobile Behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="responsive">Responsive (Adapts to screen size)</SelectItem>
              <SelectItem value="fullscreen">Full Screen</SelectItem>
              <SelectItem value="minimized">Minimized Button Only</SelectItem>
              <SelectItem value="hidden">Hidden on Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="persistSession">Persist Chat Session</Label>
            <p className="text-xs text-muted-foreground">
              Remember chat history between page visits.
            </p>
          </div>
          <Switch
            id="persistSession"
            checked={localSettings.persistSession || false}
            onCheckedChange={(value) => handleChange("persistSession", value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="requireGuestInfo">Require Guest Information</Label>
            <p className="text-xs text-muted-foreground">
              Ask visitors for their name and contact details before chatting.
            </p>
          </div>
          <Switch
            id="requireGuestInfo"
            checked={localSettings.requireGuestInfo || false}
            onCheckedChange={(value) => handleChange("requireGuestInfo", value)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showNotifications">Show Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Show browser notifications for new messages when chat is closed.
            </p>
          </div>
          <Switch
            id="showNotifications"
            checked={localSettings.showNotifications !== false}
            onCheckedChange={(value) => handleChange("showNotifications", value)}
          />
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-medium">Advanced Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="pageTargeting">Page Targeting</Label>
          <Input
            id="pageTargeting"
            value={localSettings.pageTargeting || ""}
            onChange={(e) => handleChange("pageTargeting", e.target.value)}
            placeholder="e.g., /pricing/*, /about"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of URL patterns where the widget should appear.
            Leave empty to show on all pages.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="triggerAfterPageViews">
              Trigger After Page Views: {localSettings.triggerAfterPageViews || 'Immediate'}
            </Label>
          </div>
          <Slider
            id="triggerAfterPageViews"
            min={0}
            max={10}
            step={1}
            value={[localSettings.triggerAfterPageViews || 0]}
            onValueChange={(value) => handleChange("triggerAfterPageViews", value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Show the widget after this many page views. Set to 0 to show immediately.
          </p>
        </div>
      </div>
    </CardContent>
  );
}
