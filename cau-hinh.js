// ╔══════════════════════════════════════════════════════════════╗
// ║  CÀI ĐẶT CHUNG cho MỌI thiệp.                                  ║
// ║  Muốn đổi riêng cho 1 người thì ghi đè trong nguoi/<mã>/thu.js ║
// ╚══════════════════════════════════════════════════════════════╝
window.CAU_HINH = {
  // Mã dùng khi mở trang KHÔNG có ?id= (để xem thử nhanh). Khi gửi cho người thật,
  // luôn gửi link kèm ?id=<mã-riêng>. Đặt '' nếu muốn bắt buộc phải có ?id=.
  maMacDinh: 'demo2010',

  soManh: 3,                 // 3 = lưới 3x3 (8 mảnh + 1 ô trống), 4 = 4x4 (khó hơn)

  hienTen: true,             // false = không hiện tên người nhận, chỉ gọi là "cậu"
  tenThayThe: 'cậu',         // chữ dùng thay tên khi hienTen = false
  kyTen: '',                 // ký tên cuối thư, để '' là không có dòng ký tên (mỗi thiệp có thể ghi đè)
  // loiChao: 'Gửi Dương,',  // câu chào đầu thư; không ghi thì dùng "Gửi <tên>," (thường ghi riêng trong thu.js)

  tocDoGo: 40,               // mili giây mỗi chữ khi lá thư tự gõ (nhỏ = nhanh)

  // Nhạc nền: phát sau khi người xem chạm "Chạm để mở quà" (điện thoại bắt buộc phải chạm trước).
  // Nhiều bài thì phát lần lượt, hết bài cuối quay lại bài đầu. Chỉ 1 bài thì ghi 1 chuỗi, bài đó lặp lại.
  nhacNen: 'nhac/nhac-nen-demo.wav',   // đổi thành 'nhac/ten-bai.mp3' khi bạn thêm nhạc riêng
  // Tên bài hiện ở cuối trang; để '' nếu không muốn hiện
  tenBaiHat: 'Nhạc nền mẫu (thay bằng bài của bạn)',

  // Vị trí lấy ảnh khi ảnh ghép không vuông: '50% 40%' = giữa theo chiều ngang, hơi lệch lên trên
  viTriAnhGhep: '50% 40%',

  // Chữ viết tay dưới các ảnh polaroid (theo thứ tự ảnh, tối đa 6 ảnh).
  // Ảnh chỉ hiện sau khi đọc xong thư và bấm nút "Xem ảnh".
  chuThichAnh: ['Cười lên nào', 'Xinh như hoa', 'Luôn tỏa sáng', 'Rạng rỡ ghê', 'Ngày thật vui', 'Mãi đáng yêu'],
};
