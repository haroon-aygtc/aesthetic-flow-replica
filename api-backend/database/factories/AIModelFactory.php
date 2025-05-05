<?php

namespace Database\Factories;

use App\Models\AIModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class AIModelFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AIModel::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->company() . ' AI',
            'provider' => $this->faker->randomElement(['OpenAI', 'Anthropic', 'Google', 'Cohere', 'Custom']),
            'description' => $this->faker->sentence(),
            'api_key' => $this->faker->uuid(),
            'settings' => [
                'model' => $this->faker->randomElement(['gpt-4', 'claude-2', 'gemini-pro']),
                'temperature' => $this->faker->randomFloat(1, 0, 1),
            ],
            'is_default' => false,
            'fallback_model_id' => null,
        ];
    }

    /**
     * Indicate that the model is default.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function default()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_default' => true,
            ];
        });
    }
}
