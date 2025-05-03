
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

export interface ConnectionTestResult {
  status: "success" | "error" | "pending" | "idle";
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

  let icon;
  let alertClass;
  
  switch (testResult.status) {
    case "success":
      icon = <CheckCircle className="h-4 w-4 text-green-500" />;
      alertClass = "bg-green-50 border-green-200 text-green-700";
      break;
    case "error":
      icon = <AlertCircle className="h-4 w-4 text-red-500" />;
      alertClass = "bg-red-50 border-red-200 text-red-700";
      break;
    case "pending":
    default:
      icon = <Clock className="h-4 w-4 text-amber-500" />;
      alertClass = "bg-amber-50 border-amber-200 text-amber-700";
  }

  return (
    <Alert className={`mt-4 ${alertClass}`}>
      <div className="flex items-start gap-2">
        {icon}
        <div className="space-y-1">
          <AlertDescription className="text-sm font-medium">
            {testResult.message}
          </AlertDescription>
          
          {testResult.timestamp && (
            <p className="text-xs">
              Tested {formatDistanceToNow(testResult.timestamp)} ago
            </p>
          )}
          
          {testResult.latency !== undefined && (
            <p className="text-xs">
              Latency: {testResult.latency}ms
            </p>
          )}
        </div>
      </div>
    </Alert>
  );
}
