<?php

namespace App\Database\Migrations;

use Illuminate\Database\Migrations\DatabaseMigrationRepository;

class CustomMigrationRepository extends DatabaseMigrationRepository
{
    /**
     * Determine if the migration repository exists.
     *
     * @return bool
     */
    public function repositoryExists()
    {
        try {
            // Convert array to string if necessary
            $table = is_array($this->table) ? 'migrations' : $this->table;

            return $this->getConnection()->getSchemaBuilder()->hasTable($table);
        } catch (\Exception $e) {
            // If there's an error, attempt to create the migrations table
            return false;
        }
    }
}
