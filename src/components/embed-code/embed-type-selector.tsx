
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmbedTypeSelectorProps {
  embedType: string;
  onEmbedTypeChange: (type: string) => void;
  children: React.ReactNode;
}

export function EmbedTypeSelector({ embedType, onEmbedTypeChange, children }: EmbedTypeSelectorProps) {
  return (
    <Tabs defaultValue="standard" value={embedType} onValueChange={onEmbedTypeChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="standard">Standard</TabsTrigger>
        <TabsTrigger value="iframe">iFrame</TabsTrigger>
        <TabsTrigger value="webcomponent">Web Component</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
