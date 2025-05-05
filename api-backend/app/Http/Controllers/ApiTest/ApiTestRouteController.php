
<?php

namespace App\Http\Controllers\ApiTest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class ApiTestRouteController extends Controller
{
    /**
     * List all API routes for testing
     *
     * @return \Illuminate\Http\Response
     */
    public function listRoutes()
    {
        $routes = Route::getRoutes();
        $apiRoutes = [];

        foreach ($routes as $route) {
            $uri = $route->uri();
            if (strpos($uri, 'api/') === 0) {
                $methods = $route->methods();
                $action = $route->getAction();
                $name = $action['as'] ?? '';
                $controller = $action['controller'] ?? '';
                
                $apiRoutes[] = [
                    'uri' => $uri,
                    'methods' => $methods,
                    'name' => $name,
                    'controller' => $controller
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $apiRoutes
        ]);
    }
}
