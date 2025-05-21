<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create the table if it doesn't exist
        if (!Schema::hasTable('ai_models')) {
            Schema::create('ai_models', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('provider');
                $table->text('description')->nullable();
                $table->text('api_key')->nullable();
                $table->json('settings')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('active')->default(true);
                $table->unsignedBigInteger('fallback_model_id')->nullable();
                $table->float('confidence_threshold')->default(0.7);
                $table->timestamps();

                $table->foreign('fallback_model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->nullOnDelete();
            });
        }

        // Update widgets table - SQLite compatible version
        if (Schema::hasTable('widgets') && Schema::hasColumn('widgets', 'ai_model_id')) {
            // SQLite doesn't support dropping foreign keys, so we'll skip it
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table('widgets', function (Blueprint $table) {
                    $table->dropForeign(['ai_model_id']);
                });
            }

            // For SQLite, we just add the foreign key constraint
            Schema::table('widgets', function (Blueprint $table) {
                $table->foreign('ai_model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->nullOnDelete();
            });
        }

        // Update model_activation_rules - SQLite compatible version
        if (Schema::hasTable('model_activation_rules') && Schema::hasColumn('model_activation_rules', 'model_id')) {
            // SKip dropping foreign keys for SQLite
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table('model_activation_rules', function (Blueprint $table) {
                    $table->dropForeign(['model_id']);
                });
            }

            Schema::table('model_activation_rules', function (Blueprint $table) {
                $table->foreign('model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->onDelete('cascade');
            });
        }

        // Update model_usage_logs - SQLite compatible version
        if (Schema::hasTable('model_usage_logs') && Schema::hasColumn('model_usage_logs', 'model_id')) {
            // Skip dropping foreign keys for SQLite
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table('model_usage_logs', function (Blueprint $table) {
                    $table->dropForeign(['model_id']);
                });
            }

            Schema::table('model_usage_logs', function (Blueprint $table) {
                $table->foreign('model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        // Skip for SQLite since it can't handle dropping foreign keys
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Revert widgets table
        if (Schema::hasTable('widgets') && Schema::hasColumn('widgets', 'ai_model_id')) {
            Schema::table('widgets', function (Blueprint $table) {
                $table->dropForeign(['ai_model_id']);
            });

            Schema::table('widgets', function (Blueprint $table) {
                $table->foreign('ai_model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->nullOnDelete();
            });
        }

        // Revert model_activation_rules
        if (Schema::hasTable('model_activation_rules') && Schema::hasColumn('model_activation_rules', 'model_id')) {
            Schema::table('model_activation_rules', function (Blueprint $table) {
                $table->dropForeign(['model_id']);
                $table->foreign('model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->onDelete('cascade');
            });
        }

        // Revert model_usage_logs
        if (Schema::hasTable('model_usage_logs') && Schema::hasColumn('model_usage_logs', 'model_id')) {
            Schema::table('model_usage_logs', function (Blueprint $table) {
                $table->dropForeign(['model_id']);
                $table->foreign('model_id')
                    ->references('id')
                    ->on('ai_models')
                    ->onDelete('cascade');
            });
        }
    }
};
