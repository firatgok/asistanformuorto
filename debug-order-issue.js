// Debug script for order-dependent calculation issue
// Add this to monitor state changes

console.log("=== DEBUG SCRIPT LOADED ===");

// Override updateElasticReport to log state
const originalUpdateElasticReport = updateElasticReport;
window.updateElasticReport = function() {
    console.log("=== updateElasticReport called ===");
    console.log("elasticSelections['sag']:", JSON.stringify(elasticSelections['sag']));
    console.log("elasticSelections['sol']:", JSON.stringify(elasticSelections['sol']));
    console.log("elasticSelections['on']:", JSON.stringify(elasticSelections['on']));
    console.log("elasticSelections['orta']:", JSON.stringify(elasticSelections['orta']));
    originalUpdateElasticReport.call(this);
    console.log("answers['lastik-durum']:", answers['lastik-durum']);
    console.log("---");
};

// Override calculateLastikConsumption to log counts
const originalCalculateLastikConsumption = calculateLastikConsumption;
window.calculateLastikConsumption = function() {
    console.log("=== calculateLastikConsumption called ===");
    const result = originalCalculateLastikConsumption.call(this);
    console.log("Result:", result);
    if (result.breakdown) {
        console.log(`  Sağ: ${result.breakdown.sag}, Sol: ${result.breakdown.sol}, Ön: ${result.breakdown.on}`);
    }
    console.log("---");
    return result;
};

// Log when elasticSelections changes
console.log("Initial elasticSelections:", JSON.stringify(elasticSelections, null, 2));

// Test scenario function
window.testOrderIssue = function() {
    console.log("\n=== TEST: Select ÖN first, then SAĞ ===");
    
    // Simulate ÖN selection
    console.log("\n1. Clicking ÖN main button...");
    const onBtn = document.querySelector('[data-direction="on"].elastic-main-btn');
    if (onBtn) onBtn.click();
    
    // Select ÖN 13-33 oblik
    console.log("\n2. Selecting ÖN 13-33 oblik...");
    const onTurBtn = document.querySelector('[data-parent="on"][data-type="tur"][data-value="13-33 oblik"]');
    if (onTurBtn) onTurBtn.click();
    
    // Select ÖN 24 saat
    console.log("\n3. Selecting ÖN 24 saat...");
    const onSureBtn = document.querySelector('[data-parent="on"][data-type="sure"][data-value="24 saat"]');
    if (onSureBtn) onSureBtn.click();
    
    // Now select SAĞ
    console.log("\n4. Clicking SAĞ main button...");
    const sagBtn = document.querySelector('[data-direction="sag"].elastic-main-btn:not(.next-session)');
    if (sagBtn) sagBtn.click();
    
    // Select SAĞ Sınıf II
    console.log("\n5. Clicking SAĞ Sınıf II type...");
    const sagTypeBtn = document.querySelector('[data-parent="sag"][data-elastic-type="sinif2"].elastic-type-btn:not(.next-session)');
    if (sagTypeBtn) sagTypeBtn.click();
    
    // Select SAĞ 24 saat
    console.log("\n6. Selecting SAĞ Sınıf II 24 saat...");
    const sagDurationBtn = document.querySelector('[data-parent="sag"][data-elastic-type="sinif2"][data-duration="24 saat"].elastic-duration-btn:not(.next-session)');
    if (sagDurationBtn) sagDurationBtn.click();
    
    console.log("\n=== STATE AFTER SELECTIONS ===");
    console.log("elasticSelections['on']:", JSON.stringify(elasticSelections['on']));
    console.log("elasticSelections['sag']:", JSON.stringify(elasticSelections['sag']));
    console.log("answers['lastik-durum']:", answers['lastik-durum']);
    
    // Check report output
    const output = document.getElementById('seffaf-output');
    if (output) {
        console.log("\n=== REPORT OUTPUT ===");
        console.log(output.value);
    }
};

// Another test scenario
window.testReverseOrder = function() {
    console.log("\n=== TEST: Select SAĞ first, then ÖN ===");
    
    // Reset first
    elasticSelections['sag'] = { active: false, types: { sinif2: { selected: false, duration: null }, sinif3: { selected: false, duration: null }, cross: { selected: false, duration: null } } };
    elasticSelections['on'] = { active: false, tur: null, sure: null };
    answers['lastik-durum'] = undefined;
    document.querySelectorAll('.elastic-main-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.elastic-type-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.elastic-duration-btn.selected').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.elastic-sub-btn.selected').forEach(btn => btn.classList.remove('selected'));
    
    console.log("After reset:");
    console.log("elasticSelections:", JSON.stringify(elasticSelections));
    
    // Select SAĞ first
    console.log("\n1. Clicking SAĞ main button...");
    const sagBtn = document.querySelector('[data-direction="sag"].elastic-main-btn:not(.next-session)');
    if (sagBtn) sagBtn.click();
    
    // Select SAĞ Sınıf II
    console.log("\n2. Clicking SAĞ Sınıf II type...");
    const sagTypeBtn = document.querySelector('[data-parent="sag"][data-elastic-type="sinif2"].elastic-type-btn:not(.next-session)');
    if (sagTypeBtn) sagTypeBtn.click();
    
    // Select SAĞ 24 saat
    console.log("\n3. Selecting SAĞ Sınıf II 24 saat...");
    const sagDurationBtn = document.querySelector('[data-parent="sag"][data-elastic-type="sinif2"][data-duration="24 saat"].elastic-duration-btn:not(.next-session)');
    if (sagDurationBtn) sagDurationBtn.click();
    
    // Now select ÖN
    console.log("\n4. Clicking ÖN main button...");
    const onBtn = document.querySelector('[data-direction="on"].elastic-main-btn');
    if (onBtn) onBtn.click();
    
    // Select ÖN 13-33 oblik
    console.log("\n5. Selecting ÖN 13-33 oblik...");
    const onTurBtn = document.querySelector('[data-parent="on"][data-type="tur"][data-value="13-33 oblik"]');
    if (onTurBtn) onTurBtn.click();
    
    // Select ÖN 24 saat
    console.log("\n6. Selecting ÖN 24 saat...");
    const onSureBtn = document.querySelector('[data-parent="on"][data-type="sure"][data-value="24 saat"]');
    if (onSureBtn) onSureBtn.click();
    
    console.log("\n=== STATE AFTER SELECTIONS (REVERSE ORDER) ===");
    console.log("elasticSelections['on']:", JSON.stringify(elasticSelections['on']));
    console.log("elasticSelections['sag']:", JSON.stringify(elasticSelections['sag']));
    console.log("answers['lastik-durum']:", answers['lastik-durum']);
    
    // Check report output
    const output = document.getElementById('seffaf-output');
    if (output) {
        console.log("\n=== REPORT OUTPUT (REVERSE ORDER) ===");
        console.log(output.value);
    }
};

console.log("Available debug functions:");
console.log("  testOrderIssue() - Select ÖN then SAĞ");
console.log("  testReverseOrder() - Select SAĞ then ÖN");
