import { test, expect } from '@playwright/test';

test.describe('Finanzrechner', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('has correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Finanzrechner/);
    });

    test('displays Finanzrechner heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Finanzrechner' })).toBeVisible();
    });

    test('displays all input fields', async ({ page }) => {
        await expect(page.locator('#laufzeit')).toBeVisible();
        await expect(page.locator('#darlehen')).toBeVisible();
        await expect(page.locator('#zinsatz')).toBeVisible();
        await expect(page.locator('#tilgungsSatz')).toBeVisible();
        await expect(page.locator('#sondertilgungInput')).toBeVisible();
    });

    test('displays calculate button', async ({ page }) => {
        const button = page.locator('.calculate-button');
        await expect(button).toBeVisible();
        await expect(button).toContainText('Calculate Payment Plan');
    });

    test('shows error message when clicking calculate without filling fields', async ({ page }) => {
        await page.locator('.calculate-button').click();
        await expect(page.locator('.error-message')).toContainText('Bitte alle Felder ausfuellen');
    });

    test('can fill in form fields', async ({ page }) => {
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');

        await expect(page.locator('#laufzeit')).toHaveValue('120');
        await expect(page.locator('#darlehen')).toHaveValue('100000');
        await expect(page.locator('#zinsatz')).toHaveValue('3.5');
        await expect(page.locator('#tilgungsSatz')).toHaveValue('2');
    });

    test('shows error when partial form is filled', async ({ page }) => {
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        // Leave zinsatz and tilgungsSatz empty

        await page.locator('.calculate-button').click();
        await expect(page.locator('.error-message')).toContainText('Bitte alle Felder ausfuellen');
    });

    test('displays Sondertilgung input field', async ({ page }) => {
        await expect(page.locator('#sondertilgungInput')).toBeVisible();
        // Check the label for Special Monthly Repayment
        await expect(page.getByText('Special Monthly Repayment')).toBeVisible();
    });

    test('does not show results section initially', async ({ page }) => {
        // Results card should not be visible until calculation is done
        await expect(page.locator('.results-card')).not.toBeVisible();
    });

    test('does not show payment plan table initially', async ({ page }) => {
        await expect(page.locator('.table-card')).not.toBeVisible();
    });
});

test.describe('Finanzrechner with mocked API', () => {
    test('shows loading state and results after calculation', async ({ page }) => {
        // Mock the API response
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 458.33,
                    restbetrag: 45000,
                    monatlicheSondertilgung: 100,
                    jaehrlicheSondertilgung: 1200,
                    zahlungsplan: [
                        {
                            monat: 1,
                            anfangsBestand: 100000,
                            zinsBetrag: 291.67,
                            tilgungsBetrag: 166.67,
                            sondertilgung: 100,
                            endBestand: 99733.33,
                        },
                        {
                            monat: 2,
                            anfangsBestand: 99733.33,
                            zinsBetrag: 290.89,
                            tilgungsBetrag: 167.44,
                            sondertilgung: 100,
                            endBestand: 99465.89,
                        },
                    ],
                }),
            });
        });

        await page.goto('/');

        // Fill in the form
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');
        await page.locator('#sondertilgungInput').fill('100');

        // Click calculate
        await page.locator('.calculate-button').click();

        // Wait for results card to appear
        await expect(page.locator('.results-card')).toBeVisible();

        // Check results heading
        await expect(page.getByText('Calculation Results')).toBeVisible();

        // Check payment plan table is displayed
        await expect(page.locator('.table-card')).toBeVisible();
        await expect(page.getByText('Financing Plan')).toBeVisible();

        // Check table headers
        await expect(page.getByRole('columnheader', { name: 'Month' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Starting Balance' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Interest' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Repayment', exact: true })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Special Repayment' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Ending Balance' })).toBeVisible();

        // Check that rows are displayed (2 data rows)
        const rows = page.locator('.financing-table mat-row, .financing-table tr[mat-row]');
        await expect(rows).toHaveCount(2);
    });

    test('shows error message on API failure', async ({ page }) => {
        // Mock API failure
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        await page.goto('/');

        // Fill in the form
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');

        // Click calculate
        await page.locator('.calculate-button').click();

        // Wait for error message
        await expect(page.locator('.error-message')).toContainText('Fehler bei der Berechnung');
    });

    test('button shows loading text during calculation', async ({ page }) => {
        // Mock slow API response
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 458.33,
                    restbetrag: 45000,
                    monatlicheSondertilgung: 0,
                    jaehrlicheSondertilgung: 0,
                    zahlungsplan: [],
                }),
            });
        });

        await page.goto('/');

        // Fill in the form
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');

        // Click calculate
        await page.locator('.calculate-button').click();

        // Check loading state
        await expect(page.locator('.calculate-button')).toContainText('Calculating...');
        await expect(page.locator('.calculate-button')).toBeDisabled();

        // Wait for completion
        await expect(page.locator('.calculate-button')).toContainText('Calculate Payment Plan');
        await expect(page.locator('.calculate-button')).toBeEnabled();
    });

    test('sondertilgung values are displayed after calculation', async ({ page }) => {
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 458.33,
                    restbetrag: 45000,
                    monatlicheSondertilgung: 150.5,
                    jaehrlicheSondertilgung: 1806,
                    zahlungsplan: [],
                }),
            });
        });

        await page.goto('/');

        // Fill form and calculate
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');
        await page.locator('#sondertilgungInput').fill('150.5');
        await page.locator('.calculate-button').click();

        // Check sondertilgung values are displayed in results
        await expect(page.locator('.results-card')).toBeVisible();
        await expect(page.getByText('Monthly Special Repayment')).toBeVisible();
        await expect(page.getByText('Yearly Special Repayment')).toBeVisible();
    });
});
