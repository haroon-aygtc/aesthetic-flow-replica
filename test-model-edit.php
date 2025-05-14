<?php

// Test script to verify that model data can be retrieved for editing

// Function to make a cURL request
function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'response' => $response ? json_decode($response, true) : null,
        'http_code' => $httpCode,
        'error' => $error
    ];
}

$baseUrl = 'http://localhost:8001/api';

// Step 1: Login to get a token
echo "Step 1: Logging in to get a token\n";
$loginData = [
    'email' => 'test@example.com',
    'password' => 'password' // Default test password
];

$result = makeRequest($baseUrl . '/login', 'POST', $loginData);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
    exit(1);
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
    exit(1);
}

$token = $result['response']['token'] ?? null;
if (!$token) {
    echo "No token received in response: " . json_encode($result['response']) . "\n";
    exit(1);
}

echo "Successfully logged in and got token\n\n";

// Step 2: Get all providers (to find provider IDs)
echo "Step 2: Get all providers\n";
$result = makeRequest($baseUrl . '/providers', 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
    exit(1);
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
    exit(1);
}

$providerId = null;
$providerSlug = null;

// Find the OpenAI provider ID
foreach ($result['response']['data'] as $provider) {
    if ($provider['slug'] === 'openai') {
        $providerId = $provider['id'];
        $providerSlug = $provider['slug'];
        echo "Found OpenAI provider with ID: {$providerId}\n";
        break;
    }
}

if (!$providerId) {
    echo "OpenAI provider not found!\n";
    exit(1);
}

// Step 3: Get provider models
echo "\nStep 3: Get provider models for OpenAI\n";
$result = makeRequest($baseUrl . "/providers/{$providerSlug}/models", 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
    exit(1);
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
    exit(1);
}

$modelId = null;
$modelValue = null;

// Get the first model ID
if (!empty($result['response']['data'])) {
    $model = $result['response']['data'][0];
    $modelValue = $model['value'];
    echo "Found model: {$model['label']} (Value: {$modelValue})\n";
    echo "Full model data: " . json_encode($model, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "No models found for OpenAI provider!\n";
    exit(1);
}

// Step 4: Get provider parameters
echo "\nStep 4: Get provider parameters for OpenAI\n";
$result = makeRequest($baseUrl . "/providers/{$providerSlug}/parameters", 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
    exit(1);
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
    exit(1);
}

echo "Parameters for OpenAI:\n";
foreach ($result['response']['data'] as $key => $param) {
    $name = $param['name'] ?? $key;
    $default = $param['default'] ?? 'N/A';
    echo "- {$name} ({$key}): Default: {$default}\n";
}

echo "\nAll data necessary for editing models is available!\n";
echo "The API is returning all the required data to edit AI models.\n"; 