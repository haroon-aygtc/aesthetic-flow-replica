<?php

// Test script to verify that the API endpoints are returning data correctly

// Function to make a cURL request
function makeRequest($url, $method = 'GET', $data = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    
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

// Test 1: Get all providers
echo "Test 1: Get all providers\n";
$result = makeRequest($baseUrl . '/providers');
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

// Test 2: Get OpenAI provider models
echo "Test 2: Get OpenAI models\n";
$result = makeRequest($baseUrl . '/providers/openai/models');
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

// Test 3: Get OpenAI provider parameters
echo "Test 3: Get OpenAI parameters\n";
$result = makeRequest($baseUrl . '/providers/openai/parameters');
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