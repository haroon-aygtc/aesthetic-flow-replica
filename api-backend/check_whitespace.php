<?php

// Function to check if a file has whitespace before the opening PHP tag
function checkFile($filePath) {
    $content = file_get_contents($filePath);
    
    // Check if there's whitespace before the opening PHP tag
    if (preg_match('/^\s+<\?php/', $content)) {
        echo "File has whitespace before PHP tag: $filePath\n";
        
        // Fix the file by removing whitespace
        $fixedContent = preg_replace('/^\s+<\?php/', '<?php', $content);
        file_put_contents($filePath, $fixedContent);
        echo "Fixed file: $filePath\n";
    }
}

// Function to recursively scan directories
function scanDirectory($dir) {
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $path = $dir . '/' . $file;
        
        if (is_dir($path)) {
            scanDirectory($path);
        } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
            checkFile($path);
        }
    }
}

// Start scanning from the app directory
scanDirectory(__DIR__ . '/app');

echo "Scan complete!\n";
