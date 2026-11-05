# KHU TỰ TRỊ LIAM WORLD

Bản đóng gói triển khai web từ mã nguồn `chi_bi_village_3d_cozy_world.tsx` đã có. Đã đổi tên game sang **KHU TỰ TRỊ LIAM WORLD**, đồng thời giữ chữ **ADIVA** và thêm bảng hiệu ADIVA cùng quả địa cầu 3D tại quảng trường trung tâm.

## Đã có trong mã nguồn gốc
- Thế giới 3D Three.js: công viên, suối, hồ sen, cầu gỗ, hoa đào, đom đóm ban đêm.
- Màn hình chọn 12 con giáp, xem mô hình 3D, trang phục và thú cưng côn trùng.
- Nhà thờ, chùa, khu vườn, trồng và thu hoạch cây.
- Chat realtime, đồng bộ vị trí người chơi, link mời qua `?room=...` bằng Firestore.
- Bản đồ, hành động nhân vật, Ô ăn quan và câu đố văn hóa.

## Chạy trên máy tính
1. Cài Node.js phiên bản LTS.
2. Mở thư mục dự án trong VS Code.
3. Sao chép `.env.example` thành `.env.local`.
4. Điền Firebase Web App config của dự án `liam-80811` vào `.env.local`.
5. Trong Firebase Console, bật **Authentication > Sign-in method > Anonymous**.
6. Tạo **Firestore Database**.
7. Cài và chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ local mà Vite hiển thị.

## Deploy Vercel
1. Đưa toàn bộ thư mục dự án lên một GitHub repository.
2. Vào Vercel, Import repository đó.
3. Framework: Vite; Build command: `npm run build`; Output directory: `dist`.
4. Thêm 6 biến môi trường `VITE_FIREBASE_*` tương ứng với `.env.local` trong Vercel Project Settings > Environment Variables.
5. Deploy.

## Firestore rules
Kiểm tra kỹ `firestore.rules` trước khi Publish. Đây là bộ rule khởi đầu cho cấu trúc collection hiện tại, chưa phải lớp bảo vệ chống gian lận hoặc giới hạn phòng 4 người ở mức server.

## Việc còn phải hoàn thiện trước khi mở công khai
- Kiểm thử build và chạy thực tế sau khi điền Firebase config.
- Bổ sung cơ chế server-side/transaction để khóa cứng giới hạn 4 người/phòng (mã nguồn hiện tại đồng bộ client Firestore, chưa có bộ đếm slot được bảo vệ ở server).
- Rà soát Firestore rules theo chính sách truy cập mong muốn; không dùng rule rộng cho môi trường production.
- Kiểm thử đồng bộ chuyển động, chat, vườn và nhiều thiết bị cùng lúc.

**Lưu ý:** Chỉ đóng gói mã nguồn và cấu hình khởi tạo; chưa có website public được deploy và chưa thể xác nhận multiplayer hoạt động cho tới khi Firebase được cấu hình và triển khai.
