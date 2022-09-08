### [**简体中文**](https://github.com/leoding86/pixiv-omina/blob/master/README_zh-CN.md) | [**English**](https://github.com/leoding86/pixiv-omina/blob/master/README.md) | Türkçe

---

<h1 style="text-align:center">
<img src="./build/icon.png" width=200><br>
Pixiv Omina
</h1>

Pixiv Omina, Pixiv'deki eserleri indirmek için bir yazılımdır. Basit ve kullanımı kolaydır. [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit) kullanıcısıysanız daha da iyidir, tıkla ve indir özelliğini kullanabilirsiniz.

Pixiv Omina [Electron](https://electronjs.org/) tarafından yapılmıştır.

# Platformlar💻

Windows 10'da (1903) test edin. Teorik olarak, derleyebilirseniz Mac ve Linux üzerinde çalışabilir.

# Özellikler✨

* Kolay Kullanıcı Arayüzü
* Ugoira çalışması için otomatik olarak gif oluşturun ve çerçeve bilgilerini zip dosyasına paketleyin
* Kullanıcının tüm çalışmalarını indirin (indirme iletişim kutusuna kullanıcı profili url'sini girin)
* Yeniden adlandırma ayarlarını kullanarak otomatik yeniden adlandırma
* Uygulama yeniden başlatıldıktan sonra indirmeleri geri yükle
* İndirilen işleri atla, böylece işleri aşamalı olarak indirebilirsin
* Tıkla-ve-İndir ([Pixiv Toolkit'i](https://github.com/leoding86/webextension-pixiv-toolkit) tarayıcınıza indirmeniz gerek)
* Yeni sürümü otomatik olarak kontrol edin (Otomatik güncelleme yok, otomatik güncellemenin bazen can sıkıcı olabileceğini düşünüyorum)
* Tepsiyi kapatın (Bu özelliği ayar sayfasında etkinleştirmeniz gerekir)
* Http/socks proxy desteği (socks proxy'si kullanıyorsanız, şema ile proxy url'sini girmeniz gerekir)

# İndir⚓

[Releases sayfasına git](https://github.com/leoding86/pixiv-omina/releases)

# S & C ❓

S: Neden kullanamıyorum?

C: Pixiv'i ziyaret edemiyorsanız veya bir Pixiv hesabınız yoksa bunu kullanamazsınız.

S: Uygulamayı yeniden başlattığımda tamamlanan görevler neden kayboluyor?

C: Uygulama, yeniden başlatıldıktan sonra tamamlanmış indirme görevini kaldıracaktır.

S: Aynı anda 2'den fazla eser nasıl indirilir?

C: Hayır, şimdilik yapamazsınız, çünkü gif oluşturmak oldukça ağır bir iştir. Belki aynı anda kaç indirme görevinin gerçekleştirilebileceğini kontrol etmek için bir ayar eklerim.

# Bilinen Sorunlar🤔

* Çok fazla indirme EKLEMEYİN! İndirme sınırlamasını test etmedim, çok fazla indirme uygulamanın çökmesine neden olabilir. Kullanıcı çalışmalarını indirerek çok sayıda indirme görevi eklemek kolaydır (indirme iletişim kutusuna kullanıcı profili url'sini girin), bu nedenle aynı anda birden fazla kullanıcının çalışmasını indirmek gibi bu özelliği kullanırken gerçekten dikkatli olun (Bazı kullanıcıların binlerce çalışması vardır, Dikkat edin!).

* Kurulum bazen özel protokolü Windows 10'a kaydetmez. Pixiv Toolkit'in "Pixiv Omina" düğmesinin hiçbir şey yapmadığını görürseniz, `panteras81`'in `27`. sayılı [yorumuna](https://github.com/leoding86/webextension-pixiv-toolkit/issues/27#issuecomment-605540955) bakın.

Herhangi bir sorunla karşılaşırsanız veya herhangi bir fikriniz varsa konu açmaktan çekinmeyin😀

# Ekran Görüntüleri📺

Çalışma URL'sini girerek indirin

![screenshot](./screenshots/001.gif)

Dokun-ve-İndir

![screenshot](./screenshots/002.gif)

Bazı ayarlar

![screenshot](./screenshots/003.jpg)

# Geliştirme🔧

## Bağımlılıkları yükle
```bash
yarn
```

### Geliştirme kodları

```bash
# Uygulamayı geliştirici modunda çalıştırın
yarn dev

# kaynak kodunu derleyin ve web paketi çıktısı oluşturun
yarn compile

# `yarn compile` ve elektron oluşturucu ile yapı oluştur
yarn dist

# `yarn compile` ve elektron oluşturucu ile paketlenmemiş yapı oluşturun
yarn dist:dir
```
