<?php

namespace Tests\Feature;

use App\Models\AIModel;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AIModelControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_can_get_all_ai_models()
    {
        AIModel::factory()->count(3)->create();

        $response = $this->getJson('/ai-models');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'success'
                 ]);

        $this->assertTrue($response['success']);
    }

    public function test_can_create_ai_model()
    {
        $data = [
            'name' => $this->faker->name,
            'provider' => $this->faker->company,
            'description' => $this->faker->sentence,
            'is_default' => false,
            'fallback_model_id' => null,
        ];

        $response = $this->postJson('/ai-models', $data);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name',
                         'provider',
                         'description'
                     ],
                     'success'
                 ]);

        $this->assertTrue($response['success']);
        $this->assertDatabaseHas('ai_models', ['name' => $data['name']]);
    }

    public function test_can_get_single_ai_model()
    {
        $model = AIModel::factory()->create();

        $response = $this->getJson("/ai-models/{$model->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name',
                         'provider'
                     ],
                     'success'
                 ]);

        $this->assertTrue($response['success']);
    }

    public function test_can_update_ai_model()
    {
        $model = AIModel::factory()->create();
        $newName = 'Updated Model Name';

        $response = $this->putJson("/ai-models/{$model->id}", [
            'name' => $newName
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'success'
                 ]);

        $this->assertTrue($response['success']);
        $this->assertEquals($newName, $response['data']['name']);
        $this->assertDatabaseHas('ai_models', ['id' => $model->id, 'name' => $newName]);
    }

    public function test_can_delete_ai_model()
    {
        $model = AIModel::factory()->create();

        $response = $this->deleteJson("/ai-models/{$model->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('ai_models', ['id' => $model->id]);
    }

    public function test_validation_works_for_create()
    {
        $response = $this->postJson("/ai-models", [
            // Missing required fields
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure([
                     'errors',
                     'success'
                 ]);

        $this->assertFalse($response['success']);
    }

    public function test_can_test_connection()
    {
        $model = AIModel::factory()->create();

        $response = $this->postJson("/ai-models/{$model->id}/test");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message'
                 ]);

        $this->assertTrue($response['success']);
    }
}
