
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIModelData } from '@/utils/ai-model-service';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, XCircle } from 'lucide-react';

interface ModelApiKeySettingsProps {
  model: AIModelData;
  onSave: (apiKey: string) => Promise<void>;
  onTest: () => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

export function ModelApiKeySettings({
  model,
  onSave,
  onTest,
  isSaving,
  isTesting
}: ModelApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    await onSave(apiKey);
    setApiKey('');
    setIsEditing(false);
  };
  
  const handleTest = async () => {
    setTestStatus('idle');
    try {
      await onTest();
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key">API Key for {model.provider}</Label>
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={model.api_key ? "Enter new API key" : "Enter API key"}
                    autoComplete="off"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={!apiKey.trim() || isSaving}
                      className="flex items-center"
                    >
                      {isSaving && <Spinner className="mr-2 h-4 w-4" />}
                      Save Key
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setApiKey('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Input
                      type="password"
                      value={model.api_key ? "••••••••••••••••" : ""}
                      disabled
                      className="w-60"
                      placeholder="No API key set"
                    />
                    
                    {testStatus === 'success' && (
                      <div className="ml-3 text-green-500 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span>Valid</span>
                      </div>
                    )}
                    
                    {testStatus === 'error' && (
                      <div className="ml-3 text-red-500 flex items-center">
                        <XCircle className="h-5 w-5 mr-1" />
                        <span>Invalid</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                    >
                      {model.api_key ? "Change" : "Add Key"}
                    </Button>
                    
                    {model.api_key && (
                      <Button 
                        variant="secondary" 
                        onClick={handleTest}
                        disabled={isTesting}
                      >
                        {isTesting ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md text-sm">
            <h4 className="font-medium">API Key Security</h4>
            <p className="text-muted-foreground mt-1">
              Your API key is encrypted before storage and never exposed in responses.
              To update, provide a new key.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm">
            <h4 className="font-medium">Model Information</h4>
            <p className="text-muted-foreground mt-1">
              Provider: <span className="font-medium">{model.provider}</span>
              {model.settings?.model_name && (
                <>
                  <br />
                  Model Name: <span className="font-medium">{model.settings.model_name}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
