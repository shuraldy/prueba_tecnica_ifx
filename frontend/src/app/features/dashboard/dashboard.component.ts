import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  Chart,
  DoughnutController, ArcElement, Tooltip, Legend,
  BarController, BarElement, CategoryScale, LinearScale, LogarithmicScale,
} from 'chart.js';
import { VmService } from '../../core/services/vm.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { VmStats } from '../../core/models/vm.model';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, LogarithmicScale);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly vmService = inject(VmService);
  readonly auth      = inject(AuthService);
  private readonly theme = inject(ThemeService);

  @ViewChild('statusChart')   statusChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('resourceChart') resourceChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart:   Chart | null = null;
  private resourceChart: Chart | null = null;

  constructor() {
    // Re-build charts whenever stats or theme changes
    effect(() => {
      const stats = this.vmService.stats();
      void this.theme.isDark();
      if (!stats) return;
      // Defer to next tick so @if block finishes rendering the canvases
      setTimeout(() => this.buildCharts(stats), 0);
    });
  }

  ngOnInit() {
    this.vmService.loadStats().subscribe();
  }

  ngOnDestroy() {
    this.statusChart?.destroy();
    this.resourceChart?.destroy();
  }

  private buildCharts(stats: VmStats) {
    if (!this.statusChartRef?.nativeElement || !this.resourceChartRef?.nativeElement) return;

    const css      = getComputedStyle(document.documentElement);
    const tickColor  = css.getPropertyValue('--text-muted').trim()   || '#94a3b8';
    const gridColor  = css.getPropertyValue('--border').trim()        || '#1e293b';
    const bgSurface  = css.getPropertyValue('--bg-surface').trim()    || '#0f172a';

    // --- Doughnut: VMs por estado ---
    this.statusChart?.destroy();
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Encendida', 'Apagada', 'Suspendida'],
        datasets: [{
          data: [
            stats.byStatus['Encendida'],
            stats.byStatus['Apagada'],
            stats.byStatus['Suspendida'],
          ],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderColor: bgSurface,
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} VM${ctx.parsed !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    });

    // --- Bar: Recursos totales ---
    this.resourceChart?.destroy();
    this.resourceChart = new Chart(this.resourceChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['vCPUs', 'RAM (GB)', 'Disco (GB)'],
        datasets: [{
          label: 'Total asignado',
          data: [
            stats.totalCores,
            Math.round(stats.totalRam / 1024),
            stats.totalDisk,
          ],
          backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899'],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const unit = ctx.label === 'vCPUs' ? ' cores' : ' GB';
                return ` ${ctx.parsed.y}${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: tickColor, font: { size: 12 } },
            grid: { color: gridColor },
            border: { color: gridColor },
          },
          y: {
            type: 'logarithmic',
            ticks: {
              color: tickColor,
              font: { size: 12 },
              callback: (value) => Number.isInteger(Math.log10(+value)) ? value : '',
            },
            grid: { color: gridColor },
            border: { color: gridColor },
          },
        },
      },
    });
  }
}
