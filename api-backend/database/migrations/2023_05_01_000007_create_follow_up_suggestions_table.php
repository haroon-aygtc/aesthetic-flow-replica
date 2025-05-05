<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('follow_up_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained()->onDelete('cascade');
            $table->string('text');
            $table->string('category');
            $table->string('context');
            $table->enum('position', ['start', 'inline', 'end'])->default('end');
            $table->string('format')->default('button');
            $table->string('url')->nullable();
            $table->string('tooltip_text')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            // Add index for faster lookups
            $table->index(['widget_id', 'context', 'active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('follow_up_suggestions');
    }
};
