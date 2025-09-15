import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css'],
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @Output() scanResult = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  hasDevices = false;
  hasPermission = false;
  permissionRequested = false;
  permissionDenied = false;
  qrResultString = '';
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;
  scannerEnabled = true;
  loading = true;

  ngOnInit(): void {
    this.requestCameraPermission();
  }

  ngOnDestroy(): void {
    this.scannerEnabled = false;
  }

  async requestCameraPermission(): Promise<void> {
    try {
      this.loading = true;
      this.permissionRequested = true;

      // Request camera permission using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera on mobile
        },
      });

      // If we get here, permission was granted
      this.hasPermission = true;
      this.permissionDenied = false;

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());
    } catch (error: any) {
      console.error('Camera permission error:', error);
      this.hasPermission = false;

      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        this.permissionDenied = true;
      } else if (error.name === 'NotFoundError') {
        // No camera found
        this.hasDevices = false;
      }
    } finally {
      this.loading = false;
    }
  }

  async retryPermissionRequest(): Promise<void> {
    this.permissionDenied = false;
    this.permissionRequested = false;
    await this.requestCameraPermission();
  }

  onCodeResult(resultString: string): void {
    this.qrResultString = resultString;
    this.scanResult.emit(resultString);
    this.scannerEnabled = false;
  }

  onHasPermission(has: boolean): void {
    this.hasPermission = has;
    if (!has && !this.permissionRequested) {
      this.requestCameraPermission();
    }
  }

  onHasDevices(has: boolean): void {
    this.hasDevices = has;
    this.loading = false;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    if (devices.length > 0) {
      this.currentDevice = devices[0];
    }
    this.loading = false;
  }

  onDeviceSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    this.currentDevice = this.availableDevices.find(
      (device) => device.deviceId === value
    );
  }

  closeScanner(): void {
    this.scannerEnabled = false;
    this.close.emit();
  }

  retryScan(): void {
    this.qrResultString = '';
    this.scannerEnabled = true;
  }

  openCameraSettings(): void {
    // Provide instructions for opening camera settings
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let message = 'To enable camera access:\n\n';

    if (isIOS) {
      message += '1. Go to Settings > Safari > Camera\n';
      message += '2. Enable camera access for this website\n';
      message += '3. Refresh the page and try again';
    } else if (isAndroid) {
      message += '1. Tap the camera icon in the address bar\n';
      message += '2. Select "Allow" for camera access\n';
      message += '3. Refresh the page and try again';
    } else {
      message += '1. Click the camera icon in the address bar\n';
      message += '2. Select "Allow" for camera access\n';
      message += '3. Refresh the page and try again';
    }

    alert(message);
  }
}
