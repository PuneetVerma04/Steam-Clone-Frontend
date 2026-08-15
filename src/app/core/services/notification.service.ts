import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * NotificationService wraps ngx-toastr.
 * ALWAYS use this service — never inject ToastrService directly in components or other services.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title = 'Success'): void {
    this.toastr.success(message, title);
  }

  error(message: string, title = 'Error'): void {
    this.toastr.error(message, title);
  }

  info(message: string, title = 'Info'): void {
    this.toastr.info(message, title);
  }

  warning(message: string, title = 'Warning'): void {
    this.toastr.warning(message, title);
  }
}
