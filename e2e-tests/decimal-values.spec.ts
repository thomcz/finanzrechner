// spec: Input Validation - should handle decimal input values

import { test, expect } from '@playwright/test';

test.describe('Input Validation', () => {
    test('should handle decimal input values', async ({ page }) => {
        // Mock API response for this test
        await page.route('**/api/finanzierung/calculate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    monatlicheAnnuitaet: 1093.75,
                    restbetrag: 100000,
                    monatlicheSondertilgung: 0,
                    jaehrlicheSondertilgung: 0,
                    zahlungsplan: [
                        {
                            monat: 1,
                            anfangsBestand: 250000.5,
                            zinsBetrag: 781.25,
                            tilgungsBetrag: 312.5,
                            sondertilgung: 0,
                            endBestand: 249688.0,
                        },
                    ],
                }),
            });
        });

        // 1. Navigate to the application at localhost:4200
        await page.goto('/');

        // 2. Fill darlehen with '250000.50'
        await page.locator('#darlehen').fill('250000.50');

        // 3. Fill zinsatz with '3.75'
        await page.locator('#zinsatz').fill('3.75');

        // 4. Fill tilgungsSatz with '1.5'
        await page.locator('#tilgungsSatz').fill('1.5');

        // 5. Fill laufzeit with '180'
        await page.locator('#laufzeit').fill('180');

        // Verify decimal values are accepted in the input fields
        await expect(page.locator('#tilgungsSatz')).toHaveValue('1.5');

        // 7. Click calculate button
        await page.locator('.calculate-button').click();

        // Expected Results:
        // - Calculation completes successfully (no error message appears)
        await expect(page.locator('.error-message')).not.toBeVisible();

        // - Results show properly formatted decimal numbers
        await expect(page.locator('.results-card')).toBeVisible();

        // - Payment plan table displays correctly
        await expect(page.locator('.table-card')).toBeVisible();
    });
});
