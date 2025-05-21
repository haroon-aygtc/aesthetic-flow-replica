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
        // Fix for the array to string conversion issue
        return $this->getConnection()->getSchemaBuilder()->hasTable($this->table);
    }
}
