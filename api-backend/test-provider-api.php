<?php

// Test script for API endpoints

// First, make a request to get a token
$loginData = [
    'email' => 'test@example.com',
    'password' => 'password'
];

echo "Attempting to login...\n";
$ch = curl_init('http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode != 200) {
    echo "Login failed with HTTP code $httpCode.\n";
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);
if (!isset($data['token'])) {
    echo "Login failed. No token received.\n";
    echo "Response: $response\n";
    exit(1);
}

$token = $data['token'];
echo "Login successful. Got token.\n";

// Now make a request to get the providers
echo "\nFetching providers...\n";
$ch = curl_init('http://localhost:8000/api/providers');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode != 200) {
    echo "Failed to fetch providers with HTTP code $httpCode.\n";
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);
echo "Fetched providers: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";

// Get OpenAI models
echo "\nFetching OpenAI models...\n";
$ch = curl_init('http://localhost:8000/api/providers/openai/models');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode != 200) {
    echo "Failed to fetch models with HTTP code $httpCode.\n";
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);
echo "Fetched OpenAI models: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";

// Get OpenAI parameters
echo "\nFetching OpenAI parameters...\n";
$ch = curl_init('http://localhost:8000/api/providers/openai/parameters');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode != 200) {
    echo "Failed to fetch parameters with HTTP code $httpCode.\n";
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);
echo "Fetched OpenAI parameters: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";

echo "\nAll tests completed successfully!\n"; 