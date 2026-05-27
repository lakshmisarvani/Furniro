import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

const COMPARE_KEY = 'furniro_compare';
const MAX_COMPARE = 4;

@Injectable({ providedIn: 'root' })
export class ComparisonService {
  private idsSubject = new BehaviorSubject<number[]>(this.load());
  readonly ids$ = this.idsSubject.asObservable();

  constructor(private router: Router) {}

  private load(): number[] {
    try { return JSON.parse(localStorage.getItem(COMPARE_KEY) ?? '[]'); }
    catch { return []; }
  }

  private save(ids: number[]) {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    this.idsSubject.next(ids);
  }

  get ids(): number[] { return this.idsSubject.getValue(); }
  get count(): number { return this.ids.length; }

  isComparing(id: number): boolean { return this.ids.includes(id); }

  toggle(id: number) {
    const current = this.ids;
    if (current.includes(id)) {
      this.save(current.filter(i => i !== id));
    } else if (current.length < MAX_COMPARE) {
      this.save([...current, id]);
    }
  }

  add(id: number) {
    if (!this.ids.includes(id) && this.ids.length < MAX_COMPARE) {
      this.save([...this.ids, id]);
    }
  }

  remove(id: number) { this.save(this.ids.filter(i => i !== id)); }

  clear() { this.save([]); }

  navigateToCompare() { this.router.navigate(['/compare']); }
}
