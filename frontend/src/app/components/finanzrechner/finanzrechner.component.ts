import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FinanzierungService } from '../../services/finanzierung.service';
import { Finanzierung, FinanzierungRequest, ZahlungsplanItem } from '../../models';

@Component({
    selector: 'app-finanzrechner',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatIconModule,
        MatDividerModule,
    ],
    templateUrl: './finanzrechner.component.html',
    styleUrl: './finanzrechner.component.css',
})
export class FinanzrechnerComponent {
    laufzeit = signal<number | null>(null);
    darlehen = signal<number | null>(null);
    zinsatz = signal<number | null>(null);
    tilgungsSatz = signal<number | null>(null);
    sondertilgungInput = signal<number | null>(null);

    monatlicheAnnuitaet = signal<number | null>(null);
    restbetrag = signal<number | null>(null);
    monatlicheSondertilgung = signal<number | null>(null);
    jaehrlicheSondertilgung = signal<number | null>(null);
    zahlungsplan = signal<ZahlungsplanItem[]>([]);

    loading = signal(false);
    error = signal<string | null>(null);

    constructor(private finanzierungService: FinanzierungService) {}

    calculate(): void {
        const laufzeit = this.laufzeit();
        const darlehen = this.darlehen();
        const zinsatz = this.zinsatz();
        const tilgungsSatz = this.tilgungsSatz();

        if (laufzeit === null || darlehen === null || zinsatz === null || tilgungsSatz === null) {
            this.error.set('Bitte alle Felder ausfuellen');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        const request: FinanzierungRequest = {
            laufzeit,
            darlehen,
            zinsatz,
            tilgungsSatz,
            monatlicheSondertilgung: this.sondertilgungInput() ?? 0,
        };

        this.finanzierungService.calculateFinanzierung(request).subscribe({
            next: (finanzierung: Finanzierung) => {
                this.monatlicheAnnuitaet.set(finanzierung.monatlicheAnnuitaet);
                this.restbetrag.set(finanzierung.restbetrag);
                this.monatlicheSondertilgung.set(finanzierung.monatlicheSondertilgung);
                this.jaehrlicheSondertilgung.set(finanzierung.jaehrlicheSondertilgung);
                this.zahlungsplan.set([...finanzierung.zahlungsplan].reverse());
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Fehler bei der Berechnung');
                this.loading.set(false);
                console.error(err);
            },
        });
    }
}

