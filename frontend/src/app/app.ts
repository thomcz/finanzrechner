import { Component } from '@angular/core';
import { FinanzrechnerComponent } from './components/finanzrechner/finanzrechner.component';

@Component({
    selector: 'app-root',
    imports: [FinanzrechnerComponent],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {}
