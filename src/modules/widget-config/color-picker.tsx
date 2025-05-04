
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [pickerColor, setPickerColor] = useState(color);
  const [inputColor, setInputColor] = useState(color);
  const [isOpen, setIsOpen] = useState(false);
  const initialColor = useRef(color);
  
  // Reset color picker when the prop changes and picker is not open
  useEffect(() => {
    if (!isOpen) {
      setPickerColor(color);
      setInputColor(color);
      initialColor.current = color;
    }
  }, [color, isOpen]);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickerColor(e.target.value);
    setInputColor(e.target.value);
    onChange(e.target.value);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputColor(value);
    
    // Only update the picker and call onChange if the value is a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setPickerColor(value);
      onChange(value);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // If closing without selecting a color, reset to the original color
    if (!open && pickerColor !== initialColor.current) {
      setPickerColor(initialColor.current);
      setInputColor(initialColor.current);
      onChange(initialColor.current);
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            className="w-9 h-9 rounded border cursor-pointer"
            style={{ backgroundColor: pickerColor }}
            aria-label="Select color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="space-y-3">
            <input
              type="color"
              value={pickerColor}
              onChange={handleColorChange}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        value={inputColor}
        onChange={handleInputChange}
        placeholder="#RRGGBB"
        className={cn(
          "font-mono",
          !/^#([0-9A-F]{3}){1,2}$/i.test(inputColor) && "border-red-500"
        )}
        maxLength={7}
      />
    </div>
  );
}
