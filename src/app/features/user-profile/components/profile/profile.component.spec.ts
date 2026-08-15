import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TokenService } from '@core/services/token.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/models/user.model';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const MOCK_USER: User = {
  id: 42,
  username: 'testplayer',
  email: 'test@example.com',
  role: 'Player',
  createdAt: new Date('2025-01-01'),
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const mockTokenService = { getUserId: vi.fn().mockReturnValue(42) };
  const mockUserService = {
    getUser: vi.fn().mockReturnValue(of(MOCK_USER)),
    updateUser: vi.fn().mockReturnValue(of(MOCK_USER)),
  };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    mockTokenService.getUserId.mockReturnValue(42);
    mockUserService.getUser.mockReturnValue(of(MOCK_USER));
    mockUserService.updateUser.mockReturnValue(of(MOCK_USER));
    mockUserService.updateUser.mockClear();

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: TokenService, useValue: mockTokenService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit calls tokenService.getUserId()', () => {
    fixture.detectChanges();
    expect(mockTokenService.getUserId).toHaveBeenCalled();
  });

  it('ngOnInit calls userService.getUser with the userId from token', () => {
    fixture.detectChanges();
    expect(mockUserService.getUser).toHaveBeenCalledWith(42);
  });

  it('loading is true before service resolves (synchronous check before detectChanges)', () => {
    // Before detectChanges, ngOnInit has not run yet
    expect(component.loading).toBe(true);
  });

  it('enableEdit() sets editMode to true and patches form', () => {
    fixture.detectChanges(); // trigger ngOnInit so user is loaded
    component.enableEdit();
    expect(component.editMode).toBe(true);
    expect(component.profileForm.get('username')?.value).toBe('testplayer');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
  });

  it('cancelEdit() sets editMode to false', () => {
    component.editMode = true;
    component.cancelEdit();
    expect(component.editMode).toBe(false);
  });

  it('save() calls markAllAsTouched when form is invalid', () => {
    fixture.detectChanges();
    component.editMode = true;
    component.profileForm.patchValue({ username: '', email: '' });
    const spy = vi.spyOn(component.profileForm, 'markAllAsTouched');
    component.save();
    expect(spy).toHaveBeenCalled();
    expect(mockUserService.updateUser).not.toHaveBeenCalled();
  });

  it('save() calls userService.updateUser when form is valid', () => {
    fixture.detectChanges();
    component.user = MOCK_USER;
    component.editMode = true;
    component.profileForm.patchValue({ username: 'newname', email: 'new@example.com' });
    component.save();
    expect(mockUserService.updateUser).toHaveBeenCalledWith(42, {
      username: 'newname',
      email: 'new@example.com',
    });
  });
});
