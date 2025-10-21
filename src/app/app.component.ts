import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocoShopComponent } from './focoshop/focoshop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FocoShopComponent],
  template: `
    <header class="app-header">
      <h1>FOCOSHOP</h1>
    </header>

    <main>
      <foco-shop></foco-shop>
    </main>
  `,
  styles: [`
    .app-header {
      background-color: #0d6efd;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    main {
      padding: 1rem;
    }
  `]
})
export class AppComponent {}
