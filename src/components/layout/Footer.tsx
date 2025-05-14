import React from "react"
import { Link } from "react-router-dom"

function Footer() {
    return (
        <footer className="w-full bg-background border-t border-border py-8">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">ChatEmbed</h3>
                        <p className="text-sm text-muted-foreground">
                            Powerful AI chat widget for your website that integrates seamlessly with your brand.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/integrations" className="text-sm text-muted-foreground hover:text-foreground">
                                    Integrations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link to="/api" className="text-sm text-muted-foreground hover:text-foreground">
                                    API Reference
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} ChatEmbed. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <a href="https://twitter.com" className="text-sm text-muted-foreground hover:text-foreground">
                            Twitter
                        </a>
                        <a href="https://github.com" className="text-sm text-muted-foreground hover:text-foreground">
                            GitHub
                        </a>
                        <a href="https://discord.com" className="text-sm text-muted-foreground hover:text-foreground">
                            Discord
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer 