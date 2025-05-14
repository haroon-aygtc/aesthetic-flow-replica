import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import EmbedOptionsSection from "@/components/sections/EmbedOptionsSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import { WidgetSettings } from "@/utils/widgetService";
import {widgetConfigService} from "@/utils/widgetConfig";

interface WidgetConfig {
    initiallyOpen: boolean;
    contextMode: "restricted" | "open" | "custom";
    contextName: string;
    title: string;
    primaryColor: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    showOnMobile?: boolean;
}

const Home = () => {
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
        initiallyOpen: false,
        contextMode: "restricted",
        contextName: "Website Assistance",
        title: "ChatEmbed Demo",
        primaryColor: "#4f46e5",
        position: "bottom-right",
        showOnMobile: true,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWidgetConfig();
    }, []);

    const fetchWidgetConfig = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch widget configuration from MySQL
            try {
                const defaultConfig =
                    await widgetConfigService.getDefaultWidgetConfig();

                if (defaultConfig) {
                    setWidgetConfig({
                        initiallyOpen: defaultConfig.initiallyOpen || false,
                        contextMode: defaultConfig.contextMode || "restricted",
                        contextName: defaultConfig.contextName || "Website Assistance",
                        title: defaultConfig.title || "ChatEmbed Demo",
                        primaryColor: defaultConfig.primaryColor || "#4f46e5",
                        position: defaultConfig.position || "bottom-right",
                        showOnMobile:
                            defaultConfig.showOnMobile !== undefined
                                ? defaultConfig.showOnMobile
                                : true,
                    });
                }
            } catch (dbError) {
                console.error("Error fetching widget config from database:", dbError);
                setError("Failed to load widget configuration from database");
            }
        } catch (error) {
            console.error("Error fetching widget config:", error);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Map our widget config to the format expected by ChatWidgetPreview
    const mapToWidgetSettings = (): WidgetSettings => {
        return {
            headerTitle: widgetConfig.title,
            primaryColor: widgetConfig.primaryColor,
            position: widgetConfig.position,
            initialMessage: "Hello! How can I help you today?",
            inputPlaceholder: "Type your message...",
            sendButtonText: "Send",
            persistSession: true,
            showNotifications: true,
            // Additional settings
            autoOpenDelay: widgetConfig.initiallyOpen ? 0 : undefined,
            mobileBehavior: widgetConfig.showOnMobile ? "show" : "hide"
        };
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <EmbedOptionsSection />
                <CTASection />
            </main>
            <Footer />

            {error && (
                <div className="fixed bottom-4 right-4 bg-destructive text-white p-4 rounded-md shadow-lg">
                    {error}
                </div>
            )}

            
        </div>
    );
};

export default Home;