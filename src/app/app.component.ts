import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocoShopComponent } from './focoshop/focoshop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FocoShopComponent],
  template: `
    <foco-shop></foco-shop>
  `,
  styles: [``]
})
export class AppComponent {}
