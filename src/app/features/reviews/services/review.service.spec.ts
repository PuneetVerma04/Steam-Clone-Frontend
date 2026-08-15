import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReviewService } from './review.service';
import { Review, ReviewCreateDto, ReviewUpdateDto } from '../models/review.model';

const BASE_URL = 'http://localhost:5062/store/review';

const MOCK_REVIEW: Review = {
  reviewId: 7,
  userId: 42,
  username: 'testuser',
  gameId: 3,
  comment: 'Great game',
  rating: 4,
  reviewDate: new Date('2026-04-26'),
};

const MOCK_CREATE_DTO: ReviewCreateDto = { rating: 4, comment: 'Great game' };
const MOCK_UPDATE_DTO: ReviewUpdateDto = { rating: 5, comment: 'Even better' };

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ReviewService],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ReviewService);
  });

  afterEach(() => { httpMock.verify(); });

  it('getReviews(3) sends GET /review/game/3', () => {
    service.getReviews(3).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/game/3`);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_REVIEW]);
  });

  it('createReview(3, dto) sends POST /review/game/3/add with body', () => {
    service.createReview(3, MOCK_CREATE_DTO).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/game/3/add`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(MOCK_CREATE_DTO);
    req.flush(MOCK_REVIEW);
  });

  it('updateReview(7, dto) sends PUT /review/7 with body', () => {
    service.updateReview(7, MOCK_UPDATE_DTO).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(MOCK_UPDATE_DTO);
    req.flush({ ...MOCK_REVIEW, rating: 5 });
  });

  it('deleteReview(7) sends DELETE /review/7', () => {
    service.deleteReview(7).subscribe();
    const req = httpMock.expectOne(`${BASE_URL}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
