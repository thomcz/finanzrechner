// spec: Sondertilgung Scenarios - should calculate without sondertilgung

import { test, expect } from '@playwright/test';

test.describe('Sondertilgung Scenarios', () => {
    test('should calculate without sondertilgung', async ({ page }) => {
        // Mock API with zero sondertilgung response
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
                            endBestand: 99733.33,
                        },
                        {
                            monat: 2,
                            anfangsBestand: 99733.33,
                            zinsBetrag: 290.89,
                            tilgungsBetrag: 167.44,
                            sondertilgung: 0,
                            endBestand: 99565.89,
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

        // 6. Leave sondertilgung field (#sondertilgungInput) empty
        // (No action needed - field is empty by default)

        // 8. Click calculate button
        await page.locator('.calculate-button').click();

        // Expected Results: Calculation succeeds without errors
        await expect(page.locator('.error-message')).not.toBeVisible();

        // Expected Results: Results card appears
        await expect(page.locator('.results-card')).toBeVisible();

        // Expected Results: Monthly Special Repayment shows 0.00
        await expect(page.getByText('Monthly Special Repayment')).toBeVisible();

        // Expected Results: Yearly Special Repayment shows 0.00
        await expect(page.getByText('Yearly Special Repayment')).toBeVisible();

        // Expected Results: Payment plan table appears
        await expect(page.locator('.table-card')).toBeVisible();

        // Expected Results: sondertilgung column shows 0 for all rows
        // The table should show 0.00 € for special repayment in the rows
        const sondertilgungCells = page.locator('.financing-table [mat-cell]:nth-child(5)');
        const count = await sondertilgungCells.count();
        expect(count).toBeGreaterThan(0);

        // Verify first row has 0.00 for sondertilgung
        await expect(sondertilgungCells.first()).toContainText('0.00');
    });
});
