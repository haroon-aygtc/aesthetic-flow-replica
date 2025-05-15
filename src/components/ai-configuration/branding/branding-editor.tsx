"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { HexColorPicker, HexColorInput } from "react-colorful"
import { Save, Paintbrush, Type, Layout } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BrandingSetting {
    id: number
    name: string
    logo_url: string | null
    colors: Record<string, string>
    typography: Record<string, string>
    elements: Record<string, string>
    is_active: boolean
    is_default: boolean
}

interface BrandingEditorProps {
    setting: BrandingSetting
    onUpdate: (id: number, data: Partial<Omit<BrandingSetting, "id">>) => Promise<BrandingSetting | undefined>
}

export function BrandingEditor({
    setting,
    onUpdate,
}: BrandingEditorProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("colors")
    const [colors, setColors] = useState<Record<string, string>>(setting.colors)
    const [typography, setTypography] = useState<Record<string, string>>(setting.typography)
    const [elements, setElements] = useState<Record<string, string>>(setting.elements)
    const [activeColor, setActiveColor] = useState<string>("primary")

    // Update state when setting changes
    useEffect(() => {
        setColors(setting.colors)
        setTypography(setting.typography)
        setElements(setting.elements)
    }, [setting])

    const handleColorChange = (colorKey: string, value: string) => {
        setColors({ ...colors, [colorKey]: value })
    }

    const handleTypographyChange = (key: string, value: string) => {
        setTypography({ ...typography, [key]: value })
    }

    const handleElementsChange = (key: string, value: string) => {
        setElements({ ...elements, [key]: value })
    }

    const handleSave = async () => {
        try {
            setIsLoading(true)

            await onUpdate(setting.id, {
                colors,
                typography,
                elements
            })

            toast({
                title: "Changes saved",
                description: "Branding settings have been updated successfully.",
            })
        } catch (error) {
            console.error("Failed to save branding settings:", error)

            toast({
                title: "Error",
                description: "Failed to save branding settings.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const colorEntries = Object.entries(colors)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Edit {setting.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="colors" className="flex items-center">
                                <Paintbrush className="h-4 w-4 mr-2" />
                                Colors
                            </TabsTrigger>
                            <TabsTrigger value="typography" className="flex items-center">
                                <Type className="h-4 w-4 mr-2" />
                                Typography
                            </TabsTrigger>
                            <TabsTrigger value="elements" className="flex items-center">
                                <Layout className="h-4 w-4 mr-2" />
                                Elements
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="colors" className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Color Palette</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {colorEntries.map(([key, value]) => (
                                                <button
                                                    key={key}
                                                    className={`h-8 w-8 rounded-full border-2 ${activeColor === key ? 'border-black dark:border-white' : 'border-transparent'}`}
                                                    style={{ backgroundColor: value }}
                                                    onClick={() => setActiveColor(key)}
                                                    aria-label={`Select ${key} color`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {colorEntries.map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <Label className="capitalize">{key}:</Label>
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-5 w-5 rounded-full mr-2"
                                                        style={{ backgroundColor: value }}
                                                    />
                                                    <HexColorInput
                                                        className="w-24 h-8 px-2 text-sm border rounded"
                                                        color={value}
                                                        onChange={(newColor) => handleColorChange(key, newColor)}
                                                        prefixed
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium">
                                            {activeColor ? `Editing: ${activeColor}` : "Select a color"}
                                        </h3>
                                        <HexColorPicker
                                            color={colors[activeColor] || "#000000"}
                                            onChange={(newColor) => handleColorChange(activeColor, newColor)}
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="typography" className="pt-4">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fontFamily">Base Font Family</Label>
                                        <select
                                            id="fontFamily"
                                            className="w-full p-2 border rounded"
                                            value={typography.fontFamily}
                                            onChange={(e) => handleTypographyChange("fontFamily", e.target.value)}
                                        >
                                            <option value="system-ui, sans-serif">System UI (Default)</option>
                                            <option value="'Inter', sans-serif">Inter</option>
                                            <option value="'Roboto', sans-serif">Roboto</option>
                                            <option value="'Open Sans', sans-serif">Open Sans</option>
                                            <option value="'Lato', sans-serif">Lato</option>
                                            <option value="'Montserrat', sans-serif">Montserrat</option>
                                            <option value="'Playfair Display', serif">Playfair Display</option>
                                            <option value="'Merriweather', serif">Merriweather</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="headingFontFamily">Heading Font Family</Label>
                                        <select
                                            id="headingFontFamily"
                                            className="w-full p-2 border rounded"
                                            value={typography.headingFontFamily}
                                            onChange={(e) => handleTypographyChange("headingFontFamily", e.target.value)}
                                        >
                                            <option value="system-ui, sans-serif">System UI (Default)</option>
                                            <option value="'Inter', sans-serif">Inter</option>
                                            <option value="'Roboto', sans-serif">Roboto</option>
                                            <option value="'Open Sans', sans-serif">Open Sans</option>
                                            <option value="'Lato', sans-serif">Lato</option>
                                            <option value="'Montserrat', sans-serif">Montserrat</option>
                                            <option value="'Playfair Display', serif">Playfair Display</option>
                                            <option value="'Merriweather', serif">Merriweather</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fontSize">Base Font Size</Label>
                                        <select
                                            id="fontSize"
                                            className="w-full p-2 border rounded"
                                            value={typography.fontSize}
                                            onChange={(e) => handleTypographyChange("fontSize", e.target.value)}
                                        >
                                            <option value="14px">Small (14px)</option>
                                            <option value="16px">Medium (16px)</option>
                                            <option value="18px">Large (18px)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="headingScale">Heading Scale</Label>
                                        <select
                                            id="headingScale"
                                            className="w-full p-2 border rounded"
                                            value={typography.headingScale}
                                            onChange={(e) => handleTypographyChange("headingScale", e.target.value)}
                                        >
                                            <option value="1.2">Small (1.2)</option>
                                            <option value="1.25">Medium (1.25)</option>
                                            <option value="1.33">Large (1.33)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-sm font-medium mb-4">Typography Preview</h3>
                                    <div
                                        className="p-4 border rounded"
                                        style={{
                                            fontFamily: typography.fontFamily,
                                            fontSize: typography.fontSize
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily: typography.headingFontFamily,
                                                fontSize: `calc(${typography.fontSize} * ${typography.headingScale} * 1.5)`,
                                                fontWeight: 700,
                                                marginBottom: '0.5em'
                                            }}
                                        >
                                            Heading 1
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: typography.headingFontFamily,
                                                fontSize: `calc(${typography.fontSize} * ${typography.headingScale})`,
                                                fontWeight: 600,
                                                marginBottom: '0.5em'
                                            }}
                                        >
                                            Heading 2
                                        </div>
                                        <p style={{ marginBottom: '1em' }}>
                                            This is a paragraph of text that demonstrates the base font family and size.
                                            The text should be readable and comfortable for users to scan quickly.
                                        </p>
                                        <p>
                                            <strong>Bold text</strong> and <em>italic text</em> should be distinctive
                                            and enhance the reading experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="elements" className="pt-4">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="borderRadius">Border Radius</Label>
                                        <RadioGroup
                                            id="borderRadius"
                                            value={elements.borderRadius}
                                            onValueChange={(value) => handleElementsChange("borderRadius", value)}
                                            className="flex space-x-2"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="0px" id="radius-square" />
                                                <Label htmlFor="radius-square">Square</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="4px" id="radius-rounded" />
                                                <Label htmlFor="radius-rounded">Rounded</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="8px" id="radius-pills" />
                                                <Label htmlFor="radius-pills">Pills</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="buttonStyle">Button Style</Label>
                                        <RadioGroup
                                            id="buttonStyle"
                                            value={elements.buttonStyle}
                                            onValueChange={(value) => handleElementsChange("buttonStyle", value)}
                                            className="flex space-x-2"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="filled" id="style-filled" />
                                                <Label htmlFor="style-filled">Filled</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="outline" id="style-outline" />
                                                <Label htmlFor="style-outline">Outline</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="ghost" id="style-ghost" />
                                                <Label htmlFor="style-ghost">Ghost</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shadows">Shadows</Label>
                                        <RadioGroup
                                            id="shadows"
                                            value={elements.shadows}
                                            onValueChange={(value) => handleElementsChange("shadows", value)}
                                            className="flex space-x-2"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="none" id="shadow-none" />
                                                <Label htmlFor="shadow-none">None</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="light" id="shadow-light" />
                                                <Label htmlFor="shadow-light">Light</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="medium" id="shadow-medium" />
                                                <Label htmlFor="shadow-medium">Medium</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="spacing">Spacing</Label>
                                        <RadioGroup
                                            id="spacing"
                                            value={elements.spacing}
                                            onValueChange={(value) => handleElementsChange("spacing", value)}
                                            className="flex space-x-2"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="compact" id="spacing-compact" />
                                                <Label htmlFor="spacing-compact">Compact</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="default" id="spacing-default" />
                                                <Label htmlFor="spacing-default">Default</Label>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <RadioGroupItem value="relaxed" id="spacing-relaxed" />
                                                <Label htmlFor="spacing-relaxed">Relaxed</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-sm font-medium mb-4">Elements Preview</h3>
                                    <div className="p-4 border rounded space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <div
                                                className="p-4"
                                                style={{
                                                    borderRadius: elements.borderRadius,
                                                    boxShadow: elements.shadows === "none" ? "none" :
                                                        elements.shadows === "light" ? "0 2px 4px rgba(0,0,0,0.1)" :
                                                            "0 4px 8px rgba(0,0,0,0.1)",
                                                    border: "1px solid #ddd",
                                                    backgroundColor: "#fff"
                                                }}
                                            >
                                                Card with {elements.shadows} shadow
                                            </div>
                                            <div
                                                className="p-4"
                                                style={{
                                                    borderRadius: elements.borderRadius,
                                                    boxShadow: elements.shadows === "none" ? "none" :
                                                        elements.shadows === "light" ? "0 2px 4px rgba(0,0,0,0.1)" :
                                                            "0 4px 8px rgba(0,0,0,0.1)",
                                                    border: "1px solid #ddd",
                                                    backgroundColor: "#fff"
                                                }}
                                            >
                                                Card with {elements.borderRadius} borders
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                className="px-4 py-2"
                                                style={{
                                                    borderRadius: elements.borderRadius,
                                                    backgroundColor: elements.buttonStyle === "filled" ? colors.primary : "transparent",
                                                    border: elements.buttonStyle === "outline" ? `1px solid ${colors.primary}` : "none",
                                                    color: elements.buttonStyle === "filled" ? "#fff" : colors.primary,
                                                }}
                                            >
                                                {elements.buttonStyle} Button
                                            </button>
                                            <button
                                                className="px-4 py-2"
                                                style={{
                                                    borderRadius: elements.borderRadius,
                                                    backgroundColor: elements.buttonStyle === "filled" ? colors.secondary : "transparent",
                                                    border: elements.buttonStyle === "outline" ? `1px solid ${colors.secondary}` : "none",
                                                    color: elements.buttonStyle === "filled" ? "#fff" : colors.secondary,
                                                }}
                                            >
                                                Secondary Button
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 