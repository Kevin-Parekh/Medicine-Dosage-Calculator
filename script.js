/**
 * Medicine Dosage Calculator Logic
 * Formulas and values based on Pediatric Clinical Guidelines (WHO/NICE)
 */

const medicines = {
  "Paracetamol": {
    dose_per_kg: 15,
    max_daily_dose: 4000,
    frequency: 4,
    strength_liquid: 50, // 250mg / 5ml
    strength_tablet: 500 // 500mg per tablet
  },
  "Ibuprofen": {
    dose_per_kg: 10,
    max_daily_dose: 1200,
    frequency: 3,
    strength_liquid: 20, // 100mg / 5ml
    strength_tablet: 200 // 200mg per tablet
  },
  "Amoxicillin": {
    dose_per_kg: 25,
    max_daily_dose: 2000,
    frequency: 3,
    strength_liquid: 50, // 250mg / 5ml
    strength_tablet: 250 // 250mg per tablet
  }
};

const ICONS = {
  spoon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><path d="M6 11c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V5H6v6z"/><path d="M12 15v7"/></svg>`,
  tablet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/></svg>`,
  powder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  const ageInput = document.getElementById('age');
  const weightInput = document.getElementById('weight');
  const medicineInput = document.getElementById('medicine'); 
  const dosageTypeInput = document.getElementById('dosage-type'); 
  const strengthInput = document.getElementById('custom-strength');

  const dosageValueDisplay = document.getElementById('dosage-value');
  const dosageUnitDisplay = document.getElementById('dosage-unit');
  const warningBox = document.getElementById('warning-box');
  
  const tspContainer = document.getElementById('tsp-container');
  const tspValueDisplay = document.getElementById('tsp-value');
  const visualIconsContainer = document.getElementById('visual-icons');
  const summaryOneLiner = document.getElementById('summary-one-liner');
  const recommendationText = document.getElementById('recommendation-text');
  
  const freqPerDayDisplay = document.getElementById('freq-per-day-display');
  const freqValueDisplay = document.getElementById('freq-value');
  const beakerContainer = document.getElementById('beaker-visual-container');
  const beakerFill = document.getElementById('beaker-fill');
  const beakerPointer = document.getElementById('beaker-pointer');
  const beakerPointerVal = document.getElementById('beaker-pointer-val');
  const calculationSteps = document.getElementById('calculation-steps');

  const inputs = [ageInput, weightInput, medicineInput, dosageTypeInput, strengthInput];
  const calculateBtn = document.getElementById('calculate-btn');

  function formatAsMixedFraction(val) {
    if (val === 0) return "0";
    
    // Round to nearest 0.25
    const rounded = Math.round(val * 4) / 4;
    const whole = Math.floor(rounded);
    const remainder = rounded - whole;
    
    let fracStr = "";
    if (remainder === 0.25) fracStr = "1/4";
    if (remainder === 0.5) fracStr = "1/2";
    if (remainder === 0.75) fracStr = "3/4";
    
    if (whole > 0 && remainder > 0) return `${whole}(${fracStr})`;
    if (whole === 0 && remainder > 0) return fracStr;
    return whole.toString();
  }

  function calculate() {
    const age = ageInput.value || "--";
    const weightVal = parseFloat(weightInput.value);
    const medicineName = medicineInput.value;
    const dosageType = dosageTypeInput.value;
    const userStrength = parseFloat(strengthInput.value);

    // Basic Validation
    if (!weightVal || weightVal <= 0 || !medicineName) {
      clearResults();
      return;
    }

    const isPreset = medicines[medicineName];
    
    // Core Formula Logic
    let dose_per_kg = isPreset ? isPreset.dose_per_kg : 10;
    const mgNeededPerDose = weightVal * dose_per_kg;

    let strength = null;
    let unit = '';
    let visualType = 'powder';
    const typeLower = (dosageType || "").toLowerCase();

    if (typeLower.includes('liquid') || typeLower.includes('ml')) {
      // Logic for Strength: User Input > Clinical Baseline (Age based for presets) > Fallback
      if (userStrength) {
        strength = userStrength;
      } else if (isPreset) {
        const patientAge = parseFloat(age) || 0;
        // Infants/Toddlers under 6 typically use 120mg/5ml (24mg/ml)
        if (medicineName === "Paracetamol" && patientAge < 6) {
          strength = 24; 
        } else {
          strength = isPreset.strength_liquid;
        }
      } else {
        strength = 50; 
      }
      unit = 'ml';
      visualType = 'liquid';
    } else if (typeLower.includes('tablet') || typeLower.includes('pill')) {
      strength = userStrength || (isPreset ? isPreset.strength_tablet : 500);
      unit = 'Tablets';
      visualType = 'tablet';
    } else {
      strength = 1; 
      unit = 'mg';
      visualType = 'powder';
    }

    const finalAmountRaw = mgNeededPerDose / strength;
    let displayAmount;
    
    if (unit === 'Tablets') {
        displayAmount = formatAsMixedFraction(finalAmountRaw);
    } else {
        displayAmount = finalAmountRaw.toFixed(1);
    }

    // Update UI
    dosageValueDisplay.textContent = displayAmount;
    dosageUnitDisplay.textContent = unit;

    // Formula Trace
    calculationSteps.innerHTML = `Calculation: (${weightVal}kg × ${dose_per_kg}mg/kg) ÷ ${strength}${unit === 'ml' ? 'mg/ml' : 'mg'} = ${finalAmountRaw.toFixed(2)} ${unit}`;

    const freq = isPreset ? isPreset.frequency : 3;
    freqPerDayDisplay.style.display = 'block';
    freqValueDisplay.textContent = freq;

    // Teaspoon conversion
    if (unit === 'ml') {
        const tspCount = finalAmountRaw / 5;
        tspContainer.style.display = 'block';
        
        // Exact spoon wording
        const fullSpoons = Math.floor(tspCount);
        const fraction = tspCount - fullSpoons;
        let spoonText = "";
        if (fullSpoons === 1) spoonText = "One full teaspoon";
        else if (fullSpoons > 1) {
            const numWords = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
            spoonText = `${numWords[fullSpoons] || fullSpoons} full teaspoons`;
        }
        
        if (fraction > 0) {
            const fracStr = fraction < 0.35 ? "a quarter" : fraction < 0.65 ? "a half" : "three quarters";
            spoonText += spoonText ? ` plus ${fracStr}` : `${fracStr} teaspoon`;
        }
        if (!spoonText) spoonText = "0 Teaspoons";

        tspValueDisplay.textContent = tspCount.toFixed(1);
        tspContainer.innerHTML = `≈ ${tspCount.toFixed(1)} Teaspoons <br/> <small class="text-slate-500 font-normal">(${spoonText})</small>`;

        // Beaker Visual
        beakerContainer.style.display = 'flex';
        // Max beaker height is 20ml
        const fillHeight = Math.min(100, (finalAmountRaw / 20) * 100);
        beakerFill.style.height = `${fillHeight}%`;
        beakerPointerVal.textContent = finalAmountRaw.toFixed(1);
        // Position the pointer (beaker height is 140px)
        const pointerPos = (fillHeight / 100) * 140;
        beakerPointer.style.bottom = `${pointerPos}px`;
    } else {
        tspContainer.style.display = 'none';
        beakerContainer.style.display = 'none';
    }

    const totalDailyAmount = finalAmountRaw * freq;
    
    // One-liner summary
    summaryOneLiner.style.display = 'block';
    summaryOneLiner.innerHTML = `For patient with age: ${age} and weight ${weightVal} the total dosage for a day should be ${totalDailyAmount.toFixed(1)} ${unit && unit !== 'Tablets' ? unit : 'units (total pills: ' + totalDailyAmount.toFixed(1) + ')'}`;
    if (unit === 'Tablets') {
        summaryOneLiner.innerHTML = `For patient with age: ${age} and weight ${weightVal} the total dosage for a day should be ${totalDailyAmount.toFixed(1)} Tablets`;
    } else if (unit === 'ml') {
        summaryOneLiner.innerHTML = `For patient with age: ${age} and weight ${weightVal} the total dosage for a day should be ${totalDailyAmount.toFixed(1)} ml`;
    }

    // Recommendation Text
    let recHtml = `Take <strong>${displayAmount} ${unit}</strong> of ${medicineName}`;
    if (unit === 'ml') recHtml += ` (≈ ${(finalAmountRaw/5).toFixed(1)} tsp)`;
    recHtml += `, <strong>${freq} time(s)</strong> a day as needed.`;
    
    recommendationText.style.display = 'block';
    recommendationText.innerHTML = recHtml;

    // Safety Warning
    const maxDay = isPreset ? isPreset.max_daily_dose : 2000;
    if (mgNeededPerDose * freq > maxDay) {
        warningBox.style.display = 'block';
    } else {
        warningBox.style.display = 'none';
    }

    generateVisuals(finalAmountRaw, visualType);
  }

  function generateVisuals(value, type) {
    visualIconsContainer.innerHTML = '';
    if (value <= 0) return;
    
    const count = Math.ceil(value);
    const cappedCount = Math.min(count, 12);
    
    for (let i = 0; i < cappedCount; i++) {
        const item = document.createElement('div');
        item.className = 'icon-item';
        
        let label = '';
        if (type === 'liquid') {
            const remaining = Math.max(0, value - i);
            if (remaining < 0.1) break; 
            label = remaining < 0.75 && remaining >= 0.1 ? '1/2 ml' : '1 ml';
            item.innerHTML = `${ICONS.spoon}<span class="icon-label">${label}</span>`;
        } else if (type === 'tablet') {
            const remaining = Math.max(0, value - i);
            if (remaining < 0.1) break;
            // Use 1/4 marks for icons too
            const r = Math.round(remaining * 4) / 4;
            if (r >= 1) label = '1';
            else if (r === 0.75) label = '3/4';
            else if (r === 0.5) label = '1/2';
            else if (r === 0.25) label = '1/4';
            else break;

            item.innerHTML = `${ICONS.tablet}<span class="icon-label">${label}</span>`;
        } else {
            label = '1 mg';
            item.innerHTML = `${ICONS.powder}<span class="icon-label">${label}</span>`;
        }
        visualIconsContainer.appendChild(item);
    }
    
    if (count > 12) {
        const more = document.createElement('span');
        more.className = 'text-xs text-slate-400 self-end mb-2';
        more.textContent = `+ ${count - 12} more`;
        visualIconsContainer.appendChild(more);
    }
  }

  function clearResults() {
    dosageValueDisplay.textContent = '--';
    dosageUnitDisplay.textContent = '--';
    tspContainer.style.display = 'none';
    visualIconsContainer.innerHTML = '';
    recommendationText.style.display = 'none';
    summaryOneLiner.style.display = 'none';
    warningBox.style.display = 'none';
  }

  window.addEventListener('generate-report', () => {
    const summary = document.getElementById('report-summary');
    const dateElt = document.getElementById('report-date');
    dateElt.textContent = new Date().toLocaleDateString();

    summary.innerHTML = `
        <div class="report-field"><span class="report-title">Medicine:</span> <span>${medicineInput.value}</span></div>
        <div class="report-field"><span class="report-title">Weight:</span> <span>${weightInput.value} kg</span></div>
        <div class="report-field"><span class="report-title">Form:</span> <span>${dosageTypeInput.value}</span></div>
        <hr style="margin: 20px 0;"/>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; font-weight: bold; font-size: 1.4em; text-align: center; border: 2px solid #1E40AF;">
            REQUIRED DOSAGE: <br/> ${recommendationText.innerHTML}
        </div>
        <div style="margin-top: 15px; font-size: 0.9em; color: #444; font-style: italic;">
            ${summaryOneLiner.innerText}
        </div>
    `;
  });

  if (calculateBtn) {
    calculateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      calculate();
      if (window.innerWidth < 1000) {
        document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  calculate();
});
