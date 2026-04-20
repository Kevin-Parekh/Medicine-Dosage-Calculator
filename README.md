# Medicine Dosage Calculator

A professional-grade, weight-based pediatric medicine dosage calculator designed for quick decision support.

## Features
- **Weight-Based Calculations**: Automatically applies standard clinical formulas (e.g., 15mg/kg for Paracetamol).
- **Clinical Presets**: Accurate defaults for Paracetamol, Ibuprofen, and Amoxicillin.
- **Smart Age-Aware Logic**: Switches between infant (24mg/ml) and children's (50mg/ml) formulations based on the patient's age.
- **Visual Dosing Guide**: Includes a dynamic beaker visualization for liquid medicines and fractional pill diagrams for tablets.
- **Mixed Fraction Tablet Support**: Rounds to standard half and quarter pill portions (e.g., 1(1/2) Tablets).
- **Transparency**: Shows the exact formula and calculation trace used for each result.

## How to Deploy to GitHub Pages

1. **Option A: Automated (GitHub Actions)**
   - Push this repository to GitHub.
   - Go to **Settings > Pages**.
   - Under **Build and deployment**, set **Source** to "GitHub Actions".
   - GitHub will automatically use the `npm run build` command to deploy the `dist` folder.

2. **Option B: Manual Build**
   - Run `npm install`
   - Run `npm run build`
   - Push the contents of the `dist` folder to your `gh-pages` branch.

## Safety Note
*Calculations are based on standard clinical guidelines (WHO/NICE). Always verify results with a qualified healthcare professional and check the specific concentration on your medicine's bottle.*

---
Created by Krishna Parekh.
