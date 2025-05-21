<?php

namespace App\Providers;

use App\Database\Migrations\CustomMigrationRepository;
use Illuminate\Database\Migrations\DatabaseMigrationRepository;
use Illuminate\Database\Migrations\MigrationRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class MigrationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(MigrationRepositoryInterface::class, function ($app) {
            return new CustomMigrationRepository(
                $app['db'], 'migrations'
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
