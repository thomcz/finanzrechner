// spec: Calculation Accuracy - should calculate correct monthly annuity

import { test, expect } from '@playwright/test';

test.describe('Calculation Accuracy', () => {
    test('should calculate correct monthly annuity', async ({ page }) => {
        // Mock API endpoint with response containing monatlicheAnnuitaet = 458.33
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 458.33,
                    restbetrag: 76094.58,
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
                            zinsBetrag: 291.18,
                            tilgungsBetrag: 167.15,
                            sondertilgung: 0,
                            endBestand: 99666.18,
                        },
                    ],
                }),
            });
        });

        // 1. Navigate to the application at localhost:4200
        await page.goto('/');

        // 2. Fill laufzeit with '120'
        await page.locator('#laufzeit').fill('120');

        // 3. Fill darlehen with '100000'
        await page.locator('#darlehen').fill('100000');

        // 4. Fill zinsatz with '3.5'
        await page.locator('#zinsatz').fill('3.5');

        // 5. Fill tilgungsSatz with '2'
        await page.locator('#tilgungsSatz').fill('2');

        // 7. Click the calculate button
        await page.locator('.calculate-button').click();

        // Expected Results: Results card appears with monthly annuity
        await expect(page.locator('.results-card')).toBeVisible();
        await expect(page.getByText('Monthly Payment')).toBeVisible();

        // Verify the monthly payment value contains 458.33
        await expect(page.locator('.result-value').first()).toContainText('458.33');
    });
});
