import {
  Injectable,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  LocalStorageService,
  FileUploadResult,
  FileUploadOptions,
} from '../storage/local-storage.service';

export interface UploadValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class UploadService {
  constructor(private readonly storageService: LocalStorageService) {}

  private readonly defaultValidation: UploadValidationOptions = {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
  };

  async uploadSingle(
    file: Express.Multer.File,
    options: FileUploadOptions & UploadValidationOptions = {},
  ): Promise<FileUploadResult> {
    this.validateFile(file, options);

    const uploadOptions: FileUploadOptions = {
      folder: options.folder || 'uploads',
      fileName: options.fileName,
    };

    return this.storageService.uploadFile(file, uploadOptions);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    options: FileUploadOptions & UploadValidationOptions = {},
  ): Promise<FileUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate all files first
    files.forEach((file) => this.validateFile(file, options));

    const uploadOptions: FileUploadOptions = {
      folder: options.folder || 'uploads',
    };

    return this.storageService.uploadMultipleFiles(files, uploadOptions);
  }

  private validateFile(
    file: Express.Multer.File,
    options: UploadValidationOptions = {},
  ): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const validation = { ...this.defaultValidation, ...options };

    // Size validation
    if (validation.maxSize && file.size > validation.maxSize) {
      const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024));
      throw new BadRequestException(
        `File size exceeds limit of ${maxSizeMB}MB`,
      );
    }

    // MIME type validation
    if (validation.allowedTypes) {
      // Extract base MIME type (remove parameters like codecs)
      const baseMimeType = file.mimetype.split(';')[0].trim();

      if (!validation.allowedTypes.includes(baseMimeType)) {
        throw new UnsupportedMediaTypeException(
          `File type ${file.mimetype} is not allowed`,
        );
      }
    }

    // Extension validation
    if (validation.allowedExtensions) {
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (
        !fileExtension ||
        !validation.allowedExtensions.includes(fileExtension)
      ) {
        throw new UnsupportedMediaTypeException(
          `File extension .${fileExtension} is not allowed`,
        );
      }
    }
  }

  // Helper methods for specific file types
  async uploadImage(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    return this.uploadSingle(file, {
      ...options,
      folder: options.folder || 'images',
      allowedTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB for images
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    return this.uploadSingle(file, {
      ...options,
      folder: options.folder || 'videos',
      allowedTypes: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/webm',
      ],
      maxSize: 100 * 1024 * 1024, // 100MB for videos
    });
  }

  async uploadAudio(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    return this.uploadSingle(file, {
      ...options,
      folder: options.folder || 'audio',
      allowedTypes: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
      ],
      maxSize: 25 * 1024 * 1024, // 25MB for audio
    });
  }

  async uploadDocument(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    return this.uploadSingle(file, {
      ...options,
      folder: options.folder || 'documents',
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ],
      maxSize: 20 * 1024 * 1024, // 20MB for documents
    });
  }
}
