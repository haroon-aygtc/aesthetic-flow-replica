<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Str;

class WebScraperService
{
    /**
     * User agent string for requests
     *
     * @var string
     */
    protected $userAgent = 'Mozilla/5.0 (compatible; KnowledgeBaseBot/1.0; +https://yourwebsite.com/bot)';

    /**
     * Cache time in minutes for scraped content
     *
     * @var int
     */
    protected $cacheTime = 60;

    /**
     * Request delay in microseconds to avoid overloading servers
     *
     * @var int
     */
    protected $requestDelay = 1000000; // 1 second

    /**
     * Scrape content from a website URL.
     *
     * @param string $url
     * @param bool $useCache Whether to use cached results
     * @return array
     */
    public function scrapeUrl(string $url, bool $useCache = true): array
    {
        $cacheKey = 'scraped_url_' . md5($url);

        // Return cached result if available and requested
        if ($useCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            // Validate URL
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                throw new Exception("Invalid URL format");
            }

            // Sleep to respect rate limits
            usleep($this->requestDelay);

            // Get the content with extended timeout and retries
            $response = Http::withHeaders([
                'User-Agent' => $this->userAgent,
                'Accept' => 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language' => 'en-US,en;q=0.9',
            ])->timeout(30)->retry(3, 2000)->get($url);

            if (!$response->successful()) {
                throw new Exception("Failed to fetch URL: HTTP status " . $response->status());
            }

            $html = $response->body();

            // Parse the HTML content
            $content = $this->parseHtml($html);

            // Extract structured data
            $structuredData = $this->extractStructuredData($html);

            // Extract metadata
            $metadata = $this->extractMetadata($html);

            // Combine all data
            $result = [
                'url' => $url,
                'title' => $metadata['title'] ?? '',
                'description' => $metadata['description'] ?? '',
                'content' => $content,
                'metadata' => $metadata,
                'structured_data' => $structuredData,
                'scraped_at' => now()->toIso8601String(),
                'content_type' => $response->header('Content-Type') ?? '',
                'status_code' => $response->status(),
            ];

            // Cache the result
            Cache::put($cacheKey, $result, $this->cacheTime);

            return $result;
        } catch (ConnectionException $e) {
            Log::error('Web scraping connection failed: ' . $e->getMessage(), [
                'url' => $url,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        } catch (Exception $e) {
            Log::error('Web scraping failed: ' . $e->getMessage(), [
                'url' => $url,
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Parse HTML content and extract clean text.
     *
     * @param string $html
     * @return string
     */
    protected function parseHtml(string $html): string
    {
        // Create DOM document
        $dom = new DOMDocument();

        // Suppress warning messages
        libxml_use_internal_errors(true);

        // Load HTML content with encoding handling
        $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));

        // Clear errors
        libxml_clear_errors();

        // Remove unwanted elements
        $this->removeUnwantedTags($dom);

        // Extract main content
        $content = $this->extractMainContent($dom);

        // Clean the text
        $content = $this->cleanText($content);

        return $content;
    }

    /**
     * Remove unwanted tags from DOM.
     *
     * @param DOMDocument $dom
     */
    protected function removeUnwantedTags(DOMDocument $dom): void
    {
        $unwantedTags = [
            'script', 'style', 'noscript', 'iframe',
            'nav', 'footer', 'header', 'aside',
            'form', 'button', 'svg', 'img',
            'meta', 'link', 'hr', 'br'
        ];

        foreach ($unwantedTags as $tag) {
            $elements = $dom->getElementsByTagName($tag);

            // Remove all elements of this tag type (in reverse to avoid index shifting)
            for ($i = $elements->length - 1; $i >= 0; $i--) {
                $element = $elements->item($i);
                if ($element && $element->parentNode) {
                    $element->parentNode->removeChild($element);
                }
            }
        }

        // Remove elements by class or id pattern
        $xpath = new DOMXPath($dom);
        $unwantedPatterns = [
            "//*[contains(@class, 'cookie')]",
            "//*[contains(@class, 'popup')]",
            "//*[contains(@class, 'banner')]",
            "//*[contains(@class, 'ad-')]",
            "//*[contains(@class, 'advertisement')]",
            "//*[contains(@id, 'cookie')]",
            "//*[contains(@id, 'banner')]",
            "//*[contains(@id, 'popup')]",
            "//*[contains(@id, 'ad-')]"
        ];

        foreach ($unwantedPatterns as $pattern) {
            $elements = $xpath->query($pattern);
            foreach ($elements as $element) {
                if ($element->parentNode) {
                    $element->parentNode->removeChild($element);
                }
            }
        }
    }

    /**
     * Extract the main content from the DOM.
     *
     * @param DOMDocument $dom
     * @return string
     */
    protected function extractMainContent(DOMDocument $dom): string
    {
        $xpath = new DOMXPath($dom);

        // Score-based content extraction (readability algorithm simplified)
        $contentContainers = [
            // Semantic main content elements (highest priority)
            "//main" => 10,
            "//article" => 9,
            "//section[contains(@class, 'content')]" => 8,

            // Common content containers
            "//div[@id='content']" => 7,
            "//div[contains(@class, 'content')]" => 6,
            "//div[@id='main']" => 5,
            "//div[contains(@class, 'main')]" => 5,
            "//div[@role='main']" => 5,

            // Content by text density (more text = more likely to be content)
            "//div[string-length(normalize-space(.)) > 1000]" => 4,

            // Common content patterns
            "//div[contains(@class, 'post')]" => 3,
            "//div[contains(@class, 'article')]" => 3,
            "//div[contains(@class, 'entry')]" => 3,
            "//div[contains(@class, 'blog')]" => 2
        ];

        $bestContainer = null;
        $bestScore = -1;

        foreach ($contentContainers as $query => $score) {
            $nodes = $xpath->query($query);

            if ($nodes->length > 0) {
                // Find the container with the most text content
                foreach ($nodes as $node) {
                    $textLength = strlen(trim($node->textContent));
                    $paragraphCount = $xpath->query(".//p", $node)->length;

                    // Score based on text length, paragraph count and query priority
                    $nodeScore = $score + ($textLength / 1000) + ($paragraphCount * 0.5);

                    if ($nodeScore > $bestScore) {
                        $bestScore = $nodeScore;
                        $bestContainer = $node;
                    }
                }
            }
        }

        if ($bestContainer) {
            return $dom->saveHTML($bestContainer);
        }

        // If no specific content container found, get body and remove obvious non-content areas
        $body = $dom->getElementsByTagName('body')->item(0);
        return $body ? $dom->saveHTML($body) : $dom->saveHTML();
    }

    /**
     * Clean text content.
     *
     * @param string $text
     * @return string
     */
    protected function cleanText(string $text): string
    {
        // Strip HTML tags but preserve paragraphs and lists as new lines
        $text = preg_replace('/<(p|br|\/p|h1|h2|h3|h4|h5|li)[^>]*>/i', "\n", $text);
        $text = strip_tags($text);

        // Convert HTML entities to characters
        $text = html_entity_decode($text);

        // Replace multiple newlines with a single one
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        // Remove excess whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text);

        // Trim whitespace
        $text = trim($text);

        return $text;
    }

    /**
     * Extract structured data from HTML.
     *
     * @param string $html
     * @return array
     */
    protected function extractStructuredData(string $html): array
    {
        $structuredData = [];

        // Match JSON-LD data
        preg_match_all('/<script[^>]*type=["|\']application\/ld\+json["|\'][^>]*>(.*?)<\/script>/si', $html, $matches);

        if (isset($matches[1]) && !empty($matches[1])) {
            foreach ($matches[1] as $jsonData) {
                try {
                    $data = json_decode($jsonData, true);
                    if ($data) {
                        $structuredData[] = $data;
                    }
                } catch (Exception $e) {
                    // Skip invalid JSON
                    continue;
                }
            }
        }

        return $structuredData;
    }

    /**
     * Extract metadata from HTML.
     *
     * @param string $html
     * @return array
     */
    protected function extractMetadata(string $html): array
    {
        $metadata = [];

        // Create DOM document
        $dom = new DOMDocument();

        // Suppress warning messages
        libxml_use_internal_errors(true);

        // Load HTML content
        $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));

        // Clear errors
        libxml_clear_errors();

        // Create XPath
        $xpath = new DOMXPath($dom);

        // Extract title
        $titleNodes = $xpath->query('//title');
        if ($titleNodes->length > 0) {
            $metadata['title'] = trim($titleNodes->item(0)->textContent);
        }

        // Extract all meta tags
        $metaNodes = $xpath->query("//meta");
        if ($metaNodes->length > 0) {
            foreach ($metaNodes as $meta) {
                $name = $meta->getAttribute('name') ?: $meta->getAttribute('property');
                $content = $meta->getAttribute('content');

                if ($name && $content) {
                    $metadata[$name] = $content;
                }
            }
        }

        // Extract canonical URL
        $canonicalNodes = $xpath->query("//link[@rel='canonical']");
        if ($canonicalNodes->length > 0) {
            $metadata['canonical_url'] = $canonicalNodes->item(0)->getAttribute('href');
        }

        // Extract language
        $htmlNode = $dom->getElementsByTagName('html')->item(0);
        if ($htmlNode) {
            $metadata['language'] = $htmlNode->getAttribute('lang');
        }

        return $metadata;
    }

    /**
     * Export scraped data to different formats
     *
     * @param array $data Scraped data
     * @param string $format Format to export (json, csv, text)
     * @return string
     */
    public function exportData(array $data, string $format): string
    {
        switch (strtolower($format)) {
            case 'json':
                return json_encode($data, JSON_PRETTY_PRINT);

            case 'csv':
                $output = "";
                // Add headers
                $output .= "url,title,description,content_length,scraped_at\n";
                // Add data row
                $output .= '"' . $data['url'] . '",';
                $output .= '"' . str_replace('"', '""', $data['title']) . '",';
                $output .= '"' . str_replace('"', '""', $data['description']) . '",';
                $output .= '"' . strlen($data['content']) . '",';
                $output .= '"' . $data['scraped_at'] . '"';
                return $output;

            case 'text':
                $output = "URL: " . $data['url'] . "\n";
                $output .= "Title: " . $data['title'] . "\n";
                $output .= "Description: " . $data['description'] . "\n";
                $output .= "Scraped at: " . $data['scraped_at'] . "\n\n";
                $output .= "Content:\n" . $data['content'];
                return $output;

            case 'raw':
            default:
                return $data['content'];
        }
    }
}
