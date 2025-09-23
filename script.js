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
        });
    });

    // Initialize checkbox event listeners
    initializeCheckboxListeners();
});

function initializeCheckboxListeners() {
    // Initialize option buttons for şeffaf plak
    const seffafButtons = document.querySelectorAll('#seffaf-plak .option-btn');
    seffafButtons.forEach(button => {
        button.addEventListener('click', handleOptionButtonClick);
    });

    // Initialize number buttons
    const numberButtons = document.querySelectorAll('#seffaf-plak .number-btn');
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberButtonClick);
    });

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
    const questionSection = button.closest('.number-selector-section');
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
    
    const answers = {};
    
    // Handle regular option buttons
    selectedButtons.forEach(button => {
        const question = button.dataset.question;
        const value = button.dataset.value;
        answers[question] = value;
    });
    
    // Handle önceki seans number selector
    const oncekiOnlar = document.querySelector('.number-btn[data-question="onceki-seans-onlar"].selected');
    const oncekiBirler = document.querySelector('.number-btn[data-question="onceki-seans-birler"].selected');
    
    if (oncekiOnlar && oncekiBirler) {
        const combinedNumber = oncekiOnlar.dataset.value + oncekiBirler.dataset.value;
        answers['onceki-seans'] = `${combinedNumber} numaralı plağa kadar verilmişti`;
    }
    
    // Handle mevcut plak number selector
    const mevcutOnlar = document.querySelector('.number-btn[data-question="mevcut-plak-onlar"].selected');
    const mevcutBirler = document.querySelector('.number-btn[data-question="mevcut-plak-birler"].selected');
    
    if (mevcutOnlar && mevcutBirler) {
        const combinedNumber = mevcutOnlar.dataset.value + mevcutBirler.dataset.value;
        answers['mevcut-plak'] = `${combinedNumber} numaralı plakta`;
    }
    
    // Handle verilecek plak number selector
    const verilecekOnlar = document.querySelector('.number-btn[data-question="verilecek-plak-onlar"].selected');
    const verilecekBirler = document.querySelector('.number-btn[data-question="verilecek-plak-birler"].selected');
    
    if (verilecekOnlar && verilecekBirler) {
        const combinedNumber = verilecekOnlar.dataset.value + verilecekBirler.dataset.value;
        answers['verilecek-plak'] = `${combinedNumber} adet plak verildi`;
    }
    
    const output = generateSeffafReport(answers);
    outputElement.value = output;
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
    if (Object.keys(answers).length === 0) {
        return '';
    }

    let report = 'ŞEFFAF PLAK TEDAVİSİ KONTROL RAPORU\n';
    report += '=============================================\n\n';
    
    // RUTİN KONTROLLER bölümü
    if (Object.keys(answers).some(key => ['onceki-seans', 'mevcut-plak', 'verilecek-plak', 'ipr-durum', 'adaptasyon', 'atasmanlar', 'lastik-tur', 'lastik-sure'].includes(key))) {
        report += 'RUTİN KONTROLLER:\n';
        report += '-----------------\n';
        
        if (answers['onceki-seans']) {
            report += `• Önceki seansta ${answers['onceki-seans']}\n`;
        }
        
        if (answers['mevcut-plak']) {
            report += `• Hasta şu an ${answers['mevcut-plak']}\n`;
        }
        
        if (answers['verilecek-plak']) {
            report += `• Bu seansta ${answers['verilecek-plak']}\n`;
        }
        
        if (answers['ipr-durum']) {
            report += `• ${answers['ipr-durum']}\n`;
        }
        
        if (answers['adaptasyon']) {
            report += `• Plak adaptasyonu: ${answers['adaptasyon']}\n`;
        }
        
        if (answers['atasmanlar']) {
            report += `• Ataşman durumu: ${answers['atasmanlar']}\n`;
        }
        
        if (answers['lastik-tur']) {
            report += `• Lastik durumu: ${answers['lastik-tur']}\n`;
        }
        
        if (answers['lastik-sure']) {
            report += `• ${answers['lastik-sure']} önerildi\n`;
        }
        
        report += '\n';
    }
    
    // MOTİVASYON bölümü
    if (Object.keys(answers).some(key => ['lastik-aksama', 'plak-aksama', 'plak-temizlik', 'agiz-hijyen'].includes(key))) {
        report += 'MOTİVASYON VE UYUM DEĞERLENDİRMESİ:\n';
        report += '-----------------------------------\n';
        
        if (answers['lastik-aksama']) {
            report += `• ${answers['lastik-aksama']}\n`;
        }
        
        if (answers['plak-aksama']) {
            report += `• ${answers['plak-aksama']}\n`;
        }
        
        if (answers['plak-temizlik']) {
            report += `• ${answers['plak-temizlik']}\n`;
        }
        
        if (answers['agiz-hijyen']) {
            report += `• ${answers['agiz-hijyen']}\n`;
        }
        
        report += '\n';
    }
    
    // Genel değerlendirme
    report += 'GENEL DEĞERLENDİRME:\n';
    report += '--------------------\n';
    
    // Otomatik öneriler
    if (answers['plak-aksama'] && answers['plak-aksama'].includes('10 saatten az')) {
        report += '• Hasta motivasyonu artırılmalı, plak kullanım süresi yetersiz\n';
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

function showCopySuccess(elementId) {
    const copyBtn = document.querySelector(`#${elementId} + .copy-btn`);
    if (!copyBtn) {
        // Find the copy button in the same container
        const container = document.getElementById(elementId).parentElement;
        const copyButton = container.querySelector('.copy-btn');
        if (copyButton) {
            showButtonSuccess(copyButton);
        }
    } else {
        showButtonSuccess(copyBtn);
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
