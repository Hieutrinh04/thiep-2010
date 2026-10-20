// Luồng chính: đọc mã người nhận -> tải nguoi/<mã>/thu.js -> mở quà -> ghép ảnh -> ghép xong -> cây tim + lá thư
(function () {
  'use strict';

  var MAC_DINH = {
    soManh: 3,
    hienTen: true,
    tenThayThe: 'cậu',
    kyTen: '',
    loiChao: '',
    tocDoGo: 40,
    nhacNen: '',
    tenBaiHat: '',
    viTriAnhGhep: '50% 40%',
    chuThichAnh: ['Cười lên nào', 'Xinh như hoa', 'Luôn tỏa sáng', 'Rạng rỡ ghê', 'Ngày thật vui', 'Mãi đáng yêu'],
  };
  var SO_ANH_TOI_DA = 6;
  var MA_HOP_LE = /^[a-z0-9]{6,8}$/;
  var SVG = 'http://www.w3.org/2000/svg';

  var $ = function (id) { return document.getElementById(id); };
  var P = null;          // cài đặt đã gộp (mặc định + cau-hinh.js + thu.js)
  var duongDan = '';     // nguoi/<mã>/
  var anhGhep = '';
  var manHienTai = 'manTai';

  // ---------- Tiện ích ----------
  function bam(str) {             // biến chuỗi thành số (để mỗi người có cây tim khác nhau)
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function ngauNhien(hat) {       // số ngẫu nhiên lặp lại được theo "hạt"
    var s = (hat >>> 0) || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function taoTim(mau) {
    var svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(SVG, 'use');
    use.setAttribute('href', '#hinhTim');
    svg.appendChild(use);
    if (mau) svg.style.color = mau;
    return svg;
  }
  function docMa() {
    var q = new URLSearchParams(location.search);
    var raw = q.get('id') || location.hash.replace(/^#\/?(id=)?/, '');
    var ma = '';
    try { ma = decodeURIComponent(raw).trim().toLowerCase(); } catch (e) { ma = ''; }
    // Mở trực tiếp (không có ?id=) thì dùng mã demo mặc định để xem thử
    if (!ma && window.CAU_HINH && window.CAU_HINH.maMacDinh) ma = String(window.CAU_HINH.maMacDinh).trim().toLowerCase();
    return ma;
  }
  function layDuongDan(f) {
    if (!f) return '';
    return (/^(https?:)?\/\//.test(f) || f.charAt(0) === '/') ? f : duongDan + f;
  }
  function taiScript(src) {
    return new Promise(function (ok, loi) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = function () { loi(new Error('Không tìm thấy ' + src)); };
      document.head.appendChild(s);
    });
  }
  function taiAnh(src) {
    return new Promise(function (ok, loi) {
      if (!src) { loi(new Error('Thiệp chưa có ảnh để ghép (anhGhep)')); return; }
      var i = new Image();
      i.onload = function () { ok(i); };
      i.onerror = function () { loi(new Error('Không tải được ảnh ' + src)); };
      i.src = src;
    });
  }

  // ---------- Chuyển màn ----------
  var soLanGhi = 0;

  function ghiBuoc(tt) {
    tt.buoc = soLanGhi + 1;
    try { history.pushState(tt, '', location.href); soLanGhi = tt.buoc; } catch (e) { /* bỏ qua */ }
  }

  function hienMan(id, ghiLichSu) {
    document.querySelectorAll('.man').forEach(function (m) { m.classList.toggle('hien', m.id === id); });
    manHienTai = id;
    window.scrollTo(0, 0);
    $('timNen').hidden = (id !== 'manMoQua' && id !== 'manGhep');
    document.body.classList.toggle('dang-thu', id === 'manThu');
    if (ghiLichSu) ghiBuoc({ man: id });
    if (id === 'manGhep') ghep.capNhatKichThuoc();
    if (id === 'manXong') rayHoa($('hoaRoiXong'), 22, 900, 7);
    if (id === 'manThu') {
      if (daBatDauThu) $('canhCay').classList.add('bo-qua');
      batDauThu();
    }
  }
  window.addEventListener('popstate', function (e) {
    var tt = e.state || {};
    soLanGhi = typeof tt.buoc === 'number' ? tt.buoc : 0;
    if (!$('hopAnh').hidden) dongAnh(true);
    if (tt.man && $(tt.man) && tt.man !== manHienTai) hienMan(tt.man, false);
  });

  function baoLoi(chu) {
    if (chu) $('chuLoi').textContent = chu;
    hienMan('manLoi', false);
  }

  // ---------- Trái tim nền ----------
  function raiTimNen() {
    var r = ngauNhien(7);
    var mau = ['#F48FB1', '#F8BBD0', '#FFFFFF', '#F06292', '#FFFFFF'];
    var lop = $('timNen');
    for (var i = 0; i < 18; i++) {
      var kt = 12 + Math.round(r() * 20);
      var t = taoTim(mau[i % mau.length]);
      t.style.cssText += 'left:' + (r() * 100).toFixed(1) + '%;top:' + (r() * 100).toFixed(1) + '%;width:' + kt + 'px;height:' + kt + 'px;opacity:' + (0.3 + r() * 0.45).toFixed(2) + ';--r:' + Math.round(r() * 50 - 25) + 'deg;animation-delay:-' + (r() * 6).toFixed(1) + 's';
      lop.appendChild(t);
    }
  }

  // Hoa (trái tim) rơi trong một lớp
  function rayHoa(lop, so, xa, giay) {
    if (!lop || lop.childElementCount) return;
    var r = ngauNhien(so * 31);
    var mau = ['#FFFFFF', '#F8BBD0', '#F48FB1', '#F06292', '#E9A93A'];
    for (var i = 0; i < so; i++) {
      var kt = 10 + Math.round(r() * 16);
      var t = taoTim(mau[i % mau.length]);
      t.style.cssText += 'left:' + (r() * 96).toFixed(1) + '%;width:' + kt + 'px;height:' + kt + 'px;--xa:' + xa + 'px;animation-duration:' + (giay * (0.7 + r() * 0.6)).toFixed(1) + 's;animation-delay:-' + (r() * giay).toFixed(1) + 's';
      lop.appendChild(t);
    }
  }

  // ---------- Nhạc nền ----------
  var nhac = $('nhac');
  var nutNhac = $('nutNhac');
  var nhacDangBat = false;
  var dsNhac = [], dsTenBai = [], iBai = 0, soLanLoiNhac = 0;

  function chuanBiNhac() {
    dsNhac = [].concat(P.nhacNen || []).map(String).filter(Boolean);
    dsTenBai = [].concat(P.tenBaiHat || []).map(String);
    nhac.loop = dsNhac.length === 1;
    hienTenBai();
  }
  function hienTenBai() {
    var ten = dsTenBai[iBai] || '';
    $('tenBaiHat').hidden = !ten;
    $('tenBaiHat').querySelector('span').textContent = ten;
  }
  function datBai(i) {
    iBai = i;
    nhac.src = dsNhac[i];
    hienTenBai();
  }
  function capNhatNutNhac() {
    var dangPhat = !nhac.paused;
    nutNhac.classList.toggle('dang-phat', dangPhat);
    nutNhac.setAttribute('aria-label', dangPhat ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  }
  function phatNhac() {
    if (!dsNhac.length) return;
    if (!nhac.getAttribute('src')) datBai(0);
    nhac.volume = 0.8;
    var lenh = nhac.play();
    if (lenh && lenh.catch) lenh.catch(function () { /* trình duyệt chặn: chờ lần chạm sau */ });
  }
  function sangBaiSau() {
    datBai((iBai + 1) % dsNhac.length);
    if (nhacDangBat && !document.hidden) phatNhac();
  }
  nhac.addEventListener('ended', function () { if (dsNhac.length > 1) sangBaiSau(); });
  nhac.addEventListener('error', function () {
    if (!nhac.getAttribute('src')) return;
    soLanLoiNhac++;
    if (dsNhac.length > 1 && soLanLoiNhac < dsNhac.length) sangBaiSau();
  });
  nhac.addEventListener('playing', function () { soLanLoiNhac = 0; });
  nhac.addEventListener('play', capNhatNutNhac);
  nhac.addEventListener('pause', capNhatNutNhac);
  nutNhac.addEventListener('click', function () {
    if (nhac.paused) { nhacDangBat = true; phatNhac(); } else { nhacDangBat = false; nhac.pause(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (!nhac.paused) nhac.pause(); } else if (nhacDangBat) { phatNhac(); }
  });

  // ---------- Trò ghép ảnh trượt ô ----------
  var ghep = (function () {
    var ban = $('banGhep');
    var N = 3, TONG = 9, TRONG = 8;
    var thuTu = [];
    var cacO = [];
    var soBuoc = 0;
    var daXong = false;
    var boQuaClick = false;
    var KHE = 4;

    function viTriTrong() { return thuTu.indexOf(TRONG); }
    function keNhau(a, b) {
      var cungHang = Math.floor(a / N) === Math.floor(b / N);
      return Math.abs(a - b) === N || (Math.abs(a - b) === 1 && cungHang);
    }

    function taoBan() {
      N = Math.min(4, Math.max(3, Number(P.soManh) || 3));
      TONG = N * N; TRONG = TONG - 1;
      ban.innerHTML = '';
      cacO = [];
      for (var t = 0; t < TONG; t++) {
        var el;
        if (t === TRONG) {
          el = document.createElement('div');
          el.className = 'o-trong';
          el.setAttribute('aria-hidden', 'true');
          el.appendChild(taoTim());
        } else {
          el = document.createElement('button');
          el.type = 'button';
          el.className = 'o-ghep';
          var img = document.createElement('img');
          img.src = anhGhep;
          img.alt = '';
          img.draggable = false;
          img.style.objectPosition = P.viTriAnhGhep;
          el.appendChild(img);
          el.addEventListener('click', (function (so) { return function () { bamO(so); }; })(t));
        }
        cacO[t] = el;
        ban.appendChild(el);
      }
      $('soDung').textContent = 'Đúng 0/' + (TONG - 1) + ' mảnh';
    }

    function xao() {
      var buoc = N === 3 ? 70 : 140;
      do {
        thuTu = [];
        for (var i = 0; i < TONG; i++) thuTu.push(i);
        var truoc = -1;
        for (var k = 0; k < buoc; k++) {
          var e = viTriTrong();
          var ke = [];
          [e - N, e + N, e - 1, e + 1].forEach(function (p) { if (p >= 0 && p < TONG && keNhau(p, e) && p !== truoc) ke.push(p); });
          var chon = ke[Math.floor(Math.random() * ke.length)];
          thuTu[e] = thuTu[chon]; thuTu[chon] = TRONG; truoc = e;
        }
      } while (soDung() > TONG - 4);
      soBuoc = 0;
      daXong = false;
      $('xongGhep').hidden = true;
      capNhat();
    }

    function soDung() {
      var d = 0;
      for (var i = 0; i < TONG; i++) if (thuTu[i] === i && i !== TRONG) d++;
      return d;
    }

    function capNhatKichThuoc() {
      var trong = ban.clientWidth;
      if (!trong) return;
      var o = (trong - KHE * (N - 1)) / N;
      for (var t = 0; t < TONG; t++) {
        var el = cacO[t];
        el.style.width = o + 'px';
        el.style.height = o + 'px';
        if (t !== TRONG) {
          var img = el.firstChild;
          img.style.width = trong + 'px';
          img.style.height = trong + 'px';
          img.style.transform = 'translate(' + (-(t % N) * (o + KHE)) + 'px,' + (-Math.floor(t / N) * (o + KHE)) + 'px)';
        }
      }
      capNhat();
    }

    function capNhat() {
      var trong = ban.clientWidth;
      var o = (trong - KHE * (N - 1)) / N;
      var e = viTriTrong();
      for (var p = 0; p < TONG; p++) {
        var t = thuTu[p];
        var el = cacO[t];
        el.style.transform = 'translate(' + ((p % N) * (o + KHE)) + 'px,' + (Math.floor(p / N) * (o + KHE)) + 'px)';
        if (t !== TRONG) {
          var coThe = !daXong && keNhau(p, e);
          el.classList.toggle('co-the', coThe);
          el.setAttribute('aria-label', 'Mảnh số ' + (t + 1) + (coThe ? ', chạm để trượt vào ô trống' : ''));
          el.tabIndex = coThe ? 0 : -1;
        }
      }
      $('soDung').textContent = 'Đúng ' + soDung() + '/' + (TONG - 1) + ' mảnh';
      $('soBuoc').textContent = soBuoc;
    }

    function truot(p) {
      var e = viTriTrong();
      if (daXong || !keNhau(p, e)) return false;
      thuTu[e] = thuTu[p];
      thuTu[p] = TRONG;
      soBuoc++;
      capNhat();
      if (soDung() === TONG - 1) xong();
      return true;
    }

    function bamO(so) {
      if (boQuaClick) { boQuaClick = false; return; }
      truot(thuTu.indexOf(so));
    }

    function theoHuong(huong) {
      var e = viTriTrong();
      var p = { trai: e + 1, phai: e - 1, len: e + N, xuong: e - N }[huong];
      if (p >= 0 && p < TONG && keNhau(p, e)) truot(p);
    }

    function xong() {
      daXong = true;
      capNhat();
      var lop = $('xongGhep');
      if (!lop.querySelector('img')) {
        var img = document.createElement('img');
        img.src = anhGhep;
        img.alt = 'Bức ảnh đã ghép xong';
        img.style.objectPosition = P.viTriAnhGhep;
        lop.insertBefore(img, lop.firstChild);
      }
      lop.hidden = false;
      rayHoa($('hoaRoiGhep'), 10, 380, 3.2);
      setTimeout(function () { $('nutTiepTuc').focus({ preventScroll: true }); }, 300);
    }

    var batDau = null;
    ban.addEventListener('pointerdown', function (e) { batDau = { x: e.clientX, y: e.clientY }; });
    ban.addEventListener('pointerup', function (e) {
      if (!batDau) return;
      var dx = e.clientX - batDau.x, dy = e.clientY - batDau.y;
      batDau = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      boQuaClick = true;
      setTimeout(function () { boQuaClick = false; }, 60);
      if (Math.abs(dx) > Math.abs(dy)) theoHuong(dx < 0 ? 'trai' : 'phai');
      else theoHuong(dy < 0 ? 'len' : 'xuong');
    });
    ban.addEventListener('pointercancel', function () { batDau = null; });

    document.addEventListener('keydown', function (e) {
      if (manHienTai !== 'manGhep') return;
      var h = { ArrowLeft: 'trai', ArrowRight: 'phai', ArrowUp: 'len', ArrowDown: 'xuong' }[e.key];
      if (h) { e.preventDefault(); theoHuong(h); }
    });

    window.addEventListener('resize', function () { if (manHienTai === 'manGhep') capNhatKichThuoc(); });

    return {
      khoiTao: function () { taoBan(); xao(); },
      xaoLai: xao,
      capNhatKichThuoc: capNhatKichThuoc,
      giaiLuon: function () { for (var i = 0; i < TONG; i++) thuTu[i] = i; xong(); },
    };
  })();

  // Giữ vào ảnh nhỏ để xem ảnh gốc mờ đè lên bảng
  (function () {
    var nut = $('nutAnhGoc'), phu = $('anhGocPhu');
    function hien() { phu.classList.add('hien'); }
    function an() { phu.classList.remove('hien'); }
    nut.addEventListener('pointerdown', function (e) { e.preventDefault(); hien(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { nut.addEventListener(ev, an); });
    nut.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hien(); } });
    nut.addEventListener('keyup', an);
    nut.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  })();

  // ---------- Màn 4: cây trái tim + lá thư ----------
  var daBatDauThu = false;
  var luotThu = 0;
  var nhinThu = null;
  var sauKhiMocHienTai = null;

  var THOI_GIAN_MOC = 6.7;

  function trongCay(hat) {
    var canh = $('canhCay'), tan = $('tanCay'), roi = $('timRoi');
    canh.querySelectorAll('.ve').forEach(function (p) {
      var dai = Math.ceil(p.getTotalLength ? p.getTotalLength() : 400) + 2;
      p.style.setProperty('--dai', String(dai));
      p.style.setProperty('--tre', (p.getAttribute('data-tre') || '0') + 's');
      p.style.setProperty('--tg', (p.getAttribute('data-tg') || '1') + 's');
    });

    var r = ngauNhien(hat);
    var mau = ['#F48FB1', '#F06292', '#C72C63', '#F8BBD0', '#FFFFFF', '#E9A93A', '#EC407A', '#FF8A65'];
    var so = 0, thu = 0;
    // Rải ~420 trái tim chồng lên nhau bên trong một hình trái tim lớn: (x²+y²−1)³ − x²y³ ≤ 0
    while (so < 420 && thu < 15000) {
      thu++;
      var x = r() * 2.6 - 1.3, y = r() * 2.6 - 1.4;
      var a = x * x + y * y - 1;
      if (a * a * a - x * x * y * y * y > 0) continue;
      var X = 200 + x * 150, Y = 215 - y * 140;
      var kt = 17 + Math.round(r() * 15);
      var xa = Math.min(1, Math.sqrt((X - 200) * (X - 200) + (Y - 300) * (Y - 300)) / 230);
      var tre = 3.7 + xa * 2.0 + r() * 0.35;
      var t = taoTim(mau[so % mau.length]);
      t.style.cssText += 'left:' + ((X - kt / 2) / 4).toFixed(2) + '%;top:' + ((Y - kt / 2) / 5.2).toFixed(2) + '%;width:' + (kt / 4).toFixed(2) + '%;height:' + (kt / 5.2).toFixed(2) + '%;--r:' + Math.round(r() * 60 - 30) + 'deg;animation-delay:' + tre.toFixed(2) + 's';
      tan.appendChild(t);
      so++;
    }
    for (var i = 0; i < 10; i++) {
      var k = 10 + Math.round(r() * 10);
      var f = taoTim(mau[i % mau.length]);
      f.style.cssText += 'left:' + (14 + r() * 72).toFixed(1) + '%;top:' + (16 + r() * 44).toFixed(1) + '%;width:' + (k / 4).toFixed(2) + '%;height:' + (k / 5.2).toFixed(2) + '%;animation-delay:' + (r() * 6).toFixed(1) + 's';
      roi.appendChild(f);
    }
    void canh.offsetWidth;
    canh.classList.add('dang-moc');
  }

  // Tách chuỗi thành từng "chữ nhìn thấy được" để emoji không bị vỡ khi đang gõ
  var tachChu = (function () {
    if (window.Intl && Intl.Segmenter) {
      var bo = new Intl.Segmenter('vi', { granularity: 'grapheme' });
      return function (s) { return Array.from(bo.segment(s), function (x) { return x.segment; }); };
    }
    try {
      var re = new RegExp('\\p{Extended_Pictographic}(?:\\p{Emoji_Modifier}|\\uFE0F|\\u200D\\p{Extended_Pictographic})*|[\\s\\S]\\p{M}*', 'gu');
      return function (s) { return s.match(re) || []; };
    } catch (e) {
      return function (s) { return Array.from(s); };
    }
  })();

  function goThu() {
    var luot = luotThu;
    var hop = $('noiDungThu');
    var thu = $('laThu');
    var doan = String(P.loiChuc || '').replace(/\r/g, '').trim().split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var chuTungDoan = doan.map(tachChu);
    var tocDo = Math.max(5, Number(P.tocDoGo) || 40);
    var conTro = document.createElement('span');
    conTro.className = 'con-tro';
    conTro.setAttribute('aria-hidden', 'true');
    var iDoan = 0, iChu = 0, pHienTai = null, hen = null, daXong = false;

    function ketThuc() {
      if (daXong || luot !== luotThu) return;
      daXong = true;
      clearTimeout(hen);
      hop.innerHTML = '';
      doan.forEach(function (d) { var p = document.createElement('p'); p.textContent = d; hop.appendChild(p); });
      if (hop.lastChild) hop.lastChild.appendChild(conTro);
      $('kyTen').classList.add('hien');
      thu.classList.add('xong');
      thu.removeAttribute('tabindex');
      thu.removeAttribute('role');
      thu.removeAttribute('aria-label');
      if (soAnhThu) $('nutXemAnh').hidden = false;
    }
    function buoc() {
      if (daXong || luot !== luotThu) return;
      if (iDoan >= doan.length) { ketThuc(); return; }
      if (!pHienTai) { pHienTai = document.createElement('p'); hop.appendChild(pHienTai); }
      var chu = chuTungDoan[iDoan];
      iChu++;
      pHienTai.textContent = chu.slice(0, iChu).join('');
      pHienTai.appendChild(conTro);
      var kyTu = chu[iChu - 1];
      var cho = tocDo * ('.!?'.indexOf(kyTu) >= 0 ? 8 : ',;:–'.indexOf(kyTu) >= 0 ? 4 : 1);
      if (iChu >= chu.length) { iDoan++; iChu = 0; pHienTai = null; cho = tocDo * 10; }
      hen = setTimeout(buoc, cho);
    }
    thu.addEventListener('click', ketThuc);
    thu.addEventListener('keydown', function (e) {
      if (e.target !== thu) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); ketThuc(); }
    });
    hen = setTimeout(buoc, 700);
  }

  var soAnhThu = 0;

  function xepAnh() {
    var day = $('dayAnh');
    var ds = (Array.isArray(P.anhThu) ? P.anhThu : [P.anhThu]).filter(Boolean).slice(0, SO_ANH_TOI_DA);
    soAnhThu = ds.length;
    if (!ds.length) return;
    var hang = null;
    ds.forEach(function (f, i) {
      if (i % 3 === 0) {
        hang = document.createElement('div');
        hang.className = 'day-anh__hang';
        hang.setAttribute('data-so', String(Math.min(3, ds.length - i)));
        day.appendChild(hang);
      }
      var nut = document.createElement('button');
      nut.type = 'button';
      nut.className = 'polaroid polaroid--nho';
      var chu = (P.chuThichAnh && P.chuThichAnh[i]) || '';
      nut.setAttribute('aria-label', 'Xem ảnh to' + (chu ? ': ' + chu : ''));
      var img = document.createElement('img');
      img.src = layDuongDan(f);
      img.alt = 'Ảnh của ' + tenHien();
      img.loading = 'lazy';
      if (P.viTriAnhThu && P.viTriAnhThu[i]) img.style.objectPosition = String(P.viTriAnhThu[i]);
      nut.appendChild(img);
      if (chu) { var s = document.createElement('span'); s.textContent = chu; nut.appendChild(s); }
      nut.addEventListener('click', function () { moAnh(img.src, img.alt); });
      nut.style.animationDelay = (i * 0.45).toFixed(2) + 's';
      hang.appendChild(nut);
    });
  }

  var nutVuaBam = null;
  function moAnh(src, alt) {
    nutVuaBam = document.activeElement;
    $('hopAnhImg').src = src;
    $('hopAnhImg').alt = alt;
    $('hopAnh').hidden = false;
    $('hopAnhDong').focus({ preventScroll: true });
    ghiBuoc({ man: manHienTai, anh: true });
  }
  function dongAnh(doNutBack) {
    if ($('hopAnh').hidden) return;
    $('hopAnh').hidden = true;
    if (nutVuaBam && nutVuaBam.focus) nutVuaBam.focus({ preventScroll: true });
    if (!doNutBack && history.state && history.state.anh) history.back();
  }
  $('hopAnhDong').addEventListener('click', function () { dongAnh(false); });
  $('hopAnh').addEventListener('click', function (e) { if (e.target === this) dongAnh(false); });
  document.addEventListener('keydown', function (e) {
    if ($('hopAnh').hidden) return;
    if (e.key === 'Escape') dongAnh(false);
    if (e.key === 'Tab') { e.preventDefault(); $('hopAnhDong').focus(); }
  });

  function batDauThu() {
    if (daBatDauThu) return;
    daBatDauThu = true;
    var luot = luotThu;
    var canh = $('canhCay');
    var itChuyenDong = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    xepAnh();
    trongCay(bam(duongDan));
    if (itChuyenDong) canh.classList.add('bo-qua');
    var hen = setTimeout(sauKhiMoc, itChuyenDong ? 200 : THOI_GIAN_MOC * 1000);

    function sauKhiMoc() {
      if (luot !== luotThu || canh.classList.contains('xong-moc')) return;
      clearTimeout(hen);
      if (!canh.classList.contains('dang-moc')) canh.classList.add('bo-qua', 'dang-moc');
      canh.classList.add('xong-moc');
      $('cotThu').classList.add('hien');
      $('cuoiTrang').classList.add('hien');
      $('cotThu').removeAttribute('inert');
      $('cuoiTrang').removeAttribute('inert');
      var thu = $('laThu');
      var daGo = false;
      function batDauGo() {
        if (daGo || luot !== luotThu) return;
        daGo = true;
        if (nhinThu) { nhinThu.disconnect(); nhinThu = null; }
        $('nutKeoXuong').hidden = true;
        goThu();
      }
      if ('IntersectionObserver' in window) {
        nhinThu = new IntersectionObserver(function (ds) {
          if (ds.some(function (d) { return d.isIntersecting; })) batDauGo();
        }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
        nhinThu.observe(thu);
        thu.addEventListener('click', batDauGo);
        setTimeout(function () { if (!daGo && luot === luotThu) $('nutKeoXuong').hidden = false; }, 600);
      } else {
        batDauGo();
      }
    }
    sauKhiMocHienTai = sauKhiMoc;
  }

  $('canhCay').addEventListener('click', function () {
    if (!sauKhiMocHienTai || this.classList.contains('xong-moc')) return;
    this.classList.add('bo-qua');
    sauKhiMocHienTai();
  });

  function datLaiThu() {
    luotThu++;
    daBatDauThu = false;
    sauKhiMocHienTai = null;
    if (nhinThu) { nhinThu.disconnect(); nhinThu = null; }
    $('canhCay').className = 'canh-cay';
    $('tanCay').innerHTML = '';
    $('timRoi').innerHTML = '';
    $('noiDungThu').innerHTML = '';
    var thu = $('laThu');
    thu.classList.remove('xong');
    thu.setAttribute('tabindex', '0');
    thu.setAttribute('role', 'button');
    thu.setAttribute('aria-label', 'Lá thư, nhấn để hiện hết chữ');
    $('kyTen').classList.remove('hien');
    $('nutXemAnh').hidden = true;
    $('nutKeoXuong').hidden = true;
    var day = $('dayAnh');
    day.hidden = true;
    day.classList.remove('hien');
    day.innerHTML = '';
    ['cotThu', 'cuoiTrang'].forEach(function (id) { $(id).classList.remove('hien'); $(id).setAttribute('inert', ''); });
  }

  $('nutKeoXuong').addEventListener('click', function () {
    var itChuyenDong = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('cotThu').scrollIntoView({ behavior: itChuyenDong ? 'auto' : 'smooth', block: 'start' });
  });

  $('nutXemAnh').addEventListener('click', function (e) {
    e.stopPropagation();
    if (!$('laThu').classList.contains('xong')) return;
    var day = $('dayAnh');
    this.hidden = true;
    day.hidden = false;
    void day.offsetWidth;
    day.classList.add('hien');
    var itChuyenDong = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { day.scrollIntoView({ behavior: itChuyenDong ? 'auto' : 'smooth', block: 'center' }); }, 150);
    var dau = day.querySelector('button');
    if (dau) setTimeout(function () { dau.focus({ preventScroll: true }); }, 800);
  });

  function tenHien() {
    return (P.hienTen && P.ten) ? String(P.ten) : P.tenThayThe;
  }

  // ---------- Gắn nút ----------
  var daMoQua = false;
  $('nutMoQua').addEventListener('click', function () {
    if (!daMoQua) {
      daMoQua = true;
      nutNhac.hidden = !dsNhac.length;
      nhacDangBat = true;
      phatNhac();
    }
    hienMan('manGhep', true);
    if (new URLSearchParams(location.search).get('xem') === 'nhanh') setTimeout(ghep.giaiLuon, 600);
  });
  $('nutTiepTuc').addEventListener('click', function () { hienMan('manXong', true); });
  $('nutBoQua').addEventListener('click', function () { hienMan('manXong', true); });
  $('nutMoThu').addEventListener('click', function () { hienMan('manThu', true); });
  $('nutXaoLai').addEventListener('click', function () { ghep.xaoLai(); });
  $('nutXemLai').addEventListener('click', function () { datLaiThu(); ghep.xaoLai(); hienMan('manMoQua', true); });
  document.querySelectorAll('[data-ve]').forEach(function (n) {
    n.addEventListener('click', function () {
      if (soLanGhi > 0) history.back();
      else hienMan(n.getAttribute('data-ve'), false);
    });
  });

  // ---------- Khởi động ----------
  function batDau() {
    raiTimNen();
    var ma = docMa();
    if (!MA_HOP_LE.test(ma)) { baoLoi(); return; }
    duongDan = 'nguoi/' + ma + '/';
    var duLieu = null;
    window.THIEP = function (d) { duLieu = d; };
    taiScript(duongDan + 'thu.js')
      .then(function () {
        if (!duLieu) throw new Error('Thiệp chưa có nội dung');
        P = Object.assign({}, MAC_DINH, window.CAU_HINH || {}, duLieu);
        anhGhep = layDuongDan(P.anhGhep);
        return taiAnh(anhGhep);
      })
      .then(function () {
        var ten = tenHien();
        document.querySelectorAll('[data-ten]').forEach(function (s) { s.textContent = ten; });
        document.title = 'Một món quà nhỏ dành cho ' + ten;
        $('anhGocNho').src = anhGhep;
        $('anhGocPhu').style.backgroundImage = 'url("' + anhGhep.replace(/"/g, '%22') + '")';
        $('anhGocPhu').style.backgroundPosition = P.viTriAnhGhep;
        $('anhXong').src = anhGhep;
        $('anhXong').style.objectPosition = P.viTriAnhGhep;
        $('kyTen').textContent = P.kyTen || '';
        $('kyTen').hidden = !P.kyTen;
        if (P.loiChao) document.querySelector('.la-thu__gui').textContent = String(P.loiChao);
        chuanBiNhac();
        ghep.khoiTao();
        try { history.replaceState({ man: 'manMoQua', buoc: 0 }, '', location.href); } catch (e) { /* bỏ qua */ }
        hienMan('manMoQua', false);
      })
      .catch(function (e) {
        if (window.console) console.warn(e);
        baoLoi();
      });
  }

  batDau();
})();
