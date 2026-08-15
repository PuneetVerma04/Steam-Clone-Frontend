import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User, UpdateUserDto } from '@core/models/user.model';

const BASE_URL = 'http://localhost:5062/store/users';

const MOCK_USER: User = {
  id: 5,
  username: 'testplayer',
  email: 'test@example.com',
  role: 'Player',
  createdAt: new Date('2026-01-01'),
};

const MOCK_UPDATE_DTO: UpdateUserDto = { username: 'newname', email: 'new@example.com' };

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
  });

  afterEach(() => { httpMock.verify(); });

  it('getUser(5) sends GET /users/5', () => {
    service.getUser(5).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_USER);
  });

  it('updateUser(5, dto) sends PUT /users/5 with body', () => {
    service.updateUser(5, MOCK_UPDATE_DTO).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(MOCK_UPDATE_DTO);
    req.flush({ ...MOCK_USER, ...MOCK_UPDATE_DTO });
  });
});
