<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AIProvider extends Model
{
    use HasFactory;

    protected $table = 'ai_providers';

    protected $fillable = [
        'name', 
        'slug', 
        'logo_path', 
        'description', 
        'api_base_url',
        'capabilities',
        'auth_config',
        'is_active',
        'supports_streaming',
        'requires_model_selection'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'supports_streaming' => 'boolean',
        'requires_model_selection' => 'boolean',
        'capabilities' => 'array',
        'auth_config' => 'array'
    ];
    
    public function parameters()
    {
        return $this->hasMany(ProviderParameter::class, 'provider_id');
    }
    
    public function models()
    {
        return $this->hasMany(ProviderModel::class, 'provider_id');
    }

    /**
     * Get implementation class for this provider
     * 
     * @return string|null
     */
    public function getImplementationClass()
    {
        $baseNamespace = 'App\\Services\\Providers\\';
        $className = ucfirst($this->slug) . 'Provider';
        $fullClassName = $baseNamespace . $className;
        
        if (class_exists($fullClassName)) {
            return $fullClassName;
        }
        
        return null;
    }
} 