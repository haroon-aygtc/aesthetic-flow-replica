
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('ai_models', function (Blueprint $table) {
            $table->boolean('active')->default(true)->after('is_default');
            $table->unsignedBigInteger('fallback_model_id')->nullable()->after('active');
            $table->float('confidence_threshold')->default(0.7)->after('fallback_model_id');
            
            $table->foreign('fallback_model_id')
                  ->references('id')
                  ->on('ai_models')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('ai_models', function (Blueprint $table) {
            $table->dropForeign(['fallback_model_id']);
            $table->dropColumn(['active', 'fallback_model_id', 'confidence_threshold']);
        });
    }
};
