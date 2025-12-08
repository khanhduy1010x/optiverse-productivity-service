import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

interface GeneratedFlashcard {
  front: string;
  back: string;
}

@Injectable()
export class GoogleGenAiService {
  private readonly logger = new Logger(GoogleGenAiService.name);
  private ai: any;

  constructor() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('GOOGLE_GENAI_API_KEY environment variable is not set');
    }
    // Initialize Google GenAI client using correct API
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate flashcards from extracted PDF text using Google Generative AI
   * @param pdfText The extracted text from PDF
   * @param numFlashcards Number of flashcards to generate (default: 10)
   * @returns Array of generated flashcards with front and back content
   */
  async generateFlashcardsFromText(pdfText: string, numFlashcards: number = 10): Promise<GeneratedFlashcard[]> {
    try {
      if (!pdfText || pdfText.trim().length === 0) {
        throw new BadRequestException('No text provided for flashcard generation');
      }

      const prompt = this.buildPrompt(pdfText, numFlashcards);

      // Use correct API from @google/genai
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text;

      this.logger.debug(`Generated content from AI: ${responseText.substring(0, 100)}...`);

      const flashcards = this.parseFlashcardResponse(responseText);

      if (flashcards.length === 0) {
        throw new BadRequestException('Failed to generate flashcards from the provided text');
      }

      return flashcards;
    } catch (error) {
      this.logger.error(`Error generating flashcards: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate flashcards: ${error.message}`);
    }
  }

  /**
   * Build a prompt for the AI model to generate flashcards
   * @param text The extracted text from PDF
   * @param numFlashcards Number of flashcards to generate
   * @returns Formatted prompt string
   */
  private buildPrompt(text: string, numFlashcards: number): string {
    // Limit text to prevent token overload
    const maxChars = 8000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

    return `You are an educational expert. Based on the following text, generate exactly ${numFlashcards} educational flashcards. Each flashcard should have a clear question on the front and a concise answer on the back.

Format your response as a JSON array with objects containing "front" and "back" properties. Return ONLY valid JSON, no additional text.

Example format:
[
  {
    "front": "What is the capital of France?",
    "back": "Paris"
  },
  {
    "front": "What is photosynthesis?",
    "back": "A process where plants convert light energy into chemical energy"
  }
]

Text to create flashcards from:
${truncatedText}`;
  }

  /**
   * Parse the AI response and extract flashcard data
   * @param responseText The raw response from the AI model
   * @returns Array of parsed flashcards
   */
  private parseFlashcardResponse(responseText: string): GeneratedFlashcard[] {
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const flashcards = JSON.parse(jsonMatch[0]);

      // Validate flashcard structure
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }

      const validFlashcards = flashcards.filter(
        (card) =>
          card.front &&
          card.back &&
          typeof card.front === 'string' &&
          typeof card.back === 'string' &&
          card.front.trim().length > 0 &&
          card.back.trim().length > 0,
      );

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards found in response');
      }

      return validFlashcards;
    } catch (error) {
      this.logger.error(`Error parsing flashcard response: ${error.message}`);
      throw new BadRequestException(`Failed to parse generated flashcards: ${error.message}`);
    }
  }
}
