import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FinanzrechnerComponent } from './finanzrechner.component';
import { Finanzierung } from '../../models';

const mockFinanzierungResponse: Finanzierung = {
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
        {
            monat: 2,
            anfangsBestand: 99833.33,
            zinsBetrag: 290.89,
            tilgungsBetrag: 167.44,
            sondertilgung: 0,
            endBestand: 99665.89,
        },
    ],
};

const mockFinanzierungWithSondertilgung: Finanzierung = {
    ...mockFinanzierungResponse,
    monatlicheSondertilgung: 74.23,
    jaehrlicheSondertilgung: 890.79,
    zahlungsplan: [
        {
            monat: 1,
            anfangsBestand: 100000,
            zinsBetrag: 291.67,
            tilgungsBetrag: 166.67,
            sondertilgung: 200,
            endBestand: 99533.33,
        },
    ],
};

async function renderComponent() {
    const result = await render(FinanzrechnerComponent, {
        providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    });
    const httpTesting = TestBed.inject(HttpTestingController);
    return { ...result, httpTesting };
}

describe('FinanzrechnerComponent', () => {
    describe('Structure Tests', () => {
        it('renders Finanzrechner heading', async () => {
            await renderComponent();
            expect(screen.getByRole('heading', { name: /finanzrechner/i })).toBeTruthy();
        });

        it('renders all 5 input fields', async () => {
            await renderComponent();
            expect(screen.getByLabelText(/loan term/i)).toBeTruthy();
            expect(screen.getByLabelText(/loan amount/i)).toBeTruthy();
            expect(screen.getByLabelText(/interest rate/i)).toBeTruthy();
            expect(screen.getByLabelText(/repayment rate/i)).toBeTruthy();
            expect(screen.getByLabelText(/special monthly repayment/i)).toBeTruthy();
        });

        it('renders calculate button', async () => {
            await renderComponent();
            expect(screen.getByRole('button', { name: /calculate payment plan/i })).toBeTruthy();
        });

        it('does not show results card initially', async () => {
            await renderComponent();
            expect(screen.queryByText(/calculation results/i)).toBeNull();
        });

        it('does not show payment plan table initially', async () => {
            await renderComponent();
            expect(screen.queryByText(/financing plan/i)).toBeNull();
        });

        it('does not show error message initially', async () => {
            await renderComponent();
            expect(screen.queryByText(/bitte alle felder ausfuellen/i)).toBeNull();
            expect(screen.queryByText(/fehler bei der berechnung/i)).toBeNull();
        });

        it('does not show loading spinner initially', async () => {
            await renderComponent();
            expect(screen.queryByText(/calculating\.\.\./i)).toBeNull();
        });
    });

    describe('Validation Tests', () => {
        it('shows error when calculate clicked with empty form', async () => {
            await renderComponent();
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.click(calculateButton);

            expect(screen.getByText(/bitte alle felder ausfuellen/i)).toBeTruthy();
        });

        it('shows error when form is partially filled', async () => {
            await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.click(calculateButton);

            expect(screen.getByText(/bitte alle felder ausfuellen/i)).toBeTruthy();
        });

        it('accepts decimal input values', async () => {
            await renderComponent();
            const zinsatzInput = screen.getByLabelText(/interest rate/i) as HTMLInputElement;

            await userEvent.type(zinsatzInput, '3.5');

            expect(zinsatzInput.value).toBe('3.5');
        });

        it('accepts zero as valid interest rate', async () => {
            const { httpTesting } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '0');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            expect(req.request.body.zinsatz).toBe(0);
            req.flush(mockFinanzierungResponse);
        });
    });

    describe('Form Interaction Tests', () => {
        it('updates signal values when user types in inputs', async () => {
            await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i) as HTMLInputElement;

            await userEvent.type(laufzeitInput, '360');

            expect(laufzeitInput.value).toBe('360');
        });

        it('sondertilgung field is optional', async () => {
            const { httpTesting } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            expect(req.request.body.monatlicheSondertilgung).toBe(0);
            req.flush(mockFinanzierungResponse);
        });

        it('required fields must be filled before calculation', async () => {
            await renderComponent();
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.click(calculateButton);

            expect(screen.getByText(/bitte alle felder ausfuellen/i)).toBeTruthy();
        });
    });

    describe('Loading State Tests', () => {
        it('shows loading state when calculation in progress', async () => {
            const { httpTesting } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            expect(screen.getByText(/calculating\.\.\./i)).toBeTruthy();

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);
        });

        it('disables calculate button during loading', async () => {
            const { httpTesting } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', {
                name: /calculate payment plan/i,
            }) as HTMLButtonElement;

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            expect(calculateButton.disabled).toBe(true);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);
        });
    });

    describe('Results Display Tests', () => {
        it('displays results card after successful calculation', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);

            await fixture.whenStable();

            expect(screen.getByText(/calculation results/i)).toBeTruthy();
        });

        it('displays monthly payment value', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);

            await fixture.whenStable();

            expect(screen.getByText(/monthly payment/i)).toBeTruthy();
            expect(screen.getByText(/458\.33/)).toBeTruthy();
        });

        it('displays remaining balance', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);

            await fixture.whenStable();

            expect(screen.getByText(/remaining balance/i)).toBeTruthy();
            expect(screen.getByText(/45,000\.00/)).toBeTruthy();
        });

        it('displays sondertilgung values when present', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const sondertilgungInput = screen.getByLabelText(/special monthly repayment/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.type(sondertilgungInput, '200');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungWithSondertilgung);

            await fixture.whenStable();

            expect(screen.getByText(/monthly special repayment/i)).toBeTruthy();
            expect(screen.getByText(/yearly special repayment/i)).toBeTruthy();
            expect(screen.getByText(/74\.23/)).toBeTruthy();
            expect(screen.getByText(/890\.79/)).toBeTruthy();
        });

        it('displays payment plan table with correct columns', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);

            await fixture.whenStable();

            expect(screen.getByText(/financing plan/i)).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /month/i })).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /starting balance/i })).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /interest/i })).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /^repayment$/i })).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /^special repayment$/i })).toBeTruthy();
            expect(screen.getByRole('columnheader', { name: /ending balance/i })).toBeTruthy();
        });
    });

    describe('Error Handling Tests', () => {
        it('shows error message on API failure', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

            await fixture.whenStable();

            expect(screen.getByText(/fehler bei der berechnung/i)).toBeTruthy();
        });

        it('clears error on subsequent successful calculation', async () => {
            const { httpTesting, fixture } = await renderComponent();
            const laufzeitInput = screen.getByLabelText(/loan term/i);
            const darlehenInput = screen.getByLabelText(/loan amount/i);
            const zinsatzInput = screen.getByLabelText(/interest rate/i);
            const tilgungsSatzInput = screen.getByLabelText(/repayment rate/i);
            const calculateButton = screen.getByRole('button', { name: /calculate payment plan/i });

            // First: trigger validation error
            await userEvent.click(calculateButton);
            expect(screen.getByText(/bitte alle felder ausfuellen/i)).toBeTruthy();

            // Second: fill form and submit
            await userEvent.type(laufzeitInput, '12');
            await userEvent.type(darlehenInput, '100000');
            await userEvent.type(zinsatzInput, '3.5');
            await userEvent.type(tilgungsSatzInput, '2');
            await userEvent.click(calculateButton);

            const req = httpTesting.expectOne('http://localhost:8080/api/finanzierung/calculate');
            req.flush(mockFinanzierungResponse);

            await fixture.whenStable();

            expect(screen.queryByText(/bitte alle felder ausfuellen/i)).toBeNull();
            expect(screen.getByText(/calculation results/i)).toBeTruthy();
        });
    });
});
