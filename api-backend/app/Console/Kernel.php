<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        // \App\Console\Commands\TestGeminiConnection::class,
        // \App\Console\Commands\RefreshWebsiteSources::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // ... existing scheduled commands ...

        // Refresh website sources for knowledge base
        $schedule->command('knowledge:refresh-websites')
            ->daily()
            ->at('03:00')
            ->withoutOverlapping(60)
            ->appendOutputTo(storage_path('logs/refresh-websites.log'));
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
