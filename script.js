// Global variables
let answers = {};
let elasticSelections = {
    sag: { 
        active: false, 
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null }
        }
    },
    sol: { 
        active: false, 
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null }
        }
    },
    on: { active: false, tur: null, sure: null }
};

// Sonraki seans lastik seçimleri
let nextElasticSelections = {
    'sag-next': { 
        active: false,
        sameAsNow: false,
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null }
        }
    },
    'sol-next': { 
        active: false,
        sameAsNow: false,
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null }
        }
    },
    'on-next': { active: false, sameAsNow: false, tur: null, sure: null }
};

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Re-initialize tooth charts after tab switch
            setTimeout(() => {
                initializeToothCharts();
            }, 100);
        });
    });

    // Initialize checkbox event listeners
    initializeCheckboxListeners();
    
    // Initialize elastic buttons
    initializeElasticButtons();
    
    // Initialize number inputs
    numberInputs = {
        'onceki-seans': '',
        'mevcut-plak': '',
        'verilecek-plak': ''
    };
    
    // Initialize lastik calculation display
    updateLastikCalculationDisplay();
    
    // Clear localStorage to ensure fresh start
    clearAllStoredData();
});

function initializeCheckboxListeners() {
    // Initialize option buttons for şeffaf plak
    const seffafButtons = document.querySelectorAll('#seffaf-plak .option-btn');
    seffafButtons.forEach(button => {
        button.addEventListener('click', handleOptionButtonClick);
    });

    // Initialize number buttons (old system) - DISABLED: using unified system instead
    // const numberButtons = document.querySelectorAll('#seffaf-plak .number-btn');
    // numberButtons.forEach(button => {
    //     button.addEventListener('click', handleNumberButtonClick);
    // });
    
    // Initialize unified number selectors (new system)
    const unifiedNumberButtons = document.querySelectorAll('.unified-number-selector .number-btn');
    unifiedNumberButtons.forEach(button => {
        button.addEventListener('click', handleUnifiedNumberButtonClick);
    });
    
    // Initialize clear buttons
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(button => {
        button.addEventListener('click', handleClearButtonClick);
    });

    // Initialize randevu buttons
    initializeRandevuButtons();

    // Tel tedavisi checkboxes (keep existing if any)
    const telCheckboxes = document.querySelectorAll('input[name="tel"]');
    const telOutput = document.getElementById('tel-output');
    
    telCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => updateOutput(telCheckboxes, telOutput, 'tel'));
    });
}

function handleOptionButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    const value = button.dataset.value;
    
    // Find all buttons in the same question group
    const questionGroup = button.closest('.question-group');
    const allButtons = questionGroup.querySelectorAll('.option-btn');
    
    // Remove selected class from all buttons in this question
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
    
    // Update the output
    updateSeffafOutput();
}

function handleNumberButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    const value = button.dataset.value;
    
    // Find all number buttons in the same question section
    const questionSection = button.closest('.question-group');
    if (!questionSection) return;
    
    const allButtons = questionSection.querySelectorAll('.number-btn');
    
    // Remove selected class from all buttons in this section
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    button.classList.add('selected');
    
    // Update the combined number display
    updateNumberDisplay();
    
    // Update the output
    updateSeffafOutput();
}

function updateNumberDisplay() {
    // Önceki seans display
    const oncekiOnlar = document.querySelector('.number-btn[data-question="onceki-seans-onlar"].selected');
    const oncekiBirler = document.querySelector('.number-btn[data-question="onceki-seans-birler"].selected');
    const oncekiDisplay = document.getElementById('onceki-seans-display');
    
    if (oncekiDisplay) {
        const onlar = oncekiOnlar ? oncekiOnlar.dataset.value : '-';
        const birler = oncekiBirler ? oncekiBirler.dataset.value : '-';
        
        if (onlar === '-' || birler === '-') {
            oncekiDisplay.textContent = '--';
        } else {
            oncekiDisplay.textContent = onlar + birler;
        }
    }
    
    // Mevcut plak display
    const mevcutOnlar = document.querySelector('.number-btn[data-question="mevcut-plak-onlar"].selected');
    const mevcutBirler = document.querySelector('.number-btn[data-question="mevcut-plak-birler"].selected');
    const mevcutDisplay = document.getElementById('mevcut-plak-display');
    
    if (mevcutDisplay) {
        const onlar = mevcutOnlar ? mevcutOnlar.dataset.value : '-';
        const birler = mevcutBirler ? mevcutBirler.dataset.value : '-';
        
        if (onlar === '-' || birler === '-') {
            mevcutDisplay.textContent = '--';
        } else {
            mevcutDisplay.textContent = onlar + birler;
        }
    }
    
    // Verilecek plak display
    const verilecekOnlar = document.querySelector('.number-btn[data-question="verilecek-plak-onlar"].selected');
    const verilecekBirler = document.querySelector('.number-btn[data-question="verilecek-plak-birler"].selected');
    const verilecekDisplay = document.getElementById('verilecek-plak-display');
    
    if (verilecekDisplay) {
        const onlar = verilecekOnlar ? verilecekOnlar.dataset.value : '-';
        const birler = verilecekBirler ? verilecekBirler.dataset.value : '-';
        
        if (onlar === '-' || birler === '-') {
            verilecekDisplay.textContent = '--';
        } else {
            verilecekDisplay.textContent = onlar + birler;
        }
    }
}

function updateSeffafOutput() {
    const selectedButtons = document.querySelectorAll('#seffaf-plak .option-btn.selected');
    const selectedNumbers = document.querySelectorAll('#seffaf-plak .number-btn.selected');
    const outputElement = document.getElementById('seffaf-output');
    
    // Reset answers for selected buttons only (keep FDI tooth data)
    const tempAnswers = {};
    
    // Handle regular option buttons
    selectedButtons.forEach(button => {
        const question = button.dataset.question;
        const value = button.dataset.value;
        tempAnswers[question] = value;
    });
    
    // Handle unified number inputs
    if (numberInputs['onceki-seans']) {
        const oncekiSeans = parseInt(numberInputs['onceki-seans']);
        tempAnswers['onceki-seans'] = `${oncekiSeans}. plağa kadar verilmişti`;
    }
    
    if (numberInputs['mevcut-plak']) {
        const mevcutPlak = parseInt(numberInputs['mevcut-plak']);
        tempAnswers['mevcut-plak'] = `${mevcutPlak}. plakta`;
    }
    
    if (numberInputs['verilecek-plak']) {
        const verilecekSayisi = parseInt(numberInputs['verilecek-plak']);
        
        // Önceki seansta verilen en son plak sayısını al
        let oncekiSonPlak = 0;
        if (numberInputs['onceki-seans']) {
            oncekiSonPlak = parseInt(numberInputs['onceki-seans']);
        }
        
        // Mevcut plak sayısını al
        let mevcutPlakSayisi = 0;
        if (numberInputs['mevcut-plak']) {
            mevcutPlakSayisi = parseInt(numberInputs['mevcut-plak']);
        }
        
        // Hedef plak sayısını hesapla (mevcut + verilecek)
        const hedefPlakSayisi = mevcutPlakSayisi + verilecekSayisi;
        
        // Verilecek plak numaralarını oluştur (sadece henüz verilmeyenler)
        const verilecekPlaklar = [];
        const baslangicPlak = oncekiSonPlak + 1;
        
        for (let i = baslangicPlak; i <= hedefPlakSayisi; i++) {
            verilecekPlaklar.push(i);
        }
        
        if (verilecekSayisi === 1) {
            tempAnswers['verilecek-plak'] = `Bu seans ${verilecekPlaklar[0]}. plağı vereceğiz`;
        } else {
            const plakListesi = verilecekPlaklar.join(', ');
            tempAnswers['verilecek-plak'] = `Bu seans ${plakListesi} plakları vereceğiz`;
        }
    }
    
    // Merge tempAnswers with global answers (keeping FDI tooth data and manual randevu)
    const manuelRandevu = answers['sonraki-randevu']; // Preserve manual randevu
    
    Object.keys(tempAnswers).forEach(key => {
        answers[key] = tempAnswers[key];
    });
    
    // Restore manual randevu if it was set
    if (manuelRandevu && !tempAnswers['sonraki-randevu']) {
        answers['sonraki-randevu'] = manuelRandevu;
    }
    
    const output = generateSeffafReport(answers);
    outputElement.value = output;
}

// Lastik Calculation Functions
function calculateLastikConsumption() {
    console.log('🔍 calculateLastikConsumption başladı');
    console.log('📋 Mevcut answers:', answers);
    console.log('🎯 nextElasticSelections:', nextElasticSelections);
    console.log('⚡ elasticSelections:', elasticSelections);
    
    // Randevu kaç hafta sonra?
    const randevuText = answers['sonraki-randevu'];
    console.log('📅 Randevu metni:', randevuText);
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
    if (nextElasticSelections['sag-next']) {
        if (nextElasticSelections['sag-next'].sameAsNow) {
            // "Aynı lastiklerle devam" seçili - mevcut SAĞ lastikleri say
            if (elasticSelections['sag'] && elasticSelections['sag'].types) {
                Object.keys(elasticSelections['sag'].types).forEach(type => {
                    if (elasticSelections['sag'].types[type] && elasticSelections['sag'].types[type].selected) {
                        sagCount++;
                    }
                });
            }
        } else if (nextElasticSelections['sag-next'].types) {
            // Manuel seçim - sonraki seans seçimlerini say
            Object.keys(nextElasticSelections['sag-next'].types).forEach(type => {
                if (nextElasticSelections['sag-next'].types[type] && nextElasticSelections['sag-next'].types[type].selected) {
                    sagCount++;
                }
            });
        }
    }
    
    // SOL taraf lastikleri say
    if (nextElasticSelections['sol-next']) {
        if (nextElasticSelections['sol-next'].sameAsNow) {
            // "Aynı lastiklerle devam" seçili - mevcut SOL lastikleri say
            if (elasticSelections['sol'] && elasticSelections['sol'].types) {
                Object.keys(elasticSelections['sol'].types).forEach(type => {
                    if (elasticSelections['sol'].types[type] && elasticSelections['sol'].types[type].selected) {
                        solCount++;
                    }
                });
            }
        } else if (nextElasticSelections['sol-next'].types) {
            // Manuel seçim - sonraki seans seçimlerini say
            Object.keys(nextElasticSelections['sol-next'].types).forEach(type => {
                if (nextElasticSelections['sol-next'].types[type] && nextElasticSelections['sol-next'].types[type].selected) {
                    solCount++;
                }
            });
        }
    }
    
    // ÖN taraf lastikleri say  
    if (nextElasticSelections['on-next']) {
        if (nextElasticSelections['on-next'].sameAsNow) {
            // "Aynı lastiklerle devam" seçili - mevcut ÖN lastiği kontrol et
            if (elasticSelections['on'] && elasticSelections['on'].active && 
                (elasticSelections['on'].tur && elasticSelections['on'].sure)) {
                onCount = 1;
            }
        } else {
            // Manuel seçim - tur ve sure seçili mi kontrol et
            if (nextElasticSelections['on-next'].tur && nextElasticSelections['on-next'].sure) {
                onCount = 1;
            }
        }
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
    console.log('🔧 updateLastikCalculationDisplay çağrıldı');
    const display = document.getElementById('lastik-calculation-result');
    if (!display) {
        console.log('❌ lastik-calculation-result elementi bulunamadı');
        return;
    }
    
    console.log('📱 Mobil hesaplama başlıyor...');
    const calculation = calculateLastikConsumption();
    console.log('📊 Hesaplama sonucu:', calculation);
    
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
}

function updateOutput(checkboxes, outputElement, type) {
    const checkedValues = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedValues.push(checkbox.value);
        }
    });

    // Generate formatted output
    let output = '';
    
    if (type === 'seffaf') {
        output = generateSeffafReport(checkedValues);
    } else if (type === 'tel') {
        output = generateTelReport(checkedValues);
    }
    
    outputElement.value = output;
}

function generateSeffafReport(answers) {
    // Check if there are any meaningful answers (including manual randevu)
    const hasValidAnswers = Object.keys(answers).length > 0 && 
        (Object.keys(answers).some(key => answers[key] && answers[key] !== '') || 
         selectedInterdentalSpaces.size > 0);
    
    if (!hasValidAnswers) {
        return '';
    }

    let report = 'ŞEFFAF PLAK TEDAVİSİ KONTROL RAPORU\n';
    report += '=============================================\n\n';
    
    // RUTİN KONTROLLER bölümü
    if (Object.keys(answers).some(key => ['onceki-seans', 'mevcut-plak', 'verilecek-plak', 'plak-degisim', 'sonraki-randevu', 'adaptasyon', 'atasmanlar'].includes(key)) || selectedInterdentalSpaces.size > 0) {
        report += 'RUTİN KONTROLLER:\n';
        report += '-----------------\n';
        
        if (answers['onceki-seans']) {
            report += `• Önceki seansta ${answers['onceki-seans']}\n`;
        }
        
        if (answers['mevcut-plak']) {
            report += `• Hasta şu an ${answers['mevcut-plak']}\n`;
        }
        
        // Seçilen IPR bölgelerini ekle
        const selectedTeethText = getSelectedTeethText();
        if (selectedTeethText) {
            report += `• IPR yapılacak bölge: ${selectedTeethText}\n`;
        }
        
        if (answers['verilecek-plak']) {
            report += `• Bu seansta ${answers['verilecek-plak']}\n`;
        }
        
        if (answers['plak-degisim']) {
            report += `• ${answers['plak-degisim']}\n`;
        }
        
        if (answers['sonraki-randevu']) {
            report += `• Bir sonraki randevu ${answers['sonraki-randevu']}\n`;
        }
        
        if (answers['ipr-count'] && answers['ipr-category']) {
            report += `• Sonraki seansta ${answers['ipr-count']} adet IPR yapılacak (${answers['ipr-category']})\n`;
        }
        
        if (answers['randevu-duration']) {
            report += `• Bir sonraki randevu süresi: ${answers['randevu-duration']} dakika (${answers['duration-source']})\n`;
        }
        
        if (answers['adaptasyon']) {
            report += `• ${answers['adaptasyon']}\n`;
        }
        
        if (answers['atasmanlar']) {
            report += `• ${answers['atasmanlar']}\n`;
        }
        
        report += '\n';
    }
    
    // MEVCUT LASTİK KULLANIMI bölümü
    if (answers['lastik-durum']) {
        report += 'MEVCUT LASTİK KULLANIMI:\n';
        report += '------------------------\n';
        
        // Lastik seçimlerini ayrı başlıklar altında formatla
        
        // SAĞ LASTİKLER
        const sagSelection = elasticSelections['sag'];
        if (sagSelection.active) {
            const sagParts = [];
            Object.keys(sagSelection.types).forEach(type => {
                const typeData = sagSelection.types[type];
                if (typeData.selected && typeData.duration) {
                    let typeText = '';
                    switch(type) {
                        case 'sinif2': typeText = 'Sınıf II'; break;
                        case 'sinif3': typeText = 'Sınıf III'; break;
                        case 'cross': typeText = 'Cross'; break;
                    }
                    sagParts.push(`${typeText} lastik ${typeData.duration}`);
                }
            });
            
            if (sagParts.length > 0) {
                report += 'SAĞ LASTİKLER:\n';
                sagParts.forEach(part => {
                    report += `• ${part}\n`;
                });
                report += '\n';
            }
        }
        
        // SOL LASTİKLER
        const solSelection = elasticSelections['sol'];
        if (solSelection.active) {
            const solParts = [];
            Object.keys(solSelection.types).forEach(type => {
                const typeData = solSelection.types[type];
                if (typeData.selected && typeData.duration) {
                    let typeText = '';
                    switch(type) {
                        case 'sinif2': typeText = 'Sınıf II'; break;
                        case 'sinif3': typeText = 'Sınıf III'; break;
                        case 'cross': typeText = 'Cross'; break;
                    }
                    solParts.push(`${typeText} lastik ${typeData.duration}`);
                }
            });
            
            if (solParts.length > 0) {
                report += 'SOL LASTİKLER:\n';
                solParts.forEach(part => {
                    report += `• ${part}\n`;
                });
                report += '\n';
            }
        }
        
        // ÖN LASTİKLER
        const onSelection = elasticSelections['on'];
        if (onSelection.active && onSelection.tur && onSelection.sure) {
            report += 'ÖN LASTİKLER:\n';
            report += `• ${onSelection.tur} lastik ${onSelection.sure}\n`;
            report += '\n';
        }
    }
    
    // SONRAKİ SEANSA KADAR LASTİK KULLANIMI bölümü
    const hasNextElastic = Object.keys(nextElasticSelections).some(direction => 
        nextElasticSelections[direction].active && 
        (nextElasticSelections[direction].sameAsNow || 
         Object.values(nextElasticSelections[direction].types || {}).some(type => type.selected && type.duration) ||
         (nextElasticSelections[direction].tur && nextElasticSelections[direction].sure))
    );
    
    if (hasNextElastic) {
        report += 'SONRAKİ SEANSA KADAR LASTİK KULLANIMI:\n';
        report += '--------------------------------------\n';
        
        // SAĞ LASTİKLER
        const sagNextSelection = nextElasticSelections['sag-next'];
        if (sagNextSelection.active) {
            if (sagNextSelection.sameAsNow) {
                report += 'SAĞ LASTİKLER:\n';
                
                // Mevcut lastik verilerini göster
                if (sagNextSelection.currentData && sagNextSelection.currentData.types) {
                    let hasCurrentData = false;
                    Object.keys(sagNextSelection.currentData.types).forEach(type => {
                        const typeData = sagNextSelection.currentData.types[type];
                        if (typeData.selected && typeData.duration) {
                            let typeText = '';
                            switch(type) {
                                case 'sinif2': typeText = 'Sınıf II'; break;
                                case 'sinif3': typeText = 'Sınıf III'; break;
                                case 'cross': typeText = 'Cross'; break;
                            }
                            report += `• ${typeText} lastik ${typeData.duration} (devam)\n`;
                            hasCurrentData = true;
                        }
                    });
                    
                    if (!hasCurrentData) {
                        report += '• Aynı lastiklerle devam (mevcut seçim yok)\n';
                    }
                } else {
                    report += '• Aynı lastiklerle devam (mevcut seçim yok)\n';
                }
                report += '\n';
            } else {
                const sagNextParts = [];
                Object.keys(sagNextSelection.types).forEach(type => {
                    const typeData = sagNextSelection.types[type];
                    if (typeData.selected && typeData.duration) {
                        let typeText = '';
                        switch(type) {
                            case 'sinif2': typeText = 'Sınıf II'; break;
                            case 'sinif3': typeText = 'Sınıf III'; break;
                            case 'cross': typeText = 'Cross'; break;
                        }
                        sagNextParts.push(`${typeText} lastik ${typeData.duration}`);
                    }
                });
                
                if (sagNextParts.length > 0) {
                    report += 'SAĞ LASTİKLER:\n';
                    sagNextParts.forEach(part => {
                        report += `• ${part}\n`;
                    });
                    report += '\n';
                }
            }
        }
        
        // SOL LASTİKLER
        const solNextSelection = nextElasticSelections['sol-next'];
        if (solNextSelection.active) {
            if (solNextSelection.sameAsNow) {
                report += 'SOL LASTİKLER:\n';
                
                // Mevcut lastik verilerini göster
                if (solNextSelection.currentData && solNextSelection.currentData.types) {
                    let hasCurrentData = false;
                    Object.keys(solNextSelection.currentData.types).forEach(type => {
                        const typeData = solNextSelection.currentData.types[type];
                        if (typeData.selected && typeData.duration) {
                            let typeText = '';
                            switch(type) {
                                case 'sinif2': typeText = 'Sınıf II'; break;
                                case 'sinif3': typeText = 'Sınıf III'; break;
                                case 'cross': typeText = 'Cross'; break;
                            }
                            report += `• ${typeText} lastik ${typeData.duration} (devam)\n`;
                            hasCurrentData = true;
                        }
                    });
                    
                    if (!hasCurrentData) {
                        report += '• Aynı lastiklerle devam (mevcut seçim yok)\n';
                    }
                } else {
                    report += '• Aynı lastiklerle devam (mevcut seçim yok)\n';
                }
                report += '\n';
            } else {
                const solNextParts = [];
                Object.keys(solNextSelection.types).forEach(type => {
                    const typeData = solNextSelection.types[type];
                    if (typeData.selected && typeData.duration) {
                        let typeText = '';
                        switch(type) {
                            case 'sinif2': typeText = 'Sınıf II'; break;
                            case 'sinif3': typeText = 'Sınıf III'; break;
                            case 'cross': typeText = 'Cross'; break;
                        }
                        solNextParts.push(`${typeText} lastik ${typeData.duration}`);
                    }
                });
                
                if (solNextParts.length > 0) {
                    report += 'SOL LASTİKLER:\n';
                    solNextParts.forEach(part => {
                        report += `• ${part}\n`;
                    });
                    report += '\n';
                }
            }
        }
        
        // ÖN LASTİKLER
        const onNextSelection = nextElasticSelections['on-next'];
        if (onNextSelection.active) {
            if (onNextSelection.sameAsNow) {
                report += 'ÖN LASTİKLER:\n';
                
                // Mevcut lastik verilerini göster
                if (onNextSelection.currentData && onNextSelection.currentData.tur && onNextSelection.currentData.sure) {
                    report += `• ${onNextSelection.currentData.tur} lastik ${onNextSelection.currentData.sure} (devam)\n`;
                } else {
                    report += '• Aynı lastiklerle devam (mevcut seçim yok)\n';
                }
                report += '\n';
            } else if (onNextSelection.tur && onNextSelection.sure) {
                report += 'ÖN LASTİKLER:\n';
                report += `• ${onNextSelection.tur} lastik ${onNextSelection.sure}\n`;
                report += '\n';
            }
        }
    }
    

    
    // EK İHTİYAÇLAR bölümü
    if (answers['lastik-calculation'] || answers['sakiz-ihtiyac']) {
        report += 'EK İHTİYAÇLAR:\n';
        report += '-------------\n';
        
        // Always show lastik calculation if available
        if (answers['lastik-calculation']) {
            const calc = answers['lastik-calculation'];
            const detailText = calc.details.join(', ');
            report += `• Lastik İhtiyacı: ${calc.weeks} hafta için ${calc.totalNeeded} adet lastik pakedi gerekli (${detailText})\n`;
        }
        
        if (answers['sakiz-ihtiyac']) {
            report += `• ${answers['sakiz-ihtiyac']}\n`;
        }
        
        report += '\n';
    }
    
    // MOTİVASYON VE UYUM DEĞERLENDİRMESİ bölümü
    if (answers['lastik-aksama'] || answers['lastik-saat'] || answers['plak-aksama'] || answers['plak-saat'] || answers['plak-temizlik'] || answers['agiz-hijyen']) {
        report += 'MOTİVASYON VE UYUM DEĞERLENDİRMESİ:\n';
        report += '-----------------------------------\n';
        
        // Lastik kullanım aksama
        if (answers['lastik-aksama']) {
            report += `• ${answers['lastik-aksama']}\n`;
        }
        
        // Lastik kullanım saati
        if (answers['lastik-saat']) {
            report += `• Lastik kullanım süresi: ${answers['lastik-saat']}\n`;
        }
        
        // Plak aksama
        if (answers['plak-aksama']) {
            report += `• ${answers['plak-aksama']}\n`;
        }
        
        // Plak kullanım saati
        if (answers['plak-saat']) {
            report += `• Plak kullanım süresi: ${answers['plak-saat']}\n`;
        }
        
        // Plak temizlik
        if (answers['plak-temizlik']) {
            report += `• ${answers['plak-temizlik']}\n`;
        }
        
        // Ağız hijyeni
        if (answers['agiz-hijyen']) {
            report += `• ${answers['agiz-hijyen']}\n`;
        }
        
        report += '\n';
    }
    
    // Genel değerlendirme
    report += 'GENEL DEĞERLENDİRME:\n';
    report += '--------------------\n';
    
    // Otomatik öneriler
    if (answers['plak-saat'] && answers['plak-saat'].includes('Yetersiz')) {
        report += '• Hasta motivasyonu artırılmalı, plak kullanım süresi yetersiz\n';
    }
    
    if (answers['plak-aksama'] && (answers['plak-aksama'].includes('ciddi aksama') || answers['plak-aksama'].includes('Kullanmıyor'))) {
        report += '• Plak kullanım motivasyonu artırılmalı, hasta eğitimi tekrarlanmalı\n';
    }
    
    if (answers['plak-temizlik'] && (answers['plak-temizlik'].includes('1/10') || answers['plak-temizlik'].includes('2/10') || answers['plak-temizlik'].includes('3/10'))) {
        report += '• Plak temizlik eğitimi tekrarlanmalı\n';
    }
    
    if (answers['agiz-hijyen'] && (answers['agiz-hijyen'].includes('1/10') || answers['agiz-hijyen'].includes('2/10') || answers['agiz-hijyen'].includes('3/10'))) {
        report += '• Ağız hijyen eğitimi güçlendirilmeli\n';
    }
    
    if (answers['adaptasyon'] && answers['adaptasyon'].includes('eksik')) {
        report += '• Plak adaptasyonu kontrol edilmeli, gerekirse yeniden alınmalı\n';
    }
    
    report += '\n' + getCurrentDate();
    
    return report;
}

function generateTelReport(selectedItems) {
    if (selectedItems.length === 0) {
        return '';
    }

    let report = 'TEL TEDAVİSİ DEĞERLENDİRMESİ\n';
    report += '=====================================\n\n';
    report += 'Muayene Bulguları:\n';
    
    selectedItems.forEach((item, index) => {
        report += `${index + 1}. ${item}\n`;
    });
    
    report += '\nDeğerlendirme:\n';
    
    if (selectedItems.some(item => item.includes('Metal braket') || item.includes('Seramik braket'))) {
        report += '• Braket tedavisi uygunluğu değerlendirilmiştir.\n';
    }
    
    if (selectedItems.some(item => item.includes('Çekim endikasyonu var'))) {
        report += '• Çekim endikasyonu mevcuttur, detaylı planlama yapılacaktır.\n';
    } else if (selectedItems.some(item => item.includes('Çekim endikasyonu yok'))) {
        report += '• Çekim endikasyonu bulunmamaktadır.\n';
    }
    
    if (selectedItems.some(item => item.includes('Ankraj'))) {
        report += '• Ankraj ihtiyacı değerlendirilmiştir.\n';
    }
    
    if (selectedItems.some(item => item.includes('Elastik'))) {
        report += '• Elastik kullanımı hastaya açıklanmıştır.\n';
    }
    
    if (selectedItems.some(item => item.includes('18-24 ay'))) {
        report += '• Tahmini tedavi süresi hastaya açıklanmıştır.\n';
    }
    
    if (selectedItems.some(item => item.includes('hijyen'))) {
        report += '• Ağız hijyeni eğitimi verilmiştir.\n';
    }
    
    if (selectedItems.some(item => item.includes('Beslenme'))) {
        report += '• Beslenme önerileri detaylı olarak açıklanmıştır.\n';
    }
    
    if (selectedItems.some(item => item.includes('4-6 haftalık'))) {
        report += '• Kontrol sıklığı hastaya açıklanmıştır.\n';
    }
    
    report += '\n' + getCurrentDate();
    
    return report;
}

function getCurrentDate() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    return `Tarih: ${day}.${month}.${year}`;
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value;
    
    if (text.trim() === '') {
        alert('Kopyalanacak metin bulunmuyor. Lütfen önce değerlendirme kriterlerini işaretleyin.');
        return;
    }
    
    // Create temporary textarea for copying
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    
    // Select and copy
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        if (successful) {
            showCopySuccess(elementId);
        } else {
            // Fallback for modern browsers
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess(elementId);
            }).catch(err => {
                alert('Kopyalama işlemi başarısız oldu. Lütfen metni manuel olarak seçip kopyalayın.');
            });
        }
    } catch (err) {
        document.body.removeChild(tempTextarea);
        
        // Modern clipboard API fallback
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess(elementId);
            }).catch(err => {
                alert('Kopyalama işlemi başarısız oldu. Lütfen metni manuel olarak seçip kopyalayın.');
            });
        } else {
            alert('Kopyalama işlemi başarısız oldu. Lütfen metni manuel olarak seçip kopyalayın.');
        }
    }
}

// FDI Tooth Chart Functions - Initialize after DOM is ready
function initializeToothCharts() {
    const toothButtons = document.querySelectorAll('.tooth-btn-fdi');
    console.log('Found tooth buttons:', toothButtons.length);
    
    toothButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Tooth clicked:', this.dataset.tooth, this.dataset.question);
            toggleToothSelection(this);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeToothCharts();
    // Initialize randevu buttons
    initializeRandevuButtons();
});

function toggleToothSelection(button) {
    const isSelected = button.classList.contains('selected');
    const toothNumber = button.dataset.tooth;
    const questionType = button.dataset.question;
    
    console.log('Toggling tooth:', toothNumber, 'Question:', questionType, 'Was selected:', isSelected);
    
    if (isSelected) {
        button.classList.remove('selected');
    } else {
        button.classList.add('selected');
    }
    
    updateToothOutput(questionType);
}

function updateToothOutput(questionType) {
    const selectedButtons = document.querySelectorAll(`.tooth-btn-fdi[data-question="${questionType}"].selected`);
    const selectedTeeth = Array.from(selectedButtons).map(btn => btn.dataset.tooth).sort((a, b) => parseInt(a) - parseInt(b));
    
    console.log('Selected teeth for', questionType, ':', selectedTeeth);
    
    if (selectedTeeth.length > 0) {
        let outputText = '';
        if (questionType === 'adaptasyon') {
            outputText = `${selectedTeeth.join(', ')} numaralı dişlerde plak adaptasyonu yetersiz`;
            answers['adaptasyon'] = outputText;
        } else if (questionType === 'atasmanlar') {
            outputText = `${selectedTeeth.join(', ')} numaralı dişlerde ataşman eksik`;
            answers['atasmanlar'] = outputText;
        }
        console.log('Setting answer:', questionType, '=', outputText);
        updateSeffafOutput();
    } else {
        console.log('Deleting answer:', questionType);
        delete answers[questionType];
        updateSeffafOutput();
    }
}

function clearToothSelection(questionType) {
    const buttons = document.querySelectorAll(`.tooth-btn-fdi[data-question="${questionType}"]`);
    buttons.forEach(button => {
        button.classList.remove('selected');
    });
    delete answers[questionType];
    updateSeffafOutput();
}

function clearOutput(elementId) {
    const outputElement = document.getElementById(elementId);
    if (outputElement) {
        outputElement.value = '';
        
        // Clear all form selections based on which output we're clearing
        if (elementId === 'seffaf-output') {
            // Clear all şeffaf plak selections
            clearAllSeffafSelections();
        } else if (elementId === 'tel-output') {
            // Clear all tel tedavisi selections
            clearAllTelSelections();
        }
        
        // Show success message
        const container = outputElement.parentElement;
        const clearButton = container.querySelector('.clear-btn');
        if (clearButton) {
            const originalText = clearButton.textContent;
            clearButton.textContent = '✅ Temizlendi';
            clearButton.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                clearButton.textContent = originalText;
                clearButton.style.backgroundColor = '#dc3545';
            }, 1500);
        }
    }
}

function clearAllSeffafSelections() {
    // Clear all checkboxes in şeffaf plak tab
    const seffafTab = document.getElementById('seffaf-plak');
    const checkboxes = seffafTab.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear all radio buttons in şeffaf plak tab
    const radioButtons = seffafTab.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear all option buttons
    const optionButtons = seffafTab.querySelectorAll('.option-btn.selected');
    optionButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear all score buttons
    const scoreButtons = seffafTab.querySelectorAll('.score-btn.selected');
    scoreButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear all unified number buttons
    const numberButtons = seffafTab.querySelectorAll('.unified-number-btn.selected');
    numberButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear IPR selections
    clearIPRSelections();
    
    // Clear dental chart selections
    clearToothSelection('adaptasyon');
    clearToothSelection('atasmanlar');
    
    // Clear elastic selections
    clearAllElasticSelections();
    
    // Clear rutin kontroller (number inputs and displays)
    clearRutinKontroller();
    
    // Clear ek ihtiyaçlar selections
    clearEkIhtiyaclar();
    
    // Clear motivasyon sorularını da answers'dan sil
    clearMotivasyonAnswers();
    
    // Clear lastik calculations
    clearLastikCalculations();
    
    // Clear randevu inputs
    clearRandevuInputs();
    
    // Clear IPR duration calculations
    clearIPRDurationCalculations();
    
    // Update output
    updateSeffafOutput();
}

function clearAllTelSelections() {
    // Clear all checkboxes in tel tedavisi tab
    const telTab = document.getElementById('tel-tedavisi');
    const checkboxes = telTab.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear all radio buttons in tel tedavisi tab
    const radioButtons = telTab.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // Clear all option buttons
    const optionButtons = telTab.querySelectorAll('.option-btn.selected');
    optionButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear all score buttons
    const scoreButtons = telTab.querySelectorAll('.score-btn.selected');
    scoreButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Update output
    updateTelOutput();
}

function clearIPRSelections() {
    // Clear upper jaw selections
    const upperJawButtons = document.querySelectorAll('#ust-cene .tooth-btn.selected');
    upperJawButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear lower jaw selections
    const lowerJawButtons = document.querySelectorAll('#alt-cene .tooth-btn.selected');
    lowerJawButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear the selected teeth display
    const selectedTeethDisplay = document.querySelector('.selected-teeth-display .teeth-display');
    if (selectedTeethDisplay) {
        selectedTeethDisplay.textContent = 'Henüz bölge seçilmedi';
    }
    
    // Clear the global IPR data
    if (typeof selectedInterdentalSpaces !== 'undefined') {
        selectedInterdentalSpaces.clear();
    }
}

function clearAllElasticSelections() {
    // Clear current session elastic selections
    elasticSelections = {
        sag: { 
            active: false, 
            types: {
                sinif2: { selected: false, duration: null },
                sinif3: { selected: false, duration: null },
                cross: { selected: false, duration: null }
            }
        },
        sol: { 
            active: false, 
            types: {
                sinif2: { selected: false, duration: null },
                sinif3: { selected: false, duration: null },
                cross: { selected: false, duration: null }
            }
        },
        on: { active: false, tur: null, sure: null }
    };
    
    // Clear next session elastic selections
    nextElasticSelections = {
        'sag-next': { 
            active: false,
            sameAsNow: false,
            types: {
                sinif2: { selected: false, duration: null },
                sinif3: { selected: false, duration: null },
                cross: { selected: false, duration: null }
            }
        },
        'sol-next': { 
            active: false,
            sameAsNow: false,
            types: {
                sinif2: { selected: false, duration: null },
                sinif3: { selected: false, duration: null },
                cross: { selected: false, duration: null }
            }
        },
        'on-next': { active: false, sameAsNow: false, tur: null, sure: null }
    };
    
    // Clear all elastic button selections
    const allElasticButtons = document.querySelectorAll('.elastic-main-btn.active, .elastic-type-btn.active, .elastic-duration-btn.selected, .elastic-sub-btn.selected');
    allElasticButtons.forEach(btn => {
        btn.classList.remove('active', 'selected');
    });
    
    // Hide all elastic options and duration containers
    const allElasticOptions = document.querySelectorAll('.elastic-options');
    allElasticOptions.forEach(option => {
        option.style.display = 'none';
    });
    
    // Hide all duration containers
    const allDurationContainers = document.querySelectorAll('.elastic-duration-buttons');
    allDurationContainers.forEach(container => {
        container.style.display = 'none';
    });
}

function clearRutinKontroller() {
    // Clear number button selections and displays
    const numberQuestions = ['onceki-seans', 'mevcut-plak', 'verilecek-plak'];
    
    numberQuestions.forEach(questionId => {
        // Clear number button selections
        const numberButtons = document.querySelectorAll(`[data-question="${questionId}"].number-btn.selected`);
        numberButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Clear numberInputs
        numberInputs[questionId] = '';
        
        // Clear display
        const display = document.getElementById(`${questionId}-display`);
        if (display) {
            display.textContent = '--';
        }
        
        // Clear from answers object
        delete answers[questionId];
    });
    
    // Clear plak değişim buttons
    const plakDegisimButtons = document.querySelectorAll('.plak-degisim-btn.selected');
    plakDegisimButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear plak değişim from answers
    delete answers['plak-degisim'];
    
    // Clear randevu buttons
    const randevuButtons = document.querySelectorAll('.randevu-btn.selected, .randevu-manuel-btn.selected');
    randevuButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Hide manuel input and clear
    hideManuelInput();
    
    // Clear IPR count input
    const iprInput = document.getElementById('ipr-count-input');
    if (iprInput) {
        iprInput.value = '';
        updateIPRDurationDisplay();
    }
    
    // Clear duration method selection
    const durationButtons = document.querySelectorAll('.duration-method-btn.selected');
    durationButtons.forEach(btn => btn.classList.remove('selected'));
    
    const durationContainer = document.querySelector('.duration-input-container');
    if (durationContainer) {
        durationContainer.style.display = 'none';
    }
    
    const manualDurationInput = document.getElementById('manual-duration-input');
    if (manualDurationInput) {
        manualDurationInput.value = '';
    }
    
    const durationResult = document.getElementById('duration-result');
    if (durationResult) {
        durationResult.textContent = 'Süre hesaplama yöntemi seçin';
    }
    
    // Clear randevu from answers
    delete answers['sonraki-randevu'];
    delete answers['ipr-count'];
    delete answers['ipr-duration'];
    delete answers['ipr-category'];
    delete answers['randevu-duration'];
    delete answers['duration-method'];
    delete answers['duration-source'];
}

function clearEkIhtiyaclar() {
    // Clear sakız ihtiyacı buttons  
    const sakizButtons = document.querySelectorAll('[data-question="sakiz-ihtiyac"].option-btn.selected');
    sakizButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear from answers object
    delete answers['sakiz-ihtiyac'];
}

function clearLastikCalculations() {
    // Clear lastik calculation display
    const lastikCalculationDisplay = document.getElementById('lastik-calculation-display');
    if (lastikCalculationDisplay) {
        lastikCalculationDisplay.innerHTML = '';
        lastikCalculationDisplay.style.display = 'none';
    }
    
    // Clear lastik result display in output
    const lastikResult = document.querySelector('.lastik-result');
    if (lastikResult) {
        lastikResult.remove();
    }
}

function clearRandevuInputs() {
    // Clear randevu number input
    const randevuInput = document.getElementById('randevu-sayisi');
    if (randevuInput) {
        randevuInput.value = '';
    }
    
    // Clear manuel randevu input
    const manuelRandevuInput = document.getElementById('manuel-randevu');
    if (manuelRandevuInput) {
        manuelRandevuInput.value = '';
    }
    
    // Clear randevu preview
    const randevuPreview = document.getElementById('randevu-preview');
    if (randevuPreview) {
        randevuPreview.innerHTML = '';
    }
    
    // Clear from answers object
    delete answers['randevu-sayisi'];
    delete answers['manuel-randevu'];
}

function clearIPRDurationCalculations() {
    // Clear IPR duration display
    const iprDurationDisplay = document.getElementById('ipr-duration-display');
    if (iprDurationDisplay) {
        iprDurationDisplay.innerHTML = '';
        iprDurationDisplay.style.display = 'none';
    }
    
    // Clear duration method selection
    const durationButtons = document.querySelectorAll('.duration-method-btn.selected');
    durationButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear manual duration input
    const manualDurationInput = document.getElementById('manual-duration');
    if (manualDurationInput) {
        manualDurationInput.value = '';
    }
    
    // Clear duration result display
    const durationResult = document.getElementById('duration-result');
    if (durationResult) {
        durationResult.innerHTML = '';
    }
}

function clearMotivasyonAnswers() {
    // Clear motivasyon related answers that are set by option buttons
    const motivasyonKeys = ['lastik-aksama', 'lastik-saat', 'plak-aksama', 'plak-saat', 'plak-temizlik', 'agiz-hijyen'];
    
    motivasyonKeys.forEach(key => {
        delete answers[key];
    });
}

function showCopySuccess(elementId) {
    // Find the copy button in the same container
    const container = document.getElementById(elementId).parentElement;
    const copyButton = container.querySelector('.copy-btn');
    if (copyButton) {
        showButtonSuccess(copyButton);
    }
    
    // Show success message
    const originalText = copyBtn ? copyBtn.textContent : 'Kopyalandı!';
    const button = copyBtn || document.querySelector('.copy-btn');
    
    if (button) {
        const original = button.innerHTML;
        button.innerHTML = '✓ Kopyalandı!';
        button.classList.add('copy-success');
        
        setTimeout(() => {
            button.innerHTML = original;
            button.classList.remove('copy-success');
        }, 2000);
    }
}

function showButtonSuccess(button) {
    const original = button.innerHTML;
    button.innerHTML = '✓ Kopyalandı!';
    button.classList.add('copy-success');
    
    setTimeout(() => {
        button.innerHTML = original;
        button.classList.remove('copy-success');
    }, 2000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+1 for first tab
    if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        document.querySelector('[data-tab="seffaf-plak"]').click();
    }
    
    // Ctrl+2 for second tab
    if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        document.querySelector('[data-tab="tel-tedavisi"]').click();
    }
});

// Auto-save functionality (optional - stores in localStorage)
function autoSave() {
    // Auto-save devre dışı - her açılışta temiz başlangıç için
    return;
    
    const seffafButtons = document.querySelectorAll('#seffaf-plak .option-btn.selected');
    const seffafNumbers = document.querySelectorAll('#seffaf-plak .number-btn.selected');
    const telCheckboxes = document.querySelectorAll('input[name="tel"]');
    
    const seffafState = {};
    const telState = [];
    
    // Save regular option buttons
    seffafButtons.forEach(button => {
        const question = button.dataset.question;
        const value = button.dataset.value;
        seffafState[question] = value;
    });
    
    // Save number buttons
    seffafNumbers.forEach(button => {
        const question = button.dataset.question;
        const value = button.dataset.value;
        seffafState[question] = value;
    });
    
    telCheckboxes.forEach((checkbox, index) => {
        telState[index] = checkbox.checked;
    });
    
    localStorage.setItem('ortodonti-seffaf-state', JSON.stringify(seffafState));
    localStorage.setItem('ortodonti-tel-state', JSON.stringify(telState));
}

// Load saved state
function loadSavedState() {
    try {
        const seffafState = JSON.parse(localStorage.getItem('ortodonti-seffaf-state') || '{}');
        const telState = JSON.parse(localStorage.getItem('ortodonti-tel-state') || '[]');
        
        // Load şeffaf plak button states (both option and number buttons)
        Object.entries(seffafState).forEach(([question, value]) => {
            // Try option buttons first
            let button = document.querySelector(`#seffaf-plak .option-btn[data-question="${question}"][data-value="${value}"]`);
            
            // If not found, try number buttons
            if (!button) {
                button = document.querySelector(`#seffaf-plak .number-btn[data-question="${question}"][data-value="${value}"]`);
            }
            
            if (button) {
                button.classList.add('selected');
            }
        });
        
        // Load tel tedavisi checkbox states
        const telCheckboxes = document.querySelectorAll('input[name="tel"]');
        telCheckboxes.forEach((checkbox, index) => {
            if (telState[index] !== undefined) {
                checkbox.checked = telState[index];
            }
        });
        
        // Update displays and outputs after loading state
        updateNumberDisplay();
        updateSeffafOutput();
        updateOutput(telCheckboxes, document.getElementById('tel-output'), 'tel');
        
    } catch (e) {
        console.log('No saved state found or error loading state');
    }
}

// Save state on button click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('option-btn') || e.target.classList.contains('number-btn')) {
        setTimeout(autoSave, 100); // Small delay to ensure state is updated
    }
});

// Save state on checkbox change
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        autoSave();
    }
});

// Load state on page load
// document.addEventListener('DOMContentLoaded', loadSavedState); // Devre dışı - ilk açılışta hiçbir şey seçili olmasın

// Clear all stored data for fresh start
function clearAllStoredData() {
    try {
        localStorage.removeItem('ortodonti-seffaf-state');
        localStorage.removeItem('ortodonti-tel-state');
        // Don't clear font sizes as user preferences should persist
        // localStorage.removeItem('ortodonti-font-sizes');
    } catch (e) {
        console.log('LocalStorage temizlenirken hata:', e);
    }
}

// Font size control
let fontSizes = {
    'seffaf-output': 14,
    'tel-output': 14
};

function changeFontSize(elementId, delta) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Update font size (minimum 10px, maximum 24px)
    fontSizes[elementId] = Math.max(10, Math.min(24, fontSizes[elementId] + delta));
    
    // Apply new font size
    element.style.fontSize = fontSizes[elementId] + 'px';
    
    // Save to localStorage
    localStorage.setItem('ortodonti-font-sizes', JSON.stringify(fontSizes));
}

// Load saved font sizes
function loadSavedFontSizes() {
    try {
        const savedSizes = JSON.parse(localStorage.getItem('ortodonti-font-sizes') || '{}');
        
        Object.entries(savedSizes).forEach(([elementId, size]) => {
            if (fontSizes.hasOwnProperty(elementId)) {
                fontSizes[elementId] = size;
                const element = document.getElementById(elementId);
                if (element) {
                    element.style.fontSize = size + 'px';
                }
            }
        });
    } catch (e) {
        console.log('Font size loading error:', e);
    }
}

// Load font sizes on page load
document.addEventListener('DOMContentLoaded', loadSavedFontSizes);

// FDI Dental Chart Functionality
let selectedInterdentalSpaces = new Set();

document.addEventListener('DOMContentLoaded', function() {
    initializeToothSelection();
});

function initializeToothSelection() {
    const interdentalButtons = document.querySelectorAll('.interdental-btn');
    const clearButton = document.querySelector('.clear-teeth-btn');
    
    // Interdental butonları
    interdentalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const position = this.dataset.position;
            
            if (this.classList.contains('selected')) {
                // Remove from selection
                this.classList.remove('selected');
                selectedInterdentalSpaces.delete(position);
            } else {
                // Add to selection
                this.classList.add('selected');
                selectedInterdentalSpaces.add(position);
            }
            
            updateSelectedTeethDisplay();
            updateSeffafOutput(); // Güncelle çıktıyı
        });
    });
    
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Clear all selections
            interdentalButtons.forEach(button => {
                button.classList.remove('selected');
            });
            selectedInterdentalSpaces.clear();
            updateSelectedTeethDisplay();
            updateSeffafOutput(); // Güncelle çıktıyı
        });
    }
}

function updateSelectedTeethDisplay() {
    const display = document.getElementById('selected-teeth-display');
    
    if (selectedInterdentalSpaces.size === 0) {
        display.textContent = 'Henüz bölge seçilmedi';
    } else {
        const sortedSpaces = Array.from(selectedInterdentalSpaces).sort();
        display.textContent = `IPR: ${sortedSpaces.join(', ')}`;
    }
}

function getSelectedTeethText() {
    if (selectedInterdentalSpaces.size === 0) {
        return '';
    }
    
    const sortedSpaces = Array.from(selectedInterdentalSpaces).sort();
    
    if (sortedSpaces.length === 1) {
        return `${sortedSpaces[0]} bölgesi`;
    } else {
        const lastSpace = sortedSpaces.pop();
        return `${sortedSpaces.join(', ')} ve ${lastSpace} bölgeleri`;
    }
}

// Unified Number Button Handler
function handleUnifiedNumberButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    const value = button.dataset.value;
    
    if (!question || !value) return;
    
    // Append digit to current input
    if (numberInputs[question] && numberInputs[question].length < 2) { // Limit to 2 digits
        numberInputs[question] += value;
    } else if (!numberInputs[question]) {
        numberInputs[question] = value;
    }
    
    // Update display
    updateUnifiedNumberDisplay(question);
    
    // Update output
    updateSeffafOutput();
}

// Clear Button Handler
function handleClearButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    
    if (!question) return;
    
    // Clear the input
    numberInputs[question] = '';
    
    // Update display
    updateUnifiedNumberDisplay(question);
    
    // Update output
    updateSeffafOutput();
}

// Update unified number displays
function updateUnifiedNumberDisplay(question) {
    if (!question) return;
    
    const displayElement = document.getElementById(question + '-display');
    if (displayElement) {
        const value = numberInputs[question];
        displayElement.textContent = value || '--';
    }
}

// Lastik Fonksiyonları
function initializeElasticButtons() {
    // Ana yön butonları
    const mainButtons = document.querySelectorAll('.elastic-main-btn');
    mainButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.direction;
            toggleElasticDirection(direction, this);
        });
    });

    // Lastik tür seçme butonları (yeni)
    const typeButtons = document.querySelectorAll('.elastic-type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const elasticType = this.dataset.elasticType;
            toggleElasticType(parent, elasticType, this);
        });
    });

    // Süre seçme butonları (yeni)
    const durationButtons = document.querySelectorAll('.elastic-duration-btn');
    durationButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const elasticType = this.dataset.elasticType;
            const duration = this.dataset.duration;
            selectElasticDuration(parent, elasticType, duration, this);
        });
    });

    // Eski alt seçenek butonları (ön için)
    const subButtons = document.querySelectorAll('.elastic-sub-btn');
    subButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const type = this.dataset.type;
            const value = this.dataset.value;
            selectElasticOption(parent, type, value, this);
        });
    });
    
    // "Aynı lastiklerle devam" butonları
    const sameElasticButtons = document.querySelectorAll('.same-elastic-btn');
    sameElasticButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.direction;
            toggleSameElastic(direction, this);
        });
    });
}

function toggleElasticDirection(direction, buttonElement) {
    const optionsContainer = document.getElementById(direction + '-options');
    
    // Sonraki seans butonları için
    if (direction.includes('-next')) {
        const isCurrentlyActive = nextElasticSelections[direction].active;
        
        if (isCurrentlyActive) {
            // Deaktif et
            if (direction === 'on-next') {
                nextElasticSelections[direction] = { active: false, sameAsNow: false, tur: null, sure: null };
            } else {
                nextElasticSelections[direction].active = false;
                nextElasticSelections[direction].sameAsNow = false;
                // Tüm tür seçimlerini sıfırla
                Object.keys(nextElasticSelections[direction].types).forEach(type => {
                    nextElasticSelections[direction].types[type] = { selected: false, duration: null };
                });
            }
            buttonElement.classList.remove('active');
            optionsContainer.style.display = 'none';
            
            // "Aynı lastiklerle devam" butonunu da sıfırla
            const sameBtn = buttonElement.parentElement.querySelector('.same-elastic-btn');
            if (sameBtn) sameBtn.classList.remove('active');
            
            // Alt butonları temizle
            const typeButtons = optionsContainer.querySelectorAll('.elastic-type-btn');
            const durationButtons = optionsContainer.querySelectorAll('.elastic-duration-btn');
            const subButtons = optionsContainer.querySelectorAll('.elastic-sub-btn');
            
            typeButtons.forEach(btn => btn.classList.remove('active'));
            durationButtons.forEach(btn => btn.classList.remove('selected'));
            subButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Süre butonlarını gizle
            const durationContainers = optionsContainer.querySelectorAll('.elastic-duration-buttons');
            durationContainers.forEach(container => container.style.display = 'none');
        } else {
            // Aktif et
            nextElasticSelections[direction].active = true;
            buttonElement.classList.add('active');
            optionsContainer.style.display = 'block';
        }
    } else {
        // Mevcut sistem (değişiklik yok)
        const isCurrentlyActive = elasticSelections[direction].active;

        if (isCurrentlyActive) {
            // Deaktif et
            if (direction === 'on') {
                elasticSelections[direction] = { active: false, tur: null, sure: null };
            } else {
                elasticSelections[direction].active = false;
                // Tüm tür seçimlerini sıfırla
                Object.keys(elasticSelections[direction].types).forEach(type => {
                    elasticSelections[direction].types[type] = { selected: false, duration: null };
                });
            }
            buttonElement.classList.remove('active');
            optionsContainer.style.display = 'none';
            
            // Alt butonları temizle
            const typeButtons = optionsContainer.querySelectorAll('.elastic-type-btn');
            const durationButtons = optionsContainer.querySelectorAll('.elastic-duration-btn');
            const subButtons = optionsContainer.querySelectorAll('.elastic-sub-btn');
            
            typeButtons.forEach(btn => btn.classList.remove('active'));
            durationButtons.forEach(btn => btn.classList.remove('selected'));
            subButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Süre butonlarını gizle
            const durationContainers = optionsContainer.querySelectorAll('.elastic-duration-buttons');
            durationContainers.forEach(container => container.style.display = 'none');
        } else {
            // Aktif et
            elasticSelections[direction].active = true;
            buttonElement.classList.add('active');
            optionsContainer.style.display = 'block';
        }
    }
    
    updateElasticReport();
}

function toggleElasticType(parent, elasticType, buttonElement) {
    const durationContainer = document.getElementById(`${parent}-${elasticType}-duration`);
    
    // Sonraki seans için
    if (parent.includes('-next')) {
        const isCurrentlySelected = nextElasticSelections[parent].types[elasticType].selected;
        
        if (isCurrentlySelected) {
            // Deselect
            nextElasticSelections[parent].types[elasticType] = { selected: false, duration: null };
            buttonElement.classList.remove('active');
            durationContainer.style.display = 'none';
            
            // Süre butonlarını temizle
            const durationButtons = durationContainer.querySelectorAll('.elastic-duration-btn');
            durationButtons.forEach(btn => btn.classList.remove('selected'));
        } else {
            // Select
            nextElasticSelections[parent].types[elasticType].selected = true;
            buttonElement.classList.add('active');
            durationContainer.style.display = 'flex';
        }
    } else {
        // Mevcut sistem
        const isCurrentlySelected = elasticSelections[parent].types[elasticType].selected;
        
        if (isCurrentlySelected) {
            // Deselect
            elasticSelections[parent].types[elasticType] = { selected: false, duration: null };
            buttonElement.classList.remove('active');
            durationContainer.style.display = 'none';
            
            // Süre butonlarını temizle
            const durationButtons = durationContainer.querySelectorAll('.elastic-duration-btn');
            durationButtons.forEach(btn => btn.classList.remove('selected'));
        } else {
            // Select
            elasticSelections[parent].types[elasticType].selected = true;
            buttonElement.classList.add('active');
            durationContainer.style.display = 'flex';
        }
    }
    
    updateElasticReport();
}

function selectElasticDuration(parent, elasticType, duration, buttonElement) {
    // Aynı tipteki diğer süre butonlarını deselect et
    const siblingButtons = buttonElement.parentElement.querySelectorAll('.elastic-duration-btn');
    siblingButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Bu butonu select et
    buttonElement.classList.add('selected');
    
    // Süreyi kaydet
    if (parent.includes('-next')) {
        nextElasticSelections[parent].types[elasticType].duration = duration;
    } else {
        elasticSelections[parent].types[elasticType].duration = duration;
    }
    
    updateElasticReport();
}

function toggleSameElastic(direction, buttonElement) {
    const isCurrentlyActive = nextElasticSelections[direction].sameAsNow;
    
    if (isCurrentlyActive) {
        // Deaktif et
        nextElasticSelections[direction].sameAsNow = false;
        buttonElement.classList.remove('active');
    } else {
        // Aktif et
        nextElasticSelections[direction].sameAsNow = true;
        buttonElement.classList.add('active');
        
        // Ana buton açık değilse aç
        if (!nextElasticSelections[direction].active) {
            nextElasticSelections[direction].active = true;
            const mainBtn = buttonElement.parentElement.querySelector('.elastic-main-btn');
            if (mainBtn) mainBtn.classList.add('active');
        }
        
        // Mevcut lastik seçimlerini kopyala
        copyCurrentElasticToNext(direction);
        
        // Alt seçenek butonlarını temizle (görsel olarak)
        const optionsContainer = document.getElementById(direction + '-options');
        if (optionsContainer) {
            const typeButtons = optionsContainer.querySelectorAll('.elastic-type-btn');
            const durationButtons = optionsContainer.querySelectorAll('.elastic-duration-btn');
            const subButtons = optionsContainer.querySelectorAll('.elastic-sub-btn');
            
            typeButtons.forEach(btn => btn.classList.remove('active'));
            durationButtons.forEach(btn => btn.classList.remove('selected'));
            subButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Süre butonlarını gizle
            const durationContainers = optionsContainer.querySelectorAll('.elastic-duration-buttons');
            durationContainers.forEach(container => container.style.display = 'none');
        }
    }
    
    updateElasticReport();
}

function copyCurrentElasticToNext(direction) {
    // Mevcut lastik verilerini sonraki seansa kopyala
    const currentDirection = direction.replace('-next', '');
    
    if (currentDirection === 'on') {
        // Ön lastik için
        const currentSelection = elasticSelections[currentDirection];
        if (currentSelection.active && currentSelection.tur && currentSelection.sure) {
            nextElasticSelections[direction].currentData = {
                tur: currentSelection.tur,
                sure: currentSelection.sure
            };
        } else {
            nextElasticSelections[direction].currentData = null;
        }
    } else {
        // Sağ ve Sol lastik için
        const currentSelection = elasticSelections[currentDirection];
        if (currentSelection.active) {
            nextElasticSelections[direction].currentData = {
                types: JSON.parse(JSON.stringify(currentSelection.types)) // Deep copy
            };
        } else {
            nextElasticSelections[direction].currentData = null;
        }
    }
}

function selectElasticOption(parent, type, value, buttonElement) {
    // Aynı tipteki diğer butonları deselect et
    const siblingButtons = buttonElement.parentElement.querySelectorAll('.elastic-sub-btn');
    siblingButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Bu butonu select et
    buttonElement.classList.add('selected');
    
    // Değeri kaydet
    if (parent.includes('-next')) {
        nextElasticSelections[parent][type] = value;
    } else {
        elasticSelections[parent][type] = value;
    }
    
    updateElasticReport();
}

function updateElasticReport() {
    let elasticReport = [];
    
    // Sağ ve Sol için yeni sistem
    ['sag', 'sol'].forEach(direction => {
        const selection = elasticSelections[direction];
        if (selection.active) {
            let directionText = direction === 'sag' ? 'Sağ' : 'Sol';
            
            // Her tür için kontrol et
            Object.keys(selection.types).forEach(type => {
                const typeData = selection.types[type];
                if (typeData.selected && typeData.duration) {
                    let typeText = '';
                    switch(type) {
                        case 'sinif2': typeText = 'Sınıf II'; break;
                        case 'sinif3': typeText = 'Sınıf III'; break;
                        case 'cross': typeText = 'Cross'; break;
                    }
                    
                    elasticReport.push(`${directionText} ${typeText} lastik ${typeData.duration}`);
                }
            });
        }
    });
    
    // Ön için eski sistem
    const onSelection = elasticSelections['on'];
    if (onSelection.active && onSelection.tur && onSelection.sure) {
        elasticReport.push(`Ön ${onSelection.tur} lastik ${onSelection.sure}`);
    }
    
    // Sonraki seans lastik raporu
    let nextElasticReport = [];
    
    ['sag-next', 'sol-next', 'on-next'].forEach(direction => {
        const selection = nextElasticSelections[direction];
        if (selection.active) {
            if (selection.sameAsNow) {
                // Mevcut lastik verilerini kullan
                if (direction === 'on-next') {
                    if (selection.currentData && selection.currentData.tur && selection.currentData.sure) {
                        nextElasticReport.push(`Ön ${selection.currentData.tur} lastik ${selection.currentData.sure} (devam)`);
                    } else {
                        nextElasticReport.push('Ön aynı lastiklerle devam (mevcut seçim yok)');
                    }
                } else {
                    let directionText = direction.includes('sag') ? 'Sağ' : 'Sol';
                    
                    if (selection.currentData && selection.currentData.types) {
                        let hasCurrentData = false;
                        Object.keys(selection.currentData.types).forEach(type => {
                            const typeData = selection.currentData.types[type];
                            if (typeData.selected && typeData.duration) {
                                let typeText = '';
                                switch(type) {
                                    case 'sinif2': typeText = 'Sınıf II'; break;
                                    case 'sinif3': typeText = 'Sınıf III'; break;
                                    case 'cross': typeText = 'Cross'; break;
                                }
                                
                                nextElasticReport.push(`${directionText} ${typeText} lastik ${typeData.duration} (devam)`);
                                hasCurrentData = true;
                            }
                        });
                        
                        if (!hasCurrentData) {
                            nextElasticReport.push(`${directionText} aynı lastiklerle devam (mevcut seçim yok)`);
                        }
                    } else {
                        nextElasticReport.push(`${directionText} aynı lastiklerle devam (mevcut seçim yok)`);
                    }
                }
            } else {
                if (direction === 'on-next' && selection.tur && selection.sure) {
                    nextElasticReport.push(`Ön ${selection.tur} lastik ${selection.sure}`);
                } else if (direction !== 'on-next') {
                    let directionText = direction.includes('sag') ? 'Sağ' : 'Sol';
                    
                    Object.keys(selection.types).forEach(type => {
                        const typeData = selection.types[type];
                        if (typeData.selected && typeData.duration) {
                            let typeText = '';
                            switch(type) {
                                case 'sinif2': typeText = 'Sınıf II'; break;
                                case 'sinif3': typeText = 'Sınıf III'; break;
                                case 'cross': typeText = 'Cross'; break;
                            }
                            
                            nextElasticReport.push(`${directionText} ${typeText} lastik ${typeData.duration}`);
                        }
                    });
                }
            }
        }
    });
    
    // Answers objesini güncelle
    if (elasticReport.length > 0) {
        answers['lastik-durum'] = elasticReport.join(', ');
    } else {
        delete answers['lastik-durum'];
    }
    
    if (nextElasticReport.length > 0) {
        answers['sonraki-lastik'] = nextElasticReport.join(', ');
    } else {
        delete answers['sonraki-lastik'];
    }
    
    // Update lastik calculation when elastic selections change
    updateLastikCalculationDisplay();
    
    // Şeffaf plak sekmesi rapor güncellemesi
    updateSeffafOutput();
}

function updateTelOutput() {
    const telOutput = document.getElementById('tel-output');
    if (!telOutput) return;

    let report = [];
    
    // Tel tedavisi sekmesinden seçilen tüm seçenekleri topla
    const telTab = document.getElementById('tel-tedavisi');
    if (!telTab) return;
    
    // Checkbox'ları kontrol et
    const checkboxes = telTab.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
            const text = label.textContent.trim();
            if (text && text !== checkbox.value) {
                report.push(text);
            }
        }
    });
    
    // Radio button'ları kontrol et
    const radioButtons = telTab.querySelectorAll('input[type="radio"]:checked');
    radioButtons.forEach(radio => {
        const label = radio.closest('label');
        if (label) {
            const text = label.textContent.trim();
            if (text && text !== radio.value) {
                report.push(text);
            }
        }
    });
    
    // Seçili option button'ları kontrol et
    const optionButtons = telTab.querySelectorAll('.option-btn.selected');
    optionButtons.forEach(btn => {
        const questionGroup = btn.closest('.question-group');
        if (questionGroup) {
            const questionTitle = questionGroup.querySelector('h4');
            if (questionTitle) {
                report.push(`${questionTitle.textContent.trim()}: ${btn.textContent.trim()}`);
            }
        }
    });
    
    // Seçili score button'ları kontrol et
    const scoreButtons = telTab.querySelectorAll('.score-btn.selected');
    scoreButtons.forEach(btn => {
        const questionGroup = btn.closest('.question-group');
        if (questionGroup) {
            const questionTitle = questionGroup.querySelector('h4');
            if (questionTitle) {
                report.push(`${questionTitle.textContent.trim()}: ${btn.textContent.trim()}`);
            }
        }
    });
    
    // Raporu güncelle
    telOutput.value = report.join('\n\n');
}

// Randevu Button Functions
function initializeRandevuButtons() {
    // Regular randevu buttons
    const randevuButtons = document.querySelectorAll('.randevu-btn');
    randevuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Clear all randevu selections
            const allRandevuButtons = document.querySelectorAll('.randevu-btn, .randevu-manuel-btn');
            allRandevuButtons.forEach(button => button.classList.remove('selected'));
            
            // Hide manuel input
            hideManuelInput();
            
            // Select clicked button
            this.classList.add('selected');
            
            // Update answers
            const question = this.dataset.question;
            const value = this.dataset.value;
            answers[question] = value;
            
            // Update lastik calculation
            updateLastikCalculationDisplay();
            updateSeffafOutput();
        });
    });
    
    // Manuel gir button
    const manuelBtn = document.querySelector('.randevu-manuel-btn');
    if (manuelBtn) {
        manuelBtn.addEventListener('click', function() {
            // Clear all randevu selections
            const allRandevuButtons = document.querySelectorAll('.randevu-btn, .randevu-manuel-btn');
            allRandevuButtons.forEach(button => button.classList.remove('selected'));
            
            // Select manuel button
            this.classList.add('selected');
            
            // Show manuel input
            showManuelInput();
        });
    }
    
    // Manuel confirm button
    const confirmBtn = document.querySelector('.manuel-confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const input = document.getElementById('manuel-randevu-input');
            const value = input.value.trim();
            
            if (value) {
                // Auto-format if user only entered a number
                const formattedValue = formatRandevuValue(value);
                
                // Update answers
                answers['sonraki-randevu'] = formattedValue;
                
                // Update lastik calculation
                updateLastikCalculationDisplay();
                updateSeffafOutput();
                
                // Show success feedback
                showManuelSuccess();
            } else {
                // Show error - input is empty
                input.style.borderColor = '#dc3545';
                input.focus();
                setTimeout(() => {
                    input.style.borderColor = '#ced4da';
                }, 2000);
            }
        });
    }
    
    // Manuel cancel button
    const cancelBtn = document.querySelector('.manuel-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // Clear manuel selection
            const manuelBtn = document.querySelector('.randevu-manuel-btn');
            if (manuelBtn) {
                manuelBtn.classList.remove('selected');
            }
            
            // Hide manuel input
            hideManuelInput();
            
            // Clear from answers
            delete answers['sonraki-randevu'];
            updateSeffafOutput();
        });
    }
    
    // Enter key support for manuel input
    const manuelInput = document.getElementById('manuel-randevu-input');
    if (manuelInput) {
        manuelInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
        
        // Reset border color on input and show live preview
        manuelInput.addEventListener('input', function() {
            this.style.borderColor = '#ced4da';
            
            // Show live preview of formatting
            const value = this.value.trim();
            if (value) {
                const formatted = formatRandevuValue(value);
                if (formatted !== value) {
                    // Update placeholder to show what will be saved
                    this.setAttribute('data-preview', `Kaydedilecek: "${formatted}"`);
                    this.title = `Kaydedilecek: "${formatted}"`;
                } else {
                    this.removeAttribute('data-preview');
                    this.title = '';
                }
            } else {
                this.removeAttribute('data-preview');
                this.title = '';
            }
        });
    }
    
    // Initialize IPR count input
    initializeIPRCountInput();
    
    // Initialize duration method
    initializeDurationMethod();
}

function showManuelInput() {
    const container = document.querySelector('.manuel-input-container');
    if (container) {
        container.style.display = 'block';
        
        // Focus input for better UX
        const input = document.getElementById('manuel-randevu-input');
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 300);
        }
    }
}

function hideManuelInput() {
    const container = document.querySelector('.manuel-input-container');
    if (container) {
        container.style.display = 'none';
    }
    
    // Clear input value
    const input = document.getElementById('manuel-randevu-input');
    if (input) {
        input.value = '';
        input.style.borderColor = '#ced4da';
    }
}

function showManuelSuccess() {
    const confirmBtn = document.querySelector('.manuel-confirm-btn');
    if (confirmBtn) {
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = '✓ Kaydedildi';
        confirmBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            confirmBtn.textContent = originalText;
            confirmBtn.style.backgroundColor = '#28a745';
            hideManuelInput();
        }, 1500);
    }
}

function formatRandevuValue(value) {
    // Remove extra spaces 
    const cleanValue = value.trim();
    const lowerValue = cleanValue.toLowerCase();
    
    // Check if the input is just a number (like "2", "4", "6", etc.)
    if (/^\d+$/.test(cleanValue)) {
        return `${cleanValue} hafta sonra`;
    }
    
    // Check if it's a number followed by space and some text that doesn't contain "hafta", "gün", or "sonra"
    const numberMatch = lowerValue.match(/^(\d+)\s*(.*)$/);
    if (numberMatch) {
        const number = numberMatch[1];
        const restText = numberMatch[2].trim();
        
        // If the rest doesn't contain time-related words, assume it's weeks
        if (restText === '' || (!restText.includes('hafta') && !restText.includes('gün') && !restText.includes('sonra'))) {
            return `${number} hafta sonra`;
        }
    }
    
    // If input already looks formatted or contains specific time units, return as is
    if (lowerValue.includes('hafta') || lowerValue.includes('gün') || lowerValue.includes('sonra')) {
        return cleanValue;
    }
    
    // For any other case, try to make it more consistent
    // If it contains numbers but not time words, assume it's about weeks
    if (/\d/.test(cleanValue)) {
        const numbers = cleanValue.match(/\d+/);
        if (numbers) {
            return `${numbers[0]} hafta sonra`;
        }
    }
    
    // For any other case, return the original value
    return cleanValue;
}

// IPR Count and Duration Calculation Functions
function calculateIPRDuration(iprCount) {
    if (!iprCount || iprCount <= 0) {
        return { duration: 0, text: 'IPR sayısı girilmedi' };
    }
    
    let duration;
    let category;
    
    if (iprCount <= 3) {
        duration = 20;
        category = 'Az IPR (1-3 adet)';
    } else if (iprCount <= 6) {
        duration = 30;
        category = 'Orta IPR (4-6 adet)';
    } else if (iprCount <= 10) {
        duration = 45;
        category = 'Çok IPR (7-10 adet)';
    } else {
        duration = 60;
        category = 'Yoğun IPR (10+ adet)';
    }
    
    return {
        duration: duration,
        text: `${duration} dakika (${category})`,
        category: category,
        count: iprCount
    };
}

function updateIPRDurationDisplay() {
    const input = document.getElementById('ipr-count-input');
    const display = document.getElementById('ipr-duration-display');
    
    if (!input || !display) return;
    
    const iprCount = parseInt(input.value) || 0;
    const result = calculateIPRDuration(iprCount);
    
    if (iprCount > 0) {
        display.textContent = result.text;
        display.style.color = '#007bff';
        display.style.background = '#e3f2fd';
        
        // Store in answers for report generation
        answers['ipr-count'] = iprCount;
        answers['ipr-duration'] = result.duration;
        answers['ipr-category'] = result.category;
        
        // Update the main output
        updateSeffafOutput();
        
        // Update duration method if auto is selected
        updateDurationResult();
    } else {
        display.textContent = 'Tahmini süre hesaplanacak';
        display.style.color = '#666';
        display.style.background = '#f8f9fa';
        
        // Remove from answers
        delete answers['ipr-count'];
        delete answers['ipr-duration'];
        delete answers['ipr-category'];
        
        updateSeffafOutput();
        
        // Update duration method if auto is selected
        updateDurationResult();
    }
}

function initializeIPRCountInput() {
    const input = document.getElementById('ipr-count-input');
    
    if (input) {
        // Real-time calculation on input
        input.addEventListener('input', function() {
            updateIPRDurationDisplay();
        });
        
        // Also update on change (for better UX)
        input.addEventListener('change', function() {
            updateIPRDurationDisplay();
        });
        
        // Prevent negative values
        input.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    }
}

// Duration Method Functions
function updateDurationResult() {
    const resultDisplay = document.getElementById('duration-result');
    const selectedMethod = document.querySelector('.duration-method-btn.selected');
    
    if (!resultDisplay || !selectedMethod) {
        return;
    }
    
    const method = selectedMethod.dataset.method;
    
    if (method === 'auto') {
        // Use IPR calculation
        const iprCount = parseInt(document.getElementById('ipr-count-input').value) || 0;
        const iprResult = calculateIPRDuration(iprCount);
        
        if (iprCount > 0) {
            resultDisplay.textContent = `Otomatik: ${iprResult.duration} dakika (${iprResult.category})`;
            answers['randevu-duration'] = iprResult.duration;
            answers['duration-method'] = 'auto';
            answers['duration-source'] = iprResult.category;
        } else {
            resultDisplay.textContent = 'Önce IPR sayısı girin';
            delete answers['randevu-duration'];
            delete answers['duration-method'];
            delete answers['duration-source'];
        }
    } else if (method === 'manual') {
        // Use manual input
        const manualInput = document.getElementById('manual-duration-input');
        const duration = parseInt(manualInput.value) || 0;
        
        if (duration > 0) {
            resultDisplay.textContent = `Manuel: ${duration} dakika`;
            answers['randevu-duration'] = duration;
            answers['duration-method'] = 'manual';
            answers['duration-source'] = 'Manuel giriş';
        } else {
            resultDisplay.textContent = 'Süre girin (5-120 dakika)';
            delete answers['randevu-duration'];
            delete answers['duration-method'];
            delete answers['duration-source'];
        }
    }
    
    // Update main output
    updateSeffafOutput();
}

function initializeDurationMethod() {
    // Duration method buttons
    const methodButtons = document.querySelectorAll('.duration-method-btn');
    const manualContainer = document.querySelector('.duration-input-container');
    const manualInput = document.getElementById('manual-duration-input');
    
    methodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Clear all selections
            methodButtons.forEach(b => b.classList.remove('selected'));
            
            // Select clicked button
            this.classList.add('selected');
            
            const method = this.dataset.method;
            
            if (method === 'manual') {
                // Show manual input
                manualContainer.style.display = 'block';
                setTimeout(() => manualInput.focus(), 100);
            } else {
                // Hide manual input
                manualContainer.style.display = 'none';
                manualInput.value = '';
            }
            
            // Update result display
            updateDurationResult();
        });
    });
    
    // Manual duration input
    if (manualInput) {
        manualInput.addEventListener('input', function() {
            updateDurationResult();
        });
        
        manualInput.addEventListener('change', function() {
            updateDurationResult();
        });
        
        // Prevent negative values
        manualInput.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    }
}

// Image Modal Functions
function openImageModal(elasticType) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    // Set image source and title based on elastic type
    let imageSrc = '';
    let title = '';
    
    switch(elasticType) {
        case 'sinif2':
            // Using base64 encoded image for Sınıf II elastic
            imageSrc = 'data:image/jpeg;base64,' + getSinif2ImageData();
            title = 'Sınıf II Elastik Takma Yöntemi';
            break;
        case 'sinif3':
            imageSrc = 'images/sinif3-lastik.jpg';
            title = 'Sınıf III Elastik Takma Yöntemi';
            break;
        case 'cross':
            imageSrc = 'images/cross-lastik.jpg';
            title = 'Cross Elastik Takma Yöntemi';
            break;
        default:
            imageSrc = 'images/placeholder.jpg';
            title = 'Elastik Takma Yöntemi';
    }
    
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modal.style.display = 'block';
    
    // Add event listener for clicking outside modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Add event listener for ESC key
    document.addEventListener('keydown', handleModalKeydown);
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // Remove event listeners
    document.removeEventListener('keydown', handleModalKeydown);
}

function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}

// Base64 encoded image data for Sınıf II elastic (placeholder - will be replaced with real image)
function getSinif2ImageData() {
    // This is a placeholder - you would replace this with the actual base64 data of your image
    // For now, we'll use a simple data URL that creates a small colored rectangle
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

