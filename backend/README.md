
# ChatAdmin Backend

This directory contains the Laravel backend for the ChatAdmin application. Follow these steps to set up:

## Installation

1. Navigate to this directory:
```bash
cd backend
```

2. Install Laravel using Composer:
```bash
composer create-project laravel/laravel .
```

3. Set up your database in .env file
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chatadmin
DB_USERNAME=root
DB_PASSWORD=
```

4. Install Laravel Sanctum for API authentication:
```bash
composer require laravel/sanctum
```

5. Publish Sanctum configuration:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

6. Run migrations:
```bash
php artisan migrate
```

7. Configure CORS in config/cors.php to allow requests from your frontend

8. Start the development server:
```bash
php artisan serve
```

## Authentication APIs

The backend includes these authentication endpoints:
- POST /api/register - Register a new user
- POST /api/login - Login user and get token
- POST /api/logout - Logout and invalidate token
- GET /api/user - Get authenticated user details

