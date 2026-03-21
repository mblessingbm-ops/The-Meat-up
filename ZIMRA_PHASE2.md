# ZIMRA Fiscalisation — Phase 2 Checklist

## Current Status
Phase 1 complete: Kingsport only, test environment (`fdmsapitest.zimra.co.zw`).

---

## To activate Bralyn (TIN: 2000410780, VAT Reg: 22029420)

1. Obtain `deviceID` and `activationKey` from ZIMRA taxpayer portal for Bralyn
2. Uncomment and populate the `BRALYN` block in `constants/zimra-devices.ts`:
   ```ts
   BRALYN: {
     company: 'Bralyn',
     deviceID: parseInt(process.env.ZIMRA_DEVICE_ID_BRALYN || '0'),
     activationKey: process.env.ZIMRA_ACTIVATION_KEY_BRALYN || '',
     taxPayerTIN: '2000410780',
     vatNumber: '22029420',
     branchName: 'Bralyn Litho Printers (Pvt) Ltd',
     branchAddress: { province: 'Harare', city: 'Harare', street: 'Birmingham Road', houseNo: '27' },
     branchContacts: { phoneNo: '0242779269', email: 'sales@bralyn.co.zw' },
   }
   ```
3. Add to `.env.local`:
   ```
   ZIMRA_DEVICE_ID_BRALYN=
   ZIMRA_ACTIVATION_KEY_BRALYN=
   ZIMRA_CERT_PEM_BRALYN=
   ZIMRA_PRIVATE_KEY_PEM_BRALYN=
   ```
4. Call `POST /api/zimra/device/register` with `company=BRALYN` and a newly generated CSR PEM
5. Save the returned `certificatePem` to `ZIMRA_CERT_PEM_BRALYN` in environment variables
6. Call `POST /api/zimra/device/config` with `company=BRALYN` to sync tax rates
7. Run full test checklist for Bralyn against test environment
8. Add `'BRALYN'` to the `companies` array in `app/api/zimra/fiscal-day/auto-close/route.ts`
9. Update `ZimraStatusPanel.tsx` to handle Bralyn company selection

---

## To activate SGA (TIN: 2000934222, VAT Reg: 220300970)

Follow the same steps as Bralyn above, substituting:
- `company: 'SGA'`
- `taxPayerTIN: '2000934222'`
- `vatNumber: '220300970'`
- `branchName: 'Source Global Alliance (Pvt) Ltd'`
- `branchAddress: { province: 'Harare', city: 'Harare', street: 'Simon Mazorodze Road', houseNo: '26' }`
- `branchContacts: { phoneNo: '0242787865', email: 'sales@sga.co.zw' }`

---

## Production switchover (all entities)

1. Obtain production device IDs from ZIMRA portal (separate IDs from test environment)
2. Change `ZIMRA_API_BASE_URL` in environment: `https://fdmsapi.zimra.co.zw`
3. Re-register all active devices on production environment (new CSR + new cert per device)
4. Update verification URL in `KingsportTemplate.tsx` from `fdmsapitest.zimra.co.zw` to `fdmsapi.zimra.co.zw`
5. Run full test checklist on production before go-live
6. Confirm first live receipt returns a valid `receiptID` and server signature from production ZIMRA

---

## Test checklist (run per entity before go-live)

- [ ] Device registration returns certificate
- [ ] `getConfig` returns valid tax IDs and qrUrl
- [ ] First invoice auto-opens fiscal day and submits successfully
- [ ] `fiscalDayNo` increments correctly on each new day
- [ ] QR code URL format matches ZIMRA spec section 11
- [ ] Hash and signature match spec section 13.2.1 examples
- [ ] Fiscal counters update correctly after each receipt
- [ ] Auto-close at 21:45 UTC fires and closes day
- [ ] Failed auto-close triggers Force Close button in UI
- [ ] Invoice PDF shows QR, verification code, and tax table
- [ ] Unfiscalised invoice shows red watermark
