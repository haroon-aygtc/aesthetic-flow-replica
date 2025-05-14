<?php

// Test script to authenticate with the API and then test endpoints

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

// Step 2: Test providers endpoint with authentication
echo "Step 2: Get providers with authentication\n";
$result = makeRequest($baseUrl . '/providers', 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
} else {
    echo "Success! Found " . count($result['response']['data']) . " providers\n";
    echo "First provider: " . $result['response']['data'][0]['name'] . "\n";
}
echo "\n";

// Step 3: Test OpenAI models endpoint with authentication
echo "Step 3: Get OpenAI models with authentication\n";
$result = makeRequest($baseUrl . '/providers/openai/models', 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
} else {
    echo "Success! Found " . count($result['response']['data']) . " models\n";
    echo "Sample model: " . json_encode($result['response']['data'][0]) . "\n";
}
echo "\n";

// Step 4: Test OpenAI parameters endpoint with authentication
echo "Step 4: Get OpenAI parameters with authentication\n";
$result = makeRequest($baseUrl . '/providers/openai/parameters', 'GET', null, $token);
echo "HTTP Code: " . $result['http_code'] . "\n";

if ($result['error']) {
    echo "Error: " . $result['error'] . "\n";
} elseif ($result['http_code'] != 200) {
    echo "Error response: " . json_encode($result['response']) . "\n";
} else {
    echo "Success! Found parameters\n";
    echo "Temperature parameter: " . json_encode($result['response']['data']['temperature']) . "\n";
    echo "Max Tokens parameter: " . json_encode($result['response']['data']['maxTokens']) . "\n";
} 