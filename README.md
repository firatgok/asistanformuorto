# Ortodonti Hasta Formu Yazılımı

Web tabanlı ortodonti hasta değerlendirme formu uygulaması.

## 🌐 Canlı Demo

Uygulamaya şu adresten erişebilirsiniz: **https://firatgok.github.io/asistanformuorto/**

## Özellikler

- **İki Ana Sekme**:
  - Şeffaf Plak Tedavisi
  - Tel Tedavisi

- **Kullanıcı Dostu Arayüz**:
  - Sol sütunda işaretleme kutuları
  - Sağ sütunda otomatik oluşturulan metin raporu
  - Tek tıkla kopyalama özelliği

- **Otomatik Kaydetme**: Seçimleriniz tarayıcıda otomatik olarak kaydedilir
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Klavye Kısayolları**: 
  - Ctrl+1: Şeffaf Plak sekmesi
  - Ctrl+2: Tel Tedavisi sekmesi

## Kullanım

1. `index.html` dosyasını herhangi bir web tarayıcısında açın
2. İstediğiniz sekmeyi seçin (Şeffaf Plak veya Tel Tedavisi)
3. Sol sütundaki kriterleri işaretleyin
4. Sağ sütunda otomatik oluşan raporu kontrol edin
5. "Kopyala" butonuna tıklayarak metni panoya kopyalayın
6. Dental bulut sistemindeki hasta dosyasına yapıştırın

## Teknik Detaylar

- **Teknolojiler**: HTML5, CSS3, JavaScript (Vanilla)
- **Bağımlılık**: Yok - herhangi bir web tarayıcısında çalışır
- **Tarayıcı Desteği**: Modern tüm tarayıcılar

## Dosya Yapısı

```
Ortodonti Form Yazılımı/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── script.js           # JavaScript işlevselliği
├── README.md           # Bu dosya
└── .github/
    └── copilot-instructions.md
```

## Özelleştirme

Yeni kriterler eklemek için:

1. `index.html` dosyasında ilgili checkbox grubuna yeni `<label>` ekleyin
2. `script.js` dosyasında `generateSeffafReport()` veya `generateTelReport()` fonksiyonlarına yeni koşullar ekleyin

## Lisans

Bu proje Dr. Fırat için özel olarak geliştirilmiştir.
