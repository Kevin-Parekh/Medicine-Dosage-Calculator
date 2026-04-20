/**
 * Medicine Dosage Calculator Logic
 * Author: Krishna Parekh
 */

const medicines = {
  "Paracetamol": {
    dose_per_kg: 15,
    max_daily_dose: 4000,
    frequency: 4
  },
  "Ibuprofen": {
    dose_per_kg: 10,
    max_daily_dose: 1200,
    frequency: 3
  },
  "Amoxicillin": {
    dose_per_kg: 20,
    max_daily_dose: 1500,
    frequency: 2
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
  const medicineInput = document.getElementById('medicine'); // Now an input
  const customDoseGroup = document.getElementById('custom-dose-group');
  const customDoseInput = document.getElementById('custom-dose-kg');
  const dosageTypeInput = document.getElementById('dosage-type'); // Now an input
  const strengthInput = document.getElementById('strength');
  const frequencyInput = document.getElementById('frequency');

  const intakeMgDisplay = document.getElementById('intake-mg');
  const dailyMgDisplay = document.getElementById('daily-mg');
  const dosageValueDisplay = document.getElementById('dosage-value');
  const dosageUnitDisplay = document.getElementById('dosage-unit');
  const frequencyDisplay = document.getElementById('freq-display');
  const warningBox = document.getElementById('warning-box');
  
  const tspContainer = document.getElementById('tsp-container');
  const tspValueDisplay = document.getElementById('tsp-value');
  const visualIconsContainer = document.getElementById('visual-icons');

  const inputs = [ageInput, weightInput, medicineInput, customDoseInput, dosageTypeInput, strengthInput, frequencyInput];

  function calculate() {
    const weight = parseFloat(weightInput.value);
    const medicineName = medicineInput.value;
    const dosageType = dosageTypeInput.value;
    const strength = parseFloat(strengthInput.value) || null; // Strength is optional
    const frequency = parseInt(frequencyInput.value) || 1; // Default to 1

    // Check if custom medicine
    const isPreset = medicines[medicineName];
    if (!isPreset && medicineName !== "") {
        customDoseGroup.style.display = 'block';
    } else {
        customDoseGroup.style.display = 'none';
        if (isPreset) {
            // Auto-fill frequency if preset
            if (frequencyInput.value === "") frequencyInput.placeholder = isPreset.frequency;
        }
    }

    // Basic Validation
    if (!weight || weight <= 0 || !medicineName) {
      clearResults();
      updateChart(null);
      return;
    }

    let dose_per_kg = isPreset ? isPreset.dose_per_kg : parseFloat(customDoseInput.value);
    let max_dose = isPreset ? isPreset.max_daily_dose : 2000; // Default safe max for unknown

    if (!dose_per_kg) {
        clearResults();
        updateChart(null);
        return;
    }

    // 1. Dose per intake (mg) = weight × dose_per_kg
    const dosePerIntake = weight * dose_per_kg;

    // 2. Total daily dose = dose per intake × frequency
    const totalDailyDose = dosePerIntake * frequency;

    // 3. Conversions (If strength is provided)
    let convertedValue = null;
    let unit = '';
    let visualType = 'powder';

    if (dosageType.toLowerCase().includes('liquid') || dosageType.toLowerCase().includes('ml')) {
      unit = 'ml';
      visualType = 'liquid';
      if (strength) {
          convertedValue = dosePerIntake / strength;
          const tspCount = convertedValue / 5;
          tspContainer.style.display = 'block';
          tspValueDisplay.textContent = tspCount.toFixed(1);
      } else {
          tspContainer.style.display = 'none';
      }
    } else if (dosageType.toLowerCase().includes('tablet') || dosageType.toLowerCase().includes('pill')) {
      unit = 'Tablets';
      visualType = 'tablet';
      tspContainer.style.display = 'none';
      if (strength) convertedValue = dosePerIntake / strength;
    } else {
      unit = dosageType || 'Units';
      visualType = 'powder';
      tspContainer.style.display = 'none';
      if (strength) convertedValue = dosePerIntake / strength;
    }

    // Update UI
    intakeMgDisplay.textContent = dosePerIntake.toFixed(1) + ' mg';
    dailyMgDisplay.textContent = totalDailyDose.toFixed(1) + ' mg';
    
    if (convertedValue !== null) {
        dosageValueDisplay.textContent = convertedValue.toFixed(2);
        dosageUnitDisplay.textContent = unit;
        generateVisuals(convertedValue, visualType);
    } else {
        dosageValueDisplay.textContent = dosePerIntake.toFixed(1);
        dosageUnitDisplay.textContent = 'mg';
        generateVisuals(0, visualType);
    }
    
    frequencyDisplay.textContent = frequency + ' times/day';

    // Safety Logic
    if (totalDailyDose > max_dose) {
      warningBox.style.display = 'block';
      warningBox.textContent = `⚠️ Warning: Maximum daily dose (${max_dose} mg) exceeded!`;
    } else {
      warningBox.style.display = 'none';
    }

    // Update Chart
    updateChart({ dose_per_kg, max_dose, frequency, currentAge: parseFloat(ageInput.value) || 0 });
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
            const remaining = value - i;
            if (remaining < 0.2) break; 
            label = remaining < 0.75 && remaining >= 0.2 ? '1/2 ml' : '1 ml';
            item.innerHTML = `${ICONS.spoon}<span class="icon-label">${label}</span>`;
        } else if (type === 'tablet') {
            const remaining = value - i;
            if (remaining < 0.2) break;
            label = remaining < 0.75 && remaining >= 0.2 ? '1/2' : '1';
            item.innerHTML = `${ICONS.tablet}<span class="icon-label">${label}</span>`;
        } else {
            label = '1 Unit';
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
    intakeMgDisplay.textContent = '--';
    dailyMgDisplay.textContent = '--';
    dosageValueDisplay.textContent = '--';
    dosageUnitDisplay.textContent = '--';
    frequencyDisplay.textContent = '--';
    tspContainer.style.display = 'none';
    visualIconsContainer.innerHTML = '';
    warningBox.style.display = 'none';
  }

  // --- D3 Chart Logic ---
  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const width = document.getElementById('dosage-chart').clientWidth - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  const svg = d3.select("#dosage-chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  function updateChart(params) {
    svg.selectAll("*").remove();
    if (!params) return;

    const data = [];
    const strength = parseFloat(strengthInput.value);
    
    for (let age = 0; age <= 18; age += 1) {
        const weight = (age < 12) ? age * 2 + 8 : age * 3 + 4; // Approx weight
        const doseMg = weight * params.dose_per_kg * params.frequency;
        const dailyDoseMg = Math.min(doseMg, params.max_dose);
        const dailyUnits = strength ? dailyDoseMg / strength : 0;
        data.push({age, dose: dailyDoseMg, units: dailyUnits});
    }

    const x = d3.scaleLinear().domain([0, 18]).range([0, width]);
    const yMg = d3.scaleLinear().domain([0, d3.max(data, d => d.dose) + 200]).range([height, 0]);
    const yUnits = d3.scaleLinear().domain([0, d3.max(data, d => d.units) || 10]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(10));
    svg.append("g").call(d3.axisLeft(yMg).ticks(5));

    // Line for Daily mg
    const lineMg = d3.line().x(d => x(d.age)).y(d => yMg(d.dose)).curve(d3.curveMonotoneX);
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#1E40AF").attr("stroke-width", 2).attr("d", lineMg);

    // Line for Daily Units (Dashed)
    if (strength) {
        const lineUnits = d3.line().x(d => x(d.age)).y(d => yUnits(d.units)).curve(d3.curveMonotoneX);
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#64748B")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4")
            .attr("d", lineUnits);
    }

    // Current pointer
    if (params.currentAge <= 18) {
        const d = data.find(item => item.age === Math.round(params.currentAge));
        if (d) {
            svg.append("circle").attr("cx", x(params.currentAge)).attr("cy", yMg(d.dose)).attr("r", 5).attr("fill", "#dc3545");
        }
    }
  }

  // --- Report Generation ---
  window.addEventListener('generate-report', () => {
    const summary = document.getElementById('report-summary');
    const date = document.getElementById('report-date');
    date.textContent = new Date().toLocaleDateString();

    summary.innerHTML = `
        <div class="report-field"><span class="report-title">Medicine:</span> <span>${medicineInput.value}</span></div>
        <div class="report-field"><span class="report-title">Weight:</span> <span>${weightInput.value} kg</span></div>
        <div class="report-field"><span class="report-title">Age:</span> <span>${ageInput.value} years</span></div>
        <div class="report-field"><span class="report-title">Intake Dose:</span> <span>${intakeMgDisplay.textContent}</span></div>
        <div class="report-field"><span class="report-title">Recommended Frequency:</span> <span>${frequencyDisplay.textContent}</span></div>
        <hr/>
        <div class="report-field" style="font-size: 1.2em;"><span class="report-title">Dosage to Administer:</span> <span>${dosageValueDisplay.textContent} ${dosageUnitDisplay.textContent}</span></div>
    `;
  });

  // Event Listeners
  inputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  medicineInput.addEventListener('change', () => {
    const medData = medicines[medicineInput.value];
    if (medData) {
        frequencyInput.value = medData.frequency;
        customDoseInput.value = "";
    }
    calculate();
  });

  calculate();
});
