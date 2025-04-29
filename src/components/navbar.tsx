
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { MessageSquare } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">ChatSystem</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="text-sm">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="text-sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
