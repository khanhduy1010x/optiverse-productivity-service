import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export enum FlashcardFormat {
  QA = 'qa',                    // Question & Answer
  VOCABULARY = 'vocabulary',    // Word & Definition
  TRUE_FALSE = 'true_false',    // True/False Statements
  FILL_BLANK = 'fill_blank',    // Fill in the Blank
}

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
   * @param format Format of flashcards to generate (default: qa)
   * @returns Array of generated flashcards with front and back content
   */
  async generateFlashcardsFromText(
    pdfText: string,
    numFlashcards: number = 10,
    format: FlashcardFormat = FlashcardFormat.QA,
  ): Promise<GeneratedFlashcard[]> {
    try {
      if (!pdfText || pdfText.trim().length === 0) {
        throw new BadRequestException('No text provided for flashcard generation');
      }

      const prompt = this.buildPrompt(pdfText, numFlashcards, format);

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
   * @param format Format of flashcards to generate
   * @returns Formatted prompt string
   */
  private buildPrompt(text: string, numFlashcards: number, format: FlashcardFormat): string {
    // Limit text to prevent token overload
    const maxChars = 8000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

    const formatInstructions = this.getFormatInstructions(format);

    return `You are an educational expert. Based on the following text, generate exactly ${numFlashcards} educational flashcards in the specified format.

${formatInstructions}

Text to create flashcards from:
${truncatedText}`;
  }

  /**
   * Get format-specific instructions and examples
   * @param format The flashcard format to use
   * @returns Format instructions with examples
   */
  private getFormatInstructions(format: FlashcardFormat): string {
    switch (format) {
      case FlashcardFormat.VOCABULARY:
        return `Format: Vocabulary (Word & Definition)
Create vocabulary flashcards with a word/term on the front and its definition on the back.

Format your response as a JSON array with objects containing "front" (the word/term) and "back" (the definition) properties. Return ONLY valid JSON, no additional text.

Example format:
[
  {
    "front": "Photosynthesis",
    "back": "A process where plants convert light energy into chemical energy to synthesize glucose"
  },
  {
    "front": "Mitochondria",
    "back": "The powerhouse of the cell; organelle responsible for cellular respiration and ATP production"
  },
  {
    "front": "Osmosis",
    "back": "The movement of water across a semipermeable membrane from an area of higher water concentration to lower water concentration"
  }
]`;

      case FlashcardFormat.TRUE_FALSE:
        return `Format: True/False Statements
Create true/false flashcards with statements on the front and the answer (true or false) on the back.

Format your response as a JSON array with objects containing "front" (the statement) and "back" (either "True" or "False") properties. Return ONLY valid JSON, no additional text.

Example format:
[
  {
    "front": "Photosynthesis occurs in the mitochondria of plant cells",
    "back": "False"
  },
  {
    "front": "The Great Wall of China is visible from space with the naked eye",
    "back": "False"
  },
  {
    "front": "DNA contains the genetic instructions for building proteins",
    "back": "True"
  }
]`;

      case FlashcardFormat.FILL_BLANK:
        return `Format: Fill in the Blank
Create fill-in-the-blank flashcards with sentences containing a blank (represented by ___) on the front and the answer on the back.

Format your response as a JSON array with objects containing "front" (the sentence with a blank) and "back" (the missing word/phrase) properties. Return ONLY valid JSON, no additional text.

Example format:
[
  {
    "front": "The process by which plants convert sunlight into chemical energy is called ___",
    "back": "photosynthesis"
  },
  {
    "front": "The ___ is the powerhouse of the cell and produces ATP",
    "back": "mitochondria"
  },
  {
    "front": "Water moves across a semipermeable membrane through a process called ___",
    "back": "osmosis"
  }
]`;

      case FlashcardFormat.QA:
      default:
        return `Format: Question & Answer
Create question and answer flashcards with clear questions on the front and concise answers on the back.

Format your response as a JSON array with objects containing "front" (the question) and "back" (the answer) properties. Return ONLY valid JSON, no additional text.

Example format:
[
  {
    "front": "What is the process by which plants convert light energy into chemical energy?",
    "back": "Photosynthesis - a metabolic process where light energy is used to synthesize glucose from CO2 and water"
  },
  {
    "front": "Which organelle is responsible for cellular respiration and ATP production?",
    "back": "The mitochondria, often called the powerhouse of the cell"
  },
  {
    "front": "What is osmosis?",
    "back": "The movement of water molecules across a semipermeable membrane from higher to lower water concentration"
  }
]`;
    }
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
