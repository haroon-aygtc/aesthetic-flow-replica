<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class StandardizeApiResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // Process the request
        $response = $next($request);

        // Only modify JSON responses
        if (!$response instanceof JsonResponse) {
            return $response;
        }

        $statusCode = $response->getStatusCode();
        $originalData = $response->getData(true);

        // If the response is already standardized, return it as is
        if (isset($originalData['success']) && 
            (isset($originalData['data']) || isset($originalData['message']) || isset($originalData['error']))) {
            return $response;
        }

        // Standardize the response format
        $standardizedData = [
            'success' => $this->isSuccessStatusCode($statusCode),
        ];

        // Add data if it's a successful response
        if ($this->isSuccessStatusCode($statusCode)) {
            // If the original data is an array, use it as the data
            // Otherwise, wrap it in a data property
            $standardizedData['data'] = $originalData;
            
            // Add a generic success message if none exists
            if (!isset($standardizedData['message'])) {
                $standardizedData['message'] = $this->getDefaultSuccessMessage($request);
            }
        } else {
            // For error responses
            $standardizedData['error'] = $originalData['error'] ?? $originalData['message'] ?? $this->getDefaultErrorMessage($statusCode);
            $standardizedData['message'] = $originalData['message'] ?? $this->getDefaultErrorMessage($statusCode);
            
            // Include validation errors if they exist
            if (isset($originalData['errors'])) {
                $standardizedData['errors'] = $originalData['errors'];
            }
        }

        // Log server errors
        if ($statusCode >= 500) {
            Log::error('Server error in API response', [
                'status' => $statusCode,
                'path' => $request->path(),
                'method' => $request->method(),
                'error' => $standardizedData['error'] ?? 'Unknown error'
            ]);
        }

        return $response->setData($standardizedData);
    }

    /**
     * Determine if the status code indicates success.
     *
     * @param  int  $statusCode
     * @return bool
     */
    protected function isSuccessStatusCode(int $statusCode): bool
    {
        return $statusCode >= 200 && $statusCode < 300;
    }

    /**
     * Get a default success message based on the request method.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function getDefaultSuccessMessage(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        $resource = $this->getResourceFromPath($path);

        return match ($method) {
            'GET' => "Successfully retrieved {$resource}",
            'POST' => "Successfully created {$resource}",
            'PUT', 'PATCH' => "Successfully updated {$resource}",
            'DELETE' => "Successfully deleted {$resource}",
            default => 'Operation completed successfully',
        };
    }

    /**
     * Get a default error message based on the status code.
     *
     * @param  int  $statusCode
     * @return string
     */
    protected function getDefaultErrorMessage(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'Bad request. Please check your input.',
            401 => 'Unauthorized. Authentication required.',
            403 => 'Forbidden. You do not have permission to access this resource.',
            404 => 'Resource not found.',
            405 => 'Method not allowed.',
            422 => 'Validation failed. Please check your input.',
            429 => 'Too many requests. Please try again later.',
            500 => 'Internal server error. Please try again later.',
            503 => 'Service unavailable. Please try again later.',
            default => 'An error occurred. Please try again later.',
        };
    }

    /**
     * Extract a resource name from the request path.
     *
     * @param  string  $path
     * @return string
     */
    protected function getResourceFromPath(string $path): string
    {
        // Extract the resource name from the path
        // e.g., 'api/users/1' -> 'user'
        $segments = explode('/', $path);
        $apiIndex = array_search('api', $segments);
        
        if ($apiIndex !== false && isset($segments[$apiIndex + 1])) {
            $resource = $segments[$apiIndex + 1];
            // Convert to singular form (simple approach)
            if (substr($resource, -1) === 's') {
                $resource = substr($resource, 0, -1);
            }
            return $resource;
        }
        
        return 'resource';
    }
}
