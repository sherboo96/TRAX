import { Injectable } from '@angular/core';

export interface QRCodeData {
  type: 'course_enrollment' | 'course_attendance' | 'course_info' | 'generic';
  courseId?: number;
  courseTitle?: string;
  data?: any;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class QRService {
  constructor() {}

  /**
   * Generate QR code data for course enrollment
   */
  generateEnrollmentQR(courseId: number, courseTitle: string): string {
    const qrData: QRCodeData = {
      type: 'course_enrollment',
      courseId: courseId,
      courseTitle: courseTitle,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  /**
   * Generate QR code data for course attendance
   */
  generateAttendanceQR(courseId: number, courseTitle: string): string {
    const qrData: QRCodeData = {
      type: 'course_attendance',
      courseId: courseId,
      courseTitle: courseTitle,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  /**
   * Generate QR code data for course information
   */
  generateCourseInfoQR(
    courseId: number,
    courseTitle: string,
    additionalInfo?: any
  ): string {
    const qrData: QRCodeData = {
      type: 'course_info',
      courseId: courseId,
      courseTitle: courseTitle,
      data: additionalInfo,
      timestamp: Date.now(),
    };
    return JSON.stringify(qrData);
  }

  /**
   * Parse QR code data
   */
  parseQRData(qrString: string): QRCodeData | null {
    try {
      const parsed = JSON.parse(qrString);
      if (
        parsed.type &&
        [
          'course_enrollment',
          'course_attendance',
          'course_info',
          'generic',
        ].includes(parsed.type)
      ) {
        return parsed as QRCodeData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate if QR code is for a specific course
   */
  isQRForCourse(qrString: string, courseId: number): boolean {
    const qrData = this.parseQRData(qrString);
    return qrData ? qrData.courseId === courseId : false;
  }

  /**
   * Get QR code type
   */
  getQRType(qrString: string): string | null {
    const qrData = this.parseQRData(qrString);
    return qrData ? qrData.type : null;
  }

  /**
   * Generate a test QR code URL for development
   */
  generateTestQRUrl(qrData: string): string {
    // Use a QR code generation service
    const encodedData = encodeURIComponent(qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
  }
}
