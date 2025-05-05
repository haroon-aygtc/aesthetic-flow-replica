<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->expectsJson()) {
            return null; // Return null for API requests, which will result in a 401 Unauthorized response
        }

        // For web requests, redirect to the frontend login page
        return env('FRONTEND_URL', 'http://localhost:3000') . '/login';
    }
}
