<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'category',
        'content',
        'version',
        'is_default',
        'variables',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
        'variables' => 'array',
        'version' => 'float',
    ];

    /**
     * Get the AI models that use this template.
     */
    public function aiModels()
    {
        return $this->hasMany(AIModel::class, 'template_id');
    }
}
