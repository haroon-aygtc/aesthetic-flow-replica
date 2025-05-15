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
        Schema::create('branding_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('logo_url')->nullable();
            $table->json('colors')->nullable();
            $table->json('typography')->nullable();
            $table->json('elements')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('widget_branding_setting', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->foreignId('branding_setting_id')->constrained()->onDelete('cascade');
            $table->json('overrides')->nullable();
            $table->timestamps();

            $table->unique(['widget_id', 'branding_setting_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_branding_setting');
        Schema::dropIfExists('branding_settings');
    }
};
