import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TokenService } from '@core/services/token.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { User, UpdateUserDto } from '@core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  user: User | null = null;
  loading = true;
  loadError = false;
  editMode = false;
  saving = false;

  profileForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.loading = false;
      this.loadError = true;
      return;
    }

    this.userService.getUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          this.ngZone.run(() => {
            this.user = user;
            this.loading = false;
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.loading = false;
            this.loadError = true;
            this.cd.detectChanges();
          });
        },
      });
  }

  enableEdit(): void {
    if (!this.user) return;
    this.profileForm.patchValue({
      username: this.user.username,
      email: this.user.email,
    });
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  save(): void {
    if (this.profileForm.invalid || !this.user) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const dto = this.profileForm.value as UpdateUserDto;

    this.userService.updateUser(this.user.id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.ngZone.run(() => {
            this.user = updated;
            this.saving = false;
            this.editMode = false;
            this.notificationService.success('Profile updated.');
            this.cd.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.saving = false;
            this.notificationService.error('Failed to save profile.');
            this.cd.detectChanges();
          });
        },
      });
  }
}
