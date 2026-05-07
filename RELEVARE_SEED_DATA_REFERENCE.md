# Relevare Skincare Boutique Salon & Spa - Seed Data Reference

This document contains sample development seed data for Relevare.
All values are fictional and safe for local/testing environments.

## 1) Staff / Users

| Full Name | Role | Email | Phone | Commission Type | Commission Value | Is Active | Start Date |
|---|---|---|---|---|---:|---|---|
| Maria Santos | Owner | maria.santos@relevare.local | 09170000001 | percent | 0 | true | 2023-01-05 |
| Angela Dela Cruz | Manager | angela.delacruz@relevare.local | 09170000002 | percent | 2 | true | 2023-03-10 |
| Carlo Reyes | Receptionist | carlo.reyes@relevare.local | 09170000003 | fixed | 150 | true | 2024-01-15 |
| Nina Gonzales | Senior Therapist | nina.gonzales@relevare.local | 09170000004 | percent | 12 | true | 2023-06-01 |
| Bea Lim | Aesthetic Nurse | bea.lim@relevare.local | 09170000005 | percent | 15 | true | 2024-02-20 |

## 2) Clients

| Client Code | Full Name | Sex | Birthdate | Mobile | Email | Address | Allergies | Notes | Is Active | Created At |
|---|---|---|---|---|---|---|---|---|---|---|
| C-0001 | Sophia Martinez | Female | 1994-04-11 | 09180000011 | sophia.m@example.local | Quezon City | None | Prefers weekend appointments | true | 2025-01-08 |
| C-0002 | Daniel Villanueva | Male | 1989-09-23 | 09180000012 | daniel.v@example.local | Makati City | Aspirin | Sensitive skin history | true | 2025-01-10 |
| C-0003 | Camille Ramos | Female | 1997-12-02 | 09180000013 | camille.r@example.local | Pasig City | None | Acne program package | true | 2025-01-14 |
| C-0004 | Lara Sy | Female | 1991-06-18 | 09180000014 | lara.sy@example.local | Taguig City | Fragrance | Requests hypoallergenic products | true | 2025-01-20 |
| C-0005 | Miguel Tan | Male | 1986-11-30 | 09180000015 | miguel.t@example.local | Mandaluyong City | None | Corporate client referral | true | 2025-01-22 |
| C-0006 | Patricia Ong | Female | 1993-03-09 | 09180000016 | patricia.o@example.local | Quezon City | Sulfa | Confirm medicine intake each visit | true | 2025-02-01 |
| C-0007 | Hannah Co | Female | 2000-08-27 | 09180000017 | hannah.c@example.local | Marikina City | None | Student discount profile | true | 2025-02-05 |
| C-0008 | Rafael Cruz | Male | 1995-01-16 | 09180000018 | rafael.c@example.local | Pasay City | None | Interested in laser sessions | true | 2025-02-12 |

## 3) Services

| Service Code | Service Name | Category | Duration (mins) | Price (PHP) | Cost Basis (PHP) | Taxable | Is Active |
|---|---|---|---:|---:|---:|---|---|
| SVC-001 | Signature Facial Deep Cleanse | Facial | 60 | 1800 | 600 | true | true |
| SVC-002 | Acne Control Facial | Facial | 75 | 2500 | 900 | true | true |
| SVC-003 | Brightening Gluta Facial | Facial | 60 | 2200 | 800 | true | true |
| SVC-004 | Carbon Laser Peel | Laser | 45 | 3200 | 1300 | true | true |
| SVC-005 | Diode Underarm Whitening | Laser | 40 | 2800 | 1100 | true | true |
| SVC-006 | RF Skin Tightening | Aesthetic | 50 | 3500 | 1400 | true | true |
| SVC-007 | Back Acne Treatment | Body | 60 | 2600 | 1000 | true | true |

## 4) Products

| SKU | Product Name | Category | Unit Cost (PHP) | Unit Price (PHP) | On Hand Qty | Reorder Level | Is Active |
|---|---|---|---:|---:|---:|---:|---|
| PRD-001 | Gentle Foaming Cleanser 120ml | Skincare | 220 | 480 | 45 | 12 | true |
| PRD-002 | Niacinamide Serum 30ml | Skincare | 280 | 650 | 35 | 10 | true |
| PRD-003 | SPF50 Daily Sunblock 50ml | Skincare | 300 | 720 | 40 | 12 | true |
| PRD-004 | Retinol Night Cream 30g | Skincare | 350 | 850 | 22 | 8 | true |
| PRD-005 | Soothing Gel Mask 100ml | Treatment Add-on | 180 | 420 | 30 | 10 | true |
| PRD-006 | Post-Laser Recovery Mist 80ml | Aftercare | 260 | 590 | 18 | 6 | true |
| PRD-007 | Anti-Acne Spot Corrector 15ml | Skincare | 190 | 460 | 28 | 8 | true |
| PRD-008 | Collagen Booster Capsules (30s) | Supplement | 420 | 980 | 15 | 5 | true |

## 5) Package Templates

| Package Code | Package Name | Included Services | Sessions | Package Price (PHP) | Validity (days) | Is Active |
|---|---|---|---:|---:|---:|---|
| PKG-001 | Acne Rescue Starter | SVC-002 Acne Control Facial | 4 | 9200 | 120 | true |
| PKG-002 | Bright Skin Program | SVC-003 Brightening Gluta Facial | 6 | 12000 | 180 | true |
| PKG-003 | Laser Smooth Combo | SVC-004 Carbon Laser Peel + SVC-005 Diode Underarm Whitening | 5 each | 26500 | 210 | true |
| PKG-004 | Youth Lift Series | SVC-006 RF Skin Tightening | 6 | 18900 | 180 | true |

## 6) Sample Transactions

| TXN No | Date | Client Code | Items / Services | Subtotal (PHP) | Discount (PHP) | Tax (PHP) | Net Amount (PHP) | Payment Method | Status |
|---|---|---|---|---:|---:|---:|---:|---|---|
| TXN-2026-0001 | 2026-04-28 | C-0001 | SVC-001 + PRD-003 | 2520 | 120 | 0 | 2400 | Cash | Completed |
| TXN-2026-0002 | 2026-04-29 | C-0003 | SVC-002 | 2500 | 250 | 0 | 2250 | GCash | Completed |
| TXN-2026-0003 | 2026-04-30 | C-0004 | PKG-002 (Downpayment) | 12000 | 1000 | 0 | 11000 | Card | Partial |
| TXN-2026-0004 | 2026-05-02 | C-0005 | SVC-004 + PRD-006 | 3790 | 190 | 0 | 3600 | Card | Completed |
| TXN-2026-0005 | 2026-05-03 | C-0008 | SVC-005 | 2800 | 0 | 0 | 2800 | GCash | Completed |
| TXN-2026-0006 | 2026-05-04 | C-0006 | SVC-006 + PRD-001 + PRD-002 | 4630 | 230 | 0 | 4400 | Bank Transfer | Completed |
| TXN-2026-0007 | 2026-05-05 | C-0002 | SVC-007 + PRD-005 | 3020 | 120 | 0 | 2900 | Cash | Completed |
| TXN-2026-0008 | 2026-05-06 | C-0007 | PRD-007 + PRD-003 | 1180 | 80 | 0 | 1100 | GCash | Completed |

## 7) Expenses

| Expense No | Date | Category | Description | Vendor | Amount (PHP) | Payment Method | Notes |
|---|---|---|---|---|---:|---|---|
| EXP-2026-0001 | 2026-04-28 | Utilities | Electricity Bill - April | Meralco | 12850 | Bank Transfer | Main branch |
| EXP-2026-0002 | 2026-04-29 | Supplies | Facial sheets, gloves, cotton pads | MedSupply PH | 6850 | Cash | Weekly restock |
| EXP-2026-0003 | 2026-05-01 | Payroll | Staff salary payout (half month) | Internal | 74200 | Bank Transfer | Includes incentives |
| EXP-2026-0004 | 2026-05-02 | Marketing | Facebook/Instagram ads | Meta Ads | 9500 | Card | Lead generation campaign |
| EXP-2026-0005 | 2026-05-03 | Rent | Monthly clinic rent | Greenfield Properties | 45000 | Bank Transfer | May rent |
| EXP-2026-0006 | 2026-05-04 | Maintenance | Laser machine preventive maintenance | SkinTech Services | 7800 | Bank Transfer | Quarterly schedule |
| EXP-2026-0007 | 2026-05-05 | Inventory | Product replenishment batch A | DermTrade Inc. | 23600 | Bank Transfer | SPF and serums |
| EXP-2026-0008 | 2026-05-06 | Miscellaneous | Pantry and cleaning materials | S&R Membership | 3250 | Cash | Consumables |

---

## Optional Notes for Implementation

- Use stable IDs (`C-0001`, `SVC-001`, etc.) so foreign keys are easy to map.
- Keep `*.local` emails for dev/testing only.
- You can copy this file into fixtures and convert per table (users, clients, services, products, packages, transactions, expenses).
