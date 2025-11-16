import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const ensureUploadsDir = async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
};

export const uploadToLocal = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  try {
    await ensureUploadsDir();
    
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);
    
    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);
    
    // Return relative path - Express will serve it
    // In production, this would be the full S3 URL
    return `/uploads/${uniqueFileName}`;
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw new Error('Failed to upload file to local storage');
  }
};

export const deleteFromLocal = async (fileUrl: string): Promise<void> => {
  try {
    // Extract filename from URL (handles both /uploads/filename and http://localhost:port/uploads/filename)
    const fileName = fileUrl.includes('/uploads/') 
      ? fileUrl.split('/uploads/')[1] 
      : fileUrl;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Check if file exists before deleting
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, that's okay
      console.warn(`File not found for deletion: ${filePath}`);
    }
  } catch (error) {
    console.error('Local storage delete error:', error);
    throw new Error('Failed to delete file from local storage');
  }
};

