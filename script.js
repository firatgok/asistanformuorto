// Global variables
console.log("Script.js loaded successfully!");
let answers = {};

// Debug: Global değişkenleri logla
setTimeout(() => {
    console.log("Global variables after 1 second:");
    console.log("selectedAppointment:", selectedAppointment);
    console.log("nextElasticUsage:", nextElasticUsage);
    console.log("elasticNeedCalculation:", elasticNeedCalculation);
}, 1000);

// Lastik ihtiyacı hesaplama değişkenleri
let selectedDays = 0;
let elasticNeedCalculation = {
    days: 0,
    elasticsPerDay: 0,
    totalNeed: 0
};

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

// Mevcut takılı teller seçimleri
let currentWires = {
    alt: {
        selected: false,
        type: null, // 'niti', 'ss', 'rc', 'ss-bukumlu'
        size: null  // '0.12', '0.14', '16x22', vb.
    },
    ust: {
        selected: false,
        type: null, // 'niti', 'ss', 'rc', 'ss-bukumlu'
        size: null  // '0.12', '0.14', '16x22', vb.
    }
};

// Tel bükümleri için global değişken
let wireBends = {
    alt: {}, // Diş numarası: [büküm tiplerinin array'i]
    ust: {}  // Örnek: '11': ['distal-in', 'bukkal-kron-tork']
};

// Popup ile ilgili değişkenler
let currentPopupTooth = null;
let currentPopupJaw = null;

// Dişler arası büküm popup değişkenleri
let currentInterbendPosition = null;
let currentInterbendJaw = null;

// Dişler arası büküm verileri
const interbendData = {
    alt: {}, // position: bendType (örnek: '11-21': 'key-hole-loop')
    ust: {}
};

// Tab functionality - Global function to make it accessible from HTML
function switchToOtherTab() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) {
        // If no active tab, default to first tab
        const defaultTab = document.querySelector('[data-tab="seffaf-plak"]');
        if (defaultTab) defaultTab.click();
        return;
    }
    
    const currentTab = activeTab.getAttribute('data-tab');
    const currentSwitch = document.querySelector(`#${currentTab} .switch-lever`);
    
    // Şalter tıklama animasyonu
    if (currentSwitch) {
        // Kısa titreşim efekti
        currentSwitch.style.transform = 'scale(0.95) translateY(1px)';
        setTimeout(() => {
            currentSwitch.style.transform = '';
        }, 100);
    }
    
    // Determine which tab to switch to
    const targetTab = currentTab === 'seffaf-plak' ? 'tel-tedavisi' : 'seffaf-plak';
    
    // Tab değiştir
    setTimeout(() => {
        const targetTabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
        if (targetTabBtn) {
            targetTabBtn.click();
        }
    }, 150);
}

// Elektrik şalteri animasyonu
function animateElectricSwitch(currentTab) {
    const switchElement = document.querySelector(`#${currentTab} .electric-switch .switch-lever`);
    if (switchElement) {
        // Şalter pozisyonunu değiştir
        if (switchElement.classList.contains('up')) {
            switchElement.classList.remove('up');
            switchElement.classList.add('down');
        } else {
            switchElement.classList.remove('down');
            switchElement.classList.add('up');
        }
        
        // Kısa bir titreşim efekti
        switchElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            switchElement.style.transform = 'scale(1)';
        }, 150);
    }
}

// Şalter pozisyonlarını tab'a göre güncelle
function updateSwitchPositions(activeTab) {
    console.log('Updating switch positions for:', activeTab);
    
    const allSwitches = document.querySelectorAll('.switch-lever');
    const allLabels = document.querySelectorAll('.switch-label');
    
    allSwitches.forEach(switchLever => {
        const parentTab = switchLever.closest('.tab-content');
        if (parentTab) {
            const tabId = parentTab.id;
            
            // Mantık: Tel aktifken şalter aşağıda, Plak aktifken şalter yukarıda
            if (activeTab === 'tel-tedavisi') {
                // Tel aktif → şalter aşağıda (down)
                switchLever.classList.remove('up');
                switchLever.classList.add('down');
            } else if (activeTab === 'seffaf-plak') {
                // Plak aktif → şalter yukarıda (up)  
                switchLever.classList.remove('down');
                switchLever.classList.add('up');
            }
        }
    });
    
    // Şalter etiketlerini güncelle - aktif olan tab'ın adını göster
    allLabels.forEach(label => {
        if (activeTab === 'tel-tedavisi') {
            label.textContent = '⇄ Tel';
        } else if (activeTab === 'seffaf-plak') {
            label.textContent = '⇄ Plak';
        }
    });
}

// Make function globally accessible
window.switchToOtherTab = switchToOtherTab;

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
            
            // Update electric switch positions
            setTimeout(() => {
                updateSwitchPositions(targetTab);
            }, 50);
            
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
        'plak-gun': '',
        'verilecek-plak': ''
    };
    
    // Initialize lastik calculation display
    updateLastikCalculationDisplay();
    
    // Initialize elastic need calculation
    setTimeout(() => {
        if (typeof updateElasticCalculation === 'function') {
            updateElasticCalculation();
        }
        
        // Initialize switch positions
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            updateSwitchPositions(activeTab.id);
        } else {
            // Eğer aktif tab yoksa, ilk tab'ı aktif yap
            const firstTab = document.querySelector('.tab-content');
            if (firstTab) {
                updateSwitchPositions(firstTab.id);
            }
        }
    }, 500);
    
    // Clear localStorage to ensure fresh start
    clearAllStoredData();
});

function initializeCheckboxListeners() {
    // Initialize option buttons for şeffaf plak
    const seffafButtons = document.querySelectorAll('#seffaf-plak .option-btn');
    seffafButtons.forEach(button => {
        button.addEventListener('click', handleOptionButtonClick);
    });

    // Initialize option buttons for tel tedavisi
    const telButtons = document.querySelectorAll('#tel-tedavisi .option-btn');
    telButtons.forEach(button => {
        button.addEventListener('click', handleTelOptionButtonClick);
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
    
    // Initialize clear buttons for both tabs
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const question = button.dataset.question;
            if (question === 'tel-asistan') {
                handleTelClearButtonClick(event);
            } else {
                handleClearButtonClick(event);
            }
        });
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

function handleTelOptionButtonClick(event) {
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
    
    // Tel asistan seçimi özel işlem
    if (question === 'tel-asistan') {
        answers[question] = value;
        // Display güncellemesi
        const display = document.getElementById('tel-asistan-display');
        if (display) {
            display.textContent = value;
        }
    }
    
    // Update the output
    updateTelOutput();
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
    
    // Check elastic status
    const elasticStatusSelected = document.querySelector('.elastic-status-btn.selected');
    if (elasticStatusSelected) {
        const status = elasticStatusSelected.dataset.status;
        tempAnswers['elastic-status'] = status === 'evet' ? 'Hasta lastiklerini takmıştır' : 'Hasta lastiklerini takmamıştır';
    }
    
    // Handle regular option buttons
    selectedButtons.forEach(button => {
        const question = button.dataset.question;
        const value = button.dataset.value;
        
        // Asistan seçimi özel işlem
        if (question === 'asistan') {
            tempAnswers[question] = value;
            // Display güncellemesi
            const display = document.getElementById('asistan-display');
            if (display) {
                display.textContent = value;
            }
        } else {
            tempAnswers[question] = value;
        }
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
    
    if (numberInputs['plak-gun']) {
        const plakGun = parseInt(numberInputs['plak-gun']);
        tempAnswers['plak-gun'] = `${plakGun} gün olmuş`;
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
    
    // Asistan bilgisi en üstte
    if (answers['asistan']) {
        report += `Kontroller ${answers['asistan'].toUpperCase()} Hanım tarafından yapılmıştır.\n\n`;
    }
    
    // RUTİN KONTROLLER bölümü
    if (Object.keys(answers).some(key => ['onceki-seans', 'mevcut-plak', 'plak-gun', 'verilecek-plak', 'plak-degisim', 'sonraki-randevu', 'adaptasyon', 'atasmanlar', 'ipr-yok', 'bu-seans-ipr-yok'].includes(key)) || selectedInterdentalSpaces.size > 0) {
        report += 'RUTİN KONTROLLER:\n';
        report += '-----------------\n';
        
        if (answers['onceki-seans']) {
            report += `• Önceki seansta ${answers['onceki-seans']}\n`;
        }
        
        if (answers['mevcut-plak']) {
            report += `• Hasta şu an ${answers['mevcut-plak']}\n`;
        }
        
        if (answers['plak-gun']) {
            report += `• Mevcut plağa başlayalı ${answers['plak-gun']}\n`;
        }
        
        // Bu seans IPR kontrol
        if (answers['bu-seans-ipr-yok']) {
            report += `• ${answers['bu-seans-ipr-yok']}\n`;
        } else {
            // Seçilen IPR bölgelerini ekle
            const selectedTeethText = getSelectedTeethText();
            if (selectedTeethText) {
                report += `• IPR yapılacak bölge: ${selectedTeethText}\n`;
            }
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
        
        if (answers['ipr-yok']) {
            report += `• Sonraki seansta IPR yapılmayacak\n`;
        } else if (answers['ipr-count'] && answers['ipr-category']) {
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
    // Clear elastic status buttons
    const elasticStatusButtons = document.querySelectorAll('.elastic-status-btn.selected');
    elasticStatusButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
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
    // Clear elastic status buttons
    const elasticStatusButtons = document.querySelectorAll('.elastic-status-btn.selected');
    elasticStatusButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
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
    
    // Clear Bu Seans IPR Yok button selection
    const buSeansIprYokBtn = document.getElementById('bu-seans-ipr-yok-btn');
    if (buSeansIprYokBtn) {
        buSeansIprYokBtn.classList.remove('selected');
    }
    
    // Remove from answers
    delete answers['bu-seans-ipr-yok'];
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
    const numberQuestions = ['onceki-seans', 'mevcut-plak', 'plak-gun', 'verilecek-plak'];
    
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
    
    // Clear IPR Yok buttons
    const iprYokBtn = document.getElementById('ipr-yok-btn');
    const buSeansIprYokBtn = document.getElementById('bu-seans-ipr-yok-btn');
    if (iprYokBtn) iprYokBtn.classList.remove('selected');
    if (buSeansIprYokBtn) buSeansIprYokBtn.classList.remove('selected');
    
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
            
            // Clear Bu Seans IPR Yok button selection
            const buSeansIprYokBtn = document.getElementById('bu-seans-ipr-yok-btn');
            if (buSeansIprYokBtn) {
                buSeansIprYokBtn.classList.remove('selected');
            }
            
            // Remove from answers
            delete answers['bu-seans-ipr-yok'];
            
            updateSelectedTeethDisplay();
            updateSeffafOutput(); // Güncelle çıktıyı
            updateReport(); // Raporu güncelle
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
    
    // Option button clear işlemi (asistan - şeffaf plak)
    if (question === 'asistan') {
        // Option button'ların seçimini kaldır
        const questionGroup = button.closest('.question-group');
        const optionButtons = questionGroup.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Manuel input'u temizle ve alanı kapat
        const manuelInput = document.getElementById('asistan-manual-input');
        if (manuelInput) {
            manuelInput.value = '';
        }
        
        const manualGroup = document.getElementById('manual-asistan-group');
        const toggleBtn = document.querySelector('#seffaf-plak .toggle-manual-btn');
        if (manualGroup && manualGroup.style.display !== 'none') {
            manualGroup.style.display = 'none';
            toggleBtn.classList.remove('active');
            toggleBtn.textContent = 'Manuel Giriş';
        }
        
        // Display'i sıfırla
        const display = document.getElementById('asistan-display');
        if (display) {
            display.textContent = 'Henüz seçilmedi';
        }
        
        // Answers'tan kaldır
        delete answers[question];
        
        // Update output
        updateSeffafOutput();
        return;
    }
    

    
    // Number input clear işlemi (mevcut sistem)
    // Clear the input
    numberInputs[question] = '';
    
    // Update display
    updateUnifiedNumberDisplay(question);
    
    // Update output
    updateSeffafOutput();
}

function handleTelClearButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    
    if (question === 'tel-asistan') {
        // Option button'ların seçimini kaldır
        const questionGroup = button.closest('.question-group');
        const optionButtons = questionGroup.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Manuel input'u temizle ve alanı kapat
        const manuelInput = document.getElementById('tel-asistan-manual-input');
        if (manuelInput) {
            manuelInput.value = '';
        }
        
        const manualGroup = document.getElementById('tel-manual-asistan-group');
        const toggleBtn = document.querySelector('#tel-tedavisi .toggle-manual-btn');
        if (manualGroup && manualGroup.style.display !== 'none') {
            manualGroup.style.display = 'none';
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
                toggleBtn.textContent = 'Manuel Giriş';
            }
        }
        
        // Display'i sıfırla
        const display = document.getElementById('tel-asistan-display');
        if (display) {
            display.textContent = 'Henüz seçilmedi';
        }
        
        // Answers'tan kaldır
        delete answers[question];
        
        // Update output
        updateTelOutput();
    }
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
    // Ana yön butonları (sadece data-direction attribute'u olanlar için)
    const mainButtons = document.querySelectorAll('.elastic-main-btn[data-direction]');
    mainButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.direction;
            if (direction) {
                toggleElasticDirection(direction, this);
            }
        });
    });

    // Lastik tür seçme butonları (yeni) - sadece data attribute'u olanlar için
    const typeButtons = document.querySelectorAll('.elastic-type-btn[data-parent][data-elastic-type]');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const elasticType = this.dataset.elasticType;
            if (parent && elasticType) {
                toggleElasticType(parent, elasticType, this);
            }
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
    if (direction && direction.includes('-next')) {
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
        if (!direction || !elasticSelections[direction]) {
            console.error('Direction is undefined or not found in elasticSelections:', direction);
            return;
        }
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
    if (parent && parent.includes('-next')) {
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

// Bu fonksiyon duplicate olduğu için silindi - Asıl updateTelOutput() aşağıda 3794. satırda

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
    
    // Initialize IPR Yok buttons
    initializeIPRYokButtons();
    
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
    // Handle 0 IPR (IPR Yok durumu)
    if (!iprCount || iprCount <= 0) {
        const arTime = 20; // Asistan formu doldurması için sabit 20 dk
        const rdTime = 10; // IPR yok ise minimum RD süresi
        const formattedDuration = `${arTime} dk AR ve ${rdTime} dk RD`;
        
        return {
            duration: formattedDuration,
            text: `${formattedDuration} (IPR Yok)`,
            category: 'IPR Yok',
            count: 0,
            ar: arTime,
            rd: rdTime,
            rawRD: rdTime
        };
    }
    
    // Yeni algoritma: (IPR sayısı × 3) + 10, sonucu 5'in katlarına yuvarla
    const rawRD = (iprCount * 3) + 10;
    const roundedRD = Math.ceil(rawRD / 5) * 5; // 5'in katlarına yuvarla
    const arTime = 20; // Asistan formu doldurması için sabit 20 dk
    
    const category = `${iprCount} adet IPR`;
    const formattedDuration = `${arTime} dk AR ve ${roundedRD} dk RD`;
    
    return {
        duration: formattedDuration,
        text: `${formattedDuration} (${category})`,
        category: category,
        count: iprCount,
        ar: arTime,
        rd: roundedRD,
        rawRD: rawRD
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
        
        // Clear IPR Yok selection when number is entered
        const iprYokBtn = document.getElementById('ipr-yok-btn');
        if (iprYokBtn) {
            iprYokBtn.classList.remove('selected');
        }
        delete answers['ipr-yok'];
        
        // Store in answers for report generation
        answers['ipr-count'] = iprCount;
        answers['ipr-duration'] = result.duration;
        answers['ipr-category'] = result.category;
        
        // Auto-select "IPR'dan Otomatik Al" button if none selected
        const selectedMethodBtn = document.querySelector('.duration-method-btn.selected');
        const autoMethodBtn = document.querySelector('.duration-method-btn[data-method="auto"]');
        
        if (!selectedMethodBtn && autoMethodBtn) {
            // Clear all method buttons and select auto
            const allMethodBtns = document.querySelectorAll('.duration-method-btn');
            allMethodBtns.forEach(btn => btn.classList.remove('selected'));
            autoMethodBtn.classList.add('selected');
            
            // Hide manual input container
            const manualContainer = document.querySelector('.duration-input-container');
            if (manualContainer) {
                manualContainer.style.display = 'none';
            }
        }
        
        // Update the main output
        updateSeffafOutput();
        
        // Update duration method if auto is selected
        updateDurationResult();
        
        // Update report
        updateReport();
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

function initializeIPRYokButtons() {
    // IPR Clear button
    const iprClearBtn = document.getElementById('ipr-clear-btn');
    if (iprClearBtn) {
        iprClearBtn.addEventListener('click', function() {
            // Clear IPR input
            const iprInput = document.getElementById('ipr-count-input');
            if (iprInput) {
                iprInput.value = '';
                updateIPRDurationDisplay();
            }
            
            // Clear IPR Yok selection
            const iprYokBtn = document.getElementById('ipr-yok-btn');
            if (iprYokBtn) {
                iprYokBtn.classList.remove('selected');
            }
            
            // Remove from answers (but keep bu-seans-ipr-yok intact)
            delete answers['ipr-yok'];
            delete answers['ipr-count'];
            delete answers['ipr-duration'];
            delete answers['ipr-category'];
            delete answers['randevu-duration'];
            delete answers['duration-method'];
            delete answers['duration-source'];
            
            // Reset duration display
            const resultDisplay = document.getElementById('duration-result');
            if (resultDisplay) {
                resultDisplay.textContent = 'Süre hesaplama yöntemi seçin';
            }
            
            updateReport();
        });
    }

    // IPR Yok button (next session)
    const iprYokBtn = document.getElementById('ipr-yok-btn');
    if (iprYokBtn) {
        iprYokBtn.addEventListener('click', function() {
            // Clear IPR input
            const iprInput = document.getElementById('ipr-count-input');
            if (iprInput) {
                iprInput.value = '';
                updateIPRDurationDisplay();
            }
            
            // Remove IPR count answers to prevent conflict
            delete answers['ipr-count'];
            delete answers['ipr-duration'];
            delete answers['ipr-category'];
            
            // Set IPR Yok answer (but don't set duration - that should be done via duration method selection)
            answers['ipr-yok'] = 'IPR Yok';
            
            // Reset duration method selection - user needs to select duration method separately
            const durationButtons = document.querySelectorAll('.duration-method-btn');
            durationButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Update display - show that IPR count is 0 for calculation purposes
            const resultDisplay = document.getElementById('duration-result');
            if (resultDisplay) {
                resultDisplay.textContent = 'Süre hesaplama yöntemi seçin (IPR: 0 adet)';
            }
            
            // Visual feedback
            updateButtonSelections(iprYokBtn, 'ipr-yok');
            
            updateReport();
        });
    }
    
    // Bu seans IPR Yok button
    const buSeansIPRYokBtn = document.getElementById('bu-seans-ipr-yok-btn');
    if (buSeansIPRYokBtn) {
        buSeansIPRYokBtn.addEventListener('click', function() {
            // Clear selected interdental spaces
            selectedInterdentalSpaces.clear();
            
            // Clear all interdental buttons
            const allInterdentalBtns = document.querySelectorAll('.interdental-btn');
            allInterdentalBtns.forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Update display
            const selectedDisplay = document.getElementById('selected-teeth-display');
            if (selectedDisplay) {
                selectedDisplay.textContent = 'Bu seans IPR yapılmayacak';
            }
            
            // Set answer
            answers['bu-seans-ipr-yok'] = 'Bu seans yapılacak herhangi bir IPR bulunmamaktadır';
            
            // Visual feedback
            updateButtonSelections(buSeansIPRYokBtn, 'bu-seans-ipr-yok');
            
            updateReport();
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
        // Use IPR calculation - check if IPR data already stored
        const iprInput = document.getElementById('ipr-count-input');
        const iprYokSelected = document.getElementById('ipr-yok-btn')?.classList.contains('selected');
        
        let iprCount = 0;
        let sourceText = '';
        let iprResult = null;
        
        // First check if IPR calculation is already stored (from number input)
        if (answers['ipr-count'] && answers['ipr-duration']) {
            iprCount = answers['ipr-count'];
            iprResult = {
                duration: answers['ipr-duration'],
                category: answers['ipr-category']
            };
            sourceText = `${iprCount} adet IPR - Otomatik hesaplama`;
        } else if (iprYokSelected) {
            // IPR Yok selected - count is 0
            iprCount = 0;
            iprResult = calculateIPRDuration(0);
            sourceText = 'IPR Yok - Otomatik hesaplama';
        } else if (iprInput && iprInput.value) {
            // IPR count entered but not stored yet
            iprCount = parseInt(iprInput.value) || 0;
            iprResult = calculateIPRDuration(iprCount);
            sourceText = `${iprCount} adet IPR - Otomatik hesaplama`;
        }
        
        if (iprResult) {
            resultDisplay.textContent = `Otomatik: ${iprResult.duration} (${sourceText})`;
            answers['randevu-duration'] = iprResult.duration;
            answers['duration-method'] = 'auto';
            answers['duration-source'] = sourceText;
        } else {
            resultDisplay.textContent = 'Önce IPR sayısı girin veya "IPR Yok" seçin';
            delete answers['randevu-duration'];
            delete answers['duration-method'];
            delete answers['duration-source'];
        }
    } else if (method === 'standard') {
        // Standard appointment
        const standardDuration = '20 dk AR ve 10 dk RD';
        resultDisplay.textContent = `Standart: ${standardDuration}`;
        answers['randevu-duration'] = standardDuration;
        answers['duration-method'] = 'standard';
        answers['duration-source'] = 'Standart randevu süresi';
    } else if (method === 'manual') {
        // Use manual input
        const manualInput = document.getElementById('manual-duration-input');
        const duration = parseInt(manualInput.value) || 0;
        
        if (duration > 0) {
            resultDisplay.textContent = `Manuel: ${duration} dakika`;
            answers['randevu-duration'] = `${duration} dakika`;
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
    
    // Update report
    updateReport();
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
            imageSrc = 'images/sinif2-lastik.jpg';
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
        case 'on-oblik':
            imageSrc = 'images/on-oblik-lastik.jpg';
            title = 'Ön Oblik Lastik Takma Yöntemi';
            break;
        default:
            imageSrc = 'images/placeholder.jpg';
            title = 'Elastik Takma Yöntemi';
    }
    
    // Add error handling for image loading
    modalImage.onerror = function() {
        console.log('Resim yüklenemedi:', imageSrc);
        modalTitle.textContent = title + ' (Resim yüklenemedi)';
    };
    
    modalImage.onload = function() {
        console.log('Resim başarıyla yüklendi:', imageSrc);
    };
    
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

// Elastic Status Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeElasticStatusButtons();
});

function initializeElasticStatusButtons() {
    const elasticStatusButtons = document.querySelectorAll('.elastic-status-btn');
    
    elasticStatusButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Clear all elastic status selections
            elasticStatusButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Select clicked button
            this.classList.add('selected');
            
            // Update report if needed
            updateSeffafOutput();
            updateTelOutput();
        });
    });
}

// Theme System
function initializeTheme() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('orthodontic-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Auto set theme based on time if no saved preference
    if (!savedTheme) {
        const currentHour = new Date().getHours();
        // Dark mode between 6 PM (18) and 6 AM (6)
        const autoTheme = (currentHour >= 18 || currentHour < 6) ? 'dark' : 'light';
        setTheme(autoTheme);
    } else {
        setTheme(savedTheme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('orthodontic-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save preference
    localStorage.setItem('orthodontic-theme', theme);
    
    // Update button states
    updateThemeButtons(theme);
    
    // Smooth transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeButtons(activeTheme) {
    // Update all theme buttons
    const lightButtons = document.querySelectorAll('#light-btn, #light-btn-2');
    const darkButtons = document.querySelectorAll('#dark-btn, #dark-btn-2');
    
    lightButtons.forEach(btn => {
        btn.classList.toggle('active', activeTheme === 'light');
    });
    
    darkButtons.forEach(btn => {
        btn.classList.toggle('active', activeTheme === 'dark');
    });
}

// Auto theme based on time
function autoSetThemeByTime() {
    const currentHour = new Date().getHours();
    // Dark mode between 6 PM (18) and 6 AM (6)
    const autoTheme = (currentHour >= 18 || currentHour < 6) ? 'dark' : 'light';
    
    // Only auto-set if user hasn't manually set a preference
    if (!localStorage.getItem('orthodontic-theme')) {
        setTheme(autoTheme);
    }
}

// Utility Functions
function updateButtonSelections(selectedButton, questionType) {
    // Remove selected class from all buttons in the same question group
    const questionGroup = selectedButton.closest('.question-group');
    if (questionGroup) {
        const allButtons = questionGroup.querySelectorAll('.option-btn');
        allButtons.forEach(btn => btn.classList.remove('selected'));
    }
    
    // Add selected class to the clicked button
    selectedButton.classList.add('selected');
}

function updateReport() {
    // Update both report areas
    updateMobileReportArea();
    updateDesktopReportArea();
}

function updateMobileReportArea() {
    const reportContent = generateCompleteReport();
    const mobileReportArea = document.getElementById('mobile-report-content');
    if (mobileReportArea) {
        mobileReportArea.textContent = reportContent;
    }
}

function updateDesktopReportArea() {
    const reportContent = generateCompleteReport();
    const desktopReportArea = document.getElementById('desktop-report-content');
    if (desktopReportArea) {
        desktopReportArea.textContent = reportContent;
    }
}

function generateCompleteReport() {
    let completeReport = '';
    
    // Get active tab
    const activeTab = document.querySelector('.tab-btn.active');
    const activeTabId = activeTab ? activeTab.getAttribute('data-tab') : 'seffaf-plak';
    
    if (activeTabId === 'seffaf-plak') {
        // Generate Şeffaf Plak report
        completeReport = generateSeffafReport(answers);
    } else if (activeTabId === 'tel-tedavi') {
        // Generate Tel Tedavi report
        const selectedItems = getSelectedTelItems();
        completeReport = generateTelReport(selectedItems);
    }
    
    return completeReport;
}

function getSelectedTelItems() {
    // Get selected items from tel tedavi tab
    const selectedItems = [];
    const checkboxes = document.querySelectorAll('#tel-tedavi input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label) {
            selectedItems.push(label.textContent.trim());
        }
    });
    return selectedItems;
}

// Initialize theme system when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    // Auto-update theme every hour
    setInterval(autoSetThemeByTime, 3600000); // 1 hour = 3600000 ms
});

// Randevu seçimi için global değişken
let selectedAppointment = {
    tel: null
};

// Randevu süresi seçimi için global değişken
let selectedDuration = {
    tel: {
        type: null,
        doctor: null,
        assistant: null
    }
};

// Lastik durumu seçimi için global değişken
let elasticStatus = {
    tel: null
};

// Mevcut lastik kullanımı için global değişken
let currentElasticUsage = {
    tel: {
        sag: { 
            sinif2: { selected: false, hours: null },
            sinif3: { selected: false, hours: null },
            cross: { selected: false, hours: null }
        },
        sol: { 
            sinif2: { selected: false, hours: null },
            sinif3: { selected: false, hours: null },
            cross: { selected: false, hours: null }
        },
        orta: { 
            oblik1333: { selected: false, hours: null },
            oblik2343: { selected: false, hours: null }
        }
    }
};

// Sonraki seansa kadar lastik kullanımı için global değişken
let nextElasticUsage = {
    'tel-next': {
        sag: { 
            continuesCurrent: false,
            sinif2: { selected: false, hours: null },
            sinif3: { selected: false, hours: null },
            cross: { selected: false, hours: null }
        },
        sol: { 
            continuesCurrent: false,
            sinif2: { selected: false, hours: null },
            sinif3: { selected: false, hours: null },
            cross: { selected: false, hours: null }
        },
        orta: { 
            continuesCurrent: false,
            oblik1333: { selected: false, hours: null },
            oblik2343: { selected: false, hours: null }
        }
    }
};

// Hafta seçimi fonksiyonu
function selectWeeks(section, weeks) {
    console.log(`selectWeeks called: section=${section}, weeks=${weeks}`);
    
    // Önceki seçimi temizle
    const buttons = document.querySelectorAll(`#${section}-tedavisi .time-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Yeni seçimi işaretle
    const selectedBtn = document.querySelector(`#${section}-tedavisi .time-btn[data-weeks="${weeks}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        console.log(`Button selected successfully for ${weeks} weeks`);
    } else {
        console.error(`Button not found for ${section}-tedavisi with weeks=${weeks}`);
    }
    
    // Seçimi kaydet
    selectedAppointment[section] = weeks;
    console.log(`selectedAppointment updated:`, selectedAppointment);
    
    // Manuel input'u gizle
    const manualInput = document.getElementById(`${section}-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'none';
    }
    
    // Lastik ihtiyacı hesaplamasını güncelle (sadece tel bölümü için)
    if (section === 'tel') {
        console.log('selectWeeks: Calling updateElasticCalculation()');
        updateElasticCalculation();
    }
    
    // Raporu güncelle
    updateTelOutput();
}

// Manuel input gösterme fonksiyonu
function showManualInput(section) {
    // Önceki seçimleri temizle
    const buttons = document.querySelectorAll(`#${section}-tedavisi .time-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Manuel input butonunu seç
    const manualBtn = document.querySelector(`#${section}-tedavisi .manual-btn`);
    if (manualBtn) {
        manualBtn.classList.add('selected');
    }
    
    // Manuel input'u göster
    const manualInput = document.getElementById(`${section}-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'flex';
        
        // Input'a focus ver
        const inputField = document.getElementById(`${section}-manual-weeks`);
        if (inputField) {
            inputField.focus();
        }
    }
}

// Manuel hafta onaylama fonksiyonu
function confirmManualWeeks(section) {
    const inputField = document.getElementById(`${section}-manual-weeks`);
    const weeks = parseInt(inputField.value);
    
    // Geçerli bir değer varsa onayla ve kapat
    if (weeks && weeks > 0 && weeks <= 52) {
        // Manuel input'u gizle
        const manualInput = document.getElementById(`${section}-manual-input`);
        if (manualInput) {
            manualInput.style.display = 'none';
        }
        
        // Input'u temizle
        inputField.value = '';
        
        // Lastik ihtiyacı hesaplamasını güncelle (sadece tel bölümü için)
        if (section === 'tel') {
            updateElasticCalculation();
        }
    } else if (!inputField.value || inputField.value === '') {
        // Input boşsa sadece kapat
        const manualInput = document.getElementById(`${section}-manual-input`);
        if (manualInput) {
            manualInput.style.display = 'none';
        }
    } else {
        // Geçersiz değer varsa uyar
        alert('Lütfen 1-52 arasında geçerli bir hafta sayısı girin.');
        inputField.focus();
    }
}

// Manuel input iptal fonksiyonu
function cancelManualInput(section) {
    // Manuel input'u gizle
    const manualInput = document.getElementById(`${section}-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'none';
    }
    
    // Input'u temizle
    const inputField = document.getElementById(`${section}-manual-weeks`);
    if (inputField) {
        inputField.value = '';
    }
    
    // Manuel buton seçimini kaldır
    const manualBtn = document.querySelector(`#${section}-tedavisi .manual-btn`);
    if (manualBtn) {
        manualBtn.classList.remove('selected');
    }
    
    // Seçimi temizle
    selectedAppointment[section] = null;
    
    // Raporu güncelle
    updateTelOutput();
}

// Manuel input için Enter tuşu işleme fonksiyonu
function handleManualInputKeydown(event, section) {
    if (event.key === 'Enter') {
        event.preventDefault();
        confirmManualWeeks(section);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelManualInput(section);
    }
}

// Gerçek zamanlı manuel hafta güncelleme fonksiyonu
function updateManualWeeksRealTime(section) {
    const inputField = document.getElementById(`${section}-manual-weeks`);
    const weeks = parseInt(inputField.value);
    
    if (weeks && weeks > 0 && weeks <= 52) {
        // Seçimi gerçek zamanlı olarak kaydet
        selectedAppointment[section] = weeks;
        
        // Lastik ihtiyacı hesaplamasını güncelle (sadece tel bölümü için)
        if (section === 'tel') {
            updateElasticCalculation();
        }
        
        // Raporu hemen güncelle
        updateTelOutput();
    } else if (!inputField.value || inputField.value === '') {
        // Input boşsa seçimi temizle
        selectedAppointment[section] = null;
        updateTelOutput();
    }
}

// Randevu süresi seçimi fonksiyonu
function selectDuration(section, type) {
    // Önceki seçimi temizle
    const buttons = document.querySelectorAll(`#${section}-tedavisi .duration-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Yeni seçimi işaretle
    const selectedBtn = document.querySelector(`#${section}-tedavisi .duration-btn[data-duration="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçimi kaydet
    selectedDuration[section].type = type;
    selectedDuration[section].doctor = null;
    selectedDuration[section].assistant = null;
    
    // Manuel input'u gizle
    const manualInput = document.getElementById(`${section}-duration-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'none';
    }
    
    // Raporu güncelle
    updateTelOutput();
}

// Manuel randevu süresi input gösterme
function showDurationManualInput(section) {
    // Önceki seçimleri temizle
    const buttons = document.querySelectorAll(`#${section}-tedavisi .duration-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Manuel input butonunu seç
    const manualBtn = document.querySelector(`#${section}-tedavisi .duration-btn.manual-btn`);
    if (manualBtn) {
        manualBtn.classList.add('selected');
    }
    
    // Manuel input'u göster
    const manualInput = document.getElementById(`${section}-duration-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'flex';
        
        // İlk input'a focus ver
        const doctorInput = document.getElementById(`${section}-manual-doctor`);
        if (doctorInput) {
            doctorInput.focus();
        }
    }
    
    // Type'ı manuel olarak ayarla
    selectedDuration[section].type = 'manuel';
}

// Manuel randevu süresi gerçek zamanlı güncelleme
function updateManualDurationRealTime(section) {
    const doctorInput = document.getElementById(`${section}-manual-doctor`);
    const assistantInput = document.getElementById(`${section}-manual-assistant`);
    
    const doctorMinutes = parseInt(doctorInput.value);
    const assistantMinutes = parseInt(assistantInput.value);
    
    // Değerleri kaydet
    selectedDuration[section].doctor = (doctorMinutes && doctorMinutes > 0) ? doctorMinutes : null;
    selectedDuration[section].assistant = (assistantMinutes && assistantMinutes > 0) ? assistantMinutes : null;
    
    // Raporu güncelle
    updateTelOutput();
}

// Manuel randevu süresi klavye işleme
function handleDurationInputKeydown(event, section) {
    if (event.key === 'Enter') {
        event.preventDefault();
        confirmManualDuration(section);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelManualDuration(section);
    }
}

// Manuel randevu süresi onaylama
function confirmManualDuration(section) {
    // Manuel input'u gizle
    const manualInput = document.getElementById(`${section}-duration-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'none';
    }
    
    // Input'ları temizle
    const doctorInput = document.getElementById(`${section}-manual-doctor`);
    const assistantInput = document.getElementById(`${section}-manual-assistant`);
    if (doctorInput) doctorInput.value = '';
    if (assistantInput) assistantInput.value = '';
}

// Manuel randevu süresi iptal
function cancelManualDuration(section) {
    // Manuel input'u gizle
    const manualInput = document.getElementById(`${section}-duration-manual-input`);
    if (manualInput) {
        manualInput.style.display = 'none';
    }
    
    // Input'ları temizle
    const doctorInput = document.getElementById(`${section}-manual-doctor`);
    const assistantInput = document.getElementById(`${section}-manual-assistant`);
    if (doctorInput) doctorInput.value = '';
    if (assistantInput) assistantInput.value = '';
    
    // Manuel buton seçimini kaldır
    const manualBtn = document.querySelector(`#${section}-tedavisi .duration-btn.manual-btn`);
    if (manualBtn) {
        manualBtn.classList.remove('selected');
    }
    
    // Seçimi temizle
    selectedDuration[section].type = null;
    selectedDuration[section].doctor = null;
    selectedDuration[section].assistant = null;
    
    // Raporu güncelle
    updateTelOutput();
}

// Lastik durumu seçimi fonksiyonu
function selectElasticStatus(section, status) {
    // Önceki seçimi temizle
    const buttons = document.querySelectorAll(`#${section}-tedavisi .elastic-status-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Yeni seçimi işaretle
    const selectedBtn = document.querySelector(`#${section}-tedavisi .elastic-status-btn[data-status="${status}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçimi kaydet
    elasticStatus[section] = status;
    
    // Raporu güncelle
    updateTelOutput();
}

// Aynı lastiklere devam fonksiyonu
function continueCurrentElastics(currentSection, side) {
    console.log(`continueCurrentElastics called: section=${currentSection}, side=${side}`);
    const continueBtn = document.querySelector(`#${currentSection}-next-${side}-section .continue-elastic-btn`);
    
    if (continueBtn.classList.contains('selected')) {
        // Seçimi kaldır
        continueBtn.classList.remove('selected');
        nextElasticUsage[`${currentSection}-next`][side].continuesCurrent = false;
        console.log(`Continue elastics DISABLED for ${side}`);
    } else {
        // Seçimi ekle
        continueBtn.classList.add('selected');
        nextElasticUsage[`${currentSection}-next`][side].continuesCurrent = true;
        console.log(`Continue elastics ENABLED for ${side}`);
        
        // Diğer seçimleri temizle
        const typeButtons = document.querySelectorAll(`#${currentSection}-next-${side}-section .elastic-type-btn`);
        const hourButtons = document.querySelectorAll(`#${currentSection}-next-${side}-section .elastic-hour-btn`);
        typeButtons.forEach(btn => btn.classList.remove('selected'));
        hourButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Saat bölümlerini gizle
        const hoursContainers = document.querySelectorAll(`#${currentSection}-next-${side}-section .elastic-hours-container`);
        hoursContainers.forEach(container => container.style.display = 'none');
        
        // Next usage'daki seçimleri temizle
        if (side === 'orta') {
            nextElasticUsage[`${currentSection}-next`][side].oblik1333.selected = false;
            nextElasticUsage[`${currentSection}-next`][side].oblik1333.hours = null;
            nextElasticUsage[`${currentSection}-next`][side].oblik2343.selected = false;
            nextElasticUsage[`${currentSection}-next`][side].oblik2343.hours = null;
        } else {
            nextElasticUsage[`${currentSection}-next`][side].sinif2.selected = false;
            nextElasticUsage[`${currentSection}-next`][side].sinif2.hours = null;
            nextElasticUsage[`${currentSection}-next`][side].sinif3.selected = false;
            nextElasticUsage[`${currentSection}-next`][side].sinif3.hours = null;
            nextElasticUsage[`${currentSection}-next`][side].cross.selected = false;
            nextElasticUsage[`${currentSection}-next`][side].cross.hours = null;
        }
    }
    
    // Hem hesaplamayı hem de raporu güncelle
    console.log('continueCurrentElastics: Calling updateElasticCalculation()');
    updateElasticCalculation();
}

// Lastik bölümü açma/kapama
function toggleElasticSection(section, side) {
    const sectionElement = document.getElementById(`${section}-${side}-section`);
    const button = document.querySelector(`button[onclick="toggleElasticSection('${section}', '${side}')"]`);
    
    if (sectionElement.style.display === 'none') {
        sectionElement.style.display = 'block';
        button.classList.add('active');
    } else {
        sectionElement.style.display = 'none';
        button.classList.remove('active');
        
        // Hangi section olduğunu belirle ve seçimleri temizle
        const usageObject = section.includes('next') ? nextElasticUsage : currentElasticUsage;
        
        if (side === 'orta') {
            usageObject[section][side].oblik1333.selected = false;
            usageObject[section][side].oblik1333.hours = null;
            usageObject[section][side].oblik2343.selected = false;
            usageObject[section][side].oblik2343.hours = null;
            if (section.includes('next')) {
                usageObject[section][side].continuesCurrent = false;
            }
        } else {
            usageObject[section][side].sinif2.selected = false;
            usageObject[section][side].sinif2.hours = null;
            usageObject[section][side].sinif3.selected = false;
            usageObject[section][side].sinif3.hours = null;
            usageObject[section][side].cross.selected = false;
            usageObject[section][side].cross.hours = null;
            if (section.includes('next')) {
                usageObject[section][side].continuesCurrent = false;
            }
        }
        
        // Butonları temizle
        const typeButtons = sectionElement.querySelectorAll('.elastic-type-btn, .continue-elastic-btn');
        const hourButtons = sectionElement.querySelectorAll('.elastic-hour-btn');
        typeButtons.forEach(btn => btn.classList.remove('selected'));
        hourButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Saat bölümlerini gizle
        const hoursContainers = sectionElement.querySelectorAll('.elastic-hours-container');
        hoursContainers.forEach(container => container.style.display = 'none');
        
        updateTelOutput();
    }
}

// Lastik tipi seçimi (çoklu seçim)
function selectElasticType(section, side, type) {
    console.log(`selectElasticType called: section=${section}, side=${side}, type=${type}`);
    const selectedBtn = document.querySelector(`#${section}-${side}-section .elastic-type-btn[onclick="selectElasticType('${section}', '${side}', '${type}')"]`);
    const usageObject = section.includes('next') ? nextElasticUsage : currentElasticUsage;
    
    // Next section'da aynı lastiklere devam seçeneğini temizle
    if (section.includes('next')) {
        const continueBtn = document.querySelector(`#${section}-${side}-section .continue-elastic-btn`);
        if (continueBtn) {
            continueBtn.classList.remove('selected');
            usageObject[section][side].continuesCurrent = false;
        }
    }
    
    if (selectedBtn.classList.contains('selected')) {
        // Seçimi kaldır
        selectedBtn.classList.remove('selected');
        usageObject[section][side][type].selected = false;
        usageObject[section][side][type].hours = null;
        
        // Saat seçim bölümünü gizle
        const hoursContainer = document.getElementById(`${section}-${side}-${type}-hours`);
        if (hoursContainer) {
            hoursContainer.style.display = 'none';
        }
        
        // Saat butonlarını temizle
        const hourButtons = hoursContainer?.querySelectorAll('.elastic-hour-btn');
        if (hourButtons) {
            hourButtons.forEach(btn => btn.classList.remove('selected'));
        }
    } else {
        // Seçimi ekle
        selectedBtn.classList.add('selected');
        usageObject[section][side][type].selected = true;
        
        // Saat seçim bölümünü göster
        const hoursContainer = document.getElementById(`${section}-${side}-${type}-hours`);
        if (hoursContainer) {
            hoursContainer.style.display = 'block';
        }
    }
    
    // Lastik hesaplamasını güncelle
    console.log('selectElasticType: Calling updateElasticCalculation()');
    updateElasticCalculation();
    
    console.log('selectElasticType: Calling updateTelOutput()');
    updateTelOutput();
}

// Lastik saat seçimi
function selectElasticHours(section, side, type, hours) {
    console.log(`selectElasticHours called: section=${section}, side=${side}, type=${type}, hours=${hours}`);
    const usageObject = section.includes('next') ? nextElasticUsage : currentElasticUsage;
    
    // Bu tip için önceki saat seçimini temizle
    const hoursContainer = document.getElementById(`${section}-${side}-${type}-hours`);
    const hourButtons = hoursContainer?.querySelectorAll('.elastic-hour-btn');
    if (hourButtons) {
        hourButtons.forEach(btn => btn.classList.remove('selected'));
    }
    
    // Yeni seçimi işaretle
    const selectedBtn = document.querySelector(`#${section}-${side}-${type}-hours .elastic-hour-btn[onclick="selectElasticHours('${section}', '${side}', '${type}', ${hours})"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçimi kaydet
    usageObject[section][side][type].hours = hours;
    
    // Lastik hesaplamasını güncelle
    console.log('selectElasticHours: Calling updateElasticCalculation()');
    updateElasticCalculation();
    
    console.log('selectElasticHours: Calling updateTelOutput()');
    updateTelOutput();
}

// Tel tedavisi çıktısını güncelleme fonksiyonu
function updateTelOutput() {
    let output = '';
    
    // Asistan bilgisini en üste ekle
    if (answers['tel-asistan']) {
        output += `Kontroller ${answers['tel-asistan'].toUpperCase()} Hanım tarafından yapılmıştır.\n\n`;
    }
    
    // Randevu bilgisini ekle
    if (selectedAppointment.tel && selectedAppointment.tel > 0) {
        output += `Bir sonraki randevu ${selectedAppointment.tel} hafta sonra verilecektir.\n`;
    }
    
    // Randevu süresi bilgisini ekle
    if (selectedDuration.tel && selectedDuration.tel.type) {
        let durationText = '';
        
        switch (selectedDuration.tel.type) {
            case 'standart':
                durationText = '20 dakika RD';
                break;
            case 'kisa':
                durationText = '10 dakika RD';
                break;
            case 'uzun':
                durationText = '30 dakika RD';
                break;
            case 'manuel':
                const parts = [];
                if (selectedDuration.tel.doctor && selectedDuration.tel.doctor > 0) {
                    parts.push(`${selectedDuration.tel.doctor} dk RD`);
                }
                if (selectedDuration.tel.assistant && selectedDuration.tel.assistant > 0) {
                    parts.push(`${selectedDuration.tel.assistant} dk AR`);
                }
                if (parts.length > 0) {
                    durationText = parts.join(', ');
                }
                break;
        }
        
        if (durationText) {
            output += `Bir sonraki randevu ${durationText}.\n`;
        }
    }
    
    // Lastik durumu bilgisini ekle
    if (elasticStatus.tel) {
        if (elasticStatus.tel === 'evet') {
            output += `Hasta lastiklerini takarak randevuya geldi.\n`;
        } else if (elasticStatus.tel === 'hayir') {
            output += `Hasta lastiklerini takmadan randevuya geldi.\n`;
        }
    }
    
    // Mevcut lastik kullanımı bilgisini ekle
    const sagElastics = [];
    const solElastics = [];
    const ortaElastics = [];
    
    // Sağ taraf
    const sagTypes = ['sinif2', 'sinif3', 'cross'];
    sagTypes.forEach(type => {
        if (currentElasticUsage.tel.sag[type].selected && currentElasticUsage.tel.sag[type].hours) {
            const typeText = getElasticTypeText(type);
            sagElastics.push(`• ${typeText} lastik ${currentElasticUsage.tel.sag[type].hours} saat`);
        }
    });
    
    // Sol taraf
    const solTypes = ['sinif2', 'sinif3', 'cross'];
    solTypes.forEach(type => {
        if (currentElasticUsage.tel.sol[type].selected && currentElasticUsage.tel.sol[type].hours) {
            const typeText = getElasticTypeText(type);
            solElastics.push(`• ${typeText} lastik ${currentElasticUsage.tel.sol[type].hours} saat`);
        }
    });
    
    // Orta
    if (currentElasticUsage.tel.orta.oblik1333.selected && currentElasticUsage.tel.orta.oblik1333.hours) {
        ortaElastics.push(`• 13-33 oblik lastik ${currentElasticUsage.tel.orta.oblik1333.hours} saat`);
    }
    if (currentElasticUsage.tel.orta.oblik2343.selected && currentElasticUsage.tel.orta.oblik2343.hours) {
        ortaElastics.push(`• 23-43 oblik lastik ${currentElasticUsage.tel.orta.oblik2343.hours} saat`);
    }
    
    // Lastik kullanımı raporu oluştur
    if (sagElastics.length > 0 || solElastics.length > 0 || ortaElastics.length > 0) {
        output += '\nMEVCUT LASTİK KULLANIMI:\n';
        output += '------------------------\n';
        
        if (sagElastics.length > 0) {
            output += 'SAĞ LASTİKLER:\n';
            output += sagElastics.join('\n') + '\n\n';
        }
        
        if (solElastics.length > 0) {
            output += 'SOL LASTİKLER:\n';
            output += solElastics.join('\n') + '\n\n';
        }
        
        if (ortaElastics.length > 0) {
            output += 'ORTA LASTİKLER:\n';
            output += ortaElastics.join('\n') + '\n';
        }
    }

    // Mevcut takılı tel bilgilerini ekle
    const wireInfo = [];
    if (currentWires.ust.selected) {
        const ustWireText = `${getJawText('ust')}: ${currentWires.ust.size} ${getWireTypeText(currentWires.ust.type)}`;
        wireInfo.push(ustWireText);
    }
    if (currentWires.alt.selected) {
        const altWireText = `${getJawText('alt')}: ${currentWires.alt.size} ${getWireTypeText(currentWires.alt.type)}`;
        wireInfo.push(altWireText);
    }

    if (wireInfo.length > 0) {
        output += '\nMEVCUT TAKILI TEL BİLGİSİ:\n';
        output += '-------------------------\n';
        wireInfo.forEach(info => {
            output += `• ${info}\n`;
        });
        output += '\n';
    }

    // Tel bükümleri bilgisini ekle
    const bendInfo = [];
    const interbendInfo = [];
    
    // Üst çene bükümleri
    if (wireBends.ust && Object.keys(wireBends.ust).length > 0) {
        Object.keys(wireBends.ust).forEach(tooth => {
            const bends = wireBends.ust[tooth];
            if (bends && bends.length > 0) {
                bends.forEach(bendType => {
                    const bendText = getBendTypeText(bendType);
                    bendInfo.push(`${tooth} nolu dişte "${bendText}" bükümü mevcut`);
                });
            }
        });
    }
    
    // Alt çene bükümleri
    if (wireBends.alt && Object.keys(wireBends.alt).length > 0) {
        Object.keys(wireBends.alt).forEach(tooth => {
            const bends = wireBends.alt[tooth];
            if (bends && bends.length > 0) {
                bends.forEach(bendType => {
                    const bendText = getBendTypeText(bendType);
                    bendInfo.push(`${tooth} nolu dişte "${bendText}" bükümü mevcut`);
                });
            }
        });
    }
    
    // Üst çene dişler arası bükümleri
    if (interbendData.ust && Object.keys(interbendData.ust).length > 0) {
        Object.keys(interbendData.ust).forEach(position => {
            const bendType = interbendData.ust[position];
            const bendText = getInterbendTypeText(bendType);
            interbendInfo.push(`${position} nolu dişler arasında "${bendText}" bükümü mevcut`);
        });
    }
    
    // Alt çene dişler arası bükümleri
    if (interbendData.alt && Object.keys(interbendData.alt).length > 0) {
        Object.keys(interbendData.alt).forEach(position => {
            const bendType = interbendData.alt[position];
            const bendText = getInterbendTypeText(bendType);
            interbendInfo.push(`${position} nolu dişler arasında "${bendText}" bükümü mevcut`);
        });
    }

    // Tüm ark bükümleri - bağımsız kontrol
    const fullArchInfo = [];
    if (fullArchBends.ust) {
        const bendText = getFullArchBendText(fullArchBends.ust);
        fullArchInfo.push(`Üst çene telinde "${bendText}" bükümü mevcut`);
    }
    if (fullArchBends.alt) {
        const bendText = getFullArchBendText(fullArchBends.alt);
        fullArchInfo.push(`Alt çene telinde "${bendText}" bükümü mevcut`);
    }

    if (bendInfo.length > 0 || interbendInfo.length > 0 || fullArchInfo.length > 0) {
        output += '\nTEL BÜKÜMLERİ:\n';
        output += '-------------\n';
        
        // Diş bükümleri
        if (bendInfo.length > 0) {
            output += 'Tek dişe yapılan bükümler:\n';
            bendInfo.forEach(info => {
                output += `• ${info}\n`;
            });
        }
        
        // Dişler arası bükümleri
        if (interbendInfo.length > 0) {
            if (bendInfo.length > 0) {
                output += '\nDişler arası bükümler:\n';
            } else {
                output += 'Dişler arası bükümler:\n';
            }
            interbendInfo.forEach(info => {
                output += `• ${info}\n`;
            });
        }
        
        // Tüm ark bükümleri
        if (fullArchInfo.length > 0) {
            if (bendInfo.length > 0 || interbendInfo.length > 0) {
                output += '\nTüm ark teli bükümleri:\n';
            } else {
                output += 'Tüm ark teli bükümleri:\n';
            }
            fullArchInfo.forEach(info => {
                output += `• ${info}\n`;
            });
        }
        
        output += '\n';
    }

    // Sonraki seansa kadar lastik kullanımı bilgisini ekle
    const nextSagElastics = [];
    const nextSolElastics = [];
    const nextOrtaElastics = [];
    
    // Sağ taraf - sonraki seans
    if (nextElasticUsage['tel-next'].sag.continuesCurrent) {
        // Mevcut lastikleri kopyala
        const sagTypes = ['sinif2', 'sinif3', 'cross'];
        sagTypes.forEach(type => {
            if (currentElasticUsage.tel.sag[type].selected && currentElasticUsage.tel.sag[type].hours) {
                const typeText = getElasticTypeText(type);
                nextSagElastics.push(`•• ${typeText} lastik ${currentElasticUsage.tel.sag[type].hours} saat (devam)`);
            }
        });
    } else {
        // Manuel seçimler
        const sagTypes = ['sinif2', 'sinif3', 'cross'];
        sagTypes.forEach(type => {
            if (nextElasticUsage['tel-next'].sag[type].selected && nextElasticUsage['tel-next'].sag[type].hours) {
                const typeText = getElasticTypeText(type);
                nextSagElastics.push(`•• ${typeText} lastik ${nextElasticUsage['tel-next'].sag[type].hours} saat`);
            }
        });
    }
    
    // Sol taraf - sonraki seans
    if (nextElasticUsage['tel-next'].sol.continuesCurrent) {
        // Mevcut lastikleri kopyala
        const solTypes = ['sinif2', 'sinif3', 'cross'];
        solTypes.forEach(type => {
            if (currentElasticUsage.tel.sol[type].selected && currentElasticUsage.tel.sol[type].hours) {
                const typeText = getElasticTypeText(type);
                nextSolElastics.push(`•• ${typeText} lastik ${currentElasticUsage.tel.sol[type].hours} saat (devam)`);
            }
        });
    } else {
        // Manuel seçimler
        const solTypes = ['sinif2', 'sinif3', 'cross'];
        solTypes.forEach(type => {
            if (nextElasticUsage['tel-next'].sol[type].selected && nextElasticUsage['tel-next'].sol[type].hours) {
                const typeText = getElasticTypeText(type);
                nextSolElastics.push(`•• ${typeText} lastik ${nextElasticUsage['tel-next'].sol[type].hours} saat`);
            }
        });
    }
    
    // Orta - sonraki seans
    if (nextElasticUsage['tel-next'].orta.continuesCurrent) {
        // Mevcut lastikleri kopyala
        if (currentElasticUsage.tel.orta.oblik1333.selected && currentElasticUsage.tel.orta.oblik1333.hours) {
            nextOrtaElastics.push(`•• 13-33 Oblik lastik ${currentElasticUsage.tel.orta.oblik1333.hours} saat (devam)`);
        }
        if (currentElasticUsage.tel.orta.oblik2343.selected && currentElasticUsage.tel.orta.oblik2343.hours) {
            nextOrtaElastics.push(`•• 23-43 Oblik lastik ${currentElasticUsage.tel.orta.oblik2343.hours} saat (devam)`);
        }
    } else {
        // Manuel seçimler
        if (nextElasticUsage['tel-next'].orta.oblik1333.selected && nextElasticUsage['tel-next'].orta.oblik1333.hours) {
            nextOrtaElastics.push(`•• 13-33 Oblik lastik ${nextElasticUsage['tel-next'].orta.oblik1333.hours} saat`);
        }
        if (nextElasticUsage['tel-next'].orta.oblik2343.selected && nextElasticUsage['tel-next'].orta.oblik2343.hours) {
            nextOrtaElastics.push(`•• 23-43 Oblik lastik ${nextElasticUsage['tel-next'].orta.oblik2343.hours} saat`);
        }
    }
    
    // Sonraki seans raporu oluştur
    if (nextSagElastics.length > 0 || nextSolElastics.length > 0 || nextOrtaElastics.length > 0) {
        output += '\nSONRAKİ SEANSA KADAR LASTİK KULLANIMI:\n';
        output += '--------------------------------------\n';
        
        if (nextSagElastics.length > 0) {
            output += 'SAĞ LASTİKLER:\n';
            output += nextSagElastics.join('\n') + '\n\n';
        }
        
        if (nextSolElastics.length > 0) {
            output += 'SOL LASTİKLER:\n';
            output += nextSolElastics.join('\n') + '\n\n';
        }
        
        if (nextOrtaElastics.length > 0) {
            output += 'ORTA LASTİKLER:\n';
            output += nextOrtaElastics.join('\n') + '\n';
        }
    }
    
    // Lastik ihtiyacı bilgisini ekle
    if (elasticNeedCalculation.totalNeed > 0) {
        const appointmentWeeks = selectedAppointment.tel || 0;
        
        output += '\nEK İHTİYAÇLAR:\n';
        output += '-------------\n';
        
        // elasticNeedCalculation objesindeki details bilgisini kullan
        if (elasticNeedCalculation.details && elasticNeedCalculation.details.length > 0) {
            const detailsText = elasticNeedCalculation.details.join(', ');
            const calculationText = `${detailsText} × ${elasticNeedCalculation.days} gün`;
            output += `• Lastik İhtiyacı: ${appointmentWeeks} hafta için ${elasticNeedCalculation.totalNeed} adet lastik pakedi gerekli (${calculationText})\n`;
        } else {
            output += `• Lastik İhtiyacı: ${appointmentWeeks} hafta için ${elasticNeedCalculation.totalNeed} adet lastik pakedi gerekli\n`;
        }
    }
    
    // Çıktıyı güncelle
    const outputTextarea = document.getElementById('tel-output');
    if (outputTextarea) {
        outputTextarea.value = output;
    }
}

// Lastik tipi metnini dönüştürme yardımcı fonksiyonu
function getElasticTypeText(type) {
    switch (type) {
        case 'sinif2':
            return 'Sınıf II';
        case 'sinif3':
            return 'Sınıf III';
        case 'cross':
            return 'Cross';
        case 'oblik1333':
            return '13-33 Oblik';
        case 'oblik2343':
            return '23-43 Oblik';
        default:
            return type;
    }
}

// ==============================================
// LASTİK İHTİYACI HESAPLAMA FONKSİYONLARI
// ==============================================

// Sonraki seans lastik seçimlerinden ihtiyacı hesapla
function calculateElasticNeed() {
    const resultContainer = document.getElementById('elastic-calculation-result');
    console.log('🧮 calculateElasticNeed STARTED');
    console.log('📅 selectedAppointment:', selectedAppointment);
    console.log('🔮 nextElasticUsage:', nextElasticUsage);
    
    if (!resultContainer) {
        console.error('Result container not found!');
        return;
    }
    
    // Randevu hafta bilgisini al
    const appointmentWeeks = selectedAppointment.tel || 0;
    console.log('appointmentWeeks:', appointmentWeeks);
    
    if (appointmentWeeks === 0) {
        resultContainer.innerHTML = '<p class="no-selection">Önce randevu haftası seçilmelidir</p>';
        return;
    }
    
    const totalDays = appointmentWeeks * 7;
    
    let totalElasticsPerDay = 0;
    let details = [];
    
    // Sonraki seans seçimlerini kontrol et (nextElasticUsage global değişkeninden)
    if (typeof nextElasticUsage !== 'undefined') {
        console.log('nextElasticUsage structure:', JSON.stringify(nextElasticUsage, null, 2));
        
        // Sağ taraf seçilen lastikleri say
        if (nextElasticUsage['tel-next'] && nextElasticUsage['tel-next'].sag) {
            const sagElastics = nextElasticUsage['tel-next'].sag;
            console.log('sagElastics:', sagElastics);
            let sagCount = 0;
            
            // "Aynı lastiklere devam" seçili mi kontrol et
            if (sagElastics.continuesCurrent && typeof currentElasticUsage !== 'undefined' && currentElasticUsage.tel && currentElasticUsage.tel.sag) {
                console.log('Sağ taraf aynı lastiklere devam seçili');
                console.log('currentElasticUsage.tel.sag:', currentElasticUsage.tel.sag);
                // Mevcut seçilen lastikleri say
                const sagTypes = ['sinif2', 'sinif3', 'cross'];
                sagTypes.forEach(type => {
                    console.log(`Checking current sag ${type}:`, currentElasticUsage.tel.sag[type]);
                    if (currentElasticUsage.tel.sag[type] && currentElasticUsage.tel.sag[type].selected && currentElasticUsage.tel.sag[type].hours) {
                        sagCount++;
                        console.log(`Sağ ${type} mevcut lastik sayıldı - sagCount: ${sagCount}`);
                    }
                });
            } else {
                // Manuel seçimleri kontrol et
                console.log('Sağ taraf manuel seçimler kontrol ediliyor');
                for (const type in sagElastics) {
                    console.log(`Checking manual sag ${type}:`, sagElastics[type]);
                    if (type !== 'continuesCurrent' && sagElastics[type].selected && sagElastics[type].hours) {
                        sagCount++;
                        console.log(`Sağ ${type} manuel lastik sayıldı - sagCount: ${sagCount}`);
                    }
                }
            }
            
            console.log('sagCount:', sagCount);
            if (sagCount > 0) {
                totalElasticsPerDay += sagCount;
                details.push(`Sağ: ${sagCount} lastik`);
                console.log('Added sagCount to totalElasticsPerDay:', totalElasticsPerDay);
            }
        }
        
        // Sol taraf seçilen lastikleri say
        if (nextElasticUsage['tel-next'] && nextElasticUsage['tel-next'].sol) {
            const solElastics = nextElasticUsage['tel-next'].sol;
            let solCount = 0;
            
            // "Aynı lastiklere devam" seçili mi kontrol et
            if (solElastics.continuesCurrent && typeof currentElasticUsage !== 'undefined' && currentElasticUsage.tel && currentElasticUsage.tel.sol) {
                console.log('Sol taraf aynı lastiklere devam seçili');
                console.log('currentElasticUsage.tel.sol:', currentElasticUsage.tel.sol);
                // Mevcut seçilen lastikleri say
                const solTypes = ['sinif2', 'sinif3', 'cross'];
                solTypes.forEach(type => {
                    console.log(`Checking current sol ${type}:`, currentElasticUsage.tel.sol[type]);
                    if (currentElasticUsage.tel.sol[type] && currentElasticUsage.tel.sol[type].selected && currentElasticUsage.tel.sol[type].hours) {
                        solCount++;
                        console.log(`Sol ${type} mevcut lastik sayıldı - solCount: ${solCount}`);
                    }
                });
            } else {
                // Manuel seçimleri kontrol et
                console.log('Sol taraf manuel seçimler kontrol ediliyor');
                for (const type in solElastics) {
                    console.log(`Checking manual sol ${type}:`, solElastics[type]);
                    if (type !== 'continuesCurrent' && solElastics[type].selected && solElastics[type].hours) {
                        solCount++;
                        console.log(`Sol ${type} manuel lastik sayıldı - solCount: ${solCount}`);
                    }
                }
            }
            
            console.log('solCount:', solCount);
            if (solCount > 0) {
                totalElasticsPerDay += solCount;
                details.push(`Sol: ${solCount} lastik`);
                console.log('Added solCount to totalElasticsPerDay:', totalElasticsPerDay);
            }
        }
        
        // Orta seçilen lastikleri say
        if (nextElasticUsage['tel-next'] && nextElasticUsage['tel-next'].orta) {
            const ortaElastics = nextElasticUsage['tel-next'].orta;
            let ortaCount = 0;
            
            // "Aynı lastiklere devam" seçili mi kontrol et
            if (ortaElastics.continuesCurrent && typeof currentElasticUsage !== 'undefined' && currentElasticUsage.tel && currentElasticUsage.tel.orta) {
                console.log('Orta taraf aynı lastiklere devam seçili');
                // Mevcut seçilen lastikleri say
                const ortaTypes = ['oblik1333', 'oblik2343'];
                ortaTypes.forEach(type => {
                    if (currentElasticUsage.tel.orta[type] && currentElasticUsage.tel.orta[type].selected && currentElasticUsage.tel.orta[type].hours) {
                        ortaCount++;
                        console.log(`Orta ${type} mevcut lastik sayıldı`);
                    }
                });
            } else {
                // Manuel seçimleri kontrol et
                console.log('Orta taraf manuel seçimler kontrol ediliyor');
                for (const type in ortaElastics) {
                    console.log(`Checking manual orta ${type}:`, ortaElastics[type]);
                    if (type !== 'continuesCurrent' && ortaElastics[type].selected && ortaElastics[type].hours) {
                        ortaCount++;
                        console.log(`Orta ${type} manuel lastik sayıldı - ortaCount: ${ortaCount}`);
                    }
                }
            }
            
            console.log('ortaCount:', ortaCount);
            if (ortaCount > 0) {
                totalElasticsPerDay += ortaCount;
                details.push(`Orta: ${ortaCount} lastik`);
                console.log('Added ortaCount to totalElasticsPerDay:', totalElasticsPerDay);
            }
        }
    }
    
    const totalNeed = totalElasticsPerDay * totalDays;
    
    console.log('=== CALCULATION SUMMARY ===');
    console.log('totalElasticsPerDay:', totalElasticsPerDay);
    console.log('totalDays:', totalDays);
    console.log('totalNeed:', totalNeed);
    console.log('details:', details);
    console.log('=========================');
    
    let resultHTML = '';
    
    if (totalElasticsPerDay === 0) {
        console.log('No elastics per day - showing no selection message');
        resultHTML = '<p class="no-selection">Sonraki seans için lastik seçimi yapılmadı</p>';
    } else {
        // Detayları /gün formatında düzenle
        const detailsFormatted = details.map(detail => detail.replace('lastik', '/gün')).join(', ');
        
        resultHTML = `
            <p><strong>${appointmentWeeks} hafta için ${totalNeed} adet lastik gerekli</strong></p>
            <p>(${detailsFormatted} × ${totalDays} gün)</p>
        `;
    }
    
    resultContainer.innerHTML = resultHTML;
    
    // Global değişkenleri güncelle
    elasticNeedCalculation = {
        days: totalDays,
        elasticsPerDay: totalElasticsPerDay,
        totalNeed: totalNeed,
        details: details.map(detail => detail.replace('lastik', '/gün'))
    };
}

// Lastik seçimi değiştiğinde hesaplamayı güncelle
function updateElasticCalculation() {
    console.log('🔄 updateElasticCalculation called');
    console.log('📅 selectedAppointment:', selectedAppointment);
    console.log('📦 currentElasticUsage:', currentElasticUsage);
    console.log('🔮 nextElasticUsage:', nextElasticUsage);
    
    calculateElasticNeed();
    updateTelOutput(); // Raporu da güncelle
    
    console.log('✅ updateElasticCalculation completed');
}

// Lastik tipi metnini dönüştürme yardımcı fonksiyonu
function getElasticTypeText(type) {
    switch (type) {
        case 'sinif2':
            return 'Sınıf II';
        case 'sinif3':
            return 'Sınıf III';
        case 'cross':
            return 'Cross';
        case 'oblik1333':
            return '13-33 Oblik';
        case 'oblik2343':
            return '23-43 Oblik';
        default:
            return type;
    }
}

// Emergency test function for debugging
window.testElasticCalculation = function() {
    console.log("=== EMERGENCY TEST ===");
    console.log("selectedAppointment:", selectedAppointment);
    console.log("nextElasticUsage:", nextElasticUsage);
    
    // Container kontrolü
    const container = document.getElementById('elastic-calculation-result');
    console.log("Container found:", !!container);
    
    if (container) {
        container.innerHTML = '<p style="color: green;">TEST: Container bulundu ve güncellendi!</p>';
    }
    
    updateElasticCalculation();
};

// Test şalter pozisyonları
window.testSwitches = function() {
    console.log("=== SWITCH TEST ===");
    const switches = document.querySelectorAll('.switch-lever');
    const labels = document.querySelectorAll('.switch-label');
    
    switches.forEach((sw, index) => {
        const isUp = sw.classList.contains('up');
        const isDown = sw.classList.contains('down');
        const parentTab = sw.closest('.tab-content')?.id;
        const labelText = labels[index]?.textContent || 'No Label';
        console.log(`Switch ${index}: Tab=${parentTab}, Up=${isUp}, Down=${isDown}, Label="${labelText}"`);
    });
    
    // Aktif tab'ı göster
    const activeTab = document.querySelector('.tab-content.active')?.id;
    console.log("Active tab:", activeTab);
    
    // Beklenen durum
    console.log("EXPECTED:");
    console.log("- Tel aktifken → şalter DOWN + label 'Tel'");
    console.log("- Plak aktifken → şalter UP + label 'Plak'");
};

// Global fonksiyon atamaları - HTML onclick'ler için
window.toggleElasticSection = toggleElasticSection;
window.selectElasticType = selectElasticType;
window.selectElasticHours = selectElasticHours;
window.continueCurrentElastics = continueCurrentElastics;

// ==============================================
// MEVCUT TAKILI TELLER FONKSİYONLARI
// ==============================================

// Tel bölümü açma/kapama
function toggleWireSection(jaw) {
    const sectionElement = document.getElementById(`${jaw}-wire-section`);
    const button = document.querySelector(`button[onclick="toggleWireSection('${jaw}')"]`);
    
    if (sectionElement.style.display === 'none') {
        sectionElement.style.display = 'block';
        button.classList.add('active');
    } else {
        sectionElement.style.display = 'none';
        button.classList.remove('active');
    }
}

// Tel tipi açma/kapama
function toggleWireType(jaw, wireType) {
    const sizeContainer = document.getElementById(`${jaw}-${wireType}-sizes`);
    const header = document.querySelector(`[onclick="toggleWireType('${jaw}', '${wireType}')"]`);
    
    if (sizeContainer.style.display === 'none') {
        sizeContainer.style.display = 'block';
        header.classList.add('active');
    } else {
        sizeContainer.style.display = 'none';
        header.classList.remove('active');
    }
}

// Tel boyutu seçimi
function selectWireSize(jaw, wireType, size) {
    // Önceki seçimleri temizle
    const allButtons = document.querySelectorAll(`#${jaw}-${wireType}-sizes .wire-size-btn`);
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Yeni seçimi işaretle
    const selectedButton = document.querySelector(`[onclick="selectWireSize('${jaw}', '${wireType}', '${size}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    // Aynı çenedeki diğer tel tiplerinin seçimlerini temizle
    const allJawButtons = document.querySelectorAll(`#${jaw}-wire-section .wire-size-btn`);
    allJawButtons.forEach(btn => {
        if (!btn.closest(`#${jaw}-${wireType}-sizes`)) {
            btn.classList.remove('selected');
        }
    });
    
    // SS bükümlü seçildiğinde büküm bölümünü göster
    if (wireType === 'ss-bukumlu') {
        const bendSection = document.getElementById(`${jaw}-ss-bukumlu-bends`);
        if (bendSection) {
            bendSection.style.display = 'block';
        }
    } else {
        // Diğer tel tipleri seçildiğinde tüm büküm bölümlerini gizle
        const allBendSections = document.querySelectorAll(`#${jaw}-wire-section .wire-bend-section`);
        allBendSections.forEach(section => {
            section.style.display = 'none';
        });
    }
    
    // Global değişkeni güncelle
    currentWires[jaw] = {
        selected: true,
        type: wireType,
        size: size
    };
    
    console.log(`Tel seçildi: ${jaw} çene - ${wireType} - ${size}`);
    console.log('currentWires:', currentWires);
    
    // Raporu güncelle
    updateTelOutput();
}

// Tel tipi metin dönüştürme
function getWireTypeText(type) {
    switch (type) {
        case 'niti':
            return 'Niti';
        case 'ss':
            return 'SS';
        case 'rc':
            return 'RC';
        case 'ss-bukumlu':
            return 'Bükümlü SS';
        default:
            return type;
    }
}

// Tel çene metin dönüştürme
function getJawText(jaw) {
    switch (jaw) {
        case 'alt':
            return 'Alt';
        case 'ust':
            return 'Üst';
        default:
            return jaw;
    }
}

// Büküm seçimi fonksiyonları
function selectWireBend(jaw, type, identifier) {
    if (type === 'tooth') {
        // Diş butonuna tıklandı - popup aç
        openBendPopup(jaw, identifier);
    } else if (type === 'bend') {
        // Büküm butonuna tıklandı (dişler arası) - yeni popup aç
        openInterbendPopup(jaw, identifier);
    }
}

// Seçili bükümleri getir
function getSelectedBends(jaw) {
    const bendSection = document.getElementById(`${jaw}-ss-bukumlu-bends`);
    if (!bendSection) return { teeth: [], bends: [] };
    
    const selectedTeeth = Array.from(bendSection.querySelectorAll('.tooth-btn.selected'))
        .map(btn => btn.dataset.tooth);
    
    const selectedBends = Array.from(bendSection.querySelectorAll('.bend-btn.selected'))
        .map(btn => btn.dataset.position);
    
    return {
        teeth: selectedTeeth,
        bends: selectedBends
    };
}

// Bükümleri temizle
function clearWireBends(jaw) {
    const bendSection = document.getElementById(`${jaw}-ss-bukumlu-bends`);
    if (!bendSection) return;
    
    // Tüm seçimleri temizle
    const selectedButtons = bendSection.querySelectorAll('.selected');
    selectedButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Global büküm verilerini temizle
    if (wireBends[jaw]) {
        wireBends[jaw] = {};
    }
    
    // Dişler arası büküm verilerini temizle
    if (interbendData[jaw]) {
        interbendData[jaw] = {};
    }
    
    console.log(`${jaw} çene bükümleri temizlendi`);
    
    // Raporu güncelle
    updateTelOutput();
}

// Popup fonksiyonları
function openBendPopup(jaw, tooth) {
    currentPopupTooth = tooth;
    currentPopupJaw = jaw;
    
    const popup = document.getElementById('bend-type-popup');
    const overlay = document.getElementById('popup-overlay');
    const title = document.getElementById('popup-tooth-title');
    
    // Başlığı güncelle
    title.textContent = `${tooth} Nolu Diş Bükümü Seçin`;
    
    // Mevcut seçimleri göster
    updatePopupSelections();
    
    // Popup'ı göster
    overlay.style.display = 'block';
    popup.style.display = 'block';
    
    // Popup animasyonu için küçük gecikme
    setTimeout(() => {
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.opacity = '1';
    }, 10);
}

function closeBendPopup() {
    const popup = document.getElementById('bend-type-popup');
    const overlay = document.getElementById('popup-overlay');
    
    popup.style.display = 'none';
    overlay.style.display = 'none';
    
    currentPopupTooth = null;
    currentPopupJaw = null;
}

function updatePopupSelections() {
    if (!currentPopupTooth || !currentPopupJaw) return;
    
    const bendButtons = document.querySelectorAll('.bend-type-btn');
    const currentBends = wireBends[currentPopupJaw][currentPopupTooth] || [];
    
    bendButtons.forEach(btn => {
        const bendType = btn.dataset.bend;
        if (currentBends.includes(bendType)) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function selectBendType(bendType) {
    if (!currentPopupTooth || !currentPopupJaw) return;
    
    // Global değişkeni başlat
    if (!wireBends[currentPopupJaw][currentPopupTooth]) {
        wireBends[currentPopupJaw][currentPopupTooth] = [];
    }
    
    const currentBends = wireBends[currentPopupJaw][currentPopupTooth];
    const bendIndex = currentBends.indexOf(bendType);
    
    if (bendIndex > -1) {
        // Büküm zaten seçili - kaldır
        currentBends.splice(bendIndex, 1);
    } else {
        // Büküm seçili değil - ekle
        currentBends.push(bendType);
    }
    
    // Diş butonunun görünümünü güncelle
    updateToothButtonVisual();
    
    // Popup seçimlerini güncelle
    updatePopupSelections();
    
    console.log(`${currentPopupJaw} çene ${currentPopupTooth} diş bükümleri:`, currentBends);
    
    // Raporu güncelle
    updateTelOutput();
    
    // Popup'u otomatik kapat
    closeBendPopup();
}

function updateToothButtonVisual() {
    if (!currentPopupTooth || !currentPopupJaw) return;
    
    const toothBtn = document.querySelector(`#${currentPopupJaw}-ss-bukumlu-bends [data-tooth="${currentPopupTooth}"]`);
    const hasBends = wireBends[currentPopupJaw][currentPopupTooth] && 
                     wireBends[currentPopupJaw][currentPopupTooth].length > 0;
    
    if (toothBtn) {
        if (hasBends) {
            toothBtn.classList.add('selected');
        } else {
            toothBtn.classList.remove('selected');
        }
    }
}

function clearToothBends() {
    if (!currentPopupTooth || !currentPopupJaw) return;
    
    // Bu dişin bükümlerini temizle
    if (wireBends[currentPopupJaw][currentPopupTooth]) {
        wireBends[currentPopupJaw][currentPopupTooth] = [];
    }
    
    // Popup seçimlerini güncelle
    updatePopupSelections();
    
    // Diş butonunu güncelle
    updateToothButtonVisual();
    
    // Raporu güncelle
    updateTelOutput();
}

// Büküm tipi metin dönüştürme
function getBendTypeText(bendType) {
    const bendTexts = {
        'bukkal-kron-tork': 'Bukkal kron torku',
        'piggy-back': 'Piggy back',
        'distal-tipping': 'Distal tipping',
        'meziyal-tipping': 'Meziyal tipping', 
        'distal-angulasyon': 'Distal angulasyon',
        'meziyal-angulasyon': 'Meziyal angulasyon',
        'mesial-out': 'Mesial out',
        'distal-out': 'Distal out',
        'mesial-in': 'Mesial in',
        'distal-in': 'Distal in',
        'distal-rotasyon': 'Distal rotasyon',
        'meziyal-rotasyon': 'Meziyal rotasyon'
    };
    
    return bendTexts[bendType] || bendType;
}

// FDI büküm butonlarına event listener ekle
function initializeBendButtons() {
    // Alt çene butonları
    const altBendSection = document.getElementById('alt-ss-bukumlu-bends');
    if (altBendSection) {
        // Diş butonları
        altBendSection.querySelectorAll('.tooth-btn').forEach(btn => {
            const tooth = btn.dataset.tooth;
            btn.onclick = () => selectWireBend('alt', 'tooth', tooth);
        });
        
        // Büküm butonları  
        altBendSection.querySelectorAll('.bend-btn').forEach(btn => {
            const position = btn.dataset.position;
            btn.onclick = () => selectWireBend('alt', 'bend', position);
        });
    }
    
    // Üst çene butonları
    const ustBendSection = document.getElementById('ust-ss-bukumlu-bends');
    if (ustBendSection) {
        // Diş butonları
        ustBendSection.querySelectorAll('.tooth-btn').forEach(btn => {
            const tooth = btn.dataset.tooth;
            btn.onclick = () => selectWireBend('ust', 'tooth', tooth);
        });
        
        // Büküm butonları
        ustBendSection.querySelectorAll('.bend-btn').forEach(btn => {
            const position = btn.dataset.position;
            btn.onclick = () => selectWireBend('ust', 'bend', position);
        });
    }
    
    // Popup büküm tipi butonları
    const bendTypeButtons = document.querySelectorAll('.bend-type-btn[data-bend]');
    bendTypeButtons.forEach(btn => {
        const bendType = btn.dataset.bend;
        btn.onclick = () => selectBendType(bendType);
    });
}

// Sayfa yüklendiğinde butonları başlat
document.addEventListener('DOMContentLoaded', function() {
    // Biraz gecikme ile başlat (HTML tamamen yüklensin diye)
    setTimeout(initializeBendButtons, 500);
});

// Global fonksiyon atamaları - Tel fonksiyonları
window.toggleWireSection = toggleWireSection;
window.toggleWireType = toggleWireType;
window.selectWireSize = selectWireSize;
window.selectWireBend = selectWireBend;
window.clearWireBends = clearWireBends;
window.initializeBendButtons = initializeBendButtons;

// Dişler arası büküm popup fonksiyonları
function openInterbendPopup(jaw, position) {
    currentInterbendPosition = position;
    currentInterbendJaw = jaw;
    
    const popup = document.getElementById('interbend-type-popup');
    const overlay = document.getElementById('interbend-popup-overlay');
    const title = document.getElementById('interbend-popup-title');
    
    // Başlığı güncelle
    title.textContent = `${position} nolu dişler arasında büküm seçin`;
    
    // Mevcut seçimi göster
    updateInterbendPopupSelection();
    
    // Popup'ı göster
    overlay.style.display = 'block';
    popup.style.display = 'block';
    
    // Popup animasyonu için küçük gecikme
    setTimeout(() => {
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.opacity = '1';
    }, 10);
}

function closeInterbendPopup() {
    const popup = document.getElementById('interbend-type-popup');
    const overlay = document.getElementById('interbend-popup-overlay');
    
    popup.style.display = 'none';
    overlay.style.display = 'none';
    
    currentInterbendPosition = null;
    currentInterbendJaw = null;
}

function updateInterbendPopupSelection() {
    if (!currentInterbendPosition || !currentInterbendJaw) return;
    
    const bendButtons = document.querySelectorAll('[data-interbend]');
    const currentBend = interbendData[currentInterbendJaw][currentInterbendPosition];
    
    bendButtons.forEach(btn => {
        const bendType = btn.dataset.interbend;
        if (currentBend === bendType) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function selectInterbendType(bendType) {
    if (!currentInterbendPosition || !currentInterbendJaw) return;
    
    const currentBend = interbendData[currentInterbendJaw][currentInterbendPosition];
    
    if (currentBend === bendType) {
        // Aynı büküm seçildi - kaldır
        delete interbendData[currentInterbendJaw][currentInterbendPosition];
        
        // Buton görselini güncelle - spesifik bend section içinde ara
        const bendButton = document.querySelector(`#${currentInterbendJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
        if (bendButton) {
            bendButton.classList.remove('selected');
        }
    } else {
        // Yeni büküm seç
        interbendData[currentInterbendJaw][currentInterbendPosition] = bendType;
        
        // Buton görselini güncelle - spesifik bend section içinde ara
        const bendButton = document.querySelector(`#${currentInterbendJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
        if (bendButton) {
            bendButton.classList.add('selected');
        }
    }
    
    // Raporu güncelle
    updateTelOutput();
    
    console.log(`Dişler arası büküm: ${currentInterbendJaw} çene - ${currentInterbendPosition} - ${bendType}`);
    
    // Popup'ı otomatik kapat
    closeInterbendPopup();
}

function clearInterbendSelection() {
    if (!currentInterbendPosition || !currentInterbendJaw) return;
    
    // Veriyi temizle
    delete interbendData[currentInterbendJaw][currentInterbendPosition];
    
    // Buton görselini güncelle - spesifik bend section içinde ara
    const bendButton = document.querySelector(`#${currentInterbendJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
    if (bendButton) {
        bendButton.classList.remove('selected');
    }
    
    // Popup seçimini güncelle
    updateInterbendPopupSelection();
    
    // Raporu güncelle
    updateTelOutput();
}

// Büküm tipi metin dönüştürme
function getInterbendTypeText(bendType) {
    const bendTexts = {
        'key-hole-loop': 'Key Hole Loop',
        'intruzyon': 'Intrüzyon',
        'ekstruzyon': 'Ekstrüzyon',
        'tork': 'Tork',
        'crimp-hook': 'Crimp Hook'
    };
    
    return bendTexts[bendType] || bendType;
}

// Global fonksiyon atamaları - Popup fonksiyonları
window.openBendPopup = openBendPopup;
window.closeBendPopup = closeBendPopup;
window.selectBendType = selectBendType;
window.clearToothBends = clearToothBends;

// Global fonksiyon atamaları - Interbend popup fonksiyonları
window.openInterbendPopup = openInterbendPopup;
window.closeInterbendPopup = closeInterbendPopup;
window.selectInterbendType = selectInterbendType;
window.clearInterbendSelection = clearInterbendSelection;

// Full Arch Bend Popup Functions
let currentFullArchJaw = '';
let fullArchBends = {
    ust: null,
    alt: null
};

function openFullArchPopup(jaw) {
    currentFullArchJaw = jaw;
    const popup = document.getElementById('full-arch-popup');
    const overlay = document.getElementById('full-arch-popup-overlay');
    const title = document.getElementById('full-arch-popup-title');
    
    title.textContent = jaw === 'ust' ? 'Üst Çene Tüm Ark Bükümü Seçin' : 'Alt Çene Tüm Ark Bükümü Seçin';
    
    // Event listener'ları temizle ve yeniden ekle
    const buttons = popup.querySelectorAll('.bend-type-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        // Eski event listener'ı kaldır
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Yeni butonları al ve event listener ekle
    const newButtons = popup.querySelectorAll('.bend-type-btn');
    newButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const bendType = this.getAttribute('data-bend');
            selectFullArchBend(bendType);
        });
    });
    
    // Mevcut seçimi göster
    const currentBend = fullArchBends[jaw];
    if (currentBend) {
        const selectedButton = popup.querySelector(`[data-bend="${currentBend}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
    }
    
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function closeFullArchPopup() {
    const popup = document.getElementById('full-arch-popup');
    const overlay = document.getElementById('full-arch-popup-overlay');
    
    popup.style.display = 'none';
    overlay.style.display = 'none';
    currentFullArchJaw = '';
    
    // Popup'taki seçimleri temizle
    const buttons = popup.querySelectorAll('.bend-type-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
}

function clearFullArchSelection() {
    if (!currentFullArchJaw) return;
    
    // Seçimi temizle
    delete fullArchBends[currentFullArchJaw];
    
    // Popup'taki seçimi kaldır
    const popup = document.getElementById('full-arch-popup');
    const buttons = popup.querySelectorAll('.bend-type-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    console.log(`Full arch selection cleared for: ${currentFullArchJaw}`);
    
    // Çıktıyı güncelle
    updateTelOutput();
}

function selectFullArchBend(bendType) {
    if (!currentFullArchJaw) return;
    
    // Popup'taki tüm butonlardan seçimi kaldır
    const popup = document.getElementById('full-arch-popup');
    const buttons = popup.querySelectorAll('.bend-type-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Seçilen butonu işaretle
    const selectedButton = popup.querySelector(`[data-bend="${bendType}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    // Seçimi kaydet
    fullArchBends[currentFullArchJaw] = bendType;
    
    // Tel output'unu güncelle
    updateTelOutput();
    
    // Popup'ı otomatik kapat
    closeFullArchPopup();
}

function getFullArchBendText(bendType) {
    switch (bendType) {
        case 'torklu-konsolidasyon':
            return 'Torklu Konsolidasyon Arkı';
        case 'anterior-intruzyon':
            return 'Anterior İntrüzyonlu Torklu Konsolidasyon Arkı';
        case 'anterior-tork':
            return 'Anterior Tork Arkı';
        default:
            return '';
    }
}

// Global fonksiyon atamaları - Full arch popup fonksiyonları
window.openFullArchPopup = openFullArchPopup;
window.closeFullArchPopup = closeFullArchPopup;
window.selectFullArchBend = selectFullArchBend;
window.clearFullArchSelection = clearFullArchSelection;

// Full arch butonlarını düzelt - Sadece IPR FDI'sını atla
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Şeffaf plak sekmesindeki IPR FDI'sı hariç, tüm "Alt Çene" h5 elementlerini "Tüm Alt Çene" butonuyla değiştir
        const allJawTitles = document.querySelectorAll('h5.jaw-title');
        allJawTitles.forEach(title => {
            if (title.textContent === 'Alt Çene') {
                // IPR FDI'sında mı kontrol et
                const parentChart = title.closest('.fdi-dental-chart');
                if (parentChart) {
                    const parentGroup = parentChart.closest('.question-group');
                    if (parentGroup) {
                        const headerText = parentGroup.querySelector('h4')?.textContent || '';
                        // Sadece IPR/Stripping içeren başlıklarda h5 olarak bırak
                        if (headerText.includes('IPR') || headerText.includes('Stripping')) {
                            return; // IPR FDI'sında h5 olarak bırak
                        }
                    }
                }
                // Diğer tüm durumlarda butona çevir
                title.outerHTML = '<button class="full-arch-btn" onclick="openFullArchPopup(\'alt\')">Tüm Alt Çene</button>';
            }
        });
        console.log('✅ IPR FDI hariç tüm alt çene h5 elementleri butonlarla değiştirildi');
    }, 100);
});

// Manuel giriş alanını toggle etme fonksiyonu
function toggleManualAsistanInput(tab = 'seffaf') {
    const prefix = tab === 'tel' ? 'tel-' : '';
    const manualGroup = document.getElementById(`${prefix}manual-asistan-group`);
    const toggleBtn = tab === 'tel' ? 
        document.querySelector('#tel-tedavisi .toggle-manual-btn') :
        document.querySelector('#seffaf-plak .toggle-manual-btn');
    
    if (manualGroup.style.display === 'none' || !manualGroup.style.display) {
        // Manuel giriş alanını aç
        manualGroup.style.display = 'block';
        toggleBtn.classList.add('active');
        toggleBtn.textContent = 'Manuel Girişi Kapat';
        
        // Input'a odaklan
        const input = document.getElementById(`${prefix}asistan-manual-input`);
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    } else {
        // Manuel giriş alanını kapat
        manualGroup.style.display = 'none';
        toggleBtn.classList.remove('active');
        toggleBtn.textContent = 'Manuel Giriş';
        
        // Input'u temizle
        const input = document.getElementById(`${prefix}asistan-manual-input`);
        if (input) {
            input.value = '';
        }
    }
}

// Manuel asistan ismi uygulama fonksiyonu
function applyManualAsistan(tab = 'seffaf') {
    const prefix = tab === 'tel' ? 'tel-' : '';
    const input = document.getElementById(`${prefix}asistan-manual-input`);
    const value = input.value.trim();
    
    if (!value) {
        alert('Lütfen bir asistan adı girin!');
        return;
    }
    
    // Tüm option butonlarının seçimini kaldır
    const tabContainer = tab === 'tel' ? document.getElementById('tel-tedavisi') : document.getElementById('seffaf-plak');
    const optionButtons = tabContainer.querySelectorAll(`[data-question="${prefix}asistan"].option-btn`);
    optionButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Manuel girilen değeri kaydet
    const questionKey = tab === 'tel' ? 'tel-asistan' : 'asistan';
    answers[questionKey] = value;
    
    // Display'i güncelle
    const display = document.getElementById(`${prefix}asistan-display`);
    if (display) {
        display.textContent = value;
    }
    
    // Input'u temizle ve manuel giriş alanını kapat
    input.value = '';
    toggleManualAsistanInput(tab);
    
    // Output'u güncelle
    if (tab === 'tel') {
        updateTelOutput();
    } else {
        updateSeffafOutput();
    }
    
    console.log(`✅ ${tab} Manuel asistan ismi uygulandı:`, value);
}

// Enter tuşu desteği için event listener ekle
document.addEventListener('DOMContentLoaded', function() {
    const manuelInput = document.getElementById('asistan-manual-input');
    if (manuelInput) {
        manuelInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyManualAsistan();
            }
        });
    }
    
    const telManuelInput = document.getElementById('tel-asistan-manual-input');
    if (telManuelInput) {
        telManuelInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyManualAsistan('tel');
            }
        });
    }
});

// Global olarak erişilebilir yap
window.toggleManualAsistanInput = toggleManualAsistanInput;
window.applyManualAsistan = applyManualAsistan;