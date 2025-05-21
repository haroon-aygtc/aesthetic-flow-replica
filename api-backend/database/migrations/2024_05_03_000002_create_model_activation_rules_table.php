
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('model_activation_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('model_id');
            $table->string('name');
            $table->string('query_type')->nullable();
            $table->string('use_case')->nullable();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('priority')->default(10);
            $table->json('conditions')->nullable();
            $table->timestamps();

            $table->foreign('model_id')
                  ->references('id')
                  ->on('ai_models')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('model_activation_rules');
    }
};
