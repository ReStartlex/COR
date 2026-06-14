# DEPLOY — публикация на VPS и подключение домена

Сайт **статический** (HTML/CSS/JS). Его не нужно «запускать» как Node-приложение
и он **не занимает порт** — Nginx просто отдаёт файлы. Поэтому он **не конфликтует**
с вашими сайтами на `localhost:3000` и `localhost:3001`.

- **Сервер:** `194.87.143.41`
- **Домен:** `цор.online` → punycode **`xn--n1aeq.online`**
  (если домен на самом деле `тор.онлайн` → punycode `xn--n1aee.xn--80asehdb` —
  тогда подставьте его везде вместо `xn--n1aeq.online`).

---

## 0. Что важно знать про большой видеофайл

`assets/video/cikly-lecture.mp4` ≈ **114 МБ** — это больше лимита GitHub (100 МБ),
поэтому он **исключён из Git** (`.gitignore`). Его нужно загрузить на сервер отдельно
(шаг 3). Остальные файлы спокойно идут через Git.

---

## 1. Загрузка кода на сервер

Подключитесь к серверу:
```bash
ssh root@194.87.143.41
```

Создайте отдельную папку для сайта (НЕ трогаем папки существующих проектов):
```bash
mkdir -p /var/www/cor
cd /var/www/cor
```

Залейте проект из вашего репозитория:
```bash
git clone https://github.com/ReStartlex/COR.git .
```
> Если репозиторий приватный — настройте deploy key или используйте `https` с токеном.

При обновлениях в будущем: `cd /var/www/cor && git pull`.

---

## 2. (Локально) Загрузка большого видео по scp

Видео не в Git, поэтому отправьте его с компьютера напрямую в нужную папку:
```bash
scp "D:\cifrovoi_content\assets\video\cikly-lecture.mp4" root@194.87.143.41:/var/www/cor/assets/video/cikly-lecture.mp4
```
(в Git Bash/PowerShell путь со слэшами тоже подойдёт)

> Альтернатива — Git LFS: `git lfs track "*.mp4"`, тогда видео хранится в репозитории.

Проверьте, что файл на месте:
```bash
ls -lh /var/www/cor/assets/video/
```

Права на чтение для Nginx:
```bash
chown -R www-data:www-data /var/www/cor
find /var/www/cor -type d -exec chmod 755 {} \; && find /var/www/cor -type f -exec chmod 644 {} \;
```

---

## 3. Настройка Nginx (отдельный server-блок, ничего чужого не трогаем)

Создайте конфиг сайта:
```bash
nano /etc/nginx/sites-available/cor
```

Вставьте (домен уже в punycode):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name xn--n1aeq.online www.xn--n1aeq.online;

    root /var/www/cor;
    index index.html;

    # человекочитаемые URL и аккуратная 404
    location / {
        try_files $uri $uri/ =404;
    }
    error_page 404 /404.html;

    # кэширование статики (картинки, видео, css, js)
    location ~* \.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location ~* \.(?:mp4|pdf)$ {
        expires 7d;
        add_header Cache-Control "public";
        add_header Accept-Ranges bytes;   # перемотка видео
    }

    # сжатие
    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/xml text/plain;
    gzip_min_length 1024;

    access_log /var/log/nginx/cor.access.log;
    error_log  /var/log/nginx/cor.error.log;
}
```

Включите сайт и проверьте конфигурацию:
```bash
ln -s /etc/nginx/sites-available/cor /etc/nginx/sites-enabled/cor
nginx -t          # должно быть "syntax is ok" / "test is successful"
systemctl reload nginx
```
> `nginx -t` проверяет ВСЕ конфиги — если он «ok», ваши существующие сайты не задеты.

---

## 4. DNS на Reg.ru

В панели Reg.ru для домена `цор.online` укажите A-записи на IP сервера:

| Тип | Имя (host) | Значение |
|-----|------------|----------|
| A   | `@`        | `194.87.143.41` |
| A   | `www`      | `194.87.143.41` |

Сохраните. Обновление DNS обычно занимает от 10 минут до нескольких часов.

Проверка (когда применится):
```bash
ping xn--n1aeq.online
```

---

## 5. HTTPS (бесплатный сертификат Let's Encrypt)

Когда домен начал указывать на сервер:
```bash
apt update && apt install -y certbot python3-certbot-nginx
certbot --nginx -d xn--n1aeq.online -d www.xn--n1aeq.online
```
Certbot сам добавит HTTPS-блок и редирект с http на https. Автопродление:
```bash
systemctl status certbot.timer     # обычно уже активен
```

---

## 6. Проверка

Откройте в браузере:
- `https://цор.online/` — портфолио;
- `https://цор.online/course.html` — сам курс (ЦОР).

Проверьте: видео играет, инфографика и фото видны, вкладки и тест работают,
интерактивные тренажёры (LearningApps/Удоба/WordWall) загружаются.

---

## Если домен другой / меняете адрес

Замените `xn--n1aeq.online` на ваш домен в трёх местах:
1. `server_name` в `/etc/nginx/sites-available/cor`;
2. `robots.txt` и `sitemap.xml` (строки с `loc`/`Sitemap`);
3. мета-теги `og:url`, `canonical`, `og:image`, `twitter:image` в `index.html` и `course.html`.

Быстрая замена во всех файлах локально (Git Bash):
```bash
grep -rl 'xn--n1aeq.online' . --include='*.html' --include='*.xml' --include='*.txt' \
  | xargs sed -i 's/xn--n1aeq\.online/ВАШ_ПУНИКОД/g'
```

---

## Частые вопросы

- **Конфликт с сайтами на 3000/3001?** Нет. Статика отдаётся Nginx напрямую,
  без своего порта. Это просто ещё один `server`-блок по своему `server_name`.
- **Нужен ли `npm run build`?** Нет. Для продакшена достаточно файлов из репозитория.
  Vite — только для локальной разработки (порт 3002, тоже свободный).
- **Видео не играет / 404 на видео.** Значит не загрузили `cikly-lecture.mp4` (шаг 2)
  или нет прав на чтение (`chown`/`chmod`).
- **IDN-домен в certbot.** Используйте именно punycode (`xn--...`), а не кириллицу.
