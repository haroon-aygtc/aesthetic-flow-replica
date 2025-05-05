
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export type ConnectionTestStatus = "idle" | "pending" | "success" | "error";

export interface ConnectionTestResult {
  status: ConnectionTestStatus;
  message?: string;
  timestamp?: Date;
  latency?: number;
}

interface ConnectionTestStatusProps {
  testResult: ConnectionTestResult;
}

export function ConnectionTestStatus({ testResult }: ConnectionTestStatusProps) {
  if (testResult.status === "idle") {
    return null;
  }

  if (testResult.status === "pending") {
    return (
      <Alert className="bg-muted/50 flex items-center">
        <Spinner className="mr-2" size="sm" />
        <AlertDescription>
          {testResult.message || "Testing connection..."}
        </AlertDescription>
      </Alert>
    );
  }

  if (testResult.status === "success") {
    return (
      <Alert className="bg-success/10 border-success/30">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Connection Successful</AlertTitle>
        <AlertDescription className="flex flex-col">
          <span>{testResult.message || "Successfully connected to the API."}</span>
          {testResult.latency && (
            <span className="text-xs flex items-center mt-1.5 text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" /> 
              Latency: {testResult.latency}ms
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (testResult.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Failed</AlertTitle>
        <AlertDescription>
          {testResult.message || "Failed to connect to the API."}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
