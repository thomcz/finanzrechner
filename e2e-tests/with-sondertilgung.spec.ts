// spec: Sondertilgung Scenarios - should calculate with sondertilgung affecting restbetrag

import { test, expect } from '@playwright/test';

test.describe('Sondertilgung Scenarios', () => {
    test('should calculate with sondertilgung affecting restbetrag', async ({ page }) => {
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

        // 6. Fill sondertilgung field with '200'
        await page.locator('#sondertilgungInput').fill('200');

        // 8. Click calculate button
        await page.locator('.calculate-button').click();

        // Verify results card is visible
        await expect(page.locator('.results-card')).toBeVisible();

        // Verify Monthly Payment is displayed
        await expect(page.getByText('Monthly Payment')).toBeVisible();

        // Verify Monthly Special Repayment is visible
        await expect(page.getByText('Monthly Special Repayment')).toBeVisible();

        // Verify Yearly Special Repayment is visible
        await expect(page.getByText('Yearly Special Repayment')).toBeVisible();

        // Verify Remaining Balance is visible
        await expect(page.getByText('Remaining Balance')).toBeVisible();

        // Verify payment plan table is visible
        await expect(page.locator('.table-card')).toBeVisible();
        await expect(page.getByText('Financing Plan')).toBeVisible();

        // Verify payment plan table shows sondertilgung value of 200.00
        await expect(page.getByText('200.00 €').first()).toBeVisible();
    });
});
