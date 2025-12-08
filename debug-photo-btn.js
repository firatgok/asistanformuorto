// Tarayıcı konsoluna kopyala yapıştır
console.log('Photo butonları aranıyor...');
const photoButtons = document.querySelectorAll('.photo-btn');
console.log('Toplam photo buton sayısı:', photoButtons.length);

photoButtons.forEach((btn, index) => {
    console.log(`Buton ${index + 1}:`, btn);
    console.log('- Parent:', btn.parentElement);
    console.log('- Display:', getComputedStyle(btn).display);
    console.log('- Visibility:', getComputedStyle(btn).visibility);
    console.log('- Opacity:', getComputedStyle(btn).opacity);
    console.log('- Position:', getComputedStyle(btn).position);
    console.log('- Z-index:', getComputedStyle(btn).zIndex);
    
    // Butonu kırmızı yap
    btn.style.background = 'red';
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.display = 'inline-block';
    btn.style.position = 'relative';
    btn.style.zIndex = '99999';
});