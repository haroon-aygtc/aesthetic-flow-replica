
import api from "./api-service";
import { toast } from "@/hooks/use-toast";

export interface ApiRoute {
  uri: string;
  methods: string[];
  name: string;
  controller: string;
  category: string;
}

export interface ApiTestRequest {
  method: string;
  url: string;
  data: any;
}

export interface ApiTestResponse {
  status: number;
  data: any;
  headers: any;
  duration: number;
}

export const apiTestService = {
  // Get all available API routes
  getApiRoutes: async (): Promise<ApiRoute[]> => {
    try {
      const response = await api.get('/api/test/routes');
      
      // Group routes by category (based on first segment of URI)
      const routes = response.data.data.map((route: ApiRoute) => {
        const segments = route.uri.split('/');
        // Skip 'api' in the uri path and use the next segment as category
        const category = segments.length > 1 ? (segments[1] || 'other') : 'other';
        return { ...route, category };
      });
      
      return routes;
    } catch (error) {
      console.error('Failed to fetch API routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API routes",
        variant: "destructive",
      });
      return [];
    }
  },

  // Execute a test request to an API endpoint
  executeTest: async (request: ApiTestRequest): Promise<ApiTestResponse> => {
    const startTime = performance.now();
    
    try {
      let response;
      const url = request.url.startsWith('/') ? request.url : `/${request.url}`;

      switch (request.method.toLowerCase()) {
        case 'get':
          response = await api.get(url);
          break;
        case 'post':
          response = await api.post(url, request.data);
          break;
        case 'put':
          response = await api.put(url, request.data);
          break;
        case 'delete':
          response = await api.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      const duration = performance.now() - startTime;
      
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        duration
      };
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { error: error.message },
        headers: error.response?.headers || {},
        duration
      };
    }
  },

  // Generate example request data based on endpoint and method
  generateExampleData: (endpoint: string, method: string): any => {
    // Widget examples
    if (endpoint.includes('widgets')) {
      if (method.toLowerCase() === 'post') {
        return {
          name: "Example Widget",
          is_active: true,
          settings: {
            theme: "light",
            primaryColor: "#3B82F6",
            requireGuestInfo: true
          }
        };
      }
      if (method.toLowerCase() === 'put') {
        return {
          name: "Updated Widget",
          is_active: true,
          settings: {
            theme: "dark",
            primaryColor: "#6366F1",
            requireGuestInfo: false
          }
        };
      }
    }
    
    // AI Model examples
    if (endpoint.includes('ai-models')) {
      if (method.toLowerCase() === 'post') {
        return {
          name: "Example AI Model",
          provider: "OpenAI",
          description: "GPT-4 model for chat",
          is_default: false,
          settings: {
            temperature: 0.7,
            max_tokens: 1000
          }
        };
      }
      if (method.toLowerCase() === 'put') {
        return {
          name: "Updated AI Model",
          provider: "OpenAI",
          description: "Updated description",
          is_default: true,
          settings: {
            temperature: 0.5,
            max_tokens: 2000
          }
        };
      }
    }
    
    // Guest user examples
    if (endpoint.includes('guest')) {
      if (method.toLowerCase() === 'post' && endpoint.includes('register')) {
        return {
          fullname: "John Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
          widget_id: "widget_12345"
        };
      }
      if (endpoint.includes('validate') || endpoint.includes('details')) {
        return {
          session_id: "session_12345"
        };
      }
    }
    
    // Chat examples
    if (endpoint.includes('chat')) {
      if (endpoint.includes('session/init')) {
        return {
          widget_id: "widget_12345",
          visitor_id: "visitor_12345"
        };
      }
      if (endpoint.includes('message')) {
        return {
          session_id: "session_12345",
          message: "Hello, I have a question",
          metadata: {
            source: "widget",
            page: "homepage"
          }
        };
      }
    }
    
    // Default empty object for other endpoints
    return {};
  }
};
