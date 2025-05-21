<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MarkMigrationsAsRun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrations:mark-as-run {--all} {--file=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark migrations as run without actually running them';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Check if the migrations table exists
        if (!DB::getSchemaBuilder()->hasTable('migrations')) {
            $this->error('Migrations table does not exist. Please run migrations:install first.');
            return 1;
        }

        if ($this->option('all')) {
            return $this->markAllMigrationsAsRun();
        } elseif ($this->option('file')) {
            return $this->markSpecificMigrationAsRun($this->option('file'));
        } else {
            $this->info('Please specify --all to mark all migrations as run or --file=filename to mark a specific migration.');
            return 1;
        }
    }

    /**
     * Mark all unmigrated migrations as run.
     *
     * @return int
     */
    protected function markAllMigrationsAsRun()
    {
        $migrationFiles = File::glob(database_path('migrations/*.php'));
        $ran = DB::table('migrations')->pluck('migration')->toArray();

        $pendingMigrations = [];

        foreach ($migrationFiles as $file) {
            $migrationName = Str::afterLast($file, '/');
            $migrationName = Str::beforeLast($migrationName, '.php');

            if (!in_array($migrationName, $ran)) {
                $pendingMigrations[] = $migrationName;
            }
        }

        if (empty($pendingMigrations)) {
            $this->info('No pending migrations found.');
            return 0;
        }

        $this->info('Marking ' . count($pendingMigrations) . ' migrations as run:');

        $batch = DB::table('migrations')->max('batch') + 1;

        foreach ($pendingMigrations as $migration) {
            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => $batch
            ]);

            $this->line('  <info>✓</info> ' . $migration);
        }

        $this->info('All pending migrations have been marked as run.');
        return 0;
    }

    /**
     * Mark a specific migration as run.
     *
     * @param string $fileName
     * @return int
     */
    protected function markSpecificMigrationAsRun($fileName)
    {
        // Remove .php extension if present
        $migrationName = Str::beforeLast($fileName, '.php');

        // Check if already in the migrations table
        if (DB::table('migrations')->where('migration', $migrationName)->exists()) {
            $this->info("Migration '{$migrationName}' is already marked as run.");
            return 0;
        }

        // Check if the file exists
        $filePath = database_path('migrations/' . $migrationName . '.php');
        if (!File::exists($filePath)) {
            $this->error("Migration file '{$filePath}' does not exist.");
            return 1;
        }

        $batch = DB::table('migrations')->max('batch') + 1;

        DB::table('migrations')->insert([
            'migration' => $migrationName,
            'batch' => $batch
        ]);

        $this->info("Migration '{$migrationName}' has been marked as run.");
        return 0;
    }
}
