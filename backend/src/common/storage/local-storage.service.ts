import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface FileUploadOptions {
  folder?: string;
  fileName?: string;
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';

    this.ensureUploadDir();
    this.logger.log('Local Storage Service initialized');
  }

  private async ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    const { folder = 'files', fileName } = options;

    try {
      // Create folder if it doesn't exist
      const folderPath = path.join(this.uploadDir, folder);
      if (!fs.existsSync(folderPath)) {
        await mkdir(folderPath, { recursive: true });
      }

      // Generate unique filename if not provided
      const timestamp = new Date().getTime();
      const fileExtension = file.originalname.split('.').pop();
      const finalFileName =
        fileName ||
        `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

      const filePath = path.join(folderPath, finalFileName);
      const relativePath = path.join(folder, finalFileName);

      // Save file to disk
      await writeFile(filePath, file.buffer);

      this.logger.log(`File uploaded successfully: ${relativePath}`);

      return {
        url: `${this.baseUrl}/uploads/${relativePath}`,
        path: relativePath,
        name: finalFileName,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('File upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);

      if (fs.existsSync(fullPath)) {
        await unlink(fullPath);
        this.logger.log(`File deleted successfully: ${filePath}`);
        return true;
      }

      this.logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    } catch (error) {
      this.logger.error('File deletion failed:', error);
      return false;
    }
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/uploads/${filePath}`;
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, filePath);
    return fs.existsSync(fullPath);
  }

  // Helper method to validate file types
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  // Helper method to validate file size (in bytes)
  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // Pre-defined validators for common file types
  isImage(file: Express.Multer.File): boolean {
    return this.validateFileType(file, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]);
  }

  isVideo(file: Express.Multer.File): boolean {
    return this.validateFileType(file, [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
    ]);
  }

  isAudio(file: Express.Multer.File): boolean {
    return this.validateFileType(file, [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
    ]);
  }

  isDocument(file: Express.Multer.File): boolean {
    return this.validateFileType(file, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]);
  }
}