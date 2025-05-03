
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelActivationRule extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'model_id',
        'name',
        'query_type',
        'use_case',
        'tenant_id',
        'active',
        'priority',
        'conditions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'priority' => 'integer',
        'conditions' => 'array',
    ];

    /**
     * Get the AI model that owns this rule.
     */
    public function aiModel()
    {
        return $this->belongsTo(AIModel::class, 'model_id');
    }
}
