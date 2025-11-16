import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, S3_BUCKET_NAME } from '../config/aws.js';
import { Readable } from 'stream';

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    const key = `contracts/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await getS3Client().send(command);
    
    // Return the S3 URL
    return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split('.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL');
    }
    const key = urlParts[1];

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await getS3Client().send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

export const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};

