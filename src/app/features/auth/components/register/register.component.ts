import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  serverError: string | null = null;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  private returnUrl = '/games';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // returnUrl handling per D-07
    const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/games';
    this.returnUrl = (rawReturnUrl.startsWith('http') || rawReturnUrl.startsWith('//'))
      ? '/games'
      : rawReturnUrl;

    // Reactive form per D-05
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: [RegisterComponent.passwordMatchValidator],
    });

    // Clear server error on field edit per D-11
    this.registerForm.valueChanges.subscribe(() => {
      if (this.serverError) {
        this.serverError = null;
      }
    });
  }

  /**
   * Cross-field validator per D-05: checks password === confirmPassword.
   * Applied at FormGroup level. Sets { passwordMismatch: true } on the group.
   */
  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.serverError = null;

    this.authService.register(this.registerForm.value).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: () => {
        // D-06: auto-login handled by AuthService.register() which stores token and updates currentUser$
        // D-08: welcome toast
        const username = this.authService.currentUser$.getValue()?.username || 'Player';
        this.notificationService.success(`Welcome to Aphelion, ${username}!`);
        // D-07: redirect to returnUrl or /games
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        // D-09: inline error banner for server errors
        if (err.error && typeof err.error === 'string') {
          this.serverError = err.error;
        } else if (err.error?.message) {
          this.serverError = err.error.message;
        } else {
          this.serverError = 'Something went wrong. Please try again.';
        }
      },
    });
  }
}
