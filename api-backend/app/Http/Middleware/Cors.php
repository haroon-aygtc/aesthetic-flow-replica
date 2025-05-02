
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Get the allowed origins from env or use a default value
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173');
        $origins = explode(',', $allowedOrigins);
        
        $origin = $request->header('Origin');
        if (in_array($origin, $origins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            // For development, you might want to allow any origin
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Origin, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}
