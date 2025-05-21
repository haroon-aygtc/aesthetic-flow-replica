<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MarkMigrationsAsRun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:mark-as-run {--batch=2}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark pending migrations as run without actually running them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $batch = $this->option('batch');

        // Get all migration files
        $migrationFiles = File::glob(database_path('migrations/*.php'));
        $migrationNames = [];

        foreach ($migrationFiles as $file) {
            $filename = basename($file, '.php');
            $migrationNames[] = $filename;
        }

        // Get already run migrations
        $ranMigrations = DB::table('migrations')->pluck('migration')->toArray();

        // Find pending migrations
        $pendingMigrations = array_diff($migrationNames, $ranMigrations);

        if (count($pendingMigrations) === 0) {
            $this->info('No pending migrations found.');
            return 0;
        }

        $this->info('Marking ' . count($pendingMigrations) . ' migrations as run...');

        // Insert pending migrations into the migrations table
        foreach ($pendingMigrations as $migration) {
            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => $batch,
            ]);

            $this->info('Marked ' . $migration . ' as run.');
        }

        $this->info('All pending migrations have been marked as run.');

        return 0;
    }
}