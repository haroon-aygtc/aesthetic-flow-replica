import api from "./api";

interface WidgetConfig {
    initiallyOpen: boolean;
    contextMode: "restricted" | "open" | "custom";
    contextName: string;
    title: string;
    primaryColor: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    showOnMobile?: boolean;
}

class WidgetConfigService {
    private readonly ENDPOINT = "/api/widget-config";

    async getDefaultWidgetConfig(): Promise<WidgetConfig> {
        try {
            const response = await api.get(`${this.ENDPOINT}/default`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch default widget config:", error);
            // Return fallback config
            return {
                initiallyOpen: false,
                contextMode: "restricted",
                contextName: "Website Assistance",
                title: "ChatEmbed Demo",
                primaryColor: "#4f46e5",
                position: "bottom-right",
                showOnMobile: true,
            };
        }
    }

    async getWidgetConfig(id: string): Promise<WidgetConfig> {
        const response = await api.get(`${this.ENDPOINT}/${id}`);
        return response.data;
    }

    async createWidgetConfig(config: Partial<WidgetConfig>): Promise<WidgetConfig> {
        const response = await api.post(this.ENDPOINT, config);
        return response.data;
    }

    async updateWidgetConfig(id: string, config: Partial<WidgetConfig>): Promise<WidgetConfig> {
        const response = await api.put(`${this.ENDPOINT}/${id}`, config);
        return response.data;
    }

    async deleteWidgetConfig(id: string): Promise<void> {
        await api.delete(`${this.ENDPOINT}/${id}`);
    }
}

export const widgetConfigService = new WidgetConfigService(); 