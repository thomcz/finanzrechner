import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
    test('complete calculation flow without sondertilgung', async ({ page }) => {
        // Mock API response for standard calculation
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
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
                }),
            });
        });

        // Navigate to application
        await page.goto('/');

        // Verify initial state - form visible, no results
        await expect(page.getByRole('heading', { name: 'Finanzrechner' })).toBeVisible();
        await expect(page.locator('.results-card')).not.toBeVisible();
        await expect(page.locator('.table-card')).not.toBeVisible();

        // Fill in required form fields
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');

        // Submit calculation
        await page.locator('.calculate-button').click();

        // Verify results are displayed
        await expect(page.locator('.results-card')).toBeVisible();
        await expect(page.getByText('Calculation Results')).toBeVisible();

        // Verify monthly payment is shown
        await expect(page.getByText('Monthly Payment')).toBeVisible();
        await expect(page.getByText('458.33')).toBeVisible();

        // Verify remaining balance is shown
        await expect(page.getByText('Remaining Balance')).toBeVisible();
        await expect(page.getByText('45,000.00')).toBeVisible();

        // Verify payment plan table is displayed with data
        await expect(page.locator('.table-card')).toBeVisible();
        await expect(page.getByText('Financing Plan')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Month' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Starting Balance' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Ending Balance' })).toBeVisible();

        // Verify table has data rows
        const rows = page.locator('.financing-table mat-row, .financing-table tr[mat-row]');
        await expect(rows).toHaveCount(2);
    });

    test('complete calculation flow with sondertilgung', async ({ page }) => {
        // Mock API response with sondertilgung
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 458.33,
                    restbetrag: 13361.79,
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
                        {
                            monat: 2,
                            anfangsBestand: 99533.33,
                            zinsBetrag: 290.31,
                            tilgungsBetrag: 168.02,
                            sondertilgung: 200,
                            endBestand: 99065.31,
                        },
                    ],
                }),
            });
        });

        // Navigate to application
        await page.goto('/');

        // Fill in all form fields including sondertilgung
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');
        await page.locator('#sondertilgungInput').fill('200');

        // Submit calculation
        await page.locator('.calculate-button').click();

        // Verify results with sondertilgung are displayed
        await expect(page.locator('.results-card')).toBeVisible();

        // Verify monthly special repayment is shown
        await expect(page.getByText('Monthly Special Repayment')).toBeVisible();
        await expect(page.getByText('74.23')).toBeVisible();

        // Verify yearly special repayment is shown
        await expect(page.getByText('Yearly Special Repayment')).toBeVisible();
        await expect(page.getByText('890.79')).toBeVisible();

        // Verify payment plan table shows sondertilgung values
        await expect(page.locator('.table-card')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Special Repayment' })).toBeVisible();

        // Verify sondertilgung values are in the table (200.00)
        await expect(page.getByText('200.00 €').first()).toBeVisible();
    });

    test('handles backend errors gracefully', async ({ page }) => {
        // Mock API failure
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        // Navigate to application
        await page.goto('/');

        // Fill in form fields
        await page.locator('#laufzeit').fill('120');
        await page.locator('#darlehen').fill('100000');
        await page.locator('#zinsatz').fill('3.5');
        await page.locator('#tilgungsSatz').fill('2');

        // Submit calculation
        await page.locator('.calculate-button').click();

        // Verify error message is displayed
        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Fehler bei der Berechnung');

        // Verify results are not shown
        await expect(page.locator('.results-card')).not.toBeVisible();

        // Verify form is still usable (button enabled)
        await expect(page.locator('.calculate-button')).toBeEnabled();

        // Now test recovery - mock success response
        await page.unroute('**/api/finanzierung/calculate');
        await page.route('**/api/finanzierung/calculate', async (route) => {
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

        // Retry calculation
        await page.locator('.calculate-button').click();

        // Verify error is cleared and results are shown
        await expect(page.locator('.error-message')).not.toBeVisible();
        await expect(page.locator('.results-card')).toBeVisible();
    });
});
