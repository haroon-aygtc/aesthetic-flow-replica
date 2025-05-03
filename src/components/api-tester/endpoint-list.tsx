
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Globe } from "lucide-react";
import { ApiRoute } from "@/utils/api-test-service";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EndpointListProps {
  routes: ApiRoute[];
  onSelectEndpoint: (route: ApiRoute, method: string) => void;
}

export function EndpointList({ routes, onSelectEndpoint }: EndpointListProps) {
  // Group routes by category
  const categories = Array.from(new Set(routes.map(route => route.category)));
  
  // Map method to color
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-blue-500';
      case 'post': return 'bg-green-500';
      case 'put': return 'bg-yellow-500';
      case 'delete': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card rounded-md border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">API Endpoints</h3>
        <p className="text-sm text-muted-foreground">
          Select an endpoint to test
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category, index) => (
          <AccordionItem value={category} key={index}>
            <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                {category}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 p-2">
                {routes
                  .filter(route => route.category === category)
                  .map((route, idx) => (
                    <div key={idx} className="border rounded-md p-2">
                      <div className="text-sm font-medium mb-2">{route.uri}</div>
                      <div className="flex flex-wrap gap-1">
                        {route.methods.map((method, methodIdx) => (
                          <Badge 
                            key={methodIdx} 
                            className={`cursor-pointer ${getMethodColor(method)} hover:opacity-80`}
                            onClick={() => onSelectEndpoint(route, method)}
                          >
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
