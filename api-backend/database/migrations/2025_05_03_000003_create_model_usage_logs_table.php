
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('model_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('model_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->unsignedBigInteger('widget_id')->nullable();
            $table->string('query_type')->nullable();
            $table->string('use_case')->nullable();
            $table->integer('tokens_input')->default(0);
            $table->integer('tokens_output')->default(0);
            $table->float('response_time')->default(0); // in seconds
            $table->float('confidence_score')->nullable();
            $table->boolean('fallback_used')->default(false);
            $table->boolean('success')->default(true);
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('model_id')
                  ->references('id')
                  ->on('ai_models')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('model_usage_logs');
    }
};
