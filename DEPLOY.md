# DEPLOY — публикация на VPS и подключение домена

Проект теперь — **Next.js-приложение** (React + backend API + SQLite через Prisma).
Оно запускается как **Node-процесс на порту 3002** под управлением **PM2**, а **Nginx**
работает как reverse-proxy и отдаёт HTTPS. Порт 3002 не конфликтует с вашими сайтами на
`localhost:3000` и `localhost:3001`.

- **Сервер:** `194.87.143.41`
- **Домен:** `цор.online` → punycode **`xn--n1aeq.online`**
- **Требуется на сервере:** Node.js **20+** и PM2 (`npm i -g pm2`).

> Прод живёт в ветке `main` (старая статика) до тех пор, пока вы не задеплоите ветку
> `lms-platform`. Когда будете готовы — слейте `lms-platform` в `main` (это делает Claude
> по вашей команде) и деплойте по инструкции ниже.

---

## 0. Большой видеофайл видеолекции

`public/assets/video/cikly-lecture.mp4` ≈ **114 МБ** — больше лимита GitHub (100 МБ),
поэтому исключён из Git. Загрузите его на сервер отдельно (шаг 4). Остальное идёт через Git.

---

## 1. Установка Node.js и PM2 (один раз)

```bash
ssh root@194.87.143.41
# Node 20 LTS (если ещё не стоит)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
npm i -g pm2
node -v   # должно быть v20+
```

---

## 2. Загрузка кода

```bash
mkdir -p /var/www/cor && cd /var/www/cor
git clone https://github.com/ReStartlex/COR.git .
git checkout lms-platform     # ветка с новой платформой (пока не слита в main)
```
Обновления в будущем: `cd /var/www/cor && git pull`.

---

## 3. Настройка окружения и БД

Создайте `.env` (он в `.gitignore`, поэтому его нет в репозитории):
```bash
echo 'DATABASE_URL="file:./prod.db"' > /var/www/cor/.env
```

Установите зависимости, создайте таблицы БД и соберите проект:
```bash
cd /var/www/cor
npm ci                 # установка зависимостей (prisma generate выполнится автоматически)
npx prisma db push     # создаёт prod.db со схемой (StudentProfile, TaskProgress)
npm run build          # prisma generate + next build
```

> `prod.db` (файл SQLite) хранит профиль студента и статусы «прочитано». Он создаётся на
> сервере и **не перезаписывается** при `git pull` (в Git его нет). Бэкап — просто копия файла.

---

## 4. Загрузка большого видео по scp (локально)

```bash
scp "D:\cifrovoi_content\public\assets\video\cikly-lecture.mp4" \
    root@194.87.143.41:/var/www/cor/public/assets/video/cikly-lecture.mp4
```
Проверка: `ls -lh /var/www/cor/public/assets/video/`.

---

## 5. Запуск под PM2

```bash
cd /var/www/cor
pm2 start npm --name cor -- start      # запускает "next start -p 3002"
pm2 save                               # сохранить список процессов
pm2 startup                            # автозапуск после перезагрузки (выполните выданную команду)
```
Проверка: `pm2 status` и `curl -I http://127.0.0.1:3002` (должно быть `200 OK`).

При обновлениях:
```bash
cd /var/www/cor && git pull && npm ci && npm run build && pm2 restart cor
```

---

## 6. Nginx — reverse-proxy на порт 3002

```bash
nano /etc/nginx/sites-available/cor
```
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name xn--n1aeq.online www.xn--n1aeq.online;

    client_max_body_size 200m;   # для крупного видео

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/cor.access.log;
    error_log  /var/log/nginx/cor.error.log;
}
```
```bash
ln -s /etc/nginx/sites-available/cor /etc/nginx/sites-enabled/cor
nginx -t && systemctl reload nginx
```
> `nginx -t` проверяет ВСЕ конфиги — если «ok», существующие сайты не задеты.
> Next.js сам кэширует и сжимает статику из `public/` и `/_next/static`.

---

## 7. DNS на Reg.ru

| Тип | Имя | Значение |
|-----|-----|----------|
| A   | `@`   | `194.87.143.41` |
| A   | `www` | `194.87.143.41` |

Проверка после применения: `ping xn--n1aeq.online`.

---

## 8. HTTPS (Let's Encrypt)

```bash
apt update && apt install -y certbot python3-certbot-nginx
certbot --nginx -d xn--n1aeq.online -d www.xn--n1aeq.online
```
Certbot добавит HTTPS-блок и редирект http→https. Автопродление: `systemctl status certbot.timer`.

---

## 9. Проверка

- `https://цор.online/` — главная: профиль + список предметов;
- `https://цор.online/subjects/cifrovoi-kontent` — курс с заданиями;
- `https://цор.online/subjects/proektirovanie-obrazovatelnyh-sistem` — проектная работа с интерактивом;
- `https://цор.online/showcase/igrovye-osnovy` — премиум-витрина ЦОР (3D, тест).

Проверьте: переключение темы, раскрытие заданий, отметка «прочитано» (сохраняется после
перезагрузки — значит backend и БД работают), видео, тренажёры.

---

## Частые вопросы

- **Конфликт с сайтами на 3000/3001?** Нет. Приложение слушает 3002, Nginx проксирует по
  своему `server_name`.
- **Нужен ли `npm run build`?** Да — это Node-приложение (SSR + API). Без сборки не запустится.
- **Прогресс «прочитано» сбросился после обновления?** Не должен: `prod.db` не в Git. Если
  пересоздавали БД — сделайте бэкап `prod.db` перед экспериментами.
- **Видео 404.** Не загрузили `cikly-lecture.mp4` (шаг 4) в `public/assets/video/`.
- **Старая статика.** Лежит в ветке `main` и в `_legacy/` — как референс. Новый сайт её не использует.
