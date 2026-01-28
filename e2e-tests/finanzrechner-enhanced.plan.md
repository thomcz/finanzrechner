# Finanzrechner Missing E2E Tests

## Application Overview

Enhanced E2E test plan for Finanzrechner - a financial calculator for loan amortization. Tests target the Angular frontend at localhost:4200 with mocked API responses. This plan covers missing test scenarios identified in the coverage analysis: calculation accuracy, input validation, payment plan verification, realistic scenarios, and user workflows.

## Test Scenarios

### 1. Calculation Accuracy

**Seed:** `seed.spec.ts`

#### 1.1. should calculate correct monthly annuity

**File:** `e2e-tests/tests/calculation-accuracy/monthly-annuity.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill laufzeit with '120'
  3. Fill darlehen with '100000'
  4. Fill zinsatz with '3.5'
  5. Fill tilgungsSatz with '2'
  6. Mock API with calculated values: monatlicheAnnuitaet = (100000 * 3.5 + 100000 * 2) / 1200 = 458.33
  7. Click the calculate button
  8. Wait for results to load

**Expected Results:**
  - Monthly annuity field shows '458.33'
  - Calculation matches formula: (darlehen * zinsatz + darlehen * tilgungsSatz) / 1200

#### 1.2. should calculate correct payment plan values for first month

**File:** `e2e-tests/tests/calculation-accuracy/first-month-payment.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with standard values (100000 loan, 3.5% interest, 2% repayment, 120 months)
  3. Mock API with correct first month calculation: zinsBetrag = 100000 * 3.5 / 1200 = 291.67, tilgungsBetrag = 458.33 - 291.67 = 166.67
  4. Click calculate button
  5. Wait for payment plan table to appear

**Expected Results:**
  - First row shows month 1
  - First row anfangsBestand is 100000
  - First row zinsBetrag is approximately 291.67
  - First row tilgungsBetrag is approximately 166.67
  - First row endBestand is 100000 - 166.67 = 99833.33

#### 1.3. should verify payment plan continuity between months

**File:** `e2e-tests/tests/calculation-accuracy/payment-continuity.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with standard values
  3. Mock API with 3 months of payment plan data where endBestand of month N = anfangsBestand of month N+1
  4. Click calculate button
  5. Wait for payment plan table

**Expected Results:**
  - Month 1 endBestand equals Month 2 anfangsBestand
  - Month 2 endBestand equals Month 3 anfangsBestand
  - Each row's endBestand = anfangsBestand - tilgungsBetrag - sondertilgung

### 2. Input Validation

**Seed:** `seed.spec.ts`

#### 2.1. should handle zero interest rate

**File:** `e2e-tests/tests/input-validation/zero-interest.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill laufzeit with '60'
  3. Fill darlehen with '50000'
  4. Fill zinsatz with '0'
  5. Fill tilgungsSatz with '5'
  6. Mock API with zero interest calculation
  7. Click calculate button

**Expected Results:**
  - Calculation completes without error
  - Monthly annuity shows only tilgung portion
  - Payment plan zinsBetrag columns show 0 for all rows

#### 2.2. should handle decimal input values

**File:** `e2e-tests/tests/input-validation/decimal-values.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill darlehen with '250000.50'
  3. Fill zinsatz with '3.75'
  4. Fill tilgungsSatz with '1.5'
  5. Fill laufzeit with '180'
  6. Mock API with decimal calculations
  7. Click calculate button

**Expected Results:**
  - All decimal values are accepted
  - Calculation completes successfully
  - Results show properly formatted decimal numbers

#### 2.3. should handle large loan amounts

**File:** `e2e-tests/tests/input-validation/large-amounts.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill darlehen with '1000000'
  3. Fill other fields with standard values
  4. Mock API response for large loan
  5. Click calculate button

**Expected Results:**
  - Large amount is accepted and displayed correctly
  - Calculation completes without overflow errors
  - Payment plan renders without performance issues

### 3. Sondertilgung Scenarios

**Seed:** `seed.spec.ts`

#### 3.1. should calculate without sondertilgung

**File:** `e2e-tests/tests/sondertilgung/without-sondertilgung.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill all required fields
  3. Leave sondertilgung field empty or as 0
  4. Mock API with zero sondertilgung response
  5. Click calculate button

**Expected Results:**
  - Calculation succeeds
  - monatlicheSondertilgung displays 0 or empty
  - jaehrlicheSondertilgung displays 0 or empty
  - Payment plan sondertilgung column shows 0 for all rows

#### 3.2. should calculate with sondertilgung affecting restbetrag

**File:** `e2e-tests/tests/sondertilgung/with-sondertilgung.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with 100000 loan, 120 months
  3. Fill sondertilgung with '200'
  4. Mock API showing reduced restbetrag due to sondertilgung
  5. Click calculate button

**Expected Results:**
  - Sondertilgung values appear in result fields
  - Payment plan shows sondertilgung in each row
  - endBestand reduces faster than without sondertilgung
  - jaehrlicheSondertilgung equals monatlicheSondertilgung * 12

### 4. Realistic Loan Scenarios

**Seed:** `seed.spec.ts`

#### 4.1. should handle typical home loan scenario

**File:** `e2e-tests/tests/realistic-scenarios/home-loan.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill darlehen with '300000'
  3. Fill zinsatz with '3.5'
  4. Fill tilgungsSatz with '2'
  5. Fill laufzeit with '300'
  6. Fill sondertilgung with '100'
  7. Mock API with home loan calculation
  8. Click calculate button

**Expected Results:**
  - Monthly annuity is approximately 1375 EUR
  - Payment plan displays 300 rows
  - Results show realistic home loan values

#### 4.2. should handle short-term loan scenario

**File:** `e2e-tests/tests/realistic-scenarios/short-term-loan.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill darlehen with '20000'
  3. Fill zinsatz with '5'
  4. Fill tilgungsSatz with '15'
  5. Fill laufzeit with '24'
  6. Mock API with short-term loan
  7. Click calculate button

**Expected Results:**
  - Payment plan shows 24 or fewer rows
  - Higher tilgung results in faster payoff
  - restbetrag should be much lower than with typical rates

### 5. User Workflow

**Seed:** `seed.spec.ts`

#### 5.1. should allow recalculation after changing inputs

**File:** `e2e-tests/tests/user-workflow/recalculation.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form and click calculate with first set of values
  3. Wait for results
  4. Change the darlehen field to a new value
  5. Mock API with new response
  6. Click calculate button again

**Expected Results:**
  - New results replace old results
  - Monthly annuity updates to reflect new loan amount
  - Payment plan refreshes with new values

#### 5.2. should recover from error and calculate successfully

**File:** `e2e-tests/tests/user-workflow/error-recovery.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with valid values
  3. Mock API to return 500 error
  4. Click calculate and observe error
  5. Mock API to return success
  6. Click calculate again

**Expected Results:**
  - Error message clears on successful calculation
  - Results display correctly after recovery
  - Payment plan appears as expected

#### 5.3. should submit form with Enter key

**File:** `e2e-tests/tests/user-workflow/keyboard-submit.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill all form fields
  3. Mock API with success response
  4. Press Enter key while in last input field

**Expected Results:**
  - Form submits on Enter key press
  - Calculation runs and results appear
  - Same behavior as clicking calculate button

### 6. Payment Plan Table

**Seed:** `seed.spec.ts`

#### 6.1. should display payment plan with many rows

**File:** `e2e-tests/tests/payment-plan/many-rows.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with 360 month laufzeit
  3. Mock API with 360 rows of payment data
  4. Click calculate button
  5. Wait for table to render

**Expected Results:**
  - Table displays all 360 rows
  - Table is scrollable
  - All columns are visible
  - No rendering errors or freezing

#### 6.2. should show correct row ordering

**File:** `e2e-tests/tests/payment-plan/row-ordering.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Fill form with standard values
  3. Mock API with 12 months of data
  4. Click calculate button

**Expected Results:**
  - Rows are ordered by month number
  - First data row is month 1
  - Last data row is month 12
  - Month numbers are sequential
