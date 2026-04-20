# Netlify Manuel Deploy Klasörü

Bu klasör Netlify'a manuel deploy yapmak için hazırlanmıştır.

## 📦 İçerik

- `index.html` - Ana sayfa
- `style.css` - Stil dosyası
- `script.js` - JavaScript dosyası
- `images/` - Görsel dosyaları
- `netlify.toml` - Netlify konfigürasyonu

## 🚀 Deploy Adımları

### Yöntem 1: Netlify Drop (En Kolay)

1. [Netlify](https://app.netlify.com/) sitesine giriş yapın
2. "Sites" > "Add new site" > "Deploy manually" seçin
3. Bu klasörü sürükleyip bırakın (drag & drop)
4. Deploy işlemi otomatik başlayacak

### Yöntem 2: Netlify CLI

```bash
# Netlify CLI'yi yükleyin (ilk seferlik)
npm install -g netlify-cli

# Bu klasöre gidin
cd netlify-deploy

# Netlify'a giriş yapın
netlify login

# Deploy yapın
netlify deploy --prod
```

## ⚙️ Konfigürasyon

`netlify.toml` dosyası şu özellikleri içerir:
- Güvenlik başlıkları (X-Frame-Options, X-Content-Type-Options)
- Cache kontrolü (CSS/JS için 1 yıl, HTML için her zaman fresh)
- SPA routing desteği

## 📝 Notlar

- Deploy sonrası siteniz `https://YOUR-SITE-NAME.netlify.app` adresinde yayınlanacak
- Özel domain bağlamak için Netlify dashboard'dan "Domain settings" kullanın
- Her dosya değişikliğinde bu klasörü tekrar deploy etmelisiniz
