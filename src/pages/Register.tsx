
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Mock successful registration
    toast({
      title: "Registration successful!",
      description: "Redirecting to dashboard...",
    });
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dark background with branding */}
      <div className="hidden md:flex md:w-1/2 bg-chatdark p-8 flex-col">
        <div className="flex items-center gap-2 text-white mb-12">
          <MessageSquare className="h-6 w-6" />
          <span className="font-bold text-xl">ChatSystem</span>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Join Us Today</h2>
          <p className="text-gray-300 max-w-sm">
            Create an account to access our chat widget
            platform and start building your own AI
            assistants.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-gray-300 text-sm">Customize your chat widget</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-gray-300 text-sm">Create context-aware AI responses</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-gray-300 text-sm">Embed on any website with ease</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">ChatSystem</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-gray-100 p-3">
              <MessageSquare className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Create an Admin Account</h1>
          <p className="text-center text-muted-foreground mb-8">
            Enter your details to register as an admin for ChatEmbed
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="pr-8 bg-gray-50 border border-gray-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4779 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pr-8 bg-gray-50 border border-gray-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3H14V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-8 bg-gray-50 border border-gray-200"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-8 bg-gray-50 border border-gray-200"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Register</Button>
          </form>
          
          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
          
          <p className="text-center mt-6 text-xs text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
