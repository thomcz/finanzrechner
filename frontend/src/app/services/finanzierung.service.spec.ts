import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FinanzierungService } from './finanzierung.service';
import { Finanzierung, FinanzierungRequest } from '../models';

describe('FinanzierungService', () => {
    let service: FinanzierungService;
    let httpTesting: HttpTestingController;

    const mockRequest: FinanzierungRequest = {
        laufzeit: 12,
        darlehen: 100000,
        zinsatz: 3.5,
        tilgungsSatz: 2,
        monatlicheSondertilgung: 0,
    };

    const mockResponse: Finanzierung = {
        laufzeit: 12,
        darlehen: 100000,
        zinsatz: 3.5,
        tilgungsSatz: 2,
        monatlicheAnnuitaet: 458.33,
        restbetrag: 45000,
        monatlicheSondertilgung: 0,
        jaehrlicheSondertilgung: 0,
        zahlungsplan: [
            {
                monat: 1,
                anfangsBestand: 100000,
                zinsBetrag: 291.67,
                tilgungsBetrag: 166.67,
                sondertilgung: 0,
                endBestand: 99833.33,
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(FinanzierungService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('calls API with correct request payload', () => {
        service.calculateFinanzierung(mockRequest).subscribe();

        const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockRequest);

        req.flush(mockResponse);
    });

    it('returns Observable with Finanzierung response', async () => {
        const responsePromise = new Promise<Finanzierung>((resolve) => {
            service.calculateFinanzierung(mockRequest).subscribe({
                next: (response) => resolve(response),
            });
        });

        const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
        req.flush(mockResponse);

        const response = await responsePromise;
        expect(response).toEqual(mockResponse);
        expect(response.monatlicheAnnuitaet).toBe(458.33);
        expect(response.restbetrag).toBe(45000);
        expect(response.zahlungsplan.length).toBe(1);
    });

    it('propagates HTTP errors', async () => {
        const errorPromise = new Promise<{ status: number; statusText: string }>((resolve) => {
            service.calculateFinanzierung(mockRequest).subscribe({
                error: (error) => resolve(error),
            });
        });

        const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

        const error = await errorPromise;
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
    });
});
