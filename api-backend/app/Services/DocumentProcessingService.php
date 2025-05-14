<?php

namespace App\Services;

use App\Models\KnowledgeDocument;
use App\Models\DocumentEmbedding;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DocumentProcessingService
{
    protected $embeddingService;
    
    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }
    
    public function processDocument(KnowledgeDocument $document)
    {
        try {
            // Extract text from document
            $text = $this->extractText($document);
            
            // Update document with extracted content
            $document->content = $text;
            $document->status = 'processing_embeddings';
            $document->save();
            
            // Chunk the text
            $chunks = $this->chunkText($text);
            
            // Generate embeddings for each chunk
            $this->generateEmbeddings($document, $chunks);
            
            // Update document status
            $document->status = 'processed';
            $document->save();
            
            return true;
        } catch (\Exception $e) {
            Log::error('Document processing failed: ' . $e->getMessage(), [
                'document_id' => $document->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            $document->status = 'failed';
            $document->metadata = array_merge($document->metadata ?? [], [
                'error' => $e->getMessage()
            ]);
            $document->save();
            
            return false;
        }
    }
    
    protected function extractText(KnowledgeDocument $document)
    {
        $filePath = Storage::disk('public')->path(str_replace('/storage/', '', $document->url));
        
        switch ($document->type) {
            case 'application/pdf':
                return $this->extractFromPdf($filePath);
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return $this->extractFromDocx($filePath);
            case 'text/plain':
                return file_get_contents($filePath);
            case 'text/csv':
                return $this->extractFromCsv($filePath);
            case 'application/json':
                return $this->extractFromJson($filePath);
            case 'text/html':
                return $this->extractFromHtml($filePath);
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return $this->extractFromXlsx($filePath);
            default:
                throw new \Exception("Unsupported file type: {$document->type}");
        }
    }
    
    protected function extractFromPdf($filePath)
    {
        // Using Smalot PDF Parser (requires installation)
        // composer require smalot/pdfparser
        if (!class_exists('\\Smalot\\PdfParser\\Parser')) {
            throw new \Exception('PDF Parser not available. Please install smalot/pdfparser package.');
        }
        
        $parser = new \Smalot\PdfParser\Parser();
        $pdf = $parser->parseFile($filePath);
        return $pdf->getText();
    }
    
    protected function extractFromDocx($filePath)
    {
        // Using PhpWord (requires installation)
        // composer require phpoffice/phpword
        if (!class_exists('\\PhpOffice\\PhpWord\\IOFactory')) {
            throw new \Exception('PhpWord not available. Please install phpoffice/phpword package.');
        }
        
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($filePath);
        $text = '';
        
        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                }
            }
        }
        
        return $text;
    }
    
    protected function extractFromCsv($filePath)
    {
        $text = '';
        if (($handle = fopen($filePath, "r")) !== false) {
            while (($data = fgetcsv($handle)) !== false) {
                $text .= implode(" ", $data) . "\n";
            }
            fclose($handle);
        }
        return $text;
    }
    
    protected function extractFromJson($filePath)
    {
        $json = file_get_contents($filePath);
        $data = json_decode($json, true);
        
        // Recursively extract text from JSON
        return $this->extractTextFromArray($data);
    }
    
    protected function extractTextFromArray($array)
    {
        $text = '';
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $text .= $key . ': ' . $this->extractTextFromArray($value) . "\n";
            } else if (is_string($value)) {
                $text .= $key . ': ' . $value . "\n";
            }
        }
        return $text;
    }
    
    protected function extractFromHtml($filePath)
    {
        $html = file_get_contents($filePath);
        return strip_tags($html);
    }
    
    protected function extractFromXlsx($filePath)
    {
        // Using PhpSpreadsheet (requires installation)
        // composer require phpoffice/phpspreadsheet
        if (!class_exists('\\PhpOffice\\PhpSpreadsheet\\IOFactory')) {
            throw new \Exception('PhpSpreadsheet not available. Please install phpoffice/phpspreadsheet package.');
        }
        
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
        $text = '';
        
        foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
            $text .= 'Worksheet: ' . $worksheet->getTitle() . "\n";
            
            foreach ($worksheet->getRowIterator() as $row) {
                $rowText = '';
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);
                
                foreach ($cellIterator as $cell) {
                    $rowText .= $cell->getValue() . "\t";
                }
                
                $text .= trim($rowText) . "\n";
            }
            
            $text .= "\n";
        }
        
        return $text;
    }
    
    protected function chunkText($text, $maxChunkSize = 1000, $overlapSize = 100)
    {
        // More sophisticated chunking with overlap
        $paragraphs = explode("\n\n", $text);
        $chunks = [];
        $currentChunk = '';
        $currentSize = 0;
        
        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph)) continue;
            
            $paragraphSize = strlen($paragraph);
            
            if ($currentSize + $paragraphSize <= $maxChunkSize) {
                // Add paragraph to current chunk
                $currentChunk .= $paragraph . "\n\n";
                $currentSize += $paragraphSize + 2; // +2 for the newlines
            } else {
                // Current chunk is full, save it
                if (!empty($currentChunk)) {
                    $chunks[] = trim($currentChunk);
                }
                
                // Start a new chunk
                // If the paragraph is too large, split it further
                if ($paragraphSize > $maxChunkSize) {
                    $subChunks = $this->splitLargeParagraph($paragraph, $maxChunkSize, $overlapSize);
                    foreach ($subChunks as $subChunk) {
                        $chunks[] = $subChunk;
                    }
                    $currentChunk = '';
                    $currentSize = 0;
                } else {
                    // Start new chunk with this paragraph
                    $currentChunk = $paragraph . "\n\n";
                    $currentSize = $paragraphSize + 2;
                }
            }
        }
        
        // Add the last chunk if not empty
        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }
        
        // Add overlaps between chunks
        if (count($chunks) > 1 && $overlapSize > 0) {
            $chunksWithOverlap = [];
            for ($i = 0; $i < count($chunks); $i++) {
                if ($i > 0) {
                    // Get end of previous chunk for overlap
                    $prevChunk = $chunks[$i-1];
                    $overlap = substr($prevChunk, -$overlapSize);
                    
                    // Add overlap to beginning of current chunk
                    $chunks[$i] = $overlap . "...\n" . $chunks[$i];
                }
                $chunksWithOverlap[] = $chunks[$i];
            }
            return $chunksWithOverlap;
        }
        
        return $chunks;
    }
    
    protected function splitLargeParagraph($paragraph, $maxChunkSize, $overlapSize)
    {
        $chunks = [];
        $paragraphLength = strlen($paragraph);
        $position = 0;
        
        while ($position < $paragraphLength) {
            $chunkSize = min($maxChunkSize, $paragraphLength - $position);
            $chunk = substr($paragraph, $position, $chunkSize);
            
            // Try to end at a sentence boundary
            $lastPeriod = strrpos($chunk, '.');
            if ($lastPeriod !== false && $lastPeriod > $maxChunkSize * 0.7) {
                $chunk = substr($chunk, 0, $lastPeriod + 1);
                $chunkSize = $lastPeriod + 1;
            }
            
            $chunks[] = $chunk;
            $position += $chunkSize - $overlapSize;
            
            // Ensure we don't get stuck
            if ($chunkSize <= $overlapSize) {
                $position += $overlapSize;
            }
        }
        
        return $chunks;
    }
    
    protected function generateEmbeddings(KnowledgeDocument $document, array $chunks)
    {
        foreach ($chunks as $index => $chunk) {
            try {
                $embedding = $this->embeddingService->generateEmbedding($chunk);
                
                DocumentEmbedding::create([
                    'document_id' => $document->id,
                    'content_chunk' => $chunk,
                    'chunk_index' => $index,
                    'embedding_model' => $embedding['model'],
                    'embedding_vector' => $embedding['vector'],
                    'metadata' => [
                        'chunk_size' => strlen($chunk),
                        'document_name' => $document->name,
                        'document_category' => $document->category
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to generate embedding for chunk', [
                    'document_id' => $document->id,
                    'chunk_index' => $index,
                    'error' => $e->getMessage()
                ]);
                // Continue with other chunks
            }
        }
    }
}
