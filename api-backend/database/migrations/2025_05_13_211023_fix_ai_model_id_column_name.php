<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the incorrect column name exists
        $hasIncorrectColumn = Schema::hasColumn('widgets', 'a_i_model_id');
        $hasCorrectColumn = Schema::hasColumn('widgets', 'ai_model_id');
        
        if ($hasIncorrectColumn && !$hasCorrectColumn) {
            // Column exists with incorrect name and correct column doesn't exist
            Schema::table('widgets', function (Blueprint $table) {
                $table->renameColumn('a_i_model_id', 'ai_model_id');
            });
            
            echo "Renamed column 'a_i_model_id' to 'ai_model_id' in widgets table.";
        } else if (!$hasIncorrectColumn && !$hasCorrectColumn) {
            // Neither column exists - add the correct one
            Schema::table('widgets', function (Blueprint $table) {
                $table->foreignId('ai_model_id')->nullable()->constrained()->nullOnDelete();
            });
            
            echo "Created new 'ai_model_id' column in widgets table.";
        } else if ($hasIncorrectColumn && $hasCorrectColumn) {
            // Both columns exist - need to migrate data and remove the incorrect one
            // First, copy any data from incorrect to correct column
            DB::statement('UPDATE widgets SET ai_model_id = a_i_model_id WHERE a_i_model_id IS NOT NULL');
            
            // Then drop the incorrect column
            Schema::table('widgets', function (Blueprint $table) {
                $table->dropColumn('a_i_model_id');
            });
            
            echo "Migrated data from 'a_i_model_id' to 'ai_model_id' and dropped the incorrect column.";
        } else {
            echo "No changes required. Column 'ai_model_id' already exists and has correct name.";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Since this is a column name fix, we won't provide a way to revert it
        echo "This migration cannot be reverted as it fixes a column name issue.";
    }
};
