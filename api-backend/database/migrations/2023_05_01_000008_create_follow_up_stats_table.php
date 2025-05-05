<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('follow_up_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('suggestion_id')->constrained('follow_up_suggestions')->onDelete('cascade');
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->integer('conversions')->default(0);
            $table->string('session_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            
            // Add indexes for analytics queries
            $table->index(['widget_id', 'created_at']);
            $table->index(['suggestion_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('follow_up_stats');
    }
};
