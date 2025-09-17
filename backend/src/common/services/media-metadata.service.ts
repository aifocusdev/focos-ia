import { Injectable } from '@nestjs/common';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration_ms?: number;
  size: number;
  mimeType: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
}

@Injectable()
export class MediaMetadataService {
  extractMetadata(file: Express.Multer.File): MediaMetadata {
    const metadata: MediaMetadata = {
      size: file.size,
      mimeType: file.mimetype,
      isImage: this.isImageFile(file.mimetype),
      isVideo: this.isVideoFile(file.mimetype),
      isAudio: this.isAudioFile(file.mimetype),
      isDocument: this.isDocumentFile(file.mimetype),
    };

    // For images, we could extract dimensions here
    if (metadata.isImage) {
      const dimensions = this.getImageDimensions(file.buffer);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;
    }

    // For videos/audio, we could extract duration
    if (metadata.isVideo || metadata.isAudio) {
      // In a real implementation, you would use a library like ffprobe
      // For now, we'll just set some defaults
      metadata.duration_ms = undefined;
    }

    return metadata;
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  private isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  private isDocumentFile(mimeType: string): boolean {
    return mimeType.startsWith('application/') || mimeType === 'text/plain';
  }

  private getImageDimensions(buffer: Buffer): {
    width?: number;
    height?: number;
  } {
    try {
      // Basic image dimension extraction for common formats
      // This is a simplified version - in production, you'd use a proper library like 'sharp'

      if (this.isPNG(buffer)) {
        return this.getPNGDimensions(buffer);
      } else if (this.isJPEG(buffer)) {
        return this.getJPEGDimensions();
      }

      return { width: undefined, height: undefined };
    } catch {
      return { width: undefined, height: undefined };
    }
  }

  private isPNG(buffer: Buffer): boolean {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  private isJPEG(buffer: Buffer): boolean {
    return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
  }

  private getPNGDimensions(buffer: Buffer): { width: number; height: number } {
    if (buffer.length < 24) {
      throw new Error('Invalid PNG');
    }

    // PNG dimensions are stored at bytes 16-23
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return { width, height };
  }

  private getJPEGDimensions(): {
    width?: number;
    height?: number;
  } {
    // JPEG dimension extraction is more complex
    // For now, we'll return undefined and rely on client-side extraction
    return { width: undefined, height: undefined };
  }

  generatePreviewUrl(
    originalUrl: string,
    attachmentKind: string,
  ): string | null {
    // For images, we could generate thumbnail URLs
    if (attachmentKind === 'image') {
      // This would typically point to a thumbnail generation service
      return `${originalUrl}?thumbnail=true&size=300x300`;
    }

    // For videos, we could generate poster frames
    if (attachmentKind === 'video') {
      return `${originalUrl}?poster=true&time=1`;
    }

    return null;
  }
}
