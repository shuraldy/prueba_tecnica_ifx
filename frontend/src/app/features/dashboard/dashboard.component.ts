import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { VmService } from '../../core/services/vm.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { VmStats } from '../../core/models/vm.model';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  readonly vmService = inject(VmService);
  readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resourceChart') resourceChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart: Chart | null = null;
  private resourceChart: Chart | null = null;

  ngOnInit() {
    this.vmService.loadStats().subscribe();
    this.vmService.loadVms({ limit: 100 }).subscribe();
  }

  ngAfterViewInit() {
    effect(() => {
      const stats = this.vmService.stats();
      const _dark = this.theme.isDark(); // reactive to theme changes
      if (stats) this.buildCharts(stats);
    }, { allowSignalWrites: true });
  }

  private buildCharts(stats: VmStats) {
    const tickColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-muted').trim() || '#94a3b8';
    const gridColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--border').trim() || '#1e293b';
    const surfaceColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-surface').trim() || '#0f172a';

    this.statusChart?.destroy();
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Encendida', 'Apagada', 'Suspendida'],
        datasets: [{
          data: [stats.byStatus['Encendida'], stats.byStatus['Apagada'], stats.byStatus['Suspendida']],
          backgroundColor: ['#10b981', '#64748b', '#f59e0b'],
          borderColor: surfaceColor,
          borderWidth: 3,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        cutout: '72%',
      },
    });

    this.resourceChart?.destroy();
    this.resourceChart = new Chart(this.resourceChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['vCPUs', 'RAM (GB)', 'Disco (GB)'],
        datasets: [{
          label: 'Total asignado',
          data: [stats.totalCores, Math.round(stats.totalRam / 1024), stats.totalDisk],
          backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899'],
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor }, grid: { color: gridColor } },
          y: { ticks: { color: tickColor }, grid: { color: gridColor } },
        },
      },
    });
  }
}
