// Lastik Calculation Functions
function calculateLastikConsumption() {
    // Randevu kaç hafta sonra?
    const randevuText = answers['sonraki-randevu'];
    if (!randevuText) {
        return { error: 'Önce randevu tarihini belirleyin' };
    }
    
    // Hafta sayısını çıkar
    const weekMatch = randevuText.match(/(\d+)\s*hafta/);
    if (!weekMatch) {
        return { error: 'Randevu tarihinden hafta sayısı çıkarılamadı' };
    }
    
    const weeks = parseInt(weekMatch[1]);
    const days = weeks * 7;
    
    // Sonraki seans lastik seçimlerini kontrol et
    let sagCount = 0;
    let solCount = 0;
    let onCount = 0;
    
    // SAĞ taraf lastikleri say
    if (nextElasticSelections.sag) {
        Object.keys(nextElasticSelections.sag).forEach(type => {
            if (nextElasticSelections.sag[type] && nextElasticSelections.sag[type].selected) {
                sagCount++;
            }
        });
    }
    
    // SOL taraf lastikleri say
    if (nextElasticSelections.sol) {
        Object.keys(nextElasticSelections.sol).forEach(type => {
            if (nextElasticSelections.sol[type] && nextElasticSelections.sol[type].selected) {
                solCount++;
            }
        });
    }
    
    // ÖN taraf lastikleri say  
    if (nextElasticSelections.on && nextElasticSelections.on.selected) {
        onCount = 1;
    }
    
    // Toplam günlük kullanım
    const dailyUsage = sagCount + solCount + onCount;
    
    if (dailyUsage === 0) {
        return { error: 'Sonraki seans için lastik seçimi yapın' };
    }
    
    // Toplam ihtiyaç hesapla
    const totalNeeded = dailyUsage * days;
    
    // Detayları hazırla
    const details = [];
    if (sagCount > 0) details.push(`Sağ: ${sagCount}/gün`);
    if (solCount > 0) details.push(`Sol: ${solCount}/gün`);
    if (onCount > 0) details.push(`Ön: ${onCount}/gün`);
    
    return {
        success: true,
        dailyUsage: dailyUsage,
        totalDays: days,
        weeks: weeks,
        totalNeeded: totalNeeded,
        details: details,
        breakdown: {
            sag: sagCount,
            sol: solCount,
            on: onCount
        }
    };
}

function updateLastikCalculationDisplay() {
    const display = document.getElementById('lastik-calculation-result');
    if (!display) return;
    
    const calculation = calculateLastikConsumption();
    
    if (calculation.error) {
        display.textContent = calculation.error;
        display.className = '';
        // Remove from answers
        delete answers['lastik-calculation'];
    } else if (calculation.success) {
        const detailText = calculation.details.join(', ');
        display.textContent = `${calculation.weeks} hafta için ${calculation.totalNeeded} adet lastik gerekli (${detailText} × ${calculation.totalDays} gün)`;
        display.className = 'has-calculation';
        
        // Store in answers for report
        answers['lastik-calculation'] = {
            totalNeeded: calculation.totalNeeded,
            weeks: calculation.weeks,
            dailyUsage: calculation.dailyUsage,
            details: calculation.details,
            breakdown: calculation.breakdown
        };
    }
    
    // Update main output
    updateSeffafOutput();
}