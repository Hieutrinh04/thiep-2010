# 💌 Thiệp 20/10 – Ghép ảnh & Lá thư

Website thiệp chúc mừng Ngày Phụ nữ Việt Nam (20/10) tương tác: mở quà → ghép ảnh (trượt ô)
→ cây trái tim mọc dần → lá thư tự gõ từng chữ → xem ảnh kỷ niệm, có nhạc nền.

Web **tĩnh thuần HTML/CSS/JS**, không cần backend, không framework. Mỗi người nhận có một
**mã (id) riêng** → một đường link riêng, một nội dung riêng.

---

## 1. Chạy thử trên máy (localhost)

Cần một web server tĩnh (mở trực tiếp `index.html` bằng `file://` sẽ **không chạy** vì trình
duyệt chặn nạp `thu.js` động). Chọn 1 trong các cách:

**Có Node.js:**
```bash
npx serve .
```

**Có Python:**
```bash
python -m http.server 5020
```

Rồi mở trình duyệt:
```
http://localhost:5020/?id=demo2010
```
(Mở `http://localhost:5020/` không kèm `?id=` cũng được — sẽ tự dùng mã demo đặt trong `cau-hinh.js`.)

---

## 2. Cấu trúc thư mục

```
├─ index.html              # Khung trang + các màn
├─ cau-hinh.js             # ⚙️ Cấu hình CHUNG cho mọi thiệp
├─ assets/
│  ├─ style.css            # Toàn bộ giao diện
│  └─ app.js               # Toàn bộ logic
├─ nguoi/
│  └─ demo2010/            # 📁 MỖI NGƯỜI = 1 thư mục (tên thư mục = mã id)
│     ├─ thu.js            #    Tên, lời chúc, danh sách ảnh, nhạc riêng
│     ├─ anh-ghep.svg      #    Ảnh để ghép (vuông)
│     └─ anh-thu-1..6.svg  #    Ảnh polaroid (dọc, tối đa 6)
├─ nhac/                   # 🎵 File nhạc nền (dùng chung)
│  └─ nhac-nen-demo.wav
├─ 404.html
└─ README.md
```

> **Ánh xạ với yêu cầu config:** `recipientName → ten`, `greetingMessage → loiChuc`,
> `recipientImage → anhGhep/anhThu`, `backgroundMusic → nhacNen`. Tất cả nằm trong
> `nguoi/<mã>/thu.js`; các mục dùng chung (số mảnh ghép, tốc độ gõ chữ, nhạc mặc định…)
> nằm trong `cau-hinh.js`.

---

## 3. Thay TÊN người nhận

Mở `nguoi/<mã>/thu.js`, sửa dòng:
```js
ten: 'Ngọc Anh',
```
- Muốn giấu tên (chỉ gọi "cậu"): trong `cau-hinh.js` đặt `hienTen: false`.
- Muốn đổi câu chào đầu thư: thêm `loiChao: 'Gửi chị yêu,'` trong `thu.js`.
- Muốn ký tên cuối thư: thêm `kyTen: 'Bạn của cậu',`.

## 4. Thay ẢNH

1. Chép ảnh của bạn vào thư mục `nguoi/<mã>/`.
2. **Ảnh ghép**: nên **vuông**, mặt nằm gọn trong khung. Sửa `anhGhep: 'ten-anh.jpg'`.
   - Ảnh không vuông? Chỉnh `viTriAnhGhep: '50% 40%'` (trong `cau-hinh.js`) để lấy đúng phần muốn.
3. **Ảnh polaroid** (bật ra khi bấm "Xem ảnh", tối đa 6, nên **dọc**):
   ```js
   anhThu: ['anh-thu-1.jpg', 'anh-thu-2.jpg', 'anh-thu-3.jpg'],
   chuThichAnh: ['Rạng rỡ', 'Dịu dàng', 'Tỏa sáng'],
   ```
   Hỗ trợ `.jpg .png .webp .svg`. (Ảnh demo đang là `.svg` – cứ thay bằng ảnh thật của bạn.)

## 5. Thay LỜI CHÚC

Trong `thu.js`, sửa khối `loiChuc` — **mỗi dòng là một đoạn**, thư sẽ tự gõ từng chữ:
```js
loiChuc: `
Đoạn 1...
Đoạn 2...
`,
```
Tốc độ gõ chữ: đổi `tocDoGo` trong `cau-hinh.js` (số nhỏ = gõ nhanh).

## 6. Thay NHẠC NỀN

1. Chép file `.mp3` vào thư mục `nhac/`.
2. Trong `cau-hinh.js` (dùng chung) hoặc `thu.js` (riêng từng người):
   ```js
   nhacNen: 'nhac/bai-cua-ban.mp3',
   tenBaiHat: 'Tên bài – Ca sĩ',
   ```
   Nhiều bài phát lần lượt:
   ```js
   nhacNen: ['nhac/bai-1.mp3', 'nhac/bai-2.mp3'],
   tenBaiHat: ['Bài 1 – A', 'Bài 2 – B'],
   ```
> Trình duyệt chỉ cho nhạc phát **sau khi người xem chạm "Chạm để mở quà"** (đúng chính sách
> autoplay). Nhạc demo là `.wav` cho chạy ngay — nên thay bằng `.mp3` của bạn.

## 7. Tạo MÃ (id) cho từng người

1. Tạo thư mục mới trong `nguoi/`, tên là mã riêng — **6–8 ký tự, chỉ chữ thường a–z và số**
   (ví dụ `nguoi/mai2010/`, `nguoi/lananh7/`).
2. Chép `thu.js` + ảnh vào đó, sửa nội dung.
3. Gửi cho người đó đường link kèm mã:
   ```
   https://<tên-miền>/?id=mai2010
   ```
Mỗi người một mã → không ai thấy thiệp của người khác.

Cấu hình khác trong `cau-hinh.js`: `soManh: 3` (lưới 3×3) hay `4` (4×4 khó hơn); `maMacDinh`
(mã dùng khi mở link không có `?id=`).

---

## 8. Đưa website lên Internet (miễn phí)

### Cách A – GitHub Pages
1. Tạo repo trên GitHub, tải toàn bộ thư mục này lên (giữ nguyên cấu trúc).
2. Repo → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** →
   chọn nhánh `main`, thư mục `/ (root)` → **Save**.
3. Vài phút sau web chạy ở `https://<tài-khoản>.github.io/<tên-repo>/?id=demo2010`.

### Cách B – Cloudflare Pages
1. Đăng nhập Cloudflare → **Workers & Pages → Create → Pages**.
2. **Upload assets** (kéo-thả cả thư mục) *hoặc* **Connect to Git** rồi chọn repo.
3. Build command: để trống. Output directory: `/`. → **Deploy**.
4. Web chạy ở `https://<tên-dự-án>.pages.dev/?id=demo2010`.

> Link dùng tham số `?id=` nên hoạt động tốt trên cả hai nền tảng, không cần cấu hình thêm.
> ⚠️ Không đưa thông tin cá nhân nhạy cảm vào dữ liệu công khai. Trang đã đặt `noindex` để
> tránh bị công cụ tìm kiếm thu thập, nhưng ai có link vẫn mở được — chỉ chia sẻ link cho đúng người.

---

## 9. Mẹo kiểm tra nhanh

- `?id=demo2010&xem=nhanh` → tự giải ghép ảnh để xem nhanh các màn sau.
- Giữ ô ảnh nhỏ ở màn ghép → xem ảnh gốc mờ chồng lên để dễ ghép.
- Nút ← (hoặc nút back điện thoại) chuyển về màn trước, không thoát trang.
