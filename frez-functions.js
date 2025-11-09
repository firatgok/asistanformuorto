// FREZ ISLEMLERI FUNCTIONS

const frezIslemleri = {
    selectedTeeth: new Set(),
    operations: {}
};

function openFrezPopup(tooth) {
    const toothNum = parseInt(tooth);
    if (frezIslemleri.selectedTeeth.has(toothNum)) {
        frezIslemleri.selectedTeeth.delete(toothNum);
        const btn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
        if (btn) btn.classList.remove('frez-selected');
    } else {
        frezIslemleri.selectedTeeth.add(toothNum);
        const btn = document.querySelector('#frez-islem-chart .frez-tooth[data-tooth="' + tooth + '"]');
        if (btn) btn.classList.add('frez-selected');
    }
    if (frezIslemleri.selectedTeeth.size > 0) {
        document.getElementById('frez-popup').style.display = 'block';
        document.getElementById('frez-popup-overlay').style.display = 'block';
        updateFrezPopupButtons();
    } else {
        closeFrezPopup();
    }
}

function updateFrezPopupButtons() {
    const buttons = document.querySelectorAll('.frez-option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    if (frezIslemleri.selectedTeeth.size === 1) {
        const tooth = Array.from(frezIslemleri.selectedTeeth)[0];
        const operations = frezIslemleri.operations[tooth] || [];
        operations.forEach(action => {
            const btn = document.querySelector('.frez-option-btn[data-action="' + action + '"]');
            if (btn) btn.classList.add('selected');
        });
    }
    buttons.forEach(btn => {
        btn.onclick = function() { this.classList.toggle('selected'); };
    });
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
    closeFrezPopup();
    updateSeffafOutput();
}

function closeFrezPopup() {
    document.getElementById('frez-popup').style.display = 'none';
    document.getElementById('frez-popup-overlay').style.display = 'none';
    frezIslemleri.selectedTeeth.clear();
    document.querySelectorAll('#frez-islem-chart .frez-tooth').forEach(btn => {
        btn.classList.remove('frez-selected');
    });
}

function updateFrezSummary() {
    const summaryList = document.getElementById('frez-summary-list');
    if (Object.keys(frezIslemleri.operations).length === 0) {
        summaryList.innerHTML = '<li class="no-selection">Henuz islem secilmedi</li>';
        return;
    }
    let html = '';
    Object.entries(frezIslemleri.operations).forEach(([tooth, actions]) => {
        const teethText = tooth;
        const actionTexts = actions.map(a => getFrezActionText(a));
        const actionText = actionTexts.join(', ');
        html += '<li><strong>' + teethText + ':</strong> ' + actionText + '</li>';
    });
    html += '';
    summaryList.innerHTML = html;
}

function getFrezActionText(action) {
    const texts = {
        'plakta-kes': 'Plakta kes',
        'hassas-kesi-ac': 'Hassas kesi ac',
        'hassas-kesi-derinlestir': 'Hassas kesiyi derinlestir',
        'ikili-lastik-kesisi': 'Ikili lastik kesisi ac',
        'buton-kesisi-ac': 'Buton kesisi ac',
        'buton-kesisi-derinlestir': 'Buton kesisini derinlestir',
        'pontik-servikal-duzle': 'Pontiklerin servikalini duzle',
        'pontik-okluzal-trasla': 'Pontikleri okluzalden trasla',
        'okluzal-yukselticiler-kes': 'Okluzal yukselticileri plakta kes'
    };
    return texts[action] || action;
}

function clearFrezSelections() {
    frezIslemleri.operations = {};
    frezIslemleri.selectedTeeth.clear();
    document.querySelectorAll('#frez-islem-chart .frez-tooth').forEach(btn => {
        btn.classList.remove('has-frez-operation');
    });
    updateFrezSummary();
    updateSeffafOutput();
}

function generateFrezReportText() {
    if (Object.keys(frezIslemleri.operations).length === 0) return '';
    let reportText = '\n--- HER PLAKTA FREZLE YAPILACAK ISLEMLER ---\n';
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
    const disText = isSingle ? 'disi' : 'disleri';
    const disteText = isSingle ? 'diste' : 'dislerde';
    const diseText = isSingle ? 'dise' : 'dislere';
    const pontikleriText = isSingle ? 'pontigi' : 'pontikleri';
    const texts = {
        'plakta-kes': teethText + ' ' + disText + ' plakta kes',
        'hassas-kesi-ac': teethText + ' ' + diseText + ' hassas kesi ac',
        'hassas-kesi-derinlestir': teethText + ' ' + disteText + ' hassas kesiyi derinlestir',
        'ikili-lastik-kesisi': teethText + ' ' + diseText + ' ikili lastik kesisi ac',
        'buton-kesisi-ac': teethText + ' ' + diseText + ' buton kesisi ac',
        'buton-kesisi-derinlestir': teethText + ' ' + disteText + ' buton kesisini derinlestir',
        'pontik-servikal-duzle': teethText + ' ' + disteText + ' pontiklerin servikalini duzle',
        'pontik-okluzal-trasla': teethText + ' ' + pontikleriText + ' okluzalden trasla',
        'okluzal-yukselticiler-kes': teethText + ' okluzal yukselticileri plakta kes'
    };
    return texts[action] || action;
}

window.openFrezPopup = openFrezPopup;
window.closeFrezPopup = closeFrezPopup;
window.applyFrezSelections = applyFrezSelections;
window.clearFrezSelections = clearFrezSelections;
