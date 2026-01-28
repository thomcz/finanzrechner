// spec: Input Validation - should handle zero interest rate

import { test, expect } from '@playwright/test';

test.describe('Input Validation', () => {
    test('should handle zero interest rate', async ({ page }) => {
        // Mock API with zero interest calculation
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 208.33,
                    restbetrag: 0,
                    monatlicheSondertilgung: 0,
                    jaehrlicheSondertilgung: 0,
                    zahlungsplan: [
                        {
                            monat: 1,
                            anfangsBestand: 50000,
                            zinsBetrag: 0,
                            tilgungsBetrag: 208.33,
                            sondertilgung: 0,
                            endBestand: 49791.67,
                        },
                        {
                            monat: 2,
                            anfangsBestand: 49791.67,
                            zinsBetrag: 0,
                            tilgungsBetrag: 208.33,
                            sondertilgung: 0,
                            endBestand: 49583.34,
                        },
                        {
                            monat: 3,
                            anfangsBestand: 49583.34,
                            zinsBetrag: 0,
                            tilgungsBetrag: 208.33,
                            sondertilgung: 0,
                            endBestand: 49375.01,
                        },
                    ],
                }),
            });
        });

        // 1. Navigate to the application at localhost:4200
        await page.goto('/');

        // 2. Fill laufzeit with '60'
        await page.locator('#laufzeit').fill('60');

        // 3. Fill darlehen with '50000'
        await page.locator('#darlehen').fill('50000');

        // 4. Fill zinsatz with '0'
        await page.locator('#zinsatz').fill('0');

        // 5. Fill tilgungsSatz with '5'
        await page.locator('#tilgungsSatz').fill('5');

        // 7. Click calculate button
        await page.locator('.calculate-button').click();

        // Expected Results: Calculation completes without error
        await expect(page.locator('.error-message')).not.toBeVisible();

        // Expected Results: Results card is visible with monthly payment
        await expect(page.locator('.results-card')).toBeVisible();
        await expect(page.getByText('Monthly Payment')).toBeVisible();

        // Expected Results: Payment plan table appears
        await expect(page.locator('.table-card')).toBeVisible();
        await expect(page.getByText('Financing Plan')).toBeVisible();

        // Expected Results: zinsBetrag column shows 0 for all rows in the payment plan
        // Check first row has 0.00 for interest
        await expect(page.getByText('0.00 €').first()).toBeVisible();
    });
});
