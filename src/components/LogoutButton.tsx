import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  showIcon = true,
  showText = true,
  className = "",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout: authLogout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Use the logout function from useAuth context
      await authLogout();

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      // Redirect to the login page
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${className} ${!showText && !showIcon ? "p-0" : ""}`}
    >
      {showIcon && <LogOut className={`h-4 w-4 ${showText ? "mr-2" : ""}`} />}
      {showText && (isLoggingOut ? "Logging out..." : "Logout")}
    </Button>
  );
}
