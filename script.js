// Global variables
let answers = {};
let telAnswers = {};
let spacingList = [];
let elasticList = [];
let spacingMeasurements = {};
let elasticParameters = {};
let selectedInterdentalSpaces = new Set();

// Mevcut takılı teller seçimleri
let currentWires = {
    alt: {
        selected: false,
        type: null, // 'niti', 'ss', 'rc', 'ss-bukumlu'
        size: null  // '0.12', '0.14', '16x22', vb.
    },
    ust: {
        selected: false,
        type: null,
        size: null
    }
};

// Büküm verileri
let wireBends = {
    alt: {},
    ust: {}
};

// Dişler arası büküm verileri
let interbendData = {
    alt: {},
    ust: {}
};

// Popup için global değişkenler
let currentPopupTooth = null;
let currentPopupJaw = null;
let currentInterbendPosition = null;

// Full arch popup için global değişkenler
let currentFullArchJaw = '';
let fullArchBends = {
    alt: null,
    ust: null
};

// Tel Procedures (Diş arası ve dişlere rutin dışı uygulamalar)
let telProcedures = {
    gaps: {},     // Diş araları: gap -> procedure
    teeth: {}     // Dişler: tooth -> procedure
};

let currentProcedureSelection = {
    type: null,   // 'gap' or 'tooth'
    target: null, // gap id or tooth number
    procedure: null
};

// Lastik ihtiyacı hesaplama değişkenleri
let elasticNeedCalculation = {
    days: 0,
    elasticsPerDay: 0,
    totalNeed: 0,
    details: []
};

// Sonraki seans yapılacak işlemler için global değişkenler
let selectedSokum = null;           // Tel söküm seçimi: 'alt-ust', 'ust', 'alt'
let minividaRemovals = [];          // Minivida söküm kayıtları
let yediDahilSelection = {          // 7'leri dahil etme seçimleri
    ust: false,
    alt: false
};
let plannedProceduresText = '';     // Planlanan işlemler serbest metin

// Çoklu diş işlemleri için global değişken
let multiToothSelection = {
    selectedTeeth: [],
    procedures: [],
    sentToReport: [],  // Rapora gönderilen işlemler
    minividaRange: null,  // Seçilen minivida aralığı (örn: {x: 23, y: 24})
    powerArm: null  // Power Arm için seçilen diş
};

let elasticSelections = {
    sag: { 
        active: false, 
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null },
            yatay: { selected: false, duration: null },
            ucgen: { selected: false, duration: null },
            box: { selected: false, duration: null }
        }
    },
    sol: { 
        active: false, 
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null },
            yatay: { selected: false, duration: null },
            ucgen: { selected: false, duration: null },
            box: { selected: false, duration: null }
        }
    },
    orta: {
        active: false,
        types: {
            oblik1333: { selected: false, duration: null },
            oblik2343: { selected: false, duration: null }
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
            cross: { selected: false, duration: null },
            yatay: { selected: false, duration: null },
            ucgen: { selected: false, duration: null },
            box: { selected: false, duration: null }
        }
    },
    'sol-next': { 
        active: false,
        sameAsNow: false,
        types: {
            sinif2: { selected: false, duration: null },
            sinif3: { selected: false, duration: null },
            cross: { selected: false, duration: null },
            yatay: { selected: false, duration: null },
            ucgen: { selected: false, duration: null },
            box: { selected: false, duration: null }
        }
    },
    'orta-next': {
        active: false,
        sameAsNow: false,
        types: {
            oblik1333: { selected: false, duration: null },
            oblik2343: { selected: false, duration: null }
        }
    },
    'on-next': { active: false, sameAsNow: false, tur: null, sure: null }
};

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first
    initTheme();
    
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
    
    // Initialize elastic buttons for şeffaf plak tab
    initializeElasticButtons();
    
    // Initialize wire bend buttons
    setTimeout(initializeBendButtons, 500);
    
    // Initialize number inputs
    numberInputs = {
        'onceki-seans': '',
        'mevcut-plak': '',
        'plak-gun': '',
        'verilecek-plak': ''
    };
});

function initializeCheckboxListeners() {
    // Initialize option buttons for şeffaf plak (excluding elastic-status-btn which has onclick handler)
    const seffafButtons = document.querySelectorAll('#seffaf-plak .option-btn:not(.elastic-status-btn)');
    seffafButtons.forEach(button => {
        button.addEventListener('click', handleOptionButtonClick);
    });

    // Initialize option buttons for tel tedavisi (excluding elastic-status-btn which has onclick handler)
    const telButtons = document.querySelectorAll('#tel-tedavisi .option-btn:not(.elastic-status-btn)');
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
    
    // Initialize clear buttons
    const clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(button => {
        button.addEventListener('click', handleClearButtonClick);
    });

    // Initialize randevu buttons
    initializeRandevuButtons();
    
    // Initialize tooth charts (FDI)
    initializeToothCharts();

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
    
    // Check if the clicked button is already selected
    const isAlreadySelected = button.classList.contains('selected');
    
    // Remove selected class from all buttons in this question
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // If button was not already selected, add selected class to clicked button
    if (!isAlreadySelected) {
        button.classList.add('selected');
    }
    
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
    
    // Update telAnswers
    if (question === 'tel-asistan') {
        telAnswers['asistan'] = value;
        const display = document.getElementById('tel-asistan-display');
        if (display) display.textContent = value;
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
    // Önceki seans display (unified input)
    const oncekiDisplay = document.getElementById('onceki-seans-display');
    if (oncekiDisplay && numberInputs['onceki-seans']) {
        oncekiDisplay.textContent = numberInputs['onceki-seans'];
    } else if (oncekiDisplay) {
        oncekiDisplay.textContent = '--';
    }
    
    // Mevcut plak display (unified input)
    const mevcutDisplay = document.getElementById('mevcut-plak-display');
    if (mevcutDisplay && numberInputs['mevcut-plak']) {
        mevcutDisplay.textContent = numberInputs['mevcut-plak'];
    } else if (mevcutDisplay) {
        mevcutDisplay.textContent = '--';
    }
    
    // Verilecek plak display (unified input)
    const verilecekDisplay = document.getElementById('verilecek-plak-display');
    if (verilecekDisplay && numberInputs['verilecek-plak']) {
        verilecekDisplay.textContent = numberInputs['verilecek-plak'];
    } else if (verilecekDisplay) {
        verilecekDisplay.textContent = '--';
    }
    
    // Plak gün display (unified input)
    const plakGunDisplay = document.getElementById('plak-gun-display');
    if (plakGunDisplay && numberInputs['plak-gun']) {
        plakGunDisplay.textContent = numberInputs['plak-gun'];
    } else if (plakGunDisplay) {
        plakGunDisplay.textContent = '--';
    }
    
    // Plak durum kutusu güncelle
    updatePlakStatusBox();
}

// Plak durum kutusunu güncelle
function updatePlakStatusBox() {
    const statusMevcutPlak = document.getElementById('status-mevcut-plak');
    const statusPlakGun = document.getElementById('status-plak-gun');
    
    if (statusMevcutPlak) {
        statusMevcutPlak.textContent = numberInputs['mevcut-plak'] || '--';
    }
    
    if (statusPlakGun) {
        statusPlakGun.textContent = numberInputs['plak-gun'] || '--';
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
        
        console.log('Şeffaf Plak - Seçilen:', question, '=', value);
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
        tempAnswers['plak-gun'] = `${plakGun}`;
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
    
    // List of MOTİVASYON questions that can be deselected
    const motivasyonQuestions = ['lastik-aksama', 'lastik-saat', 'plak-aksama', 'plak-saat', 'plak-temizlik', 'agiz-hijyen', 'sakiz-sure', 'sakiz-siklik', 'sakiz-parcalanma'];
    
    // Remove deselected MOTİVASYON questions from answers
    motivasyonQuestions.forEach(question => {
        if (!tempAnswers.hasOwnProperty(question)) {
            delete answers[question];
        }
    });
    
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
    outputElement.textContent = output;
    
    // Update lastik calculation - sadece elastic report'tan çağrılmamışsa
    // (updateElasticReport zaten çağırıyor, çift çağrıyı önle)
    // updateLastikCalculationDisplay();
}

// Lastik Calculation Functions
function calculateLastikConsumption() {
    // Randevu kaç hafta sonra?
    const randevuText = answers['sonraki-randevu'];
    console.log('calculateLastikConsumption - randevuText:', randevuText);
    
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
    
    console.log('calculateLastikConsumption - weeks:', weeks, 'days:', days);
    
    // Sonraki seans lastik seçimlerini kontrol et
    let sagCount = 0;
    let solCount = 0;
    let onCount = 0;
    
    // SAĞ taraf lastikleri say
    if (nextElasticSelections['sag-next'] && nextElasticSelections['sag-next'].active) {
        if (nextElasticSelections['sag-next'].sameAsNow) {
            // Mevcut lastikleri say
            if (elasticSelections['sag'] && elasticSelections['sag'].types) {
                Object.keys(elasticSelections['sag'].types).forEach(type => {
                    if (elasticSelections['sag'].types[type] && elasticSelections['sag'].types[type].selected && elasticSelections['sag'].types[type].duration) {
                        sagCount++;
                    }
                });
            }
        } else {
            // Sonraki seans seçimlerini say
            if (nextElasticSelections['sag-next'].types) {
                Object.keys(nextElasticSelections['sag-next'].types).forEach(type => {
                    if (nextElasticSelections['sag-next'].types[type] && nextElasticSelections['sag-next'].types[type].selected && nextElasticSelections['sag-next'].types[type].duration) {
                        sagCount++;
                    }
                });
            }
        }
    }
    
    // SOL taraf lastikleri say
    if (nextElasticSelections['sol-next'] && nextElasticSelections['sol-next'].active) {
        if (nextElasticSelections['sol-next'].sameAsNow) {
            // Mevcut lastikleri say
            if (elasticSelections['sol'] && elasticSelections['sol'].types) {
                Object.keys(elasticSelections['sol'].types).forEach(type => {
                    if (elasticSelections['sol'].types[type] && elasticSelections['sol'].types[type].selected && elasticSelections['sol'].types[type].duration) {
                        solCount++;
                    }
                });
            }
        } else {
            // Sonraki seans seçimlerini say
            if (nextElasticSelections['sol-next'].types) {
                Object.keys(nextElasticSelections['sol-next'].types).forEach(type => {
                    if (nextElasticSelections['sol-next'].types[type] && nextElasticSelections['sol-next'].types[type].selected && nextElasticSelections['sol-next'].types[type].duration) {
                        solCount++;
                    }
                });
            }
        }
    }
    
    // ÖN taraf lastikleri say  
    if (nextElasticSelections['on-next'] && nextElasticSelections['on-next'].active) {
        if (nextElasticSelections['on-next'].sameAsNow) {
            // Mevcut lastikleri say
            if (elasticSelections['on'] && elasticSelections['on'].tur && elasticSelections['on'].sure) {
                onCount = 1;
            }
        } else {
            // Sonraki seans seçimlerini say
            if (nextElasticSelections['on-next'].tur && nextElasticSelections['on-next'].sure) {
                onCount = 1;
            }
        }
    }
    
    // Toplam günlük kullanım
    const dailyUsage = sagCount + solCount + onCount;
    
    console.log('calculateLastikConsumption - sagCount:', sagCount, 'solCount:', solCount, 'onCount:', onCount, 'dailyUsage:', dailyUsage);
    
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
    
    console.log('calculateLastikConsumption - SUCCESS - totalNeeded:', totalNeeded, 'details:', details);
    
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
    // Update Şeffaf Plak display
    const display = document.getElementById('lastik-calculation-result');
    // Update Tel display
    const telDisplay = document.getElementById('tel-lastik-calculation-result');
    
    // If neither display exists, return
    if (!display && !telDisplay) return;
    
    // Determine which tab is active
    const activeTab = document.querySelector('.tab-content:not([style*="display: none"])')?.id || 'seffaf-plak';
    
    let calculation;
    if (activeTab === 'tel-tedavisi') {
        // Tel bölümü için elasticNeedCalculation kullan
        const telCalc = elasticNeedCalculation || {};
        
        if (telCalc.elasticsPerDay && telCalc.elasticsPerDay > 0) {
            calculation = {
                success: true,
                weeks: telCalc.days / 7,
                totalNeeded: telCalc.totalNeed,
                dailyUsage: telCalc.elasticsPerDay,
                totalDays: telCalc.days,
                details: telCalc.details || []
            };
        } else {
            calculation = {
                error: 'Lastik hesaplaması için sonraki seans lastiklerini seçin'
            };
        }
    } else {
        // Şeffaf Plak bölümü için calculateLastikConsumption kullan
        calculation = calculateLastikConsumption();
    }
    
    if (calculation.error) {
        if (display) {
            display.textContent = calculation.error;
            display.className = '';
        }
        if (telDisplay) {
            telDisplay.textContent = calculation.error;
            telDisplay.className = '';
        }
        // Remove from answers
        delete answers['lastik-calculation'];
    } else if (calculation.success) {
        const detailText = calculation.details.join(', ');
        const text = `${calculation.weeks} hafta için ${calculation.totalNeeded} adet lastik gerekli (${detailText} × ${calculation.totalDays} gün)`;
        
        if (display) {
            display.textContent = text;
            display.className = 'has-calculation';
        }
        if (telDisplay) {
            telDisplay.textContent = text;
            telDisplay.className = 'has-calculation';
        }
        
        // Store in answers for report
        answers['lastik-calculation'] = {
            totalNeeded: calculation.totalNeeded,
            weeks: calculation.weeks,
            totalDays: calculation.totalDays,
            dailyUsage: calculation.dailyUsage,
            details: calculation.details,
            breakdown: calculation.breakdown
        };
    }
    
    // DON'T call updateSeffafOutput here - it creates infinite loop!
    // updateSeffafOutput is already calling this function
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
    
    outputElement.textContent = output;
}

function generateSeffafReport(answers) {
    // Check if there are any meaningful answers (including manual randevu and special note)
    const specialNote = document.getElementById('seffaf-special-note');
    const hasSpecialNote = specialNote && specialNote.value.trim();
    
    const hasValidAnswers = Object.keys(answers).length > 0 && 
        (Object.keys(answers).some(key => answers[key] && answers[key] !== '') || 
         selectedInterdentalSpaces.size > 0);
    
    if (!hasValidAnswers && !hasSpecialNote) {
        return '';
    }

    let report = '';
    
    // Asistan bilgisi en üstte
    if (answers['asistan']) {
        report += `Kontroller ${answers['asistan'].toUpperCase()} Hanım tarafından yapılmıştır.\n`;
    }
    
    // Dişler arası boşluk ölçümlerini ekle (ilk olarak)
    if (Object.keys(spacingMeasurements).length > 0) {
        report += '\n*** DİŞLER ARASI BOŞLUK ÖLÇÜMLERİ ***\n';
        Object.entries(spacingMeasurements).forEach(([position, value]) => {
            report += `• ${position} arası: ${value} mm\n`;
        });
        report += '\n';
    }
    
    // RUTİN KONTROLLER bölümü
    if (Object.keys(answers).some(key => ['onceki-seans', 'mevcut-plak', 'plak-gun', 'verilecek-plak', 'plak-degisim', 'sonraki-randevu', 'adaptasyon', 'atasmanlar'].includes(key)) || selectedInterdentalSpaces.size > 0) {
        report += 'RUTİN KONTROLLER:\n';
        report += '-----------------\n';
        
        if (answers['onceki-seans']) {
            report += `• Önceki seansta ${answers['onceki-seans']}\n`;
        }
        
        if (answers['mevcut-plak']) {
            report += `• Hasta şu an ${answers['mevcut-plak']}`;
            if (answers['plak-gun']) {
                report += ` (${answers['plak-gun']}. gün)`;
            }
            report += '\n';
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
        
        if (answers['ipr-count']) {
            report += `• Sonraki seansta ${answers['ipr-count']} adet IPR yapılacak\n`;
        }
        
        if (answers['randevu-duration']) {
            report += `• Bir sonraki randevu süresi: ${answers['duration-source']}\n`;
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
                    
                    // Hayvan seçimini veri yapısından al
                    const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                    
                    let text = `${typeText} lastik ${typeData.duration}`;
                    if (animalText) text += ` (${animalText})`;
                    sagParts.push(text);
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
                    
                    // Hayvan seçimini veri yapısından al
                    const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                    
                    let text = `${typeText} lastik ${typeData.duration}`;
                    if (animalText) text += ` (${animalText})`;
                    solParts.push(text);
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
                            
                            // Hayvan seçimini mevcut lastik verisinden al
                            const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                            
                            let text = `${typeText} lastik ${typeData.duration}`;
                            if (animalText) text += ` (${animalText})`;
                            text += ' (devam)';
                            report += `• ${text}\n`;
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
                        
                        // Hayvan seçimini veri yapısından al
                        const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                        
                        let text = `${typeText} lastik ${typeData.duration}`;
                        if (animalText) text += ` (${animalText})`;
                        sagNextParts.push(text);
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
                            
                            // Hayvan seçimini mevcut lastik verisinden al
                            const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                            
                            let text = `${typeText} lastik ${typeData.duration}`;
                            if (animalText) text += ` (${animalText})`;
                            text += ' (devam)';
                            report += `• ${text}\n`;
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
                        
                        // Hayvan seçimini veri yapısından al
                        const animalText = typeData.animal ? getAnimalName(typeData.animal) : '';
                        
                        let text = `${typeText} lastik ${typeData.duration}`;
                        if (animalText) text += ` (${animalText})`;
                        solNextParts.push(text);
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
    
    // MOTİVASYON bölümü
    if (Object.keys(answers).some(key => ['lastik-aksama', 'lastik-saat', 'plak-aksama', 'plak-saat', 'plak-temizlik', 'agiz-hijyen', 'sakiz-sure', 'sakiz-siklik', 'sakiz-parcalanma'].includes(key))) {
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
        
        // Sakız kullanımı değerlendirmesi
        if (answers['sakiz-sure'] || answers['sakiz-siklik'] || answers['sakiz-parcalanma']) {
            console.log('SAKIZ DEĞERLERİ:', {
                sure: answers['sakiz-sure'],
                siklik: answers['sakiz-siklik'],
                parcalanma: answers['sakiz-parcalanma']
            });
            let sakizText = '• Sakız kullanımı: ';
            const sakizParts = [];
            
            // Sıklık ve süreyi birleştirme
            if (answers['sakiz-siklik'] && answers['sakiz-sure']) {
                const siklik = answers['sakiz-siklik'];
                const sure = answers['sakiz-sure'];
                
                // Sayısal sıklık kontrolü (1 kere, 2 kere, 3 kere ana öğünlerde)
                if (siklik.includes('1 kere')) {
                    sakizParts.push(`Günde 1 kere ${sure}`);
                } else if (siklik.includes('2 kere')) {
                    sakizParts.push(`Günde 2 kere ${sure}`);
                } else if (siklik.includes('3 kere')) {
                    sakizParts.push(`Günde 3 kere ${sure}`);
                } else {
                    // "Her çıkarıp taktığımda" veya "Hiç" durumu
                    sakizParts.push(siklik);
                    if (siklik !== 'Hiç') {
                        sakizParts.push(sure);
                    }
                }
            } else {
                // Sadece biri seçilmişse ayrı ayrı ekle
                if (answers['sakiz-siklik']) {
                    sakizParts.push(answers['sakiz-siklik']);
                }
                
                if (answers['sakiz-sure']) {
                    sakizParts.push(answers['sakiz-sure']);
                }
            }
            
            // Parçalanma durumu
            if (answers['sakiz-parcalanma']) {
                sakizParts.push(answers['sakiz-parcalanma']);
            }
            
            if (sakizParts.length > 0) {
                report += sakizText + sakizParts.join(', ') + '\n';
            }
        }
        
        report += '\n';
    }
    
    // EK İHTİYAÇLAR bölümü
    if (answers['lastik-calculation'] || answers['lastik-ihtiyac'] || answers['sakiz-ihtiyac']) {
        report += 'EK İHTİYAÇLAR:\n';
        report += '-------------\n';
        
        // Lastik ihtiyacı hesaplaması
        if (answers['lastik-calculation']) {
            const calc = answers['lastik-calculation'];
            const detailsText = calc.details.join(', ');
            report += `• Lastik İhtiyacı: ${calc.weeks} hafta için ${calc.totalNeeded} adet lastik pakedi gerekli (${detailsText} × ${calc.totalDays} gün)\n`;
        }
        
        if (answers['lastik-ihtiyac']) {
            report += `• ${answers['lastik-ihtiyac']}\n`;
        }
        
        if (answers['sakiz-ihtiyac']) {
            report += `• ${answers['sakiz-ihtiyac']}\n`;
        }
        
        report += '\n';
    }
    
    // Frez islemleri bolumu
    const frezReport = generateFrezReportText();
    if (frezReport) {
        report += frezReport;
    }
    
    report += '\n' + getCurrentDate();
    
    // Özel not varsa ekle (specialNote already declared at function start)
    if (specialNote && specialNote.value.trim()) {
        report += '\n\n─────────────────────────\nÖZEL NOT:\n' + specialNote.value.trim();
    }
    
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
    
    // Özel not varsa ekle
    const specialNote = document.getElementById('seffaf-special-note');
    if (specialNote && specialNote.value.trim()) {
        report += '\n\n─────────────────────────\nÖZEL NOT:\n' + specialNote.value.trim();
    }
    
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
    const text = element.textContent;
    
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
    // Select only tooth buttons that are NOT frez teeth (they have their own onclick handlers)
    const toothButtons = document.querySelectorAll('.tooth-btn-fdi:not(.frez-tooth)');
    console.log('🦷 initializeToothCharts çağrıldı');
    console.log('🦷 Toplam .tooth-btn-fdi buton sayısı:', document.querySelectorAll('.tooth-btn-fdi').length);
    console.log('🦷 Frez buton sayısı (.frez-tooth):', document.querySelectorAll('.frez-tooth').length);
    console.log('🦷 Event listener eklenecek buton sayısı:', toothButtons.length);
    
    if (toothButtons.length === 0) {
        console.error('⚠️ UYARI: Hiç diş butonu bulunamadı!');
    }
    
    toothButtons.forEach((button, index) => {
        const tooth = button.dataset.tooth;
        const question = button.dataset.question;
        
        if (index < 5) {
            console.log(`  Buton ${index + 1}: Diş ${tooth}, Soru: ${question}`);
        }
        
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            console.log('🦷 Tooth clicked:', this.dataset.tooth, 'Question:', this.dataset.question);
            console.log('🦷 Calling toggleToothSelection...');
            try {
                toggleToothSelection(this);
                console.log('🦷 toggleToothSelection returned successfully');
            } catch (error) {
                console.error('❌ toggleToothSelection hatası:', error);
                console.error('❌ Stack:', error.stack);
            }
        });
    });
    
    console.log('✅ initializeToothCharts tamamlandı');
}

function updateToothOutput(questionType) {
    const selectedButtons = document.querySelectorAll(`.tooth-btn-fdi[data-question="${questionType}"].selected`);
    const selectedTeeth = Array.from(selectedButtons).map(btn => btn.dataset.tooth).sort((a, b) => parseInt(a) - parseInt(b));
    
    console.log('📊 updateToothOutput:', {
        questionType: questionType,
        selectedCount: selectedButtons.length,
        selectedTeeth: selectedTeeth
    });
    
    if (selectedTeeth.length > 0) {
        let outputText = '';
        if (questionType === 'adaptasyon') {
            outputText = `Plak adaptasyonu eksik olan dişler: ${selectedTeeth.join(', ')}`;
            answers['adaptasyon'] = outputText;
            console.log('  ✅ Adaptasyon cümlesi oluşturuldu:', outputText);
        } else if (questionType === 'atasmanlar') {
            outputText = `Eksik ataşman olan dişler: ${selectedTeeth.join(', ')}`;
            answers['atasmanlar'] = outputText;
            console.log('  ✅ Ataşman cümlesi oluşturuldu:', outputText);
        }
        updateSeffafOutput();
    } else {
        console.log('  ℹ️ Hiç diş seçili değil, cevap siliniyor');
        delete answers[questionType];
        updateSeffafOutput();
    }
}

function clearToothSelection(questionType) {
    console.log('🧹 clearToothSelection çağrıldı:', questionType);
    
    const buttons = document.querySelectorAll(`.tooth-btn-fdi[data-question="${questionType}"]`);
    console.log('  Temizlenecek buton sayısı:', buttons.length);
    
    buttons.forEach(button => {
        button.classList.remove('selected');
    });
    
    delete answers[questionType];
    console.log('  answers["' + questionType + '"] silindi');
    
    // updateToothOutput'u çağır ki rapor güncellensin
    updateToothOutput(questionType);
}

function clearOutput(elementId) {
    const outputElement = document.getElementById(elementId);
    if (outputElement) {
        outputElement.textContent = '';
        
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

// Reset all data and clear browser cache
function resetData() {
    // Kullanıcıya onay sorusu
    const confirmation = confirm('Tüm kaydedilmiş veriler silinecek ve sayfa yenilenecek. Emin misiniz?');
    
    if (confirmation) {
        // Önce tüm output'ları temizle
        const seffafOutput = document.getElementById('seffaf-output');
        const telOutput = document.getElementById('tel-output');
        if (seffafOutput) seffafOutput.textContent = '';
        if (telOutput) telOutput.textContent = '';
        
        // Plak durum kutusunu temizle
        const statusMevcutPlak = document.getElementById('status-mevcut-plak');
        const statusPlakGun = document.getElementById('status-plak-gun');
        if (statusMevcutPlak) statusMevcutPlak.textContent = '--';
        if (statusPlakGun) statusPlakGun.textContent = '--';
        
        // Number inputs'u sıfırla
        numberInputs = {
            'onceki-seans': '',
            'mevcut-plak': '',
            'plak-gun': '',
            'verilecek-plak': ''
        };
        
        // Tüm seçimleri temizle
        if (typeof clearAllSeffafSelections === 'function') {
            clearAllSeffafSelections();
        }
        if (typeof clearAllTelSelections === 'function') {
            clearAllTelSelections();
        }
        
        // LocalStorage'ı temizle
        localStorage.clear();
        
        // Kısa bir gecikme ile sayfayı yeniden yükle
        setTimeout(function() {
            window.location.reload(true);
        }, 100);
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
    
    // NOT: LocalStorage'ı burada temizleme - sadece resetData fonksiyonunda temizlensin
    // localStorage.removeItem('ortodontiFormData'); // KALDIRILDI
    console.log('🗑️ Şeffaf plak verileri temizlendi (localStorage korundu)');
    
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
    
    // NOT: LocalStorage'ı burada temizleme - sadece resetData fonksiyonunda temizlensin
    // localStorage.removeItem('ortodontiFormData'); // KALDIRILDI
    console.log('🗑️ Tel tedavisi verileri temizlendi (localStorage korundu)');
    
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
    delete answers['randevu-duration'];
    delete answers['duration-method'];
    delete answers['duration-source'];
}

function clearEkIhtiyaclar() {
    // Clear lastik ihtiyacı buttons
    const lastikButtons = document.querySelectorAll('[data-question="lastik-ihtiyac"].option-btn.selected');
    lastikButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear sakız ihtiyacı buttons  
    const sakizButtons = document.querySelectorAll('[data-question="sakiz-ihtiyac"].option-btn.selected');
    sakizButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Clear from answers object
    delete answers['lastik-ihtiyac'];
    delete answers['sakiz-ihtiyac'];
}

function clearMotivasyonAnswers() {
    // Clear motivasyon related answers that are set by option buttons
    const motivasyonKeys = ['lastik-aksama', 'plak-aksama', 'plak-temizlik', 'agiz-hijyen'];
    
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
document.addEventListener('DOMContentLoaded', loadSavedState);

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
// selectedInterdentalSpaces is now defined at the top of the file

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
    updateNumberDisplay(); // Update all displays
    
    // Update output
    updateSeffafOutput();
}

// Clear Button Handler
function handleClearButtonClick(event) {
    const button = event.target;
    const question = button.dataset.question;
    
    if (!question) return;
    
    // Special handling for asistan question
    if (question === 'asistan') {
        // Find all option buttons for asistan and remove selected class
        const questionGroup = button.closest('.question-group');
        const allButtons = questionGroup.querySelectorAll('.option-btn[data-question="asistan"]');
        allButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Clear from answers
        delete answers['asistan'];
        
        // Clear display
        const display = document.getElementById('asistan-display');
        if (display) {
            display.textContent = 'Henüz seçilmedi';
        }
        
        // Update output
        updateSeffafOutput();
        return;
    }
    
    // Tel sekmesindeki asistan temizlemesi
    if (question === 'tel-asistan') {
        // Find all option buttons for tel-asistan and remove selected class
        const questionGroup = button.closest('.question-group');
        const allButtons = questionGroup.querySelectorAll('.option-btn[data-question="tel-asistan"]');
        allButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Clear from answers
        delete telAnswers['asistan'];
        
        // Clear display
        const display = document.getElementById('tel-asistan-display');
        if (display) {
            display.textContent = 'Henüz seçilmedi';
        }
        
        // Update output
        updateTelOutput();
        return;
    }
    
    // Clear the input for number inputs
    numberInputs[question] = '';
    
    // Clear from answers object
    delete answers[question];
    
    // Update display
    updateUnifiedNumberDisplay(question);
    updateNumberDisplay(); // Update all displays
    
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
let elasticButtonsInitialized = false;

function initializeElasticButtons() {
    // Sadece bir kez başlat
    if (elasticButtonsInitialized) return;
    
    // Sadece ŞEFFAF PLAK sekmesindeki butonlar için event listener ekle
    // Tel sekmesindeki butonlar onclick handler kullanıyor
    const seffafTab = document.getElementById('seffaf-plak');
    if (!seffafTab) return;
    
    const mainButtons = seffafTab.querySelectorAll('.elastic-main-btn');
    mainButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.direction;
            toggleElasticDirection(direction, this);
        });
    });

    // Lastik tür seçme butonları - sadece şeffaf plak sekmesindekiler
    const typeButtons = seffafTab.querySelectorAll('.elastic-type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const elasticType = this.dataset.elasticType;
            toggleElasticType(parent, elasticType, this);
        });
    });

    // Süre seçme butonları - sadece şeffaf plak sekmesindekiler
    const durationButtons = seffafTab.querySelectorAll('.elastic-duration-btn');
    durationButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const elasticType = this.dataset.elasticType;
            const duration = this.dataset.duration;
            selectElasticDuration(parent, elasticType, duration, this);
        });
    });

    // Eski alt seçenek butonları (ön için) - sadece şeffaf plak sekmesindekiler
    const subButtons = seffafTab.querySelectorAll('.elastic-sub-btn');
    subButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.dataset.parent;
            const type = this.dataset.type;
            const value = this.dataset.value;
            selectElasticOption(parent, type, value, this);
        });
    });
    
    // "Aynı lastiklerle devam" butonları - sadece şeffaf plak sekmesindekiler
    const sameElasticButtons = seffafTab.querySelectorAll('.same-elastic-btn');
    sameElasticButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.direction;
            toggleSameElastic(direction, this);
        });
    });
    
    elasticButtonsInitialized = true;
}

function toggleElasticDirection(direction, buttonElement) {
    if (!direction) {
        console.error('toggleElasticDirection: direction is undefined');
        return;
    }
    
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
    if (!parent || !elasticType) {
        console.error('toggleElasticType: parent or elasticType is undefined', { parent, elasticType });
        return;
    }
    
    const durationContainer = document.getElementById(`${parent}-${elasticType}-duration`);
    
    // Sonraki seans için
    if (parent.includes('-next')) {
        // Ana seçimi aktif et (eğer değilse)
        if (!nextElasticSelections[parent].active) {
            nextElasticSelections[parent].active = true;
            const mainBtn = buttonElement.closest('.elastic-direction-block')?.querySelector('.elastic-main-btn');
            if (mainBtn) mainBtn.classList.add('active');
        }
        
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
        // Ana seçimi aktif et (eğer değilse)
        if (!elasticSelections[parent].active) {
            elasticSelections[parent].active = true;
            const mainBtn = buttonElement.closest('.elastic-direction-block')?.querySelector('.elastic-main-btn');
            if (mainBtn) mainBtn.classList.add('active');
        }
        
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
    updateLastikCalculationDisplay();
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
        
        // Auto-activate parent when selecting ÖN tur/sure (sonraki seans)
        if (parent === 'on-next' && !nextElasticSelections[parent].active) {
            nextElasticSelections[parent].active = true;
            const mainBtn = document.querySelector(`[data-direction="${parent}"].elastic-main-btn`);
            if (mainBtn) mainBtn.classList.add('active');
        }
    } else {
        elasticSelections[parent][type] = value;
        
        // Auto-activate parent when selecting ÖN tur/sure (mevcut seans)
        if (parent === 'on' && !elasticSelections[parent].active) {
            elasticSelections[parent].active = true;
            const mainBtn = document.querySelector(`[data-direction="${parent}"].elastic-main-btn`);
            if (mainBtn) mainBtn.classList.add('active');
        }
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
    
    // Lastik hesaplamasını güncelle (raporda göstermek için)
    updateLastikCalculationDisplay();
    
    // Şeffaf plak sekmesi rapor güncellemesi
    updateSeffafOutput();
}

function updateTelOutput() {
    const telOutput = document.getElementById('tel-output');
    if (!telOutput) return;

    let report = 'TEL TEDAVISI KONTROL RAPORU\n';
    report += '=============================================\n\n';
    
    // Asistan bilgisi
    if (telAnswers['asistan']) {
        report += 'KONTROL BILGILERI:\n';
        report += '-----------------\n';
        report += 'Kontrolu yapan asistan: ' + telAnswers['asistan'] + '\n\n';
    }
    
    // Randevu planlama
    if (telAnswers['randevu-hafta'] || telAnswers['randevu-suresi']) {
        report += 'RANDEVU PLANLAMA:\n';
        report += '-----------------\n';
        if (telAnswers['randevu-hafta']) {
            report += 'Bir sonraki randevu: ' + telAnswers['randevu-hafta'] + '\n';
        }
        if (telAnswers['randevu-suresi']) {
            report += 'Bir sonraki randevu suresi: ' + telAnswers['randevu-suresi'] + '\n';
        }
        report += '\n';
    }
    
    // Lastik durumu
    if (telAnswers['lastik-durum']) {
        report += 'LASTIK DURUMU:\n';
        report += '--------------\n';
        report += telAnswers['lastik-durum'] + '\n\n';
    }
    
    // Lastik kullanım bilgileri
    const telElasticReport = generateTelElasticReport();
    if (telElasticReport) {
        report += telElasticReport + '\n';
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
        report += 'BU SEANS TAKILAN TELLER:\n';
        report += '-------------------------\n';
        wireInfo.forEach(info => {
            report += `• ${info}\n`;
        });
        report += '\n';
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
                    bendInfo.push(`${tooth} nolu dişte "${bendText}" bükümü yapıldı`);
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
                    bendInfo.push(`${tooth} nolu dişte "${bendText}" bükümü yapıldı`);
                });
            }
        });
    }
    
    // Üst çene dişler arası bükümleri
    if (interbendData.ust && Object.keys(interbendData.ust).length > 0) {
        Object.keys(interbendData.ust).forEach(position => {
            const bendType = interbendData.ust[position];
            const bendText = getInterbendTypeText(bendType);
            interbendInfo.push(`${position} nolu dişler arasında "${bendText}" bükümü yapıldı`);
        });
    }
    
    // Alt çene dişler arası bükümleri
    if (interbendData.alt && Object.keys(interbendData.alt).length > 0) {
        Object.keys(interbendData.alt).forEach(position => {
            const bendType = interbendData.alt[position];
            const bendText = getInterbendTypeText(bendType);
            interbendInfo.push(`${position} nolu dişler arasında "${bendText}" bükümü yapıldı`);
        });
    }

    if (bendInfo.length > 0 || interbendInfo.length > 0) {
        report += 'TEL BÜKÜMLERİ:\n';
        report += '-------------\n';
        
        // Diş bükümleri
        if (bendInfo.length > 0) {
            report += 'Tek dişe yapılan bükümler:\n';
            bendInfo.forEach(info => {
                report += `• ${info}\n`;
            });
        }
        
        // Dişler arası bükümleri
        if (interbendInfo.length > 0) {
            if (bendInfo.length > 0) {
                report += '\nDişler arası bükümler:\n';
            } else {
                report += 'Dişler arası bükümler:\n';
            }
            interbendInfo.forEach(info => {
                report += `• ${info}\n`;
            });
        }
        report += '\n';
    }
    
    // Tüm ark bükümleri
    const fullArchInfo = [];
    if (fullArchBends.ust) {
        const bendText = getFullArchBendText(fullArchBends.ust);
        fullArchInfo.push(`Üst Çene: ${bendText}`);
    }
    if (fullArchBends.alt) {
        const bendText = getFullArchBendText(fullArchBends.alt);
        fullArchInfo.push(`Alt Çene: ${bendText}`);
    }
    
    if (fullArchInfo.length > 0) {
        report += 'TÜM ARK BÜKÜMLERİ:\n';
        report += '-------------------\n';
        fullArchInfo.forEach(info => {
            report += `• ${info}\n`;
        });
        report += '\n';
    }
    
    // Diş arası ve dişlere rutin dışı uygulamalar
    const gapProcedures = Object.entries(telProcedures.gaps);
    const toothProcedures = Object.entries(telProcedures.teeth);
    
    if (gapProcedures.length > 0 || toothProcedures.length > 0) {
        report += 'DİŞ ARASI VE DİŞLERE RUTİN DIŞI UYGULAMALAR:\n';
        report += '---------------------------------------------\n';
        
        // Diş arası işlemler
        gapProcedures.forEach(([gap, procedure]) => {
            if (procedure === 'minivida') {
                report += `• ${gap} diş arasına minivida yapılmıştır.\n`;
            } else if (procedure === 'open-coil') {
                report += `• ${gap} arasına open coil takıldı.\n`;
            } else if (procedure === 'distal-jig') {
                report += `• ${gap} arasına distal jig yerleştirilmiştir.\n`;
            }
        });
        
        // Diş üstü işlemler
        toothProcedures.forEach(([tooth, procedure]) => {
            if (procedure === 'braket-yapistirilmasi') {
                report += `• ${tooth} nolu dişin kırılan braketi yeniden yapıştırılmıştır.\n`;
            } else if (procedure === 'braket-kirik-yapistirlamadi') {
                report += `• ${tooth} nolu dişin braketi kırılmış ancak yapıştırılmadı.\n`;
            } else if (procedure === 'tork-springi') {
                report += `• ${tooth} nolu dişe tork springi (killroy) yerleştirilmiştir.\n`;
            } else if (procedure === 'izc-vida') {
                report += `• ${tooth} nolu dişin hizasına IZC Vidası yerleştirilmiştir.\n`;
            }
        });
        
        report += '\n';
    }
    
    // Lastik ihtiyacı bilgisini ekle
    if (elasticNeedCalculation.totalNeed > 0) {
        const appointmentWeeks = telAnswers['randevu-haftasi'] || 0;
        
        report += 'EK İHTİYAÇLAR:\n';
        report += '-------------\n';
        
        // elasticNeedCalculation objesindeki details bilgisini kullan
        if (elasticNeedCalculation.details && elasticNeedCalculation.details.length > 0) {
            const detailsText = elasticNeedCalculation.details.join(', ');
            const calculationText = `${detailsText} × ${elasticNeedCalculation.days} gün`;
            report += `• Lastik İhtiyacı: ${appointmentWeeks} hafta için ${elasticNeedCalculation.totalNeed} adet lastik pakedi gerekli (${calculationText})\n`;
        } else {
            report += `• Lastik İhtiyacı: ${appointmentWeeks} hafta için ${elasticNeedCalculation.totalNeed} adet lastik pakedi gerekli\n`;
        }
        report += '\n';
    }
    
    // Çoklu diş işlemlerini ekle
    if (multiToothSelection.sentToReport.length > 0) {
        report += 'ÇOKLU DİŞ İŞLEMLERİ:\n';
        report += '--------------------\n';
        multiToothSelection.sentToReport.forEach((procedure, index) => {
            report += `• ${index + 1}) ${procedure}\n`;
        });
        report += '\n';
    }
    
    // Sonraki seans yapılacak işlemler
    if (selectedSokum || minividaRemovals.length > 0 || plannedProceduresText || yediDahilSelection.ust || yediDahilSelection.alt) {
        report += 'SONRAKİ SEANS YAPILACAK İŞLEMLER:\n';
        report += '----------------------------------\n';
        
        // Tel söküm bilgisini ekle
        if (selectedSokum) {
            const sokumTexts = {
                'alt-ust': 'Alt-Üst',
                'ust': 'Üst',
                'alt': 'Alt'
            };
            report += `• ${sokumTexts[selectedSokum]} tel söküm yapılacak.\n`;
        }
        
        // Minivida söküm bilgilerini ekle
        if (minividaRemovals.length > 0) {
            minividaRemovals.forEach(removal => {
                report += `• ${removal.text}.\n`;
            });
        }
        
        // 7'leri dahil etme bilgilerini ekle
        if (yediDahilSelection.ust) {
            report += "• Üst 7'leri dahil edilecek.\n";
        }
        if (yediDahilSelection.alt) {
            report += "• Alt 7'leri dahil edilecek.\n";
        }
        
        // Diğer planlanan işlemleri ekle
        if (plannedProceduresText) {
            // Planlanan işlemleri satırlara böl ve her birine bullet ekle
            const plannedLines = plannedProceduresText.split('\n').filter(line => line.trim());
            plannedLines.forEach(line => {
                report += `• ${line.trim()}\n`;
            });
        }
        
        report += '\n';
    }
    
    // Motivasyon ve uyum
    if (telAnswers['lastik-aksama'] || telAnswers['lastik-saat'] || telAnswers['agiz-hijyen-skor']) {
        report += 'MOTIVASYON VE UYUM DEGERLENDIRMESI:\n';
        report += '------------------------------------\n';
        if (telAnswers['lastik-aksama']) {
            report += '• Lastik kullanimi: ' + telAnswers['lastik-aksama'] + '\n';
        }
        if (telAnswers['lastik-saat']) {
            report += '• Gunluk kullanim: ' + telAnswers['lastik-saat'] + '\n';
        }
        if (telAnswers['agiz-hijyen-skor']) {
            report += '• Agiz hijyeni skoru: ' + telAnswers['agiz-hijyen-skor'] + '\n';
        }
        report += '\n';
    }
    
    report += getCurrentDate();
    
    // Özel not varsa ekle
    const specialNote = document.getElementById('tel-special-note');
    if (specialNote && specialNote.value.trim()) {
        report += '\n\n─────────────────────────\nÖZEL NOT:\n' + specialNote.value.trim();
    }
    
    telOutput.textContent = report;
}

function generateTelElasticReport() {
    let report = '';
    
    // Mevcut lastikler
    const currentElastics = getTelElasticSelections('tel');
    if (currentElastics.length > 0) {
        report += 'MEVCUT LASTIK KULLANIMI:\n';
        report += '------------------------\n';
        currentElastics.forEach(function(item) {
            report += '• ' + item + '\n';
        });
        report += '\n';
    }
    
    // Sonraki seans lastikleri
    const nextElastics = getTelElasticSelections('tel-next');
    if (nextElastics.length > 0) {
        report += 'SONRAKI SEANSA KADAR LASTIK KULLANIMI:\n';
        report += '--------------------------------------\n';
        nextElastics.forEach(function(item) {
            report += '• ' + item + '\n';
        });
        report += '\n';
    }
    
    return report;
}

function getTelElasticSelections(prefix) {
    const selections = [];
    const telTab = document.getElementById('tel-tedavisi');
    if (!telTab) return selections;
    
    // Sag lastikler
    const sagSection = telTab.querySelector('#' + prefix + '-sag-section');
    if (sagSection && sagSection.style.display !== 'none') {
        // "Aynı lastiklere devam" kontrolü (sadece next için)
        if (prefix === 'tel-next') {
            const continueBtn = sagSection.querySelector('.continue-elastic-btn');
            if (continueBtn && continueBtn.classList.contains('active')) {
                // Mevcut lastikleri direkt tel-sag-section'dan al
                const currentSagSection = telTab.querySelector('#tel-sag-section');
                if (currentSagSection && currentSagSection.style.display !== 'none') {
                    const sagElastics = getTelDirectionElastics(currentSagSection, 'Sag');
                    if (sagElastics.length > 0) {
                        sagElastics.forEach(item => {
                            selections.push(item + ' (devam)');
                        });
                    }
                }
            } else {
                const sagElastics = getTelDirectionElastics(sagSection, 'Sag');
                selections.push(...sagElastics);
            }
        } else {
            const sagElastics = getTelDirectionElastics(sagSection, 'Sag');
            selections.push(...sagElastics);
        }
    }
    
    // Sol lastikler
    const solSection = telTab.querySelector('#' + prefix + '-sol-section');
    if (solSection && solSection.style.display !== 'none') {
        // "Aynı lastiklere devam" kontrolü (sadece next için)
        if (prefix === 'tel-next') {
            const continueBtn = solSection.querySelector('.continue-elastic-btn');
            if (continueBtn && continueBtn.classList.contains('active')) {
                // Mevcut lastikleri direkt tel-sol-section'dan al
                const currentSolSection = telTab.querySelector('#tel-sol-section');
                if (currentSolSection && currentSolSection.style.display !== 'none') {
                    const solElastics = getTelDirectionElastics(currentSolSection, 'Sol');
                    if (solElastics.length > 0) {
                        solElastics.forEach(item => {
                            selections.push(item + ' (devam)');
                        });
                    }
                }
            } else {
                const solElastics = getTelDirectionElastics(solSection, 'Sol');
                selections.push(...solElastics);
            }
        } else {
            const solElastics = getTelDirectionElastics(solSection, 'Sol');
            selections.push(...solElastics);
        }
    }
    
    // Orta lastikler
    const ortaSection = telTab.querySelector('#' + prefix + '-orta-section');
    if (ortaSection && ortaSection.style.display !== 'none') {
        // "Aynı lastiklere devam" kontrolü (sadece next için)
        if (prefix === 'tel-next') {
            const continueBtn = ortaSection.querySelector('.continue-elastic-btn');
            if (continueBtn && continueBtn.classList.contains('active')) {
                // Mevcut lastikleri direkt tel-orta-section'dan al
                const currentOrtaSection = telTab.querySelector('#tel-orta-section');
                if (currentOrtaSection && currentOrtaSection.style.display !== 'none') {
                    const ortaElastics = getTelDirectionElastics(currentOrtaSection, 'Orta');
                    if (ortaElastics.length > 0) {
                        ortaElastics.forEach(item => {
                            selections.push(item + ' (devam)');
                        });
                    }
                }
            } else {
                const ortaElastics = getTelDirectionElastics(ortaSection, 'Orta');
                selections.push(...ortaElastics);
            }
        } else {
            const ortaElastics = getTelDirectionElastics(ortaSection, 'Orta');
            selections.push(...ortaElastics);
        }
    }
    
    return selections;
}

function getTelDirectionElastics(section, direction) {
    const elastics = [];
    
    // Yön isimlerini Türkçe'ye çevir
    const directionNames = {
        'sag': 'Sağ',
        'sol': 'Sol',
        'orta': 'Ön'
    };
    const directionText = directionNames[direction] || direction;
    
    // Aktif tip butonlarını bul
    const typeButtons = section.querySelectorAll('.elastic-type-btn.active');
    typeButtons.forEach(function(typeBtn) {
        const typeName = typeBtn.textContent.trim();
        
        // onclick attribute'undan elasticType'ı çıkar
        const onclickAttr = typeBtn.getAttribute('onclick');
        const elasticTypeMatch = onclickAttr.match(/'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
        if (!elasticTypeMatch) return;
        
        const tabType = elasticTypeMatch[1]; // 'tel' veya 'tel-next'
        const dir = elasticTypeMatch[2]; // 'sag', 'sol', 'orta'
        const elasticType = elasticTypeMatch[3]; // 'sinif2', 'sinif3', 'cross', etc.
        
        // Hayvan seçimini veri yapısından al
        let animalText = '';
        if (tabType === 'tel-next') {
            const directionKey = dir + '-next';
            if (nextElasticSelections[directionKey] && 
                nextElasticSelections[directionKey].types && 
                nextElasticSelections[directionKey].types[elasticType] &&
                nextElasticSelections[directionKey].types[elasticType].animal) {
                animalText = getAnimalName(nextElasticSelections[directionKey].types[elasticType].animal);
            }
        } else if (tabType === 'tel') {
            if (elasticSelections[dir] && 
                elasticSelections[dir].types && 
                elasticSelections[dir].types[elasticType] &&
                elasticSelections[dir].types[elasticType].animal) {
                animalText = getAnimalName(elasticSelections[dir].types[elasticType].animal);
            }
        }
        
        // Saat seçimi
        const animalKey = tabType + '-' + dir + '-' + elasticType;
        const hoursContainer = section.querySelector('#' + animalKey + '-hours');
        let hoursText = '';
        if (hoursContainer && hoursContainer.style.display !== 'none') {
            const selectedHour = hoursContainer.querySelector('.elastic-hour-btn.selected');
            if (selectedHour) {
                hoursText = selectedHour.textContent.trim();
            }
        }
        
        let text = directionText + ' ' + typeName;
        if (animalText) text += ' (' + animalText + ')';
        if (hoursText) text += ' - ' + hoursText;
        
        elastics.push(text);
    });
    
    return elastics;
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
        return { 
            doctorDuration: 0, 
            assistantDuration: 0,
            totalDuration: 0,
            text: 'IPR sayısı girilmedi',
            count: 0
        };
    }
    
    // Formül: (IPR sayısı × 3) + 10 dk (RD)
    const rawDoctorDuration = (iprCount * 3) + 10;
    
    // 5'in katlarına yuvarla
    const doctorDuration = Math.round(rawDoctorDuration / 5) * 5;
    
    // Asistan süresi sabit 20 dk (AR)
    const assistantDuration = 20;
    
    // Toplam süre
    const totalDuration = doctorDuration + assistantDuration;
    
    return {
        doctorDuration: doctorDuration,
        assistantDuration: assistantDuration,
        totalDuration: totalDuration,
        duration: totalDuration, // Geriye uyumluluk için
        text: `${doctorDuration}dk RD + ${assistantDuration}dk AR = ${totalDuration}dk toplam`,
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
            resultDisplay.textContent = `Otomatik: ${iprResult.assistantDuration}dk AR, ${iprResult.doctorDuration}dk RD`;
            answers['randevu-duration'] = iprResult.totalDuration;
            answers['duration-method'] = 'auto';
            answers['duration-source'] = `${iprResult.assistantDuration}dk AR, ${iprResult.doctorDuration}dk RD`;
        } else {
            resultDisplay.textContent = 'Önce IPR sayısı girin';
            delete answers['randevu-duration'];
            delete answers['duration-method'];
            delete answers['duration-source'];
        }
    } else if (method === 'standard') {
        // Use standard duration (20 AR + 10 RD = 30 minutes)
        resultDisplay.textContent = 'Standart: 20dk AR, 10dk RD';
        answers['randevu-duration'] = 30;
        answers['duration-method'] = 'standard';
        answers['duration-source'] = '20dk AR, 10dk RD';
    } else if (method === 'manual') {
        // Use manual input - calculate total from assistant and doctor durations
        const assistantDuration = parseInt(document.getElementById('manual-assistant-duration').value) || 0;
        const doctor1Duration = parseInt(document.getElementById('manual-doctor1-duration').value) || 0;
        const doctor2Duration = parseInt(document.getElementById('manual-doctor2-duration').value) || 0;
        const totalDuration = assistantDuration + doctor1Duration + doctor2Duration;
        
        if (totalDuration > 0) {
            let durationText = '';
            if (assistantDuration > 0) durationText += `${assistantDuration}dk AR`;
            if (doctor1Duration > 0) {
                if (durationText) durationText += ', ';
                durationText += `${doctor1Duration}dk rd`;
            }
            if (doctor2Duration > 0) {
                if (durationText) durationText += ', ';
                durationText += `${doctor2Duration}dk rutin`;
            }
            resultDisplay.textContent = `Manuel: ${durationText}`;
            answers['randevu-duration'] = totalDuration;
            answers['duration-method'] = 'manual';
            answers['duration-source'] = durationText;
        } else {
            resultDisplay.textContent = 'Asistan ve/veya Doktor süresi girin';
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
    const assistantInput = document.getElementById('manual-assistant-duration');
    const doctor1Input = document.getElementById('manual-doctor1-duration');
    const doctor2Input = document.getElementById('manual-doctor2-duration');
    
    methodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Clear all selections
            methodButtons.forEach(b => b.classList.remove('selected'));
            
            // Select clicked button
            this.classList.add('selected');
            
            const method = this.dataset.method;
            
            if (method === 'manual') {
                // Show manual input
                if (manualContainer) manualContainer.style.display = 'block';
                setTimeout(() => {
                    if (assistantInput) assistantInput.focus();
                }, 100);
            } else {
                // Hide manual input
                if (manualContainer) manualContainer.style.display = 'none';
                if (assistantInput) assistantInput.value = '';
                if (doctor1Input) doctor1Input.value = '';
                if (doctor2Input) doctor2Input.value = '';
            }
            
            // Update result display
            updateDurationResult();
        });
    });
    
    // Manual duration inputs - update on change
    if (assistantInput) {
        assistantInput.addEventListener('input', function() {
            updateDurationResult();
        });
        
        assistantInput.addEventListener('change', function() {
            updateDurationResult();
        });
        
        // Prevent negative values
        assistantInput.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    }
    
    if (doctor1Input) {
        doctor1Input.addEventListener('input', function() {
            updateDurationResult();
        });
        
        doctor1Input.addEventListener('change', function() {
            updateDurationResult();
        });
        
        // Prevent negative values
        doctor1Input.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    }
    
    if (doctor2Input) {
        doctor2Input.addEventListener('input', function() {
            updateDurationResult();
        });
        
        doctor2Input.addEventListener('change', function() {
            updateDurationResult();
        });
        
        // Prevent negative values
        doctor2Input.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    }
}

// FREZ ISLEMLERI FUNCTIONS

const frezIslemleri = {
    selectedTeeth: new Set(),
    operations: {}
};

function toggleFrezToothSelection(tooth) {
    const toothNum = parseInt(tooth);
    const btn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
    
    if (frezIslemleri.selectedTeeth.has(toothNum)) {
        frezIslemleri.selectedTeeth.delete(toothNum);
        if (btn) btn.classList.remove('frez-selected');
    } else {
        frezIslemleri.selectedTeeth.add(toothNum);
        if (btn) btn.classList.add('frez-selected');
    }
    
    // Enable/disable "İşlem Seç" button
    const openPopupBtn = document.getElementById('open-frez-popup-btn');
    if (openPopupBtn) {
        openPopupBtn.disabled = frezIslemleri.selectedTeeth.size === 0;
    }
}

function openFrezPopupForSelected() {
    if (frezIslemleri.selectedTeeth.size === 0) return;
    
    document.getElementById('frez-popup').style.display = 'block';
    document.getElementById('frez-popup-overlay').style.display = 'block';
    
    // Update popup title with selected teeth count
    const title = document.getElementById('frez-popup-title');
    if (frezIslemleri.selectedTeeth.size === 1) {
        const tooth = Array.from(frezIslemleri.selectedTeeth)[0];
        title.textContent = 'Diş ' + tooth + ' için frez işlemi seçin';
    } else {
        const teethList = Array.from(frezIslemleri.selectedTeeth).sort((a, b) => a - b).join(', ');
        title.textContent = frezIslemleri.selectedTeeth.size + ' diş (' + teethList + ') için frez işlemi seçin';
    }
    
    setupFrezPopupButtons();
}

function setupFrezPopupButtons() {
    const buttons = document.querySelectorAll('.frez-option-btn');
    
    // Clear all selections first
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // If only one tooth selected, show its current operations
    if (frezIslemleri.selectedTeeth.size === 1) {
        const tooth = Array.from(frezIslemleri.selectedTeeth)[0];
        const operations = frezIslemleri.operations[tooth] || [];
        operations.forEach(action => {
            const actionBtn = document.querySelector('.frez-option-btn[data-action="' + action + '"]');
            if (actionBtn) actionBtn.classList.add('selected');
        });
    }
}

function handleFrezActionClick(action) {
    // Apply this action to all selected teeth
    frezIslemleri.selectedTeeth.forEach(tooth => {
        if (frezIslemleri.operations[tooth] && frezIslemleri.operations[tooth].includes(action)) {
            // Remove this action
            frezIslemleri.operations[tooth] = frezIslemleri.operations[tooth].filter(a => a !== action);
            if (frezIslemleri.operations[tooth].length === 0) {
                delete frezIslemleri.operations[tooth];
                const toothBtn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
                if (toothBtn) toothBtn.classList.remove('has-frez-operation');
            }
        } else {
            // Add this action
            if (!frezIslemleri.operations[tooth]) {
                frezIslemleri.operations[tooth] = [];
            }
            frezIslemleri.operations[tooth].push(action);
            const toothBtn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
            if (toothBtn) toothBtn.classList.add('has-frez-operation');
        }
    });
    
    updateFrezSummary();
    updateSeffafOutput();
    closeFrezPopup();
}

function applyFrezSelections() {
    const selectedButtons = document.querySelectorAll('.frez-option-btn.selected');
    const actions = Array.from(selectedButtons).map(btn => btn.dataset.action);
    
    frezIslemleri.selectedTeeth.forEach(tooth => {
        if (actions.length > 0) {
            frezIslemleri.operations[tooth] = actions;
            const toothBtn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
            if (toothBtn) toothBtn.classList.add('has-frez-operation');
        } else {
            delete frezIslemleri.operations[tooth];
            const toothBtn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
            if (toothBtn) toothBtn.classList.remove('has-frez-operation');
        }
    });
    
    updateFrezSummary();
    updateSeffafOutput();
    closeFrezPopup();
}

function closeFrezPopup() {
    const popup = document.getElementById('frez-popup');
    const overlay = document.getElementById('frez-popup-overlay');
    
    if (popup) popup.style.setProperty('display', 'none', 'important');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    
    // Clear tooth selection
    frezIslemleri.selectedTeeth.forEach(tooth => {
        const btn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
        if (btn) btn.classList.remove('frez-selected');
    });
    frezIslemleri.selectedTeeth.clear();
    
    // Disable "İşlem Seç" button
    const openPopupBtn = document.getElementById('open-frez-popup-btn');
    if (openPopupBtn) {
        openPopupBtn.disabled = true;
    }
}

function updateFrezSummary() {
    const summaryList = document.getElementById('frez-summary-list');
    if (Object.keys(frezIslemleri.operations).length === 0) {
        summaryList.innerHTML = '<li class="no-selection">Henüz işlem seçilmedi</li>';
        return;
    }
    let html = '';
    Object.entries(frezIslemleri.operations).forEach(([tooth, actions]) => {
        const teethText = tooth;
        const actionTexts = actions.map(a => getFrezActionText(a));
        const actionText = actionTexts.join(', ');
        html += '<li><strong>' + teethText + ':</strong> ' + actionText + ' <button class="remove-frez-btn" onclick="removeFrezOperation(' + tooth + ')">×</button></li>';
    });
    html += '';
    summaryList.innerHTML = html;
}

function removeFrezOperation(tooth) {
    delete frezIslemleri.operations[tooth];
    const toothBtn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
    if (toothBtn) {
        toothBtn.classList.remove('has-frez-operation');
        toothBtn.classList.remove('frez-selected'); // Kırmızı seçimi de kaldır
    }
    updateFrezSummary();
    updateSeffafOutput();
}

function getFrezActionText(action) {
    const texts = {
        'plakta-kes': 'Plakta kes',
        'hassas-kesi-ac': 'Hassas kesi aç',
        'hassas-kesi-derinlestir': 'Hassas kesiyi derinleştir',
        'ikili-lastik-kesisi': 'İkili lastik kesisi aç',
        'buton-kesisi-ac': 'Buton kesisi aç',
        'buton-kesisi-derinlestir': 'Buton kesisini derinleştir',
        'pontik-servikal-duzle': 'Pontiklerin servikalini düzle',
        'pontik-okluzal-trasla': 'Pontikleri okluzalden traşla',
        'okluzal-yukselticiler-kes': 'Okluzal yükselticileri plakta kes'
    };
    return texts[action] || action;
}

function clearFrezSelections() {
    frezIslemleri.operations = {};
    frezIslemleri.selectedTeeth.clear();
    document.querySelectorAll('#frez-islem-chart .frez-tooth').forEach(btn => {
        btn.classList.remove('has-frez-operation');
        btn.classList.remove('frez-selected'); // Kırmızı seçimleri de kaldır
    });
    updateFrezSummary();
    updateSeffafOutput();
}

function generateFrezReportText() {
    if (Object.keys(frezIslemleri.operations).length === 0) return '';
    let reportText = '\n--- HER PLAKTA FREZLE YAPILACAK İŞLEMLER ---\n';
    const actionGroups = {};
    Object.entries(frezIslemleri.operations).forEach(function(entry) {
        const tooth = entry[0];
        const actions = entry[1];
        actions.forEach(function(action) {
            if (!actionGroups[action]) actionGroups[action] = [];
            actionGroups[action].push(tooth);
        });
    });
    Object.entries(actionGroups).forEach(function(entry) {
        const action = entry[0];
        const teeth = entry[1];
        const teethText = teeth.sort(function(a, b) { return parseInt(a) - parseInt(b); }).join(', ');
        const actionReportText = getFrezActionReportText(action, teethText);
        reportText += '- ' + actionReportText + '\n';
    });
    return reportText;
}

function getFrezActionReportText(action, teethText) {
    const isSingle = teethText.split(',').length === 1;
    const disText = isSingle ? 'dişi' : 'dişleri';
    const disteText = isSingle ? 'dişte' : 'dişlerde';
    const diseText = isSingle ? 'dişe' : 'dişlere';
    const pontikleriText = isSingle ? 'pontiği' : 'pontikleri';
    const texts = {
        'plakta-kes': teethText + ' ' + disText + ' plakta kes',
        'hassas-kesi-ac': teethText + ' ' + diseText + ' hassas kesi aç',
        'hassas-kesi-derinlestir': teethText + ' ' + disteText + ' hassas kesiyi derinleştir',
        'ikili-lastik-kesisi': teethText + ' ' + diseText + ' ikili lastik kesisi aç',
        'buton-kesisi-ac': teethText + ' ' + diseText + ' buton kesisi aç',
        'buton-kesisi-derinlestir': teethText + ' ' + disteText + ' buton kesisini derinleştir',
        'pontik-servikal-duzle': teethText + ' ' + disteText + ' pontiklerin servikalini düzle',
        'pontik-okluzal-trasla': teethText + ' ' + pontikleriText + ' okluzalden traşla',
        'okluzal-yukselticiler-kes': teethText + ' okluzal yükselticileri plakta kes'
    };
    return texts[action] || action;
}


// Tel Tedavisi Randevu Suresi Fonksiyonlari
function selectDuration(tabType, durationType) {
    const durationButtons = document.querySelectorAll('#' + tabType + '-tedavisi .duration-btn');
    durationButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector('#' + tabType + '-tedavisi .duration-btn[data-duration="' + durationType + '"]');
    if (selectedBtn) selectedBtn.classList.add('selected');
    const durationTexts = {
        'standart': '20 dakika',
        'islem': '25 dakika',
        'uzun': '30 dakika',
        'kisa-15': '15 dakika',
        'cok-kisa': '10 dakika',
        'sokum': '40-50 dakika'
    };
    if (tabType === 'tel') {
        telAnswers['randevu-suresi'] = durationTexts[durationType] || durationType;
        updateTelOutput();
    }
}

function showDurationManualInput(tabType) {
    const manualContainer = document.getElementById(tabType + '-duration-manual-input');
    if (manualContainer) {
        manualContainer.style.display = 'block';
    }
}

function confirmManualDuration(tabType) {
    const doctor1 = document.getElementById(tabType + '-manual-doctor').value;
    const doctor2 = document.getElementById(tabType + '-manual-doctor2').value;
    const assistant = document.getElementById(tabType + '-manual-assistant').value;
    let durationText = '';
    if (doctor1) durationText += doctor1 + 'dk rd';
    if (doctor2) durationText += (durationText ? ', ' : '') + doctor2 + 'dk rutin';
    if (assistant) durationText += (durationText ? ', ' : '') + assistant + 'dk ar';
    if (tabType === 'tel' && durationText) {
        telAnswers['randevu-suresi'] = durationText;
        updateTelOutput();
    }
    const manualContainer = document.getElementById(tabType + '-duration-manual-input');
    if (manualContainer) manualContainer.style.display = 'none';
}

function cancelManualDuration(tabType) {
    const manualContainer = document.getElementById(tabType + '-duration-manual-input');
    if (manualContainer) {
        manualContainer.style.display = 'none';
        document.getElementById(tabType + '-manual-doctor').value = '';
        document.getElementById(tabType + '-manual-doctor2').value = '';
        document.getElementById(tabType + '-manual-assistant').value = '';
    }
}

function handleDurationInputKeydown(event, tabType) {
    if (event.key === 'Enter') {
        confirmManualDuration(tabType);
    } else if (event.key === 'Escape') {
        cancelManualDuration(tabType);
    }
}

function updateManualDurationRealTime(tabType) {
    // Bu fonksiyon gerçek zamanlı güncelleme için kullanılabilir
}

// Tel Tedavisi Hafta Secimi
function selectWeeks(tabType, weeks) {
    const timeButtons = document.querySelectorAll('#' + tabType + '-tedavisi .time-btn');
    timeButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector('#' + tabType + '-tedavisi .time-btn[data-weeks="' + weeks + '"]');
    if (selectedBtn) selectedBtn.classList.add('selected');
    if (tabType === 'tel') {
        telAnswers['randevu-hafta'] = weeks + ' hafta sonra';
        telAnswers['randevu-haftasi'] = weeks; // Store numeric value for elastic calculation
        updateElasticCalculation(); // This will call updateTelOutput() internally
    }
    const manualInput = document.getElementById(tabType + '-manual-input');
    if (manualInput) manualInput.style.display = 'none';
}

function showManualInput(tabType) {
    const manualInput = document.getElementById(tabType + '-manual-input');
    if (manualInput) {
        manualInput.style.display = 'block';
        const input = document.getElementById(tabType + '-manual-weeks');
        if (input) input.focus();
    }
}

function handleManualInputKeydown(event, tabType) {
    if (event.key === 'Enter') {
        confirmManualWeeks(tabType);
    } else if (event.key === 'Escape') {
        cancelManualInput(tabType);
    }
}

function confirmManualWeeks(tabType) {
    const input = document.getElementById(tabType + '-manual-weeks');
    const weeks = parseInt(input.value);
    if (weeks && weeks > 0) {
        if (tabType === 'tel') {
            telAnswers['randevu-hafta'] = weeks + ' hafta sonra';
            telAnswers['randevu-haftasi'] = weeks; // Store numeric value for elastic calculation
            updateElasticCalculation(); // This will call updateTelOutput() internally
        }
        const manualInput = document.getElementById(tabType + '-manual-input');
        if (manualInput) manualInput.style.display = 'none';
    }
}

function cancelManualInput(tabType) {
    const manualInput = document.getElementById(tabType + '-manual-input');
    if (manualInput) {
        manualInput.style.display = 'none';
        const input = document.getElementById(tabType + '-manual-weeks');
        if (input) input.value = '';
    }
}

function updateManualWeeksRealTime(tabType) {
    // Gerçek zamanli güncelleme
}

// Tel Tedavisi Asistan Secimi
function toggleManualAsistanInput(tab = 'seffaf') {
    const prefix = tab === 'tel' ? 'tel-' : '';
    const manualGroup = document.getElementById(`${prefix}manual-asistan-group`);
    const toggleBtn = tab === 'tel' ? 
        document.querySelector('#tel-tedavisi .toggle-manual-btn') :
        document.querySelector('#seffaf-plak .toggle-manual-btn');
    
    if (!manualGroup) {
        console.error('Manuel asistan group bulunamadı:', `${prefix}manual-asistan-group`);
        return;
    }
    
    if (manualGroup.style.display === 'none' || !manualGroup.style.display) {
        // Manuel giriş alanını aç
        manualGroup.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.textContent = 'Manuel Girişi Kapat';
        }
        
        // Input'a odaklan
        const input = document.getElementById(`${prefix}asistan-manual-input`);
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    } else {
        // Manuel giriş alanını kapat
        manualGroup.style.display = 'none';
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.textContent = 'Manuel Giriş';
        }
        
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
    
    if (!input) {
        console.error('Input bulunamadı:', `${prefix}asistan-manual-input`);
        return;
    }
    
    const value = input.value.trim();
    
    if (!value) {
        alert('Lütfen bir asistan adı girin!');
        return;
    }
    
    // Tüm option butonlarının seçimini kaldır
    const tabContainer = tab === 'tel' ? document.getElementById('tel-tedavisi') : document.getElementById('seffaf-plak');
    const optionButtons = tabContainer.querySelectorAll(`[data-question="asistan"].option-btn`);
    optionButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Manuel girilen değeri kaydet
    if (tab === 'tel') {
        telAnswers['asistan'] = value;
    } else {
        answers['asistan'] = value;
    }
    
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

// Tel Tedavisi Lastik Secimleri
function selectElasticType(tabType, direction, elasticType) {
    const section = document.getElementById(tabType + '-' + direction + '-section');
    if (!section) return;
    
    const typeBtn = section.querySelector('.elastic-type-btn[onclick*="' + elasticType + '"]');
    if (!typeBtn) return;
    
    // Toggle active state
    const isActive = typeBtn.classList.contains('active');
    
    if (isActive) {
        // Deactivate
        typeBtn.classList.remove('active');
        // Hide hours container
        const hoursContainer = document.getElementById(tabType + '-' + direction + '-' + elasticType + '-hours');
        if (hoursContainer) hoursContainer.style.display = 'none';
        
        // Storage'dan sil
        if (tabType === 'tel-next' && nextElasticSelections[direction + '-next'] && nextElasticSelections[direction + '-next'].types) {
            nextElasticSelections[direction + '-next'].types[elasticType] = {
                selected: false,
                duration: null
            };
        } else if (tabType === 'tel' && elasticSelections[direction] && elasticSelections[direction].types) {
            elasticSelections[direction].types[elasticType] = {
                selected: false,
                duration: null
            };
        }
    } else {
        // Activate
        typeBtn.classList.add('active');
        // Show hours container
        const hoursContainer = document.getElementById(tabType + '-' + direction + '-' + elasticType + '-hours');
        if (hoursContainer) hoursContainer.style.display = 'block';
        
        // Storage'a ekle
        if (tabType === 'tel-next') {
            if (!nextElasticSelections[direction + '-next']) {
                nextElasticSelections[direction + '-next'] = {
                    active: true,
                    types: {}
                };
            }
            if (!nextElasticSelections[direction + '-next'].types) {
                nextElasticSelections[direction + '-next'].types = {};
            }
            nextElasticSelections[direction + '-next'].types[elasticType] = {
                selected: true,
                duration: null
            };
        } else if (tabType === 'tel') {
            if (!elasticSelections[direction]) {
                elasticSelections[direction] = {
                    active: true,
                    types: {}
                };
            }
            if (!elasticSelections[direction].types) {
                elasticSelections[direction].types = {};
            }
            elasticSelections[direction].types[elasticType] = {
                selected: true,
                duration: null
            };
        }
    }
    
    // Lastik hesaplamasını güncelle (sadece tel-next için)
    if (tabType === 'tel-next') {
        updateElasticCalculation();
    } else {
        updateTelOutput();
    }
}

function toggleElasticSection(tabType, direction) {
    const section = document.getElementById(tabType + '-' + direction + '-section');
    const btn = document.querySelector('.elastic-main-btn[onclick*="' + direction + '"]');
    if (section && btn) {
        if (section.style.display === 'none') {
            section.style.display = 'block';
            btn.classList.add('active');
        } else {
            section.style.display = 'none';
            btn.classList.remove('active');
        }
    }
}

function toggleWireSection(jaw) {
    // Tel değişikliği bölümlerini aç/kapa (alt/ust çene)
    const section = document.getElementById(jaw + '-wire-section');
    const btn = document.querySelector('.wire-main-btn[onclick*="' + jaw + '"]');
    if (section && btn) {
        if (section.style.display === 'none') {
            section.style.display = 'block';
            btn.classList.add('active');
        } else {
            section.style.display = 'none';
            btn.classList.remove('active');
        }
    }
}

function toggleWireType(jaw, wireType) {
    // Tel tipi seçeneklerini aç/kapa (SS, RC, SS Bükümlü vb.)
    const sizeContainer = document.getElementById(jaw + '-' + wireType + '-sizes');
    const header = document.querySelector('.wire-type-header[onclick*="' + wireType + '"]');
    
    if (sizeContainer) {
        if (sizeContainer.style.display === 'none') {
            sizeContainer.style.display = 'block';
            if (header) header.classList.add('active');
        } else {
            sizeContainer.style.display = 'none';
            if (header) header.classList.remove('active');
        }
    }
}

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

// Wire bend (büküm) yönetimi için fonksiyonlar
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
    
    if (!popup || !overlay || !title) return;
    
    // Başlığı güncelle
    title.textContent = `${tooth} Nolu Diş Bükümü Seçin`;
    
    // Mevcut seçimleri göster
    updatePopupSelections();
    
    // Popup'ı göster
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function closeBendPopup() {
    const popup = document.getElementById('bend-type-popup');
    const overlay = document.getElementById('popup-overlay');
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    
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

// Dişler arası büküm popup'ı
function openInterbendPopup(jaw, position) {
    currentInterbendPosition = position;
    currentPopupJaw = jaw;
    
    const popup = document.getElementById('interbend-type-popup');
    const overlay = document.getElementById('popup-overlay');
    const title = document.getElementById('interbend-popup-title');
    
    if (!popup || !overlay || !title) return;
    
    // Başlığı güncelle
    title.textContent = `${position} Dişler Arası Büküm Seçin`;
    
    // Mevcut seçimi göster
    updateInterbendPopupSelection();
    
    // Popup'ı göster
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function closeInterbendPopup() {
    const popup = document.getElementById('interbend-type-popup');
    const overlay = document.getElementById('popup-overlay');
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    
    currentInterbendPosition = null;
}

function updateInterbendPopupSelection() {
    if (!currentInterbendPosition || !currentPopupJaw) return;
    
    const bendButtons = document.querySelectorAll('[data-interbend]');
    const currentBend = interbendData[currentPopupJaw][currentInterbendPosition];
    
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
    if (!currentInterbendPosition || !currentPopupJaw) return;
    
    const currentBend = interbendData[currentPopupJaw][currentInterbendPosition];
    
    if (currentBend === bendType) {
        // Aynı büküm seçildi - kaldır
        delete interbendData[currentPopupJaw][currentInterbendPosition];
        
        // Buton görselini güncelle
        const bendButton = document.querySelector(`#${currentPopupJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
        if (bendButton) {
            bendButton.classList.remove('selected');
        }
    } else {
        // Yeni büküm seç
        interbendData[currentPopupJaw][currentInterbendPosition] = bendType;
        
        // Buton görselini güncelle
        const bendButton = document.querySelector(`#${currentPopupJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
        if (bendButton) {
            bendButton.classList.add('selected');
        }
    }
    
    // Raporu güncelle
    updateTelOutput();
    
    console.log(`Dişler arası büküm: ${currentPopupJaw} çene - ${currentInterbendPosition} - ${bendType}`);
    
    // Popup'ı otomatik kapat
    closeInterbendPopup();
}

function clearInterbendSelection() {
    if (!currentInterbendPosition || !currentPopupJaw) return;
    
    // Veriyi temizle
    delete interbendData[currentPopupJaw][currentInterbendPosition];
    
    // Buton görselini güncelle
    const bendButton = document.querySelector(`#${currentPopupJaw}-ss-bukumlu-bends .bend-btn[data-position="${currentInterbendPosition}"]`);
    if (bendButton) {
        bendButton.classList.remove('selected');
    }
    
    // Popup seçimini güncelle
    updateInterbendPopupSelection();
    
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
        'meziyal-rotasyon': 'Meziyal rotasyon',
        'inset': 'İnset',
        'ofset': 'Ofset',
        'intrüzyon': 'İntrüzyon',
        'ekstrüzyon': 'Ekstrüzyon',
        'key-hole-loop': 'Key hole loop',
        'intruzyon': 'İntrüzyon',
        'ekstruzyon': 'Ekstrüzyon',
        'tork': 'Tork',
        'crimp-hook': 'Crimp hook'
    };
    
    return bendTexts[bendType] || bendType;
}

// Dişler arası büküm tipi metin dönüştürme
function getInterbendTypeText(bendType) {
    return getBendTypeText(bendType);
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

// Çene metin dönüştürme
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

// FDI büküm butonlarına event listener ekle
function initializeBendButtons() {
    // Alt çene butonları
    const altBendSection = document.getElementById('alt-ss-bukumlu-bends');
    if (altBendSection) {
        // Diş butonları - data-jaw attribute'unu kullan
        altBendSection.querySelectorAll('.tooth-btn[data-jaw]').forEach(btn => {
            const tooth = btn.dataset.tooth;
            const jaw = btn.dataset.jaw;
            btn.onclick = () => selectWireBend(jaw, 'tooth', tooth);
        });
        
        // Büküm butonları - data-jaw attribute'unu kullan
        altBendSection.querySelectorAll('.bend-btn[data-jaw]').forEach(btn => {
            const position = btn.dataset.position;
            const jaw = btn.dataset.jaw;
            btn.onclick = () => selectWireBend(jaw, 'bend', position);
        });
    }
    
    // Üst çene butonları
    const ustBendSection = document.getElementById('ust-ss-bukumlu-bends');
    if (ustBendSection) {
        // Diş butonları - data-jaw attribute'unu kullan
        ustBendSection.querySelectorAll('.tooth-btn[data-jaw]').forEach(btn => {
            const tooth = btn.dataset.tooth;
            const jaw = btn.dataset.jaw;
            btn.onclick = () => selectWireBend(jaw, 'tooth', tooth);
        });
        
        // Büküm butonları - data-jaw attribute'unu kullan
        ustBendSection.querySelectorAll('.bend-btn[data-jaw]').forEach(btn => {
            const position = btn.dataset.position;
            const jaw = btn.dataset.jaw;
            btn.onclick = () => selectWireBend(jaw, 'bend', position);
        });
    }
    
    // Popup büküm tipi butonları
    const bendTypeButtons = document.querySelectorAll('.bend-type-btn[data-bend]');
    bendTypeButtons.forEach(btn => {
        const bendType = btn.dataset.bend;
        btn.onclick = () => selectBendType(bendType);
    });
}

// Full Arch Popup Fonksiyonları
function openFullArchPopup(jaw) {
    currentFullArchJaw = jaw;
    const popup = document.getElementById('full-arch-popup');
    const overlay = document.getElementById('full-arch-popup-overlay');
    const title = document.getElementById('full-arch-popup-title');
    
    if (!popup || !overlay || !title) {
        console.error('Full arch popup elements not found');
        return;
    }
    
    title.textContent = jaw === 'ust' ? 'Üst Çene Tüm Ark Bükümü Seçin' : 'Alt Çene Tüm Ark Bükümü Seçin';
    
    // Event listener'ları temizle ve yeniden ekle
    const buttons = popup.querySelectorAll('.bend-type-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        // Eski event listener'ı kaldır
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
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
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
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
    
    console.log(`Full arch bend selected: ${currentFullArchJaw} - ${bendType}`);
    
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

// Tel Procedures (Diş arası ve dişlere rutin dışı uygulamalar) Fonksiyonları
function openTelProceduresPopup(type, target) {
    const popup = document.getElementById('tel-procedures-popup');
    const overlay = document.getElementById('tel-procedures-popup-overlay');
    const title = document.getElementById('tel-procedures-popup-title');
    const gapOptions = document.getElementById('gap-procedures');
    const toothOptions = document.getElementById('tooth-procedures');
    
    if (!popup || !overlay || !title || !gapOptions || !toothOptions) {
        console.error('Tel procedures popup elements not found');
        return;
    }
    
    currentProcedureSelection = {
        type: type,
        target: target,
        procedure: null
    };
    
    // Popup title ve options'ı ayarla
    if (type === 'gap') {
        title.textContent = `${target} Diş Arası İşlem Seçin`;
        gapOptions.style.display = 'block';
        toothOptions.style.display = 'none';
    } else {
        title.textContent = `${target} Nolu Diş İşlem Seçin`;
        gapOptions.style.display = 'none';
        toothOptions.style.display = 'block';
    }
    
    // Mevcut seçimi göster
    const currentProcedure = type === 'gap' ? telProcedures.gaps[target] : telProcedures.teeth[target];
    document.querySelectorAll('.procedure-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-procedure') === currentProcedure) {
            btn.classList.add('selected');
        }
    });
    
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function selectTelProcedure(procedure) {
    currentProcedureSelection.procedure = procedure;
    
    // Görsel feedback
    document.querySelectorAll('.procedure-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`[data-procedure="${procedure}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçimi kaydet
    if (currentProcedureSelection.type === 'gap') {
        telProcedures.gaps[currentProcedureSelection.target] = procedure;
    } else {
        telProcedures.teeth[currentProcedureSelection.target] = procedure;
    }
    
    // FDI butonunu güncelle
    updateTelProcedureButton(currentProcedureSelection.type, currentProcedureSelection.target, procedure);
    
    console.log(`Tel procedure selected: ${currentProcedureSelection.type} - ${currentProcedureSelection.target} - ${procedure}`);
    
    // Output'u güncelle
    updateTelOutput();
    
    // Popup'ı kapat
    setTimeout(() => {
        closeTelProceduresPopup();
    }, 300);
}

function updateTelProcedureButton(type, target, procedure) {
    const selector = type === 'gap' ? 
        `[data-question="tel-procedures"][data-gap="${target}"]` : 
        `[data-question="tel-procedures"][data-tooth="${target}"]`;
    
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('selected');
    }
}

function clearTelProcedureSelection() {
    if (currentProcedureSelection.type && currentProcedureSelection.target) {
        if (currentProcedureSelection.type === 'gap') {
            delete telProcedures.gaps[currentProcedureSelection.target];
        } else {
            delete telProcedures.teeth[currentProcedureSelection.target];
        }
        
        // FDI butonunu güncelle
        const selector = currentProcedureSelection.type === 'gap' ? 
            `[data-question="tel-procedures"][data-gap="${currentProcedureSelection.target}"]` : 
            `[data-question="tel-procedures"][data-tooth="${currentProcedureSelection.target}"]`;
        
        const button = document.querySelector(selector);
        if (button) {
            button.classList.remove('selected');
        }
        
        // Output'u güncelle
        updateTelOutput();
    }
    
    closeTelProceduresPopup();
}

function closeTelProceduresPopup() {
    const popup = document.getElementById('tel-procedures-popup');
    const overlay = document.getElementById('tel-procedures-popup-overlay');
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    currentProcedureSelection = { type: null, target: null, procedure: null };
}

function clearTelProcedures() {
    telProcedures = { gaps: {}, teeth: {} };
    
    // Tüm seçili butonları temizle
    document.querySelectorAll('[data-question="tel-procedures"]').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Output'u güncelle
    updateTelOutput();
}

// Lastik İhtiyacı Hesaplama Fonksiyonları
function calculateElasticNeed() {
    console.log('🧮 calculateElasticNeed STARTED');
    
    // Randevu hafta bilgisini al
    const appointmentWeeks = telAnswers['randevu-haftasi'] || 0;
    console.log('appointmentWeeks:', appointmentWeeks);
    
    if (appointmentWeeks === 0) {
        elasticNeedCalculation = {
            days: 0,
            elasticsPerDay: 0,
            totalNeed: 0,
            details: []
        };
        return;
    }
    
    const totalDays = appointmentWeeks * 7;
    
    let totalElasticsPerDay = 0;
    let details = [];
    
    // Sağ taraf seçilen lastikleri say
    if (nextElasticSelections['sag-next']) {
        const sagElastics = nextElasticSelections['sag-next'];
        let sagCount = 0;
        
        // "Aynı lastiklere devam" seçili mi kontrol et
        if (sagElastics.sameAsNow && elasticSelections.sag && elasticSelections.sag.types) {
            const sagTypes = ['sinif2', 'sinif3', 'cross', 'yatay', 'ucgen', 'box'];
            sagTypes.forEach(type => {
                if (elasticSelections.sag.types[type] && elasticSelections.sag.types[type].selected && elasticSelections.sag.types[type].duration) {
                    sagCount++;
                }
            });
        } else if (sagElastics.types) {
            // Manuel seçimleri kontrol et
            for (const type in sagElastics.types) {
                if (sagElastics.types[type].selected && sagElastics.types[type].duration) {
                    sagCount++;
                }
            }
        }
        
        if (sagCount > 0) {
            totalElasticsPerDay += sagCount;
            details.push(`Sağ: ${sagCount}/gün`);
        }
    }
    
    // Sol taraf seçilen lastikleri say
    if (nextElasticSelections['sol-next']) {
        const solElastics = nextElasticSelections['sol-next'];
        let solCount = 0;
        
        // "Aynı lastiklere devam" seçili mi kontrol et
        if (solElastics.sameAsNow && elasticSelections.sol && elasticSelections.sol.types) {
            const solTypes = ['sinif2', 'sinif3', 'cross', 'yatay', 'ucgen', 'box'];
            solTypes.forEach(type => {
                if (elasticSelections.sol.types[type] && elasticSelections.sol.types[type].selected && elasticSelections.sol.types[type].duration) {
                    solCount++;
                }
            });
        } else if (solElastics.types) {
            // Manuel seçimleri kontrol et
            for (const type in solElastics.types) {
                if (solElastics.types[type].selected && solElastics.types[type].duration) {
                    solCount++;
                }
            }
        }
        
        if (solCount > 0) {
            totalElasticsPerDay += solCount;
            details.push(`Sol: ${solCount}/gün`);
        }
    }
    
    // Orta taraf seçilen lastikleri say
    if (nextElasticSelections['orta-next']) {
        const ortaElastics = nextElasticSelections['orta-next'];
        let ortaCount = 0;
        
        // "Aynı lastiklere devam" seçili mi kontrol et
        if (ortaElastics.sameAsNow && elasticSelections.orta && elasticSelections.orta.types) {
            const ortaTypes = ['oblik1333', 'oblik2343'];
            ortaTypes.forEach(type => {
                if (elasticSelections.orta.types[type] && elasticSelections.orta.types[type].selected && elasticSelections.orta.types[type].duration) {
                    ortaCount++;
                }
            });
        } else if (ortaElastics.types) {
            // Manuel seçimleri kontrol et
            for (const type in ortaElastics.types) {
                if (ortaElastics.types[type].selected && ortaElastics.types[type].duration) {
                    ortaCount++;
                }
            }
        }
        
        if (ortaCount > 0) {
            totalElasticsPerDay += ortaCount;
            details.push(`Orta: ${ortaCount}/gün`);
        }
    }
    
    const totalNeed = totalElasticsPerDay * totalDays;
    
    console.log('=== CALCULATION SUMMARY ===');
    console.log('totalElasticsPerDay:', totalElasticsPerDay);
    console.log('totalDays:', totalDays);
    console.log('totalNeed:', totalNeed);
    console.log('details:', details);
    console.log('=========================');
    
    // Global değişkenleri güncelle
    elasticNeedCalculation = {
        days: totalDays,
        elasticsPerDay: totalElasticsPerDay,
        totalNeed: totalNeed,
        details: details
    };
}

// Lastik seçimi değiştiğinde hesaplamayı güncelle
function updateElasticCalculation() {
    console.log('🔄 updateElasticCalculation called');
    calculateElasticNeed();
    updateTelLastikCalculationDisplay(); // Tel bölümü için hesaplama göster
    updateTelOutput(); // Raporu da güncelle
    console.log('✅ updateElasticCalculation completed');
}

function updateTelLastikCalculationDisplay() {
    const telDisplay = document.getElementById('tel-lastik-calculation-result');
    if (!telDisplay) return;
    
    const telCalc = elasticNeedCalculation || {};
    
    if (telCalc.elasticsPerDay && telCalc.elasticsPerDay > 0) {
        const weeks = telCalc.days / 7;
        const detailText = telCalc.details.join(', ');
        const text = `${weeks} hafta için ${telCalc.totalNeed} adet lastik gerekli (${detailText} × ${telCalc.days} gün)`;
        
        telDisplay.textContent = text;
        telDisplay.className = 'has-calculation';
    } else {
        telDisplay.textContent = 'Lastik hesaplaması için sonraki seans lastiklerini seçin';
        telDisplay.className = '';
    }
}

function selectAnimal(tabType, direction, elasticType, animal) {
    const animalKey = tabType + '-' + direction + '-' + elasticType;
    const animalButtons = document.querySelectorAll('.animal-btn[data-animal-key="' + animalKey + '"]');
    animalButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector('.animal-btn[data-animal-key="' + animalKey + '"][data-animal="' + animal + '"]');
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        const hoursContainer = document.getElementById(animalKey + '-hours');
        if (hoursContainer) hoursContainer.style.display = 'block';
    }
    
    // Hayvan seçimini elasticSelections veya nextElasticSelections'a kaydet
    if (tabType === 'tel-next' || tabType === 'seffaf-next') {
        const directionKey = direction + '-next';
        if (!nextElasticSelections[directionKey]) {
            nextElasticSelections[directionKey] = {
                active: true,
                types: {}
            };
        }
        if (!nextElasticSelections[directionKey].types[elasticType]) {
            nextElasticSelections[directionKey].types[elasticType] = {
                selected: true,
                duration: null,
                animal: null
            };
        }
        nextElasticSelections[directionKey].types[elasticType].animal = animal;
    } else if (tabType === 'tel' || tabType === 'seffaf') {
        // Mevcut lastikler için elasticSelections'ı güncelle
        if (!elasticSelections[direction]) {
            elasticSelections[direction] = {
                active: true,
                types: {}
            };
        }
        if (!elasticSelections[direction].types[elasticType]) {
            elasticSelections[direction].types[elasticType] = {
                selected: true,
                duration: null,
                animal: null
            };
        }
        elasticSelections[direction].types[elasticType].animal = animal;
    }
    
    // Hem tel hem şeffaf plak için rapor güncellemesi
    if (tabType === 'tel' || tabType === 'tel-next') {
        updateTelOutput();
    } else if (tabType === 'seffaf' || tabType === 'seffaf-next') {
        updateSeffafOutput();
    }
}

// Hayvan kodundan hayvan ismini döndür
function getAnimalName(animalCode) {
    const animalNames = {
        'kartal': 'Kartal',
        'goril': 'Goril',
        'ferret': 'Ferret',
        'kaplumbaga': 'Kaplumbağa'
    };
    return animalNames[animalCode] || animalCode;
}

function selectElasticHours(tabType, direction, elasticType, hours) {
    const animalKey = tabType + '-' + direction + '-' + elasticType;
    const hoursContainer = document.getElementById(animalKey + '-hours');
    if (!hoursContainer) return;
    const hourButtons = hoursContainer.querySelectorAll('.elastic-hour-btn');
    hourButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = hoursContainer.querySelector('.elastic-hour-btn[onclick*="' + hours + '"]');
    if (selectedBtn) selectedBtn.classList.add('selected');
    
    const hourText = hours === 24 ? '24 Saat' : hours === 12 ? '12 Saat' : '8 Saat';
    
    // Storage'a duration bilgisi ekle
    if (tabType === 'tel-next') {
        const directionKey = direction + '-next';
        if (!nextElasticSelections[directionKey]) {
            nextElasticSelections[directionKey] = {
                active: true,
                types: {}
            };
        }
        if (!nextElasticSelections[directionKey].types[elasticType]) {
            nextElasticSelections[directionKey].types[elasticType] = {
                selected: true,
                duration: null
            };
        }
        nextElasticSelections[directionKey].types[elasticType].duration = hourText;
    } else if (tabType === 'tel') {
        // Mevcut lastikler için elasticSelections'ı güncelle
        if (!elasticSelections[direction]) {
            elasticSelections[direction] = {
                active: true,
                types: {}
            };
        }
        if (!elasticSelections[direction].types[elasticType]) {
            elasticSelections[direction].types[elasticType] = {
                selected: true,
                duration: null
            };
        }
        elasticSelections[direction].types[elasticType].duration = hourText;
    }
    
    // Lastik hesaplamasını güncelle
    if (tabType === 'tel-next') {
        updateElasticCalculation();
    }
    
    updateTelOutput();
}

function selectElasticStatus(section, status) {
    // Lastik kullanım durumu seçimi - "Hastamız şu an lastiklerini taktı mı?"
    let containerSelector;
    if (section === 'seffaf') {
        containerSelector = '.elastic-status-container';
    } else {
        containerSelector = `#${section}-tedavisi`;
    }
    
    // Önceki seçimi temizle
    const buttons = document.querySelectorAll(`${containerSelector} .elastic-status-btn`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Yeni seçimi işaretle
    const selectedBtn = document.querySelector(`${containerSelector} .elastic-status-btn[data-status="${status}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Raporu güncelle
    if (section === 'seffaf') {
        updateSeffafOutput();
    } else if (section === 'tel') {
        updateTelOutput();
    }
}

function continueCurrentElastics(tabType, direction) {
    // Tel bölümü için "aynı lastiklere devam" fonksiyonu
    
    const continueBtn = document.querySelector(`.continue-elastic-btn[onclick*="'${direction}'"]`);
    if (!continueBtn) return;
    
    // Butonu toggle yap
    continueBtn.classList.toggle('active');
    
    // Storage'u güncelle
    const directionKey = direction + '-next';
    if (!nextElasticSelections[directionKey]) {
        nextElasticSelections[directionKey] = {
            active: true,
            types: {}
        };
    }
    
    // Eğer aktifse, "aynı lastiklere devam" flag'ini set et
    if (continueBtn.classList.contains('active')) {
        nextElasticSelections[directionKey].sameAsNow = true;
        
        // Yön bazlı seçimleri temizle
        const directionContainer = continueBtn.closest('.elastic-direction-block');
        if (directionContainer) {
            // Tüm elastic-type-btn'leri pasif yap
            const typeButtons = directionContainer.querySelectorAll('.elastic-type-btn');
            typeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Tüm hayvan ve saat seçimlerini temizle
            const animalButtons = directionContainer.querySelectorAll('.animal-btn');
            animalButtons.forEach(btn => btn.classList.remove('selected'));
            
            const hourButtons = directionContainer.querySelectorAll('.elastic-hour-btn');
            hourButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Saat container'larını gizle
            const hoursContainers = directionContainer.querySelectorAll('.elastic-hours-container');
            hoursContainers.forEach(container => container.style.display = 'none');
        }
        
        // Storage'daki types'ı temizle
        nextElasticSelections[directionKey].types = {};
    } else {
        // Aktif değilse, "aynı lastiklere devam" flag'ini kaldır
        nextElasticSelections[directionKey].sameAsNow = false;
    }
    
    // Lastik hesaplamasını güncelle
    updateElasticCalculation();
    
    updateTelOutput();
}

// ============================================
// SONRAKI SEANS YAPILACAK İŞLEMLER FONKSİYONLARI
// ============================================

function selectSokum(type) {
    const selectedBtn = document.querySelector(`[data-sokum="${type}"]`);
    
    // Eğer zaten seçiliyse, seçimi kaldır
    if (selectedSokum === type) {
        selectedSokum = null;
        if (selectedBtn) {
            selectedBtn.classList.remove('selected');
        }
        updateTelOutput();
        return;
    }
    
    // Önceki seçimi temizle
    document.querySelectorAll('.sokum-option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Yeni seçimi işaretle
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçimi kaydet
    selectedSokum = type;
    
    // Raporu güncelle
    updateTelOutput();
}

// Minivida input değişikliğinde gönder butonunu güncelle
function updateMinividaInputState() {
    const startInput = document.getElementById('minivida-start-tooth');
    const endInput = document.getElementById('minivida-end-tooth');
    const sendBtn = document.getElementById('send-minivida-btn');
    
    if (!startInput || !endInput || !sendBtn) return;
    
    const startTooth = startInput.value.trim();
    const endTooth = endInput.value.trim();
    
    // Her iki değer de girildiyse butonu aktif et
    sendBtn.disabled = !(startTooth && endTooth);
}

// Minivida söküm bilgisini rapora gönder
function sendMinividaToReport() {
    const startInput = document.getElementById('minivida-start-tooth');
    const endInput = document.getElementById('minivida-end-tooth');
    
    if (!startInput || !endInput) return;
    
    const startTooth = startInput.value.trim();
    const endTooth = endInput.value.trim();
    
    if (!startTooth || !endTooth) {
        alert('Lütfen her iki diş numarasını da girin!');
        return;
    }
    
    // Yeni minivida söküm kaydı oluştur
    const removal = {
        id: Date.now(),
        startTooth: startTooth,
        endTooth: endTooth,
        text: `Sonraki seans ${startTooth}-${endTooth} dişleri arasındaki vida sökülecek`
    };
    
    // Listeye ekle
    minividaRemovals.push(removal);
    
    // Input'ları temizle
    startInput.value = '';
    endInput.value = '';
    
    // Gönder butonunu devre dışı bırak
    const sendBtn = document.getElementById('send-minivida-btn');
    if (sendBtn) sendBtn.disabled = true;
    
    // Listeyi güncelle
    updateMinividaRemovalList();
    
    // Raporu güncelle
    updateTelOutput();
}

// Minivida söküm listesini güncelle
function updateMinividaRemovalList() {
    const listContainer = document.getElementById('minivida-removal-list');
    
    if (!listContainer) return;
    
    if (minividaRemovals.length === 0) {
        listContainer.innerHTML = '<div class="no-minivida">Henüz vida sökümü eklenmedi</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    minividaRemovals.forEach(removal => {
        const item = document.createElement('div');
        item.className = 'minivida-removal-item';
        item.innerHTML = `
            <span class="minivida-removal-text">${removal.text}</span>
            <button class="remove-minivida-btn" onclick="removeMinividaRemoval(${removal.id})" title="Kaldır">×</button>
        `;
        listContainer.appendChild(item);
    });
}

// Tek bir minivida söküm kaydını sil
function removeMinividaRemoval(removalId) {
    minividaRemovals = minividaRemovals.filter(r => r.id !== removalId);
    updateMinividaRemovalList();
    updateTelOutput();
}

// Tüm minivida söküm kayıtlarını temizle
function clearAllMinividaRemovals() {
    if (minividaRemovals.length === 0) {
        return;
    }
    
    minividaRemovals = [];
    updateMinividaRemovalList();
    updateTelOutput();
}

// Planlanan işlemler metnini güncelle
function updatePlannedProcedures() {
    const textarea = document.getElementById('planned-procedures-text');
    if (!textarea) return;
    
    plannedProceduresText = textarea.value.trim();
    
    // Raporu güncelle
    updateTelOutput();
}

// Planlanan işlemler metnini temizle
function clearPlannedProcedures() {
    const textarea = document.getElementById('planned-procedures-text');
    if (!textarea) return;
    
    if (!textarea.value.trim()) return; // Zaten boşsa hiçbir şey yapma
    
    if (!confirm('Planlanan işlemleri temizlemek istediğinize emin misiniz?')) {
        return;
    }
    
    textarea.value = '';
    plannedProceduresText = '';
    updateTelOutput();
}

// 7'leri dahil etme seçimi toggle
function toggleYediDahil(jaw) {
    // Seçimi tersine çevir
    yediDahilSelection[jaw] = !yediDahilSelection[jaw];
    
    // Buton görünümünü güncelle
    const button = document.querySelector(`[data-jaw="${jaw}"]`);
    if (button) {
        if (yediDahilSelection[jaw]) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    }
    
    // Raporu güncelle
    updateTelOutput();
}

// ============================================
// ÇOKLU DİŞ İŞLEMLERİ FONKSİYONLARI
// ============================================

function toggleToothSelection(buttonOrTooth) {
    // Eğer button elementi geçilmişse
    if (typeof buttonOrTooth === 'object' && buttonOrTooth.dataset) {
        const button = buttonOrTooth;
        const tooth = button.dataset.tooth;
        const question = button.dataset.question;
        
        // Adaptasyon veya ataşman için
        if (question === 'adaptasyon' || question === 'atasmanlar') {
            const isSelected = button.classList.contains('selected');
            
            console.log('🔄 toggleToothSelection (v2):', {
                tooth: tooth,
                question: question,
                wasSelected: isSelected,
                willBe: !isSelected ? 'selected' : 'deselected'
            });
            
            if (isSelected) {
                button.classList.remove('selected');
                console.log('  ➖ Seçim kaldırıldı');
            } else {
                button.classList.add('selected');
                console.log('  ➕ Seçildi');
            }
            
            // updateToothOutput'u çağır
            updateToothOutput(question);
            return;
        }
        
        // Multi-select için (Çoklu Diş İşlemleri)
        if (button.classList.contains('multi-select')) {
            const index = multiToothSelection.selectedTeeth.indexOf(tooth);
            
            if (index === -1) {
                multiToothSelection.selectedTeeth.push(tooth);
                button.classList.add('selected');
            } else {
                multiToothSelection.selectedTeeth.splice(index, 1);
                button.classList.remove('selected');
            }
            
            updateSelectedTeethDisplay();
            updateProcedureButtonsState();
            return;
        }
    }
    
    // Eğer tooth string'i geçilmişse (eski kullanım - multi-select için)
    if (typeof buttonOrTooth === 'string') {
        const tooth = buttonOrTooth;
        const button = document.querySelector(`[data-tooth="${tooth}"].multi-select`);
        
        if (!button) {
            console.warn('Button not found for tooth:', tooth);
            return;
        }
        
        const index = multiToothSelection.selectedTeeth.indexOf(tooth);
        
        if (index === -1) {
            multiToothSelection.selectedTeeth.push(tooth);
            button.classList.add('selected');
        } else {
            multiToothSelection.selectedTeeth.splice(index, 1);
            button.classList.remove('selected');
        }
        
        updateSelectedTeethDisplay();
        updateProcedureButtonsState();
    }
}

function updateSelectedTeethDisplay() {
    const display = document.getElementById('selected-teeth-list');
    
    if (!display) return;
    
    if (multiToothSelection.selectedTeeth.length === 0) {
        display.textContent = 'Henüz diş seçilmedi';
        display.style.color = 'var(--gray-500)';
    } else {
        display.textContent = multiToothSelection.selectedTeeth.join(', ');
        display.style.color = 'var(--primary-600)';
    }
}

function updateProcedureButtonsState() {
    const memoryChainBtn = document.getElementById('memory-chain-btn');
    const chainYenilemeBtn = document.getElementById('chain-yenileme-btn');
    const ligaturBtn = document.getElementById('ligatur-btn');
    const openCoilBtn = document.getElementById('open-coil-btn');
    const koruyucuBoruBtn = document.getElementById('koruyucu-boru-btn');
    const closeCoilBtn = document.getElementById('close-coil-btn');
    const telKompozitBtn = document.getElementById('tel-kompozit-btn');
    const powerBarBtn = document.getElementById('power-bar-btn');
    const coilAktivasyonBtn = document.getElementById('coil-aktivasyon-btn');
    const loopAktivasyonBtn = document.getElementById('loop-aktivasyon-btn');
    const laysBackBtn = document.getElementById('lays-back-btn');
    const laysBackAktivasyonBtn = document.getElementById('lays-back-aktivasyon-btn');
    
    // Kontrol: 
    // - Minivida + Power Arm seçili ise → diş seçilmeden de işlem yapılabilir
    // - Minivida veya Power Arm seçili ise → 1 diş gerekli
    // - Hiçbiri seçili değilse → 2+ diş gerekli
    let canPerformProcedure = false;
    
    if (multiToothSelection.minividaRange && multiToothSelection.powerArm) {
        // Minivida + Power Arm → diş seçilmesine gerek yok
        canPerformProcedure = true;
    } else if (multiToothSelection.minividaRange || multiToothSelection.powerArm) {
        // Sadece minivida veya sadece power arm → 1 diş gerekli
        canPerformProcedure = multiToothSelection.selectedTeeth.length >= 1;
    } else {
        // Hiçbiri seçili değil → 2+ diş gerekli
        canPerformProcedure = multiToothSelection.selectedTeeth.length >= 2;
    }
    
    if (memoryChainBtn) memoryChainBtn.disabled = !canPerformProcedure;
    if (chainYenilemeBtn) chainYenilemeBtn.disabled = !canPerformProcedure;
    if (ligaturBtn) ligaturBtn.disabled = !canPerformProcedure;
    if (openCoilBtn) openCoilBtn.disabled = !canPerformProcedure;
    if (koruyucuBoruBtn) koruyucuBoruBtn.disabled = !canPerformProcedure;
    if (closeCoilBtn) closeCoilBtn.disabled = !canPerformProcedure;
    if (telKompozitBtn) telKompozitBtn.disabled = !canPerformProcedure;
    if (powerBarBtn) powerBarBtn.disabled = !canPerformProcedure;
    if (coilAktivasyonBtn) coilAktivasyonBtn.disabled = !canPerformProcedure;
    if (loopAktivasyonBtn) loopAktivasyonBtn.disabled = !canPerformProcedure;
    if (laysBackBtn) laysBackBtn.disabled = !canPerformProcedure;
    if (laysBackAktivasyonBtn) laysBackAktivasyonBtn.disabled = !canPerformProcedure;
}

function clearMultiToothSelection() {
    multiToothSelection.selectedTeeth = [];
    multiToothSelection.minividaRange = null;  // Minivida seçimini de temizle
    multiToothSelection.powerArm = null;  // Power Arm seçimini de temizle
    
    // Tüm seçili butonları temizle
    document.querySelectorAll('.tooth-btn-fdi.multi-select.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateSelectedTeethDisplay();
    updateProcedureButtonsState();
}

function addMultiToothProcedure(procedureType) {
    // Minivida + Power Arm ise diş seçmez bile işlem yapabilir
    // Minivida veya Power Arm vardı diş seçili yoksa, sadece 1 seçiliyse diş şart
    let requiredTeeth = 2;
    if ((multiToothSelection.minividaRange && multiToothSelection.powerArm) || 
        (multiToothSelection.minividaRange || multiToothSelection.powerArm)) {
        requiredTeeth = 1;
    }
    
    // Minivida + Power Arm kombinasyonu seçiliyse diş seçmek zorunlu değil
    if (multiToothSelection.minividaRange && multiToothSelection.powerArm) {
        // Diş seçimi zorunlu değil, işlem yapabilir
    } else if (multiToothSelection.selectedTeeth.length < requiredTeeth) {
        if (multiToothSelection.minividaRange || multiToothSelection.powerArm) {
            alert('En az 1 diş seçmelisiniz!');
        } else {
            alert('En az 2 diş seçmelisiniz!');
        }
        return;
    }
    
    let procedureText = '';
    
    if (multiToothSelection.minividaRange && multiToothSelection.powerArm) {
        // Minivida ve Power Arm seçili ise
        const minividaX = multiToothSelection.minividaRange.x;
        const minividaY = multiToothSelection.minividaRange.y;
        const powerArmX = multiToothSelection.powerArm.x;
        const powerArmY = multiToothSelection.powerArm.y;
        const selectedTooth = multiToothSelection.selectedTeeth[0];
        
        // Eğer diş seçilmişse
        if (selectedTooth) {
            if (procedureType === 'memory-chain') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan memory chain takıldı`;
            } else if (procedureType === 'chain-yenileme') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan chain yenilendi`;
            } else if (procedureType === 'ligatur') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan 8 ligatür takıldı`;
            } else if (procedureType === 'open-coil') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan open coil takıldı`;
            } else if (procedureType === 'koruyucu-boru') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan koruyucu boru takıldı`;
            } else if (procedureType === 'close-coil') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan close coil takıldı`;
            } else if (procedureType === 'tel-kompozit') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan tel kompozitle kaplandı`;
            } else if (procedureType === 'power-bar') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan power bar takıldı`;
            } else if (procedureType === 'lays-back') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan lays back takıldı`;
            } else if (procedureType === 'lays-back-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan lays back aktive edildi`;
            } else if (procedureType === 'coil-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan coil aktive edildi`;
            } else if (procedureType === 'loop-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan loop aktive edildi`;
            }
        } else {
            // Diş seçilmemişse (sadece minivida + power arm)
            if (procedureType === 'memory-chain') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan memory chain takıldı`;
            } else if (procedureType === 'chain-yenileme') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan chain yenilendi`;
            } else if (procedureType === 'ligatur') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan 8 ligatür takıldı`;
            } else if (procedureType === 'open-coil') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan open coil takıldı`;
            } else if (procedureType === 'koruyucu-boru') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan koruyucu boru takıldı`;
            } else if (procedureType === 'close-coil') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan close coil takıldı`;
            } else if (procedureType === 'tel-kompozit') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan tel kompozitle kaplandı`;
            } else if (procedureType === 'power-bar') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan power bar takıldı`;
            } else if (procedureType === 'lays-back') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan lays back takıldı`;
            } else if (procedureType === 'lays-back-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan lays back aktive edildi`;
            } else if (procedureType === 'coil-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan coil aktive edildi`;
            } else if (procedureType === 'loop-aktivasyon') {
                procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${powerArmX}-${powerArmY} arasındaki power arm'ya uzanan loop aktive edildi`;
            }
        }
    } else if (multiToothSelection.powerArm) {
        // Sadece Power Arm seçili ise
        const powerArmX = multiToothSelection.powerArm.x;
        const powerArmY = multiToothSelection.powerArm.y;
        const selectedTooth = multiToothSelection.selectedTeeth[0];
        
        if (procedureType === 'memory-chain') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan memory chain takıldı`;
        } else if (procedureType === 'chain-yenileme') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan chain yenilendi`;
        } else if (procedureType === 'ligatur') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan 8 ligatür takıldı`;
        } else if (procedureType === 'open-coil') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan open coil takıldı`;
        } else if (procedureType === 'koruyucu-boru') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan koruyucu boru takıldı`;
        } else if (procedureType === 'close-coil') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan close coil takıldı`;
        } else if (procedureType === 'tel-kompozit') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan tel kompozitle kaplandı`;
        } else if (procedureType === 'power-bar') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan power bar takıldı`;
        } else if (procedureType === 'lays-back') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan lays back takıldı`;
        } else if (procedureType === 'lays-back-aktivasyon') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan lays back aktive edildi`;
        } else if (procedureType === 'coil-aktivasyon') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan coil aktive edildi`;
        } else if (procedureType === 'loop-aktivasyon') {
            procedureText = `${powerArmX}-${powerArmY} arasındaki power arm'dan ${selectedTooth} nolu dişe uzanan loop aktive edildi`;
        }
    } else if (multiToothSelection.minividaRange) {
        // Sadece minivida seçili ise
        const minividaX = multiToothSelection.minividaRange.x;
        const minividaY = multiToothSelection.minividaRange.y;
        const selectedTooth = multiToothSelection.selectedTeeth[0];
        
        if (procedureType === 'memory-chain') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan memory chain takıldı`;
        } else if (procedureType === 'chain-yenileme') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan chain yenilendi`;
        } else if (procedureType === 'ligatur') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan 8 ligatür takıldı`;
        } else if (procedureType === 'open-coil') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan open coil takıldı`;
        } else if (procedureType === 'koruyucu-boru') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan koruyucu boru takıldı`;
        } else if (procedureType === 'close-coil') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan close coil takıldı`;
        } else if (procedureType === 'tel-kompozit') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan tel kompozitle kaplandı`;
        } else if (procedureType === 'power-bar') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan power bar takıldı`;
        } else if (procedureType === 'lays-back') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan lays back takıldı`;
        } else if (procedureType === 'lays-back-aktivasyon') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan lays back aktive edildi`;
        } else if (procedureType === 'coil-aktivasyon') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan coil aktive edildi`;
        } else if (procedureType === 'loop-aktivasyon') {
            procedureText = `${minividaX}-${minividaY} arasındaki minividadan ${selectedTooth} nolu dişe uzanan loop aktive edildi`;
        }
    } else {
        // Normal çoklu diş seçimi
        const firstTooth = multiToothSelection.selectedTeeth[0];
        const lastTooth = multiToothSelection.selectedTeeth[multiToothSelection.selectedTeeth.length - 1];
        
        if (procedureType === 'memory-chain') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan memory chain takıldı`;
        } else if (procedureType === 'chain-yenileme') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan chain yenilendi`;
        } else if (procedureType === 'ligatur') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan 8 ligatür takıldı`;
        } else if (procedureType === 'open-coil') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan open coil takıldı`;
        } else if (procedureType === 'koruyucu-boru') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan koruyucu boru takıldı`;
        } else if (procedureType === 'close-coil') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan close coil takıldı`;
        } else if (procedureType === 'tel-kompozit') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan tel kompozitle kaplandı`;
        } else if (procedureType === 'power-bar') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan power bar takıldı`;
        } else if (procedureType === 'lays-back') {
            procedureText = `${firstTooth}'dan ${lastTooth}'ya uzanan lays back takıldı`;
        } else if (procedureType === 'lays-back-aktivasyon') {
            procedureText = `${firstTooth}-${lastTooth} dişleri arasındaki lays back aktive edildi`;
        } else if (procedureType === 'coil-aktivasyon') {
            procedureText = `${firstTooth}-${lastTooth} dişleri arasındaki coil aktive edildi`;
        } else if (procedureType === 'loop-aktivasyon') {
            procedureText = `${firstTooth}-${lastTooth} dişleri arasındaki loop aktive edildi`;
        }
    }
    
    // Procedure'ı listeye ekle
    const procedure = {
        id: Date.now(),
        text: procedureText,
        teeth: [...multiToothSelection.selectedTeeth],
        type: procedureType,
        minivida: multiToothSelection.minividaRange ? { ...multiToothSelection.minividaRange } : null
    };
    
    multiToothSelection.procedures.push(procedure);
    
    // Listeyi güncelle
    updateProcedureList();
    
    // Seçimi temizle (yalnızca multiTooth seçimini)
    multiToothSelection.selectedTeeth = [];
    
    // Rapora gönder butonunu aktif et
    updateSendToReportButtonState();
}

function updateProcedureList() {
    const listContainer = document.getElementById('multi-procedure-list');
    
    if (!listContainer) return;
    
    if (multiToothSelection.procedures.length === 0) {
        listContainer.innerHTML = '<div class="no-procedures">Henüz işlem eklenmedi</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    multiToothSelection.procedures.forEach(procedure => {
        const item = document.createElement('div');
        item.className = 'procedure-item';
        item.innerHTML = `
            <span class="procedure-text">${procedure.text}</span>
            <button class="remove-procedure-btn" onclick="removeProcedure(${procedure.id})" title="Kaldır">×</button>
        `;
        listContainer.appendChild(item);
    });
}

function removeProcedure(procedureId) {
    multiToothSelection.procedures = multiToothSelection.procedures.filter(p => p.id !== procedureId);
    updateProcedureList();
    updateSendToReportButtonState();
}

function updateSendToReportButtonState() {
    const sendBtn = document.getElementById('send-report-btn');
    if (sendBtn) {
        sendBtn.disabled = multiToothSelection.procedures.length === 0;
    }
}

function sendMultiProceduresToReport() {
    if (multiToothSelection.procedures.length === 0) {
        return;
    }
    
    // Yeni procedures'ları sentToReport'a ekle
    multiToothSelection.procedures.forEach(procedure => {
        multiToothSelection.sentToReport.push(procedure.text);
    });
    
    // Procedures listesini temizle
    multiToothSelection.procedures = [];
    updateProcedureList();
    updateSendToReportButtonState();
    
    // Raporu güncelle
    updateTelOutput();
}

function clearMultiProcedures() {
    if (!confirm('Tüm çoklu diş işlemlerini temizlemek istediğinize emin misiniz?')) {
        return;
    }
    
    multiToothSelection.procedures = [];
    multiToothSelection.sentToReport = [];  // Rapora gönderilenleri de temizle
    multiToothSelection.selectedTeeth = [];  // Seçilen dişleri de temizle
    updateProcedureList();
    updateSendToReportButtonState();
    updateTelOutput();  // Raporu güncelle
}

window.toggleFrezToothSelection = toggleFrezToothSelection;
window.openFrezPopupForSelected = openFrezPopupForSelected;
window.handleFrezActionClick = handleFrezActionClick;
window.closeFrezPopup = closeFrezPopup;
window.clearFrezSelections = clearFrezSelections;
window.removeFrezOperation = removeFrezOperation;
window.selectDuration = selectDuration;
window.showDurationManualInput = showDurationManualInput;
window.confirmManualDuration = confirmManualDuration;
window.cancelManualDuration = cancelManualDuration;
window.handleDurationInputKeydown = handleDurationInputKeydown;
window.updateManualDurationRealTime = updateManualDurationRealTime;
window.selectBendType = selectBendType;
window.clearToothBends = clearToothBends;
window.selectInterbendType = selectInterbendType;
window.clearInterbendSelection = clearInterbendSelection;
window.closeBendPopup = closeBendPopup;
window.closeInterbendPopup = closeInterbendPopup;
window.initializeBendButtons = initializeBendButtons;
window.selectWeeks = selectWeeks;
window.showManualInput = showManualInput;
window.handleManualInputKeydown = handleManualInputKeydown;
window.confirmManualWeeks = confirmManualWeeks;
window.cancelManualInput = cancelManualInput;
window.updateManualWeeksRealTime = updateManualWeeksRealTime;
window.clearWireBends = clearWireBends;
window.openFullArchPopup = openFullArchPopup;
window.toggleManualAsistanInput = toggleManualAsistanInput;
window.applyManualAsistan = applyManualAsistan;
window.selectElasticType = selectElasticType;
window.toggleElasticSection = toggleElasticSection;
window.toggleWireSection = toggleWireSection;
window.toggleWireType = toggleWireType;
window.selectWireSize = selectWireSize;
window.selectAnimal = selectAnimal;
window.selectElasticHours = selectElasticHours;
window.continueCurrentElastics = continueCurrentElastics;
window.openFullArchPopup = openFullArchPopup;
window.closeFullArchPopup = closeFullArchPopup;
window.selectFullArchBend = selectFullArchBend;
window.clearFullArchSelection = clearFullArchSelection;
window.clearWireBends = clearWireBends;
window.openTelProceduresPopup = openTelProceduresPopup;
window.selectTelProcedure = selectTelProcedure;
window.clearTelProcedureSelection = clearTelProcedureSelection;
window.closeTelProceduresPopup = closeTelProceduresPopup;
window.clearTelProcedures = clearTelProcedures;
window.toggleToothSelection = toggleToothSelection;
window.clearToothSelection = clearToothSelection;
window.clearMultiToothSelection = clearMultiToothSelection;
window.addMultiToothProcedure = addMultiToothProcedure;
window.removeProcedure = removeProcedure;
window.sendMultiProceduresToReport = sendMultiProceduresToReport;
window.clearMultiProcedures = clearMultiProcedures;

// Theme management functions
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButtons(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeButtons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    
    toggleBtns.forEach(btn => {
        if (theme === 'dark') {
            btn.textContent = '☀️';
            btn.title = 'Light Mode\'a Geç';
        } else {
            btn.textContent = '🌙';
            btn.title = 'Dark Mode\'a Geç';
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// Special note functions
function updateSeffafSpecialNote() {
    updateSeffafOutput();
}

function updateTelSpecialNote() {
    updateTelOutput();
}

window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
window.updateSeffafSpecialNote = updateSeffafSpecialNote;
window.updateTelSpecialNote = updateTelSpecialNote;

// Image modal functions
function openImageModal(elasticType) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !modalImage || !modalTitle) return;
    
    // Lastik tipine göre görsel ve başlık ayarla
    const imageData = {
        'sinif2': {
            title: 'Sınıf II Lastik Nasıl Takılır?',
            image: 'images/sinif2-lastik.jpg',
            alt: 'Sınıf II Lastik Takma Görseli'
        },
        'sinif3': {
            title: 'Sınıf III Lastik Nasıl Takılır?',
            image: 'images/sinif3-lastik.jpg',
            alt: 'Sınıf III Lastik Takma Görseli'
        },
        'cross': {
            title: 'Cross Lastik Nasıl Takılır?',
            image: 'images/cross-lastik.jpg',
            alt: 'Cross Lastik Takma Görseli'
        },
        'on-oblik': {
            title: 'Ön Oblik Lastik Nasıl Takılır?',
            image: 'images/on-oblik-lastik.jpg',
            alt: 'Ön Oblik Lastik Takma Görseli'
        }
    };
    
    const data = imageData[elasticType];
    if (!data) {
        modalTitle.textContent = 'Görsel Bulunamadı';
        modalImage.src = '';
        modalImage.alt = 'Görsel mevcut değil';
    } else {
        modalTitle.textContent = data.title;
        modalImage.src = data.image;
        modalImage.alt = data.alt;
    }
    
    modal.style.display = 'flex';
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', closeOnEscape);
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.removeEventListener('keydown', closeOnEscape);
}

function closeOnEscape(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}

// Modal dışına tıklayınca kapatma
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // Manuel asistan input'larına Enter tuşu desteği
    const manualAsistanInput = document.getElementById('asistan-manual-input');
    if (manualAsistanInput) {
        manualAsistanInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyManualAsistan('seffaf');
            }
        });
    }
    
    const telManualAsistanInput = document.getElementById('tel-asistan-manual-input');
    if (telManualAsistanInput) {
        telManualAsistanInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyManualAsistan('tel');
            }
        });
    }
    
    // Tel procedures için FDI butonlarına event listener ekle
    setTimeout(() => {
        const telToothBtns = document.querySelectorAll('[data-question="tel-procedures"][data-tooth]');
        const telGapBtns = document.querySelectorAll('[data-question="tel-procedures"][data-gap]');
        
        telToothBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tooth = this.getAttribute('data-tooth');
                openTelProceduresPopup('tooth', tooth);
            });
        });
        
        telGapBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const gap = this.getAttribute('data-gap');
                openTelProceduresPopup('gap', gap);
            });
        });
        
        console.log(`Tel procedures event listeners added: ${telToothBtns.length} teeth, ${telGapBtns.length} gaps`);
    }, 500);
    
    // Dişler arası boşluk ölçümü event listeners'ları
    setTimeout(() => {
        initializeSpacingListeners();
        updateSpacingButtonStates();
        console.log('Spacing measurement listeners initialized');
    }, 500);
});

window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

// Özel not temizleme fonksiyonu
function clearSpecialNote(tabType) {
    if (tabType === 'seffaf') {
        const specialNote = document.getElementById('seffaf-special-note');
        if (specialNote) {
            specialNote.value = '';
            updateSeffafSpecialNote();
        }
    } else if (tabType === 'tel') {
        const specialNote = document.getElementById('tel-special-note');
        if (specialNote) {
            specialNote.value = '';
            updateTelSpecialNote();
        }
    }
}

window.clearSpecialNote = clearSpecialNote;

// Reset/Sıfırlama Fonksiyonları

function resetCurrentElastics(tabType) {
    if (tabType === 'seffaf') {
        // Şeffaf plak mevcut lastikleri sıfırla
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
        
        // UI'yi sıfırla
        const seffafTab = document.getElementById('seffaf-plak');
        if (seffafTab) {
            // Ana butonları pasif yap
            const mainBtns = seffafTab.querySelectorAll('.elastic-main-btn[data-direction]');
            mainBtns.forEach(btn => {
                if (!btn.getAttribute('data-direction').includes('next')) {
                    btn.classList.remove('active');
                    const direction = btn.getAttribute('data-direction');
                    const container = document.getElementById(direction + '-options');
                    if (container) container.style.display = 'none';
                }
            });
            
            // Tüm tip butonlarını pasif yap
            const typeBtns = seffafTab.querySelectorAll('.elastic-type-btn:not([data-parent*="next"])');
            typeBtns.forEach(btn => btn.classList.remove('selected'));
            
            // Tüm süre butonlarını pasif yap
            const durationBtns = seffafTab.querySelectorAll('.elastic-duration-btn:not([data-parent*="next"])');
            durationBtns.forEach(btn => btn.classList.remove('selected'));
            
            // Hayvan butonlarını pasif yap
            const animalBtns = seffafTab.querySelectorAll('.animal-btn[data-animal-key^="seffaf-sag-"], .animal-btn[data-animal-key^="seffaf-sol-"]');
            animalBtns.forEach(btn => btn.classList.remove('selected'));
        }
        
        updateSeffafOutput();
        
    } else if (tabType === 'tel') {
        // Tel mevcut lastikleri sıfırla
        const telTab = document.getElementById('tel-tedavisi');
        if (telTab) {
            // Sağ, Sol, Orta bölümlerini kapat
            ['tel-sag-section', 'tel-sol-section', 'tel-orta-section'].forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'none';
                    
                    // İçindeki tüm seçimleri temizle
                    const typeBtns = section.querySelectorAll('.elastic-type-btn');
                    typeBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const animalBtns = section.querySelectorAll('.animal-btn');
                    animalBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const hourBtns = section.querySelectorAll('.elastic-hour-btn');
                    hourBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const hoursContainers = section.querySelectorAll('[id$="-hours"]');
                    hoursContainers.forEach(container => container.style.display = 'none');
                }
            });
        }
        
        updateTelOutput();
    }
}

function resetNextElastics(tabType) {
    if (!confirm('Sonraki seans lastik seçimlerini sıfırlamak istediğinize emin misiniz?')) {
        return;
    }
    
    if (tabType === 'seffaf') {
        // Şeffaf plak sonraki seans lastikleri sıfırla
        nextElasticSelections = {
            'sag-next': { 
                active: false, 
                sameAsNow: false,
                currentData: null,
                types: {
                    sinif2: { selected: false, duration: null },
                    sinif3: { selected: false, duration: null },
                    cross: { selected: false, duration: null }
                }
            },
            'sol-next': { 
                active: false, 
                sameAsNow: false,
                currentData: null,
                types: {
                    sinif2: { selected: false, duration: null },
                    sinif3: { selected: false, duration: null },
                    cross: { selected: false, duration: null }
                }
            },
            'on-next': { 
                active: false, 
                sameAsNow: false,
                currentData: null,
                tur: null, 
                sure: null 
            }
        };
        
        // UI'yi sıfırla
        const seffafTab = document.getElementById('seffaf-plak');
        if (seffafTab) {
            // Ana butonları pasif yap
            const mainBtns = seffafTab.querySelectorAll('.elastic-main-btn[data-direction*="next"]');
            mainBtns.forEach(btn => {
                btn.classList.remove('active');
                const direction = btn.getAttribute('data-direction');
                const container = document.getElementById(direction + '-options');
                if (container) container.style.display = 'none';
            });
            
            // "Aynı lastiklerle devam" butonlarını pasif yap
            const sameBtns = seffafTab.querySelectorAll('.same-elastic-btn');
            sameBtns.forEach(btn => btn.classList.remove('active'));
            
            // Tüm tip butonlarını pasif yap
            const typeBtns = seffafTab.querySelectorAll('.elastic-type-btn[data-parent*="next"]');
            typeBtns.forEach(btn => btn.classList.remove('selected'));
            
            // Tüm süre butonlarını pasif yap
            const durationBtns = seffafTab.querySelectorAll('.elastic-duration-btn[data-parent*="next"]');
            durationBtns.forEach(btn => btn.classList.remove('selected'));
            
            // Hayvan butonlarını pasif yap
            const animalBtns = seffafTab.querySelectorAll('.animal-btn[data-animal-key*="next"]');
            animalBtns.forEach(btn => btn.classList.remove('selected'));
        }
        
        updateSeffafOutput();
        
    } else if (tabType === 'tel') {
        // Tel sonraki seans lastikleri sıfırla
        const telTab = document.getElementById('tel-tedavisi');
        if (telTab) {
            // Sağ, Sol, Orta bölümlerini kapat
            ['tel-next-sag-section', 'tel-next-sol-section', 'tel-next-orta-section'].forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'none';
                    
                    // "Aynı lastiklere devam" butonunu pasif yap
                    const continueBtn = section.querySelector('.continue-elastic-btn');
                    if (continueBtn) continueBtn.classList.remove('active');
                    
                    // İçindeki tüm seçimleri temizle
                    const typeBtns = section.querySelectorAll('.elastic-type-btn');
                    typeBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const animalBtns = section.querySelectorAll('.animal-btn');
                    animalBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const hourBtns = section.querySelectorAll('.elastic-hour-btn');
                    hourBtns.forEach(btn => btn.classList.remove('selected'));
                    
                    const hoursContainers = section.querySelectorAll('[id$="-hours"]');
                    hoursContainers.forEach(container => container.style.display = 'none');
                }
            });
        }
        
        updateTelOutput();
    }
}

function resetFrezSelections() {
    if (!confirm('Tüm frez işlemlerini sıfırlamak istediğinize emin misiniz?')) {
        return;
    }
    
    // Frez state'ini sıfırla
    frezIslemleri = {
        selectedTeeth: new Set(),
        operations: {}
    };
    
    // UI'yi sıfırla
    const frezTeeth = document.querySelectorAll('.frez-tooth');
    frezTeeth.forEach(tooth => {
        tooth.classList.remove('frez-selected', 'has-frez-operation');
    });
    
    updateSeffafOutput();
}

window.resetCurrentElastics = resetCurrentElastics;
window.resetNextElastics = resetNextElastics;
window.resetFrezSelections = resetFrezSelections;

// ===== DİŞLER ARASI BOŞLUK ÖLÇÜMÜ FONKSİYONLARI =====

// Global dişler arası boşluk ölçümleri storage
let currentSpacingPosition = null;

// Dişler arası boşluk popup'ını aç
function openSpacingPopup(position) {
    currentSpacingPosition = position;
    const popup = document.getElementById('spacing-measurement-popup');
    const overlay = document.getElementById('spacing-popup-overlay');
    const title = document.getElementById('spacing-popup-title');
    const input = document.getElementById('spacing-input');
    
    if (!popup || !overlay || !title) return;
    
    // Başlığı güncelle
    const [tooth1, tooth2] = position.split('-');
    title.textContent = `${tooth1} - ${tooth2} Dişleri Arası Boşluk Ölçümü`;
    
    // Önceki değeri göster (varsa)
    input.value = spacingMeasurements[position] || '';
    
    // Popup'ı aç
    overlay.style.display = 'block';
    popup.style.display = 'block';
    
    // Input'a focus ver
    setTimeout(() => input.focus(), 100);
    
    // Enter tuşu ve Escape için event listener
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveSpacingMeasurement();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeSpacingPopup();
        }
    };
    
    input.addEventListener('keydown', handleKeyDown);
    
    // Overlay'e tıklanınca kaydet ve kapat
    const handleOverlayClick = (e) => {
        if (e.target === overlay) {
            saveSpacingMeasurement();
        }
    };
    
    overlay.addEventListener('click', handleOverlayClick);
}

// Boşluk popup'ını kapat
function closeSpacingPopup() {
    const popup = document.getElementById('spacing-measurement-popup');
    const overlay = document.getElementById('spacing-popup-overlay');
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    
    currentSpacingPosition = null;
}

// Boşluk input'unu temizle
function clearSpacingInput() {
    const input = document.getElementById('spacing-input');
    if (input) input.value = '';
    input.focus();
}

// Boşluk ölçümünü kaydet
function saveSpacingMeasurement() {
    const input = document.getElementById('spacing-input');
    const value = input.value.trim();
    
    if (!currentSpacingPosition) return;
    
    // Validation: Format kontrolü (0.x veya sayı)
    if (value === '') {
        // Ölçümü sil
        delete spacingMeasurements[currentSpacingPosition];
    } else if (!isValidSpacingValue(value)) {
        alert('Lütfen geçerli bir ölçüm girin (0-2 mm arası, örn: 0.5, 1, 1.5)');
        return;
    } else {
        // Ölçümü kaydet
        spacingMeasurements[currentSpacingPosition] = parseFloat(value).toFixed(1);
    }
    
    // UI'yi güncelle
    updateSpacingButtonStates();
    updateSpacingDisplay();
    updateSeffafOutput();
    
    closeSpacingPopup();
}

// Boşluk değerinin geçerliliğini kontrol et
function isValidSpacingValue(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 2;
}

// Boşluk butonlarının durumunu güncelle
function updateSpacingButtonStates() {
    const buttons = document.querySelectorAll('.interdental-spacing-btn');
    buttons.forEach(btn => {
        const position = btn.getAttribute('data-position');
        if (spacingMeasurements[position]) {
            btn.classList.add('spacing-measured');
            btn.textContent = spacingMeasurements[position];
        } else {
            btn.classList.remove('spacing-measured');
            btn.textContent = '•';
        }
    });
}

// Boşluk display'ını güncelle
function updateSpacingDisplay() {
    const display = document.getElementById('spacing-measure-display');
    if (!display) return;
    
    const measurements = Object.entries(spacingMeasurements);
    if (measurements.length === 0) {
        display.textContent = 'Henüz ölçüm yapılmadı';
        display.style.color = '#999';
    } else {
        const summary = measurements
            .map(([pos, value]) => `${pos}: ${value}mm`)
            .join(', ');
        display.textContent = summary;
        display.style.color = '#333';
    }
}

// Tüm boşluk ölçümlerini temizle
function clearAllSpacingMeasurements() {
    spacingMeasurements = {};
    updateSpacingButtonStates();
    updateSpacingDisplay();
    updateSeffafOutput();
}

// Dişler arası boşluk event listeners'ı başlat
function initializeSpacingListeners() {
    const spacingButtons = document.querySelectorAll('.interdental-spacing-btn');
    spacingButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const position = this.getAttribute('data-position');
            openSpacingPopup(position);
        });
    });
    
    const clearBtn = document.getElementById('spacing-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllSpacingMeasurements);
    }
}

// Minivida Işlemleri
function toggleMinividaInput() {
    const container = document.getElementById('minivida-input-container');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        document.getElementById('minivida-tooth-x').focus();
    } else {
        container.style.display = 'none';
    }
}

function applyMinividaRange() {
    const toothX = document.getElementById('minivida-tooth-x').value;
    const toothY = document.getElementById('minivida-tooth-y').value;
    
    if (!toothX || !toothY) {
        alert('Lütfen her iki diş numarasını girin!');
        return;
    }
    
    const xNum = parseInt(toothX);
    const yNum = parseInt(toothY);
    
    if (isNaN(xNum) || isNaN(yNum) || xNum < 11 || xNum > 48 || yNum < 11 || yNum > 48) {
        alert('Lütfen geçerli diş numaraları girin (11-48)!');
        return;
    }
    
    if (xNum === yNum) {
        alert('Farklı diş numaraları seçmelisiniz!');
        return;
    }
    
    // Minivida aralığını state'e kaydet
    multiToothSelection.minividaRange = {
        x: xNum,
        y: yNum
    };
    
    // Input'u temizle ve kapat
    document.getElementById('minivida-tooth-x').value = '';
    document.getElementById('minivida-tooth-y').value = '';
    document.getElementById('minivida-input-container').style.display = 'none';
    
    // İşlem seçimi butonlarını aktif et
    updateProcedureButtonsState();
    
    // Mesajı göster
    const messageEl = document.getElementById('minivida-message');
    messageEl.textContent = `${xNum}-${yNum} arasındaki minivida seçildi. Şimdi diş seçin ve işlem seçin.`;
    messageEl.style.display = 'block';
}

function cancelMinividaInput() {
    document.getElementById('minivida-tooth-x').value = '';
    document.getElementById('minivida-tooth-y').value = '';
    document.getElementById('minivida-input-container').style.display = 'none';
    document.getElementById('minivida-message').style.display = 'none';
}

// Minivida seçimi temizle
function clearMinividaSelection() {
    multiToothSelection.minividaRange = null;
}

// Power Arm Fonksiyonları
function togglePowerArmInput() {
    const container = document.getElementById('power-arm-input-container');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        document.getElementById('power-arm-tooth-x').focus();
    } else {
        container.style.display = 'none';
    }
}

function applyPowerArm() {
    const toothX = document.getElementById('power-arm-tooth-x').value;
    const toothY = document.getElementById('power-arm-tooth-y').value;
    
    if (!toothX || !toothY) {
        alert('Lütfen her iki diş numarasını girin!');
        return;
    }
    
    const xNum = parseInt(toothX);
    const yNum = parseInt(toothY);
    
    if (isNaN(xNum) || isNaN(yNum) || xNum < 11 || xNum > 48 || yNum < 11 || yNum > 48) {
        alert('Lütfen geçerli diş numaraları girin (11-48)!');
        return;
    }
    
    if (xNum === yNum) {
        alert('Farklı diş numaraları seçmelisiniz!');
        return;
    }
    
    // Power Arm aralığını state'e kaydet
    multiToothSelection.powerArm = {
        x: xNum,
        y: yNum
    };
    
    // Input'u temizle ve kapat
    document.getElementById('power-arm-tooth-x').value = '';
    document.getElementById('power-arm-tooth-y').value = '';
    document.getElementById('power-arm-input-container').style.display = 'none';
    
    // İşlem seçimi butonlarını aktif et
    updateProcedureButtonsState();
    
    // Mesajı göster
    const messageEl = document.getElementById('power-arm-message');
    messageEl.textContent = `${xNum}-${yNum} arasındaki power arm seçildi.`;
    messageEl.style.display = 'block';
}

function cancelPowerArmInput() {
    document.getElementById('power-arm-tooth').value = '';
    document.getElementById('power-arm-input-container').style.display = 'none';
}

// Export için global olarak ayarla
window.openSpacingPopup = openSpacingPopup;
window.closeSpacingPopup = closeSpacingPopup;
window.clearSpacingInput = clearSpacingInput;
window.saveSpacingMeasurement = saveSpacingMeasurement;
window.clearAllSpacingMeasurements = clearAllSpacingMeasurements;
window.toggleMinividaInput = toggleMinividaInput;
window.applyMinividaRange = applyMinividaRange;
window.cancelMinividaInput = cancelMinividaInput;
window.togglePowerArmInput = togglePowerArmInput;
window.applyPowerArm = applyPowerArm;
window.cancelPowerArmInput = cancelPowerArmInput;

// ===== OTOMATIK KAYDETME SİSTEMİ (4 SANIYE) =====
let lastSaveTime = 0;
let saveInProgress = false;

// Tüm verileri localStorage'a kaydet
function saveFormDataToLocalStorage() {
    if (saveInProgress) return;
    
    saveInProgress = true;
    
    try {
        const formData = {
            answers: answers || {},
            telAnswers: telAnswers || {},
            numberInputs: numberInputs || {},
            frezIslemleri: {
                selectedTeeth: Array.from(frezIslemleri.selectedTeeth || []),
                operations: frezIslemleri.operations || {}
            },
            currentWires: currentWires || {},
            wireBends: wireBends || {},
            interbendData: interbendData || {},
            telProcedures: telProcedures || {},
            currentProcedureSelection: currentProcedureSelection || {},
            multiToothSelection: multiToothSelection || {},
            elasticSelections: elasticSelections || {},
            nextElasticSelections: nextElasticSelections || {},
            spacingMeasurements: spacingMeasurements || {},
            spacingList: spacingList || [],
            elasticParameters: elasticParameters || {},
            elasticList: elasticList || [],
            elasticNeedCalculation: elasticNeedCalculation || {},
            selectedSokum: selectedSokum || null,
            minividaRemovals: minividaRemovals || [],
            yediDahilSelection: yediDahilSelection || {},
            plannedProceduresText: plannedProceduresText || '',
            fullArchBends: fullArchBends || {},
            selectedInterdentalSpaces: Array.from(selectedInterdentalSpaces || []),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('ortodontiFormData', JSON.stringify(formData));
        console.log('✅ Form verileri kaydedildi:', new Date().toLocaleTimeString(), 'Toplam:', Object.keys(formData).length, 'alan');
        
        // Başarı notification'ı göster
        showSaveNotification();
        lastSaveTime = Date.now();
        
    } catch (e) {
        console.error('❌ LocalStorage kaydı başarısız:', e.message);
    } finally {
        saveInProgress = false;
    }
}

// LocalStorage'dan verileri geri yükle
function restoreFormDataFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('ortodontiFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Tüm verileri global değişkenlere geri yükle
            answers = formData.answers || {};
            telAnswers = formData.telAnswers || {};
            numberInputs = formData.numberInputs || {};
            
            // Frez işlemleri geri yükle
            if (formData.frezIslemleri) {
                frezIslemleri.selectedTeeth = new Set(formData.frezIslemleri.selectedTeeth || []);
                frezIslemleri.operations = formData.frezIslemleri.operations || {};
            }
            
            currentWires = formData.currentWires || {};
            wireBends = formData.wireBends || {};
            interbendData = formData.interbendData || {};
            telProcedures = formData.telProcedures || {};
            currentProcedureSelection = formData.currentProcedureSelection || {};
            multiToothSelection = formData.multiToothSelection || {};
            elasticSelections = formData.elasticSelections || {};
            nextElasticSelections = formData.nextElasticSelections || {};
            spacingMeasurements = formData.spacingMeasurements || {};
            spacingList = formData.spacingList || [];
            elasticParameters = formData.elasticParameters || {};
            elasticList = formData.elasticList || [];
            elasticNeedCalculation = formData.elasticNeedCalculation || {};
            selectedSokum = formData.selectedSokum || null;
            minividaRemovals = formData.minividaRemovals || [];
            yediDahilSelection = formData.yediDahilSelection || {};
            plannedProceduresText = formData.plannedProceduresText || '';
            fullArchBends = formData.fullArchBends || {};
            selectedInterdentalSpaces = new Set(formData.selectedInterdentalSpaces || []);
            
            console.log('✅ Form verileri geri yüklendi - Kayıt tarihi:', formData.timestamp);
            
            // UI'ı güncelle
            updateAllOutputs();
            
            return true;
        } else {
            console.log('ℹ️ LocalStorage\'da kaydedilmiş veri bulunamadı');
        }
    } catch (e) {
        console.error('❌ LocalStorage geri yükleme başarısız:', e.message);
    }
    
    return false;
}

// Başarı notification'ı göster
function showSaveNotification() {
    const notification = document.getElementById('save-notification');
    if (notification) {
        notification.style.display = 'flex';
        
        // 2 saniye sonra gizle
        setTimeout(function() {
            notification.style.display = 'none';
        }, 2000);
    }
}

// Tüm UI outputlarını güncelle
function updateAllOutputs() {
    try {
        // ÖNCE butonları restore et
        // Adaptasyon ve ataşman butonlarını restore et
        restoreToothSelections();
        
        // Frez işlemleri butonlarını restore et
        restoreFrezSelections();
        
        // Lastik hayvan seçimlerini restore et
        restoreElasticAnimalSelections();
        
        // SONRA outputları güncelle
        // Şeffaf Plak sekmesi
        if (typeof updateToothOutput === 'function') {
            updateToothOutput('adaptasyon');
            updateToothOutput('atasmanlar');
        }
        
        // Tel sekmesi
        if (typeof updateWireSelection === 'function') {
            updateWireSelection();
        }
        if (typeof updateSelectedTeethDisplay === 'function') {
            updateSelectedTeethDisplay();
        }
        
        // Plak durum kutusunu güncelle
        if (typeof updatePlakStatusBox === 'function') {
            updatePlakStatusBox();
        }
        
        // Number displays'ı güncelle
        if (typeof updateNumberDisplays === 'function') {
            updateNumberDisplays();
        }
    } catch (e) {
        console.error('UI güncelleme hatası:', e);
    }
}

// Diş seçimlerini restore et (adaptasyon ve ataşmanlar)
function restoreToothSelections() {
    console.log('🔄 restoreToothSelections çağrıldı');
    console.log('  answers:', answers);
    
    // Adaptasyon dişlerini restore et
    if (answers['adaptasyon']) {
        const adaptasyonText = answers['adaptasyon'];
        console.log('  Adaptasyon text:', adaptasyonText);
        const match = adaptasyonText.match(/(\d+)/g);
        if (match) {
            console.log('  Restore edilecek adaptasyon dişleri:', match);
            match.forEach(tooth => {
                const btn = document.querySelector(`.tooth-btn-fdi[data-question="adaptasyon"][data-tooth="${tooth}"]`);
                if (btn) {
                    btn.classList.add('selected');
                    console.log('    ✅ Diş', tooth, 'restore edildi');
                } else {
                    console.log('    ❌ Diş', tooth, 'için buton bulunamadı');
                }
            });
        }
    } else {
        console.log('  ℹ️ Adaptasyon verisi yok');
    }
    
    // Ataşman dişlerini restore et
    if (answers['atasmanlar']) {
        const atasmanText = answers['atasmanlar'];
        console.log('  Ataşman text:', atasmanText);
        const match = atasmanText.match(/(\d+)/g);
        if (match) {
            console.log('  Restore edilecek ataşman dişleri:', match);
            match.forEach(tooth => {
                const btn = document.querySelector(`.tooth-btn-fdi[data-question="atasmanlar"][data-tooth="${tooth}"]`);
                if (btn) {
                    btn.classList.add('selected');
                    console.log('    ✅ Diş', tooth, 'restore edildi');
                } else {
                    console.log('    ❌ Diş', tooth, 'için buton bulunamadı');
                }
            });
        }
    } else {
        console.log('  ℹ️ Ataşman verisi yok');
    }
}

// Frez işlemleri seçimlerini restore et
function restoreFrezSelections() {
    console.log('🔄 restoreFrezSelections çağrıldı');
    console.log('  frezIslemleri:', frezIslemleri);
    
    if (frezIslemleri.selectedTeeth && frezIslemleri.selectedTeeth.size > 0) {
        console.log('  Restore edilecek frez dişleri:', Array.from(frezIslemleri.selectedTeeth));
        frezIslemleri.selectedTeeth.forEach(tooth => {
            const btn = document.querySelector(`#frez-islem-chart .frez-tooth[data-tooth="${tooth}"]`);
            if (btn) {
                btn.classList.add('frez-selected');
                console.log('    ✅ Frez diş', tooth, 'restore edildi');
            } else {
                console.log('    ❌ Frez diş', tooth, 'için buton bulunamadı');
            }
        });
        
        // "İşlem Seç" butonunu etkinleştir
        const openPopupBtn = document.getElementById('open-frez-popup-btn');
        if (openPopupBtn) {
            openPopupBtn.disabled = false;
            console.log('  ✅ İşlem Seç butonu etkinleştirildi');
        }
    } else {
        console.log('  ℹ️ Frez işlemi verisi yok');
    }
}

// Lastik hayvan seçimlerini restore et
function restoreElasticAnimalSelections() {
    console.log('🔄 restoreElasticAnimalSelections çağrıldı');
    
    // Mevcut lastikler (elasticSelections)
    Object.keys(elasticSelections).forEach(direction => {
        if (elasticSelections[direction] && elasticSelections[direction].types) {
            Object.keys(elasticSelections[direction].types).forEach(elasticType => {
                const typeData = elasticSelections[direction].types[elasticType];
                if (typeData && typeData.animal) {
                    const tabType = 'seffaf'; // veya 'tel' - her ikisi de aynı hayvan butonlarını kullanıyor
                    const animalKey = tabType + '-' + direction + '-' + elasticType;
                    const selectedBtn = document.querySelector('.animal-btn[data-animal-key="' + animalKey + '"][data-animal="' + typeData.animal + '"]');
                    if (selectedBtn) {
                        selectedBtn.classList.add('selected');
                        console.log('  ✅ Mevcut lastik hayvan restore edildi:', direction, elasticType, typeData.animal);
                    }
                }
            });
        }
    });
    
    // Sonraki seans lastikleri (nextElasticSelections)
    Object.keys(nextElasticSelections).forEach(directionKey => {
        if (nextElasticSelections[directionKey] && nextElasticSelections[directionKey].types) {
            const direction = directionKey.replace('-next', '');
            Object.keys(nextElasticSelections[directionKey].types).forEach(elasticType => {
                const typeData = nextElasticSelections[directionKey].types[elasticType];
                if (typeData && typeData.animal) {
                    const tabType = 'seffaf-next'; // veya 'tel-next'
                    const animalKey = tabType + '-' + direction + '-' + elasticType;
                    const selectedBtn = document.querySelector('.animal-btn[data-animal-key="' + animalKey + '"][data-animal="' + typeData.animal + '"]');
                    if (selectedBtn) {
                        selectedBtn.classList.add('selected');
                        console.log('  ✅ Sonraki lastik hayvan restore edildi:', directionKey, elasticType, typeData.animal);
                    }
                }
            });
        }
    });
}

// Sayfa yüklendiğinde otomatik geri yükleme
window.addEventListener('load', function() {
    console.log('Sayfa yüklendi - Form verileri kontrol ediliyor...');
    
    // Eğer localStorage'da veri varsa geri yükle
    restoreFormDataFromLocalStorage();
    
    // 4 saniyede bir otomatik kaydet başlat
    setInterval(function() {
        saveFormDataToLocalStorage();
    }, 4000);
});

window.saveFormDataToLocalStorage = saveFormDataToLocalStorage;
window.restoreFormDataFromLocalStorage = restoreFormDataFromLocalStorage;
window.showSaveNotification = showSaveNotification;

// ===== STICKY NAVIGATION FUNCTIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // Sticky navigation butonlarına tıklama eventi ekle
    const navButtons = document.querySelectorAll('.nav-item');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Smooth scroll ile ilgili bölüme git
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Kısa bir vurgu efekti
                targetElement.style.transition = 'all 0.3s ease';
                targetElement.style.backgroundColor = 'var(--primary-50)';
                targetElement.style.boxShadow = '0 0 0 3px var(--primary-200)';
                
                setTimeout(() => {
                    targetElement.style.backgroundColor = '';
                    targetElement.style.boxShadow = '';
                }, 1000);
            }
        });
    });
    
    // Tab değiştiğinde navigasyonları göster/gizle
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Tüm navigasyonları gizle
            document.querySelectorAll('.sticky-nav, .sticky-nav-bottom').forEach(nav => {
                nav.style.display = 'none';
            });
            
            // İlgili tab'ın navigasyonlarını göster
            if (tabName === 'seffaf-plak') {
                const topNav = document.getElementById('sticky-nav-plak-top');
                const bottomNav = document.getElementById('sticky-nav-plak-bottom');
                if (topNav) topNav.style.display = 'flex';
                if (bottomNav) bottomNav.style.display = 'flex';
            } else if (tabName === 'tel-tedavisi') {
                const topNav = document.getElementById('sticky-nav-tel-top');
                const bottomNav = document.getElementById('sticky-nav-tel-bottom');
                if (topNav) topNav.style.display = 'flex';
                if (bottomNav) bottomNav.style.display = 'flex';
            }
        });
    });
    
    // Sayfa yüklendiğinde aktif tab'ın navigasyonunu göster
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'seffaf-plak') {
        const topNav = document.getElementById('sticky-nav-plak-top');
        const bottomNav = document.getElementById('sticky-nav-plak-bottom');
        if (topNav) topNav.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'flex';
    }
});

// ===== FULLSCREEN MODAL FUNCTIONS =====
let currentReportElementId = null;

function openFullscreenReport(elementId) {
    const reportElement = document.getElementById(elementId);
    const modal = document.getElementById('fullscreen-modal');
    const modalBody = document.getElementById('fullscreen-report-content');
    
    if (!reportElement || !modal || !modalBody) return;
    
    const reportText = reportElement.textContent;
    
    if (!reportText || reportText.trim() === '') {
        alert('Görüntülenecek rapor bulunmuyor. Lütfen önce değerlendirme kriterlerini işaretleyin.');
        return;
    }
    
    currentReportElementId = elementId;
    modalBody.textContent = reportText;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeFullscreenReport() {
    const modal = document.getElementById('fullscreen-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scroll
    currentReportElementId = null;
}

function copyFullscreenReport() {
    const modalBody = document.getElementById('fullscreen-report-content');
    if (!modalBody) return;
    
    const text = modalBody.textContent;
    
    if (!text || text.trim() === '') {
        alert('Kopyalanacak metin bulunmuyor.');
        return;
    }
    
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccessFullscreen();
        }).catch(err => {
            // Fallback to old method
            copyWithFallback(text);
        });
    } else {
        copyWithFallback(text);
    }
}

function copyWithFallback(text) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    tempTextarea.style.position = 'fixed';
    tempTextarea.style.opacity = '0';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        if (successful) {
            showCopySuccessFullscreen();
        } else {
            alert('Kopyalama işlemi başarısız oldu.');
        }
    } catch (err) {
        document.body.removeChild(tempTextarea);
        alert('Kopyalama işlemi başarısız oldu.');
    }
}

function showCopySuccessFullscreen() {
    const footer = document.querySelector('.fullscreen-modal-footer');
    if (!footer) return;
    
    const successMsg = document.createElement('div');
    successMsg.textContent = '✓ Kopyalandı!';
    successMsg.style.cssText = 'position: absolute; background: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; animation: fadeIn 0.3s ease;';
    footer.style.position = 'relative';
    footer.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 2000);
}

// ESC tuşu ile modal'ı kapatma
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('fullscreen-modal');
        if (modal && modal.classList.contains('active')) {
            closeFullscreenReport();
        }
    }
});

// Modal dışına tıklandığında kapatma
document.getElementById('fullscreen-modal')?.addEventListener('click', function(event) {
    if (event.target === this) {
        closeFullscreenReport();
    }
});
