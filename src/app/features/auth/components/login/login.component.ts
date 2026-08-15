import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  serverError: string | null = null;
  isLoading = false;
  hidePassword = true;
  private returnUrl = '/games';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read returnUrl from query params per D-07, AUTH-05
    const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/games';
    // T-02-01 mitigation: reject external URLs (open redirect prevention)
    this.returnUrl = (rawReturnUrl.startsWith('http') || rawReturnUrl.startsWith('//'))
      ? '/games'
      : rawReturnUrl;

    // Reactive form per D-05
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Clear server error when user edits any field per D-11
    this.loginForm.valueChanges.subscribe(() => {
      if (this.serverError) {
        this.serverError = null;
      }
    });
  }

  onSubmit(): void {
    // If form invalid, mark all as touched to reveal errors per UI-SPEC submit pattern
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.serverError = null;

    this.authService.login(this.loginForm.value).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        // Per D-09: display server error message inline, not as toast
        // Backend returns string body for 401: "Invalid email" or "Invalid password"
        if (err.error && typeof err.error === 'string') {
          this.serverError = err.error;
        } else if (err.error?.message) {
          this.serverError = err.error.message;
        } else {
          this.serverError = 'Invalid email or password. Please try again.';
        }
      },
    });
  }
}
