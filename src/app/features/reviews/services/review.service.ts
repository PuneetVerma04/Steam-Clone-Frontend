import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Review, ReviewCreateDto, ReviewUpdateDto } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/review`;

  constructor(private readonly http: HttpClient) {}

  getReviews(gameId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/game/${gameId}`);
  }

  createReview(gameId: number, dto: ReviewCreateDto): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/game/${gameId}/add`, dto);
  }

  updateReview(reviewId: number, dto: ReviewUpdateDto): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, dto);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }
}
