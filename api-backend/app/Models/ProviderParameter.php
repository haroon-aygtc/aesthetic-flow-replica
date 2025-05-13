<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProviderParameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id', 
        'param_key', 
        'display_name', 
        'type',
        'config', 
        'default_value', 
        'description',
        'is_required', 
        'is_advanced', 
        'display_order'
    ];
    
    protected $casts = [
        'config' => 'array',
        'default_value' => 'array',
        'is_required' => 'boolean',
        'is_advanced' => 'boolean'
    ];
    
    public function provider()
    {
        return $this->belongsTo(AIProvider::class, 'provider_id');
    }
} 