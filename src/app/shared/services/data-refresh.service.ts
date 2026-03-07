import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  private refreshReviewsSubject = new Subject<void>();

  public refreshReviews$: Observable<void> = this.refreshReviewsSubject.asObservable();

  triggerReviewsRefresh() {
    this.refreshReviewsSubject.next();
  }
}
