"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Info, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface BrandingPreviewProps {
  setting: BrandingSetting
  generateCss: (settingId: number) => Promise<string | null>
}

export function BrandingPreview({ setting, generateCss }: BrandingPreviewProps) {
  const { toast } = useToast()
  const [css, setCss] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Generate CSS when setting changes
  useEffect(() => {
    handleGenerateCss()
  }, [setting.id])

  const handleGenerateCss = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const generatedCss = await generateCss(setting.id)
      setCss(generatedCss)
    } catch (err) {
      console.error("Failed to generate CSS:", err)
      setError("Failed to generate CSS preview. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (!css) return

    navigator.clipboard.writeText(css)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "CSS has been copied to your clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Preview</CardTitle>
        <CardDescription>
          Preview the CSS generated from your branding settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: setting.colors.primary }}
            />
            <span className="font-medium">{setting.name}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateCss}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              disabled={!css || isLoading}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>CSS Preview</AlertTitle>
          <AlertDescription>
            This is the CSS that will be applied to your widget based on your branding settings.
          </AlertDescription>
        </Alert>

        <div className="relative">
          <pre className="p-4 rounded-md bg-muted overflow-auto max-h-[400px] text-xs">
            <code>{css || "No CSS available. Generate a preview first."}</code>
          </pre>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Color Preview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(setting.colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: value }}
                />
                <span className="text-xs">{key}: {value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Typography Preview</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(setting.typography).map(([key, value]) => (
              <div key={key} className="text-xs">
                {key}: {value}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
