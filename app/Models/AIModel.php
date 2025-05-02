<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class AIModel extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'provider',
        'description',
        'api_key',
        'settings',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'settings' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * Get widgets that use this AI model.
     */
    public function widgets()
    {
        return $this->hasMany(Widget::class);
    }

    /**
     * Set the API key with encryption.
     *
     * @param string $value
     * @return void
     */
    public function setApiKeyAttribute($value)
    {
        if (!empty($value)) {
            $this->attributes['api_key'] = Crypt::encryptString($value);
        }
    }

    /**
     * Get the API key with decryption.
     *
     * @param string $value
     * @return string|null
     */
    public function getApiKeyAttribute($value)
    {
        if (!empty($value)) {
            return Crypt::decryptString($value);
        }
        return null;
    }
}