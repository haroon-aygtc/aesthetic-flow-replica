<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProviderModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'model_id',
        'display_name',
        'description',
        'is_default',
        'is_free',
        'is_restricted',
        'input_token_limit',
        'output_token_limit',
        'capabilities',
        'display_order',
    ];
    
    protected $casts = [
        'is_default' => 'boolean',
        'is_free' => 'boolean',
        'is_restricted' => 'boolean',
        'input_token_limit' => 'integer',
        'output_token_limit' => 'integer',
        'capabilities' => 'array',
    ];

    /**
     * Get the provider that owns the model.
     */
    public function provider()
    {
        return $this->belongsTo(AIProvider::class, 'provider_id');
    }
} 