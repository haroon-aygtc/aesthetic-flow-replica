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
        'is_free', 
        'is_restricted', 
        'is_featured',
        'input_token_limit', 
        'output_token_limit', 
        'capabilities',
        'pricing',
        'display_order'
    ];
    
    protected $casts = [
        'is_free' => 'boolean',
        'is_restricted' => 'boolean',
        'is_featured' => 'boolean',
        'capabilities' => 'array',
        'pricing' => 'array'
    ];
    
    public function provider()
    {
        return $this->belongsTo(AIProvider::class, 'provider_id');
    }
} 