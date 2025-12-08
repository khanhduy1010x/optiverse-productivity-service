import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfProcessingService {
  private readonly logger = new Logger(PdfProcessingService.name);

  /**
   * Extract text content from a PDF file buffer
   * @param pdfBuffer The PDF file as a buffer
   * @returns Extracted text from the PDF
   */
  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new BadRequestException('PDF file is empty');
      }

      // Use correct pdf-parse v2.4.5 API
      const parser = new PDFParse({ data: pdfBuffer });
      const result = await parser.getText();

      if (!result.text || result.text.trim().length === 0) {
        throw new BadRequestException('No text content found in PDF');
      }

      this.logger.debug(`Extracted text from PDF`);
      return result.text;
    } catch (error) {
      this.logger.error(`Error parsing PDF: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to process PDF file: ${error.message}`);
    }
  }

  /**
   * Clean and prepare extracted text for AI processing
   * @param text Raw extracted text from PDF
   * @returns Cleaned text
   */
  cleanText(text: string): string {
    // Remove extra whitespace and newlines
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }
}
