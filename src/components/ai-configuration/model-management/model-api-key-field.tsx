import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { InfoIcon, RefreshCw, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface ModelApiKeyFieldProps {
  onFetchModels?: () => Promise<void>;
  isFetching?: boolean;
  apiKeyVerified?: boolean;
}

export function ModelApiKeyField({ 
  onFetchModels, 
  isFetching = false,
  apiKeyVerified = false 
}: ModelApiKeyFieldProps) {
  const form = useFormContext();
  const [showApiKey, setShowApiKey] = useState(false);
  
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md font-medium">API Connection</CardTitle>
            <CardDescription>Securely connect to the AI provider</CardDescription>
          </div>
          {apiKeyVerified && (
            <div className="flex items-center text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Verified
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <div className="flex">
                <div className="relative flex-grow">
                  <FormControl>
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter provider API key"
                      {...field}
                      className="pr-10 bg-background font-mono text-sm"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={toggleApiKeyVisibility}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {onFetchModels && (
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2"
                    onClick={onFetchModels}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="flex items-start mt-2 text-xs text-muted-foreground">
                <InfoIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <FormDescription className="mt-0">
                  Your API key is stored securely and used only to communicate with the provider.
                  Never share your API key or include it in client-side code.
                </FormDescription>
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
