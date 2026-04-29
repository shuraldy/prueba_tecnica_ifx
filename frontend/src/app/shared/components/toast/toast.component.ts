import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [Toast],
  template: `<p-toast position="top-right" [breakpoints]="{'576px': {width: '100%', right: '0', left: '0'}}" />`,
})
export class ToastComponent {}
