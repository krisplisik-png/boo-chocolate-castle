# Подключённые иллюстрации и обработка сундука

Оригиналы файлов не перезаписывались.

- `public/assets/chest-art.png` — копия сундука из Downloads, исходный файл `Изображение ChatGPT 15 окт. 2026 г., 15_46_20-1.png`.
- `public/assets/chest-cutout.png` — вариант сундука с прозрачным фоном, подготовленный встроенным imagegen. Крышка и корпус анимируются отдельно через CSS clip-path, карточка — отдельный canvas.
- `public/assets/reward-art.png` — ваша карточка `Изображение ChatGPT 15 окт. 2026 г., 15_46_22-2.png`. Номер и название студии рисуются на canvas и попадают в скачиваемый PNG 1254×1254.
- `public/assets/medal-art.png` — ваша «Волшебная шоколадная медаль с призраком». Используется в пяти индикаторах задания, общем счётчике, эффектах получения и финале.

Режим обработки: встроенный imagegen, редактирование исходного изображения, прозрачный фон. Финальный prompt:

> Use case: background-extraction. Edit target: the provided purple and gold autumn magic treasure chest. Remove only the cream background and ground plane, output the same chest as a clean alpha-transparent game sprite. Keep the exact chest shape, gold star clasp, moon ornament, leaves, viewing angle, composition, scale, slightly open lid and magical glow unchanged. Keep the chest at the same position within a square canvas with identical framing so CSS animation layers can align. No added text, no extra props, no new design. Preserve full chest and its sparkles. Actual transparent background.
