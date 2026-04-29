import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (i of rows(); track i) {
        <div class="card rounded-xl p-5 animate-pulse" style="background-color: var(--bg-elevated)">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-md" style="background-color: var(--bg-muted)"></div>
              <div class="h-4 w-28 rounded" style="background-color: var(--bg-muted)"></div>
            </div>
            <div class="h-5 w-20 rounded-full" style="background-color: var(--bg-muted)"></div>
          </div>
          <div class="h-3 w-24 rounded mb-4" style="background-color: var(--bg-muted)"></div>
          <div class="grid grid-cols-3 gap-2">
            @for (j of [1,2,3]; track j) {
              <div class="rounded-lg p-2 h-12" style="background-color: var(--bg-muted)"></div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  readonly count = input<number>(6);
  rows(): number[] { return Array.from({ length: this.count() }, (_, i) => i); }
}
