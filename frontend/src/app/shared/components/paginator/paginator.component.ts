import { Component, input, output } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [PaginatorModule],
  template: `
    <div class="flex justify-center mt-6">
      <p-paginator
        [first]="(page() - 1) * rows()"
        [rows]="rows()"
        [totalRecords]="total()"
        [rowsPerPageOptions]="[6, 12, 24]"
        (onPageChange)="onPageChange($event)" />
    </div>
  `,
})
export class PaginatorComponent {
  readonly page  = input.required<number>();
  readonly rows  = input.required<number>();
  readonly total = input.required<number>();

  readonly pageChange = output<{ page: number; limit: number }>();

  onPageChange(event: PaginatorState) {
    this.pageChange.emit({
      page:  (event.page ?? 0) + 1,
      limit: event.rows ?? this.rows(),
    });
  }
}
