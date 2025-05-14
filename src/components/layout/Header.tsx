import React from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function Header() {
    return (
        <header className="w-full bg-background border-b border-border py-4">
            <div className="container flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="text-xl font-semibold">
                        ChatEmbed
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/features" className="text-sm font-medium hover:text-primary">
                        Features
                    </Link>
                    <Link to="/pricing" className="text-sm font-medium hover:text-primary">
                        Pricing
                    </Link>
                    <Link to="/docs" className="text-sm font-medium hover:text-primary">
                        Documentation
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="outline" size="sm">
                            Login
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header 