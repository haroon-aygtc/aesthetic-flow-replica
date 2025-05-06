<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

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
        'metadata',
        'status',
        'created_by',
        'updated_by',
        'slug',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
        'variables' => 'array',
        'metadata' => 'array',
        'version' => 'float',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    /**
     * Get the AI models that use this template.
     */
    public function aiModels()
    {
        return $this->hasMany(AIModel::class, 'template_id');
    }

    /**
     * Get the user who created this template.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this template.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
