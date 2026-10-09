# Hành trình 6 năm — Quà kỷ niệm ngày cưới (bản v2)

Web tương tác tặng vợ nhân 6 năm ngày cưới (11/10/2020 → 11/10/2026).
Mở `index.html` trên điện thoại (hoặc chạy `python3 -m http.server` rồi mở bằng browser).

Design v2: nền kem + hồng phấn + vàng gold, chữ script Great Vibes,
phong bì thư mở đầu, bộ đếm ngày yêu live, cánh hoa hồng rơi,
nhạc music-box tự sinh (WebAudio, nút bật/tắt góc phải), pháo hoa màn cuối.
Font chữ tự host trong `assets/fonts/` (OFL) — chạy offline vẫn đẹp.

## Cách thay ảnh vợ chồng thật

Chỉ cần **ghi đè file** `assets/vo-chong.jpg` bằng ảnh thật (tỉ lệ vuông là đẹp nhất).
Không cần sửa code — trang finale tự load file này.

## Cách sửa lời nhắn ở màn cuối

Mở `index.html`, tìm đoạn:

```html
<p class="finale-letter">Anh yêu em<br><span class="sign">— Bật Hưng</span></p>
```

Sửa chữ "Anh yêu em" thành lời nhắn của anh.

## Font tiếng Việt

`assets/fonts/` chứa 2 subset cho mỗi font: **latin** (U+0000–00FF: có à á â ã è é ê
ì í ò ó ô õ ù ú ý — …) và **vietnamese** (có Ắ Ằ Ẳ Ẵ Ặ Đ Ơ Ư …). Trình duyệt tự chọn
file theo `unicode-range` nên mọi dấu tiếng Việt đều đúng font, không bị rớt font.
(Ký tự ♥ ở finale đã thay bằng SVG vẽ tay vì font không có U+2665.)

## Sprite chibi

`assets/cap-doi-chibi.webp` — ảnh AI vẽ cặp đôi chibi: chú rể áo dài navy khăn đóng
+ cô dâu áo dài trắng voan đỏ nắm tay nhau, nền hồng pastel. Hiển thị trong khung
tròn viền trắng (sticker). Xuất hiện ở: lá thư (trượt lên + tim), mỗi chặng năm
(nhún đi bộ).

`assets/chu-re-lap-lo.webp` / `assets/co-dau-lap-lo.webp` — 2 nhân vật vẽ riêng
tư thế lấp ló tò mò. JS tự đặt 1–2 sticker ở vị trí random mỗi màn (góc/cạnh,
không che nội dung) — kiểu 2 đứa rình xem vợ chơi thử thách. Finale chỉ giữ
khung tim ảnh thật, không chibi.

## Flow (v2)

1. Phong bì (chạm để mở, nhạc bắt đầu) → 2. Lá thư (bộ đếm ngày yêu live) →
3. 6 chặng (2020 quiz, 2021 chạm tim, 2022 hứng tim,
   2023 nghỉ, 2024 ghép tim, 2025 nghỉ) → 4. Finale (ảnh + mưa tim + pháo hoa)
