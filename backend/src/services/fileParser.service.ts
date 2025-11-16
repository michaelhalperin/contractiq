import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedText {
  text: string;
  metadata?: {
    pages?: number;
    [key: string]: unknown;
  };
}

export const parsePDF = async (buffer: Buffer): Promise<ParsedText> => {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const parseDOCX = async (buffer: Buffer): Promise<ParsedText> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      metadata: {},
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const parseText = async (buffer: Buffer): Promise<ParsedText> => {
  return {
    text: buffer.toString('utf-8'),
    metadata: {},
  };
};

export const extractTextFromFile = async (
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'txt'
): Promise<ParsedText> => {
  switch (fileType) {
    case 'pdf':
      return parsePDF(buffer);
    case 'docx':
      return parseDOCX(buffer);
    case 'txt':
      return parseText(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

