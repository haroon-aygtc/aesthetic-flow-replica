<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add status column if it doesn't exist
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('password');
            }
            
            // Add last_active column
            $table->timestamp('last_active')->nullable()->after('status');
            
            // Add profile_image column
            $table->string('profile_image')->nullable()->after('last_active');
            
            // Add phone column
            $table->string('phone')->nullable()->after('profile_image');
            
            // Add additional user information
            $table->string('job_title')->nullable()->after('phone');
            $table->string('company')->nullable()->after('job_title');
            $table->text('bio')->nullable()->after('company');
            $table->json('preferences')->nullable()->after('bio');
            $table->string('timezone')->nullable()->after('preferences');
            $table->string('language')->default('en')->after('timezone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Don't drop status as it might be used elsewhere
            $table->dropColumn([
                'last_active',
                'profile_image',
                'phone',
                'job_title',
                'company',
                'bio',
                'preferences',
                'timezone',
                'language'
            ]);
        });
    }
};
