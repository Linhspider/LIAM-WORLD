import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { 
  Sun, Moon, CloudRain, Sparkles, Users, MessageCircle, 
  Home, Sprout, Shirt, Compass, Award, Shield, Volume2, 
  Camera, Heart, Gift, MapPin, HelpCircle, CheckCircle2, 
  Lock, Unlock, RefreshCw, Send, Smile, Eye, Play, User,
  ChevronRight, ChevronLeft, Star, Flame, Droplets, Info,
  Gamepad2, Trees, Landmark, Bell, Footprints, Map,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Navigation, Wand2,
  Share2, Copy, Globe, UserPlus, Wifi, ExternalLink
} from 'lucide-react';

// ==========================================
// 1. FIREBASE INITIALIZATION (STRICT RULES)
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'liam-80811',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'liam-world';

// ==========================================
// 2. GAME DATA & CONSTANTS (VIETNAMESE CULTURE)
// ==========================================
const ZODIAC_CHARS = [
  { id: 'ty', name: 'Tý – Chuột Tinh Anh', animal: 'Chuột', color: '#FFD1DC', accent: '#FF6B8B', earType: 'round_large', tail: 'thin_long', desc: 'Nhanh nhẹn, thông minh, luôn tìm ra hạt giống quý đầu tiên.' },
  { id: 'suu', name: 'Sửu – Trâu Chăm Chỉ', animal: 'Trâu', color: '#D4E2D4', accent: '#6B8E23', earType: 'horns_curved', tail: 'tuft', desc: 'Hiền lành, gắn bó với đồng ruộng và khu vườn xanh mát.' },
  { id: 'dan', name: 'Dần – Hổ Dũng Mãnh', animal: 'Hổ', color: '#FFE5B4', accent: '#FF8C00', earType: 'tiger_ears', tail: 'striped', desc: 'Năng động, thích khám phá núi rừng và bảo vệ ngôi làng.' },
  { id: 'mao', name: 'Mão – Mèo Dịu Dàng', animal: 'Mèo', color: '#F3E5F5', accent: '#BA68C8', earType: 'cat_pointed', tail: 'cat_curved', desc: 'Đáng yêu, thích nằm sưởi nắng bên hiên nhà gỗ và ngắm hồ cá.' },
  { id: 'thin', name: 'Thìn – Rồng Thần Tiên', animal: 'Rồng', color: '#E0F7FA', accent: '#00BCD4', earType: 'dragon_antlers', tail: 'dragon_fin', desc: 'Biểu tượng bay lên, mang mưa thuận gió hòa cho cả khu vườn.' },
  { id: 'ty_snake', name: 'Tỵ – Rắn Bí Ẩn', animal: 'Rắn', color: '#E8F5E9', accent: '#4CAF50', earType: 'crown_gem', tail: 'coiled', desc: 'Tinh tế, am hiểu các câu đố lịch sử và thảo dược quý.' },
  { id: 'ngo', name: 'Ngọ – Ngựa Tự Do', animal: 'Ngựa', color: '#FFF3E0', accent: '#E65100', earType: 'horse_mane', tail: 'bushy', desc: 'Yêu thích chạy nhảy qua những cây cầu gỗ và thảo nguyên hoa.' },
  { id: 'mui', name: 'Mùi – Dê Bông Xốp', animal: 'Dê', color: '#FFFDE7', accent: '#FBC02D', earType: 'ram_curled', tail: 'short_fluffy', desc: 'Ôn hòa, yêu nghệ thuật trang trí nhà cửa và cắm hoa.' },
  { id: 'than', name: 'Thân – Khỉ Tinh Nghịch', animal: 'Khỉ', color: '#EFEBE9', accent: '#8D6E63', earType: 'monkey_side', tail: 'curly_long', desc: 'Vui nhộn, bậc thầy các trò chơi dân gian và hái quả ngọt.' },
  { id: 'dau', name: 'Dậu – Gà Rực Rỡ', animal: 'Gà', color: '#FFEBEE', accent: '#E53935', earType: 'rooster_comb', tail: 'feather_fan', desc: 'Luôn đánh thức ngôi làng bằng tiếng hát trong trẻo mỗi sớm mai.' },
  { id: 'tuat', name: 'Tuất – Chó Trung Thành', animal: 'Chó', color: '#F5F5DC', accent: '#A1887F', earType: 'floppy_dog', tail: 'wagging', desc: 'Người bạn đáng tin cậy, canh giữ vườn hoa khỏi những kẻ trộm vui tính.' },
  { id: 'hoi', name: 'Hợi – Heo Hồng Phúc', animal: 'Heo', color: '#FCE4EC', accent: '#F06292', earType: 'pig_folded', tail: 'curly_pig', desc: 'Đáng yêu, yêu ẩm thực truyền thống và những buổi tiệc trà.' }
];

const OUTFITS = [
  { id: 'aodai', name: 'Áo Dài Truyền Thống', style: 'long_tunic', primary: '#E53935', secondary: '#FFF8E1', hat: 'khan_dong', desc: 'Tà áo dài thướt tha cùng mấn đội đầu duyên dáng.' },
  { id: 'tuthan', name: 'Áo Tứ Thân Bắc Bộ', style: 'layered_dress', primary: '#8D6E63', secondary: '#EC407A', hat: 'non_quai_thao', desc: 'Trang phục lễ hội kinh Bắc với nón quai thao rộng vành.' },
  { id: 'baba', name: 'Áo Bà Ba Nam Bộ', style: 'simple_shirt', primary: '#AED581', secondary: '#212121', hat: 'khan_ran', desc: 'Giản dị, gần gũi với miền sông nước và khăn rằn.' },
  { id: 'dantoc', name: 'Thổ Cẩm Tây Bắc', style: 'patterned', primary: '#3949AB', secondary: '#FF7043', hat: 'mu_tho_cam', desc: 'Rực rỡ sắc màu hoa văn thổ cẩm vùng núi cao.' },
  { id: 'tet', name: 'Lễ Phục Tết Nguyên Đán', style: 'royal_festive', primary: '#D32F2F', secondary: '#FFD700', hat: 'mao_vang', desc: 'Sắc đỏ vàng may mắn đón xuân sang.' },
  { id: 'hiendai', name: 'Pastel Dạo Phố', style: 'hoodie', primary: '#80DEEA', secondary: '#FFFFFF', hat: 'beret', desc: 'Trẻ trung, năng động cho những buổi dạo công viên.' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', style: 'cyber', primary: '#311B92', secondary: '#00E5FF', hat: 'visor', desc: 'Áo khoác phát sáng neon kết hợp kính thực tế ảo.' },
  { id: 'tuonglai', name: 'Công Nghệ Tương Lai', style: 'sleek_suit', primary: '#CFD8DC', secondary: '#00BFA5', hat: 'halo_tech', desc: 'Vật liệu ánh kim nhẹ nhàng cùng vòng sáng công nghệ.' },
  { id: 'phihanhgia', name: 'Phi Hành Gia Chibi', style: 'spacesuit', primary: '#ECEFF1', secondary: '#FF9800', hat: 'helmet', desc: 'Bộ đồ du hành vũ trụ mini có bình dưỡng khí sau lưng.' },
  { id: 'congiap', name: 'Linh Thú 12 Con Giáp', style: 'onesie', primary: '#FFE082', secondary: '#FF5252', hat: 'crown_mini', desc: 'Trang phục hóa trang đồng bộ với linh vật của bạn.' }
];

const FAIRY_PETS = [
  { id: 'buom_tien', name: 'Bướm Tiên Ngũ Sắc', wingType: 'butterfly', color: '#F48FB1', glow: '#F8BBD0', skill: 'Tìm Hoa Hiếm (+25% tỉ lệ hạt giống quý)', bonusType: 'rare_seed' },
  { id: 'ong_mat', name: 'Ong Mật Bụng Tròn', wingType: 'bee', color: '#FFD54F', glow: '#FFF59D', skill: 'Thu Thập Mật Hoa (+20% xu khi thu hoạch)', bonusType: 'extra_gold' },
  { id: 'chuon_chuon', name: 'Chuồn Chuồn Nước', wingType: 'dragonfly', color: '#4DD0E1', glow: '#B2EBF2', skill: 'Phát Hiện Kho Báu Quanh Suối & Hồ Sen', bonusType: 'water_radar' },
  { id: 'dom_dom', name: 'Đom Đóm Đêm Sao', wingType: 'beetle', color: '#AED581', glow: '#CCFF90', skill: 'Tỏa Sáng Ban Đêm (Tăng tầm nhìn & lung linh)', bonusType: 'night_light' },
  { id: 'bo_rua', name: 'Bọ Rùa May Mắn', wingType: 'ladybug', color: '#E53935', glow: '#FFCDD2', skill: 'Tìm Kiếm Hạt Giống Miễn Phí Mỗi Ngày', bonusType: 'free_seed' },
  { id: 'buom_dem', name: 'Bướm Đêm Ánh Trăng', wingType: 'moth', color: '#9575CD', glow: '#D1C4E9', skill: 'Phát Hiện Vật Phẩm Văn Hóa Ẩn Ban Đêm', bonusType: 'night_radar' },
  { id: 'chuon_pha_le', name: 'Chuồn Chuồn Pha Lê', wingType: 'crystal_dragonfly', color: '#E0F7FA', glow: '#84FFFF', skill: 'Tăng 15% Tốc Độ Chạy Cho Nhân Vật', bonusType: 'speed_boost' },
  { id: 'tien_hoa', name: 'Tiên Hoa Anh Đào', wingType: 'petal_fairy', color: '#FF80AB', glow: '#FCE4EC', skill: 'Chăm Sóc Cây (Cây lớn nhanh hơn 35%)', bonusType: 'fast_grow' }
];

const HOUSE_STYLES = [
  { id: 'bagian', name: 'Nhà Ba Gian Bắc Bộ', roofColor: '#B71C1C', wallColor: '#FFF8E1', woodColor: '#5D4037', style: 'traditional_north', desc: 'Mái ngói đỏ, cột gỗ lim, sân gạch đỏ truyền thống.' },
  { id: 'ruonghue', name: 'Nhà Rường Cố Đô Huế', roofColor: '#4E342E', wallColor: '#EFEBE9', woodColor: '#3E2723', style: 'imperial_hue', desc: 'Kiến trúc gỗ chạm khắc tinh xảo, trầm mặc bên hồ sen.' },
  { id: 'nhasan', name: 'Nhà Sàn Tây Bắc', roofColor: '#8D6E63', wallColor: '#D7CCC8', woodColor: '#6D4C41', style: 'stilt_house', desc: 'Nhà sàn cao ráo bằng gỗ và tre, gần gũi núi rừng.' },
  { id: 'nambo', name: 'Nhà Mái Ngói Nam Bộ', roofColor: '#D84315', wallColor: '#FFF3E0', woodColor: '#795548', style: 'south_tile', desc: 'Không gian thoáng đãng, hiên rộng đón gió mát.' },
  { id: 'mientay', name: 'Nhà Vườn Miền Tây', roofColor: '#689F38', wallColor: '#F1F8E9', woodColor: '#8D6E63', style: 'garden_villa', desc: 'Bao quanh bởi cây ăn trái, rặng dừa và hồ cá Koi.' },
  { id: 'hiendai', name: 'Biệt Thự Việt Đương Đại', roofColor: '#37474F', wallColor: '#ECEFF1', woodColor: '#B0BEC5', style: 'modern_viet', desc: 'Sự giao thoa giữa kính hiện đại, mái Á Đông và sân vườn.' }
];

const SEEDS_DATA = [
  // HOA
  { id: 'hoa_dao', name: 'Hoa Đào Nhật Tân', category: 'Hoa', cost: 20, sell: 55, growTime: 25, color: '#FF80AB', stemColor: '#5D4037', shape: 'blossom' },
  { id: 'hoa_mai', name: 'Hoa Mai Vàng Phương Nam', category: 'Hoa', cost: 20, sell: 55, growTime: 25, color: '#FFD600', stemColor: '#6D4C41', shape: 'blossom' },
  { id: 'hoa_sen', name: 'Hoa Sen Đồng Tháp', category: 'Hoa', cost: 30, sell: 80, growTime: 35, color: '#F48FB1', stemColor: '#2E7D32', shape: 'lotus' },
  { id: 'hoa_hong', name: 'Hoa Hồng Đà Lạt', category: 'Hoa', cost: 15, sell: 40, growTime: 20, color: '#E53935', stemColor: '#388E3C', shape: 'rose' },
  { id: 'hoa_huong_duong', name: 'Hoa Hướng Dương', category: 'Hoa', cost: 25, sell: 65, growTime: 30, color: '#FBC02D', stemColor: '#4CAF50', shape: 'sunflower' },
  { id: 'hoa_lan', name: 'Hoa Lan Hồ Điệp', category: 'Hoa', cost: 40, sell: 110, growTime: 40, color: '#BA68C8', stemColor: '#43A047', shape: 'orchid' },
  // RAU CỦ
  { id: 'ca_rot', name: 'Cà Rốt Tươi', category: 'Rau Củ', cost: 10, sell: 28, growTime: 15, color: '#FF7043', stemColor: '#66BB6A', shape: 'root' },
  { id: 'ca_chua', name: 'Cà Chua Chín Đỏ', category: 'Rau Củ', cost: 12, sell: 35, growTime: 18, color: '#EF5350', stemColor: '#43A047', shape: 'berry' },
  { id: 'bi_do', name: 'Bí Đỏ Hồ Lô', category: 'Rau Củ', cost: 18, sell: 50, growTime: 22, color: '#FFA726', stemColor: '#2E7D32', shape: 'pumpkin' },
  { id: 'dau_tay', name: 'Dâu Tây Mọng Nước', category: 'Rau Củ', cost: 22, sell: 60, growTime: 24, color: '#EC407A', stemColor: '#388E3C', shape: 'berry' },
  // CÂY ĂN QUẢ
  { id: 'xoai_cat', name: 'Xoài Cát Hòa Lộc', category: 'Cây Ăn Quả', cost: 45, sell: 130, growTime: 45, color: '#FFEE58', stemColor: '#5D4037', shape: 'tree_fruit' },
  { id: 'cam_sanh', name: 'Cam Sành Mọng Nước', category: 'Cây Ăn Quả', cost: 40, sell: 115, growTime: 40, color: '#FFA000', stemColor: '#4E342E', shape: 'tree_fruit' }
];

const HOME_PETS_DATA = [
  { id: 'meo_mun', name: 'Mèo Tam Thể', type: 'cat', cost: 80, color: '#FFE0B2' },
  { id: 'cho_ cỏ', name: 'Chó Phú Quốc Mini', type: 'dog', cost: 100, color: '#D7CCC8' },
  { id: 'tho_trang', name: 'Thỏ Ngọc Trắng', type: 'rabbit', cost: 70, color: '#FFFFFF' },
  { id: 'ga_tre', name: 'Gà Tre Đuôi Dài', type: 'chicken', cost: 60, color: '#FFCC80' },
  { id: 'ca_koi', name: 'Cá Koi Cẩm Tú', type: 'koi', cost: 90, color: '#FF7043' }
];

const CULTURAL_QUIZZES = [
  {
    q: 'Bánh chưng và bánh giầy gắn liền với truyền thuyết vào thời các vua Hùng thứ mấy?',
    options: ['Vua Hùng thứ 6 (Lang Liêu)', 'Vua Hùng thứ 1', 'Vua Hùng thứ 18', 'Thời nhà Lý'],
    ans: 0,
    reward: 50,
    explain: 'Hoàng tử Lang Liêu (đời Hùng Vương thứ 6) đã làm ra bánh chưng hình vuông tượng trưng cho Đất và bánh giầy hình tròn tượng trưng cho Trời.'
  },
  {
    q: 'Kiến trúc "Cổng Tam Quan" thường xuất hiện ở công trình văn hóa nào của Việt Nam?',
    options: ['Ngôi Chùa và Đình Làng truyền thống', 'Các tòa nhà chọc trời', 'Bến cảng thương mại', 'Trạm vũ trụ'],
    ans: 0,
    reward: 50,
    explain: 'Cổng Tam Quan với 3 lối đi (Hữu quan, Không quan, Trung quan) là nét kiến trúc đặc trưng của Chùa Việt Nam.'
  },
  {
    q: 'Trong 12 con giáp Việt Nam, con vật nào đứng ở vị trí thứ 4 (khác với Thỏ ở một số nước Á Đông)?',
    options: ['Mão – Con Mèo', 'Dần – Con Hổ', 'Thìn – Con Rồng', 'Mùi – Con Dê'],
    ans: 0,
    reward: 50,
    explain: 'Văn hóa Việt Nam sử dụng linh vật Mão (Con Mèo) gần gũi với đời sống nông nghiệp lúa nước.'
  },
  {
    q: 'Trò chơi dân gian nào sử dụng các viên sỏi nhỏ chia vào các ô vuông và hai ô lớn ở hai đầu?',
    options: ['Ô Ăn Quan', 'Kéo Co', 'Đập Niêu', 'Nhảy Sạp'],
    ans: 0,
    reward: 60,
    explain: 'Ô ăn quan là trò chơi dân gian rèn luyện tư duy tính toán và chiến thuật rất phổ biến của trẻ em Việt Nam.'
  },
  {
    q: 'Nhà thờ mang phong cách Gothic kết hợp bản địa tại Việt Nam thường nổi bật với chi tiết nào?',
    options: ['Tháp chuông cao vút, cửa vòm nhọn và kính màu', 'Mái rơm thấp không cửa sổ', 'Nhà nổi trên sông', 'Kiến trúc hang động'],
    ans: 0,
    reward: 60,
    explain: 'Các nhà thờ cổ tại Việt Nam kết hợp hài hòa vòm nhọn Gothic, cửa kính màu rực rỡ cùng vật liệu và hoa văn bản địa.'
  }
];

const PLOT_COORDS = [
  { index: 0, name: 'Khu Đất Đông Bắc (Lô 1)', x: -48, z: -42, rotY: Math.PI / 4 },
  { index: 1, name: 'Khu Đất Tây Bắc (Lô 2)', x: 48, z: -42, rotY: -Math.PI / 4 },
  { index: 2, name: 'Khu Đất Tây Nam (Lô 3)', x: -48, z: 42, rotY: (3 * Math.PI) / 4 },
  { index: 3, name: 'Khu Đất Đông Nam (Lô 4)', x: 48, z: 42, rotY: -(3 * Math.PI) / 4 }
];

const WORLD_LANDMARKS = [
  { id: 'park', name: 'Công Viên Thiên Nhiên', x: 0, z: 0, icon: '🌸', color: '#10B981', desc: 'Hồ sen trung tâm, cầu gỗ đỏ, suối mát và rừng hoa đào rơi.' },
  { id: 'church', name: 'Nhà Thờ Gothic Việt Nam', x: 0, z: -58, icon: '⛪', color: '#F59E0B', desc: 'Công trình kiến trúc vòm nhọn, tháp chuông cao và cửa kính màu.' },
  { id: 'pagoda', name: 'Ngôi Chùa Truyền Thống', x: -62, z: 0, icon: '🏮', color: '#EF4444', desc: 'Cổng Tam Quan, tượng Phật vàng, hồ sen và cây Bồ Đề cổ thụ.' },
  { id: 'folk', name: 'Khu Trò Chơi Dân Gian', x: 56, z: 0, icon: '🎲', color: '#8B5CF6', desc: 'Sân chơi Ô Ăn Quan và hoạt động lễ hội văn hóa.' },
  { id: 'plot0', name: 'Nhà & Vườn Lô 1 (ĐB)', x: -48, z: -42, icon: '🏡', color: '#EC4899', desc: 'Khu nhà kiến trúc Việt và 8 luống đất trồng cây Lô 1.' },
  { id: 'plot1', name: 'Nhà & Vườn Lô 2 (TB)', x: 48, z: -42, icon: '🏡', color: '#06B6D4', desc: 'Khu nhà kiến trúc Việt và 8 luống đất trồng cây Lô 2.' },
  { id: 'plot2', name: 'Nhà & Vườn Lô 3 (TN)', x: -48, z: 42, icon: '🏡', color: '#84CC16', desc: 'Khu nhà kiến trúc Việt và 8 luống đất trồng cây Lô 3.' },
  { id: 'plot3', name: 'Nhà & Vườn Lô 4 (ĐN)', x: 48, z: 42, icon: '🏡', color: '#F97316', desc: 'Khu nhà kiến trúc Việt và 8 luống đất trồng cây Lô 4.' }
];

const PUBLIC_SERVERS = [
  { code: 'VIETNAM01', name: 'Kênh Hà Nội – Hồ Gươm', tag: 'Đông vui' },
  { code: 'SAIGON02', name: 'Kênh Sài Gòn – Bến Thành', tag: 'Năng động' },
  { code: 'HOIAN03', name: 'Kênh Phố Cổ Hội An', tag: 'Thư giãn' },
  { code: 'DALAT04', name: 'Kênh Đà Lạt Sương Mù', tag: 'Lãng mạn' }
];

// Danh sách các hành động biểu cảm & tương tác bạn bè vui nhộn
const SOCIAL_ACTIONS = [
  {
    id: 'headlock',
    name: 'Kê Đầu / Xoa Đầu',
    icon: '🤜😵',
    anim: 'headlock',
    chatText: 'vừa nhảy tới KÊ ĐẦU cốc yêu một cái vào đầu',
    soloText: 'đang khởi động tay chuẩn bị đi kê đầu bạn bè! 🤜😄',
    color: 'from-rose-500 to-orange-500'
  },
  {
    id: 'taunt',
    name: 'Chọc Quê Lè Lưỡi',
    icon: '😜🍑',
    anim: 'taunt',
    chatText: 'vừa lắc hông lè lưỡi CHỌC QUÊ "Lêu lêu bắt mình đi!" với',
    soloText: 'đang lè lưỡi lắc mông chọc quê cả làng: Lêu lêu! 😜🎶',
    color: 'from-amber-500 to-pink-500'
  },
  {
    id: 'hiphop',
    name: 'Nhảy Hip-Hop',
    icon: '🕺🔥',
    anim: 'hiphop',
    chatText: 'đang bật nhạc nhảy Hip-Hop cực sung trước mặt',
    soloText: 'đang nhảy Hip-Hop bùng cháy giữa sân làng! 🕺🔥',
    color: 'from-purple-600 to-indigo-500'
  },
  {
    id: 'spindance',
    name: 'Nhảy Xoay Vòng',
    icon: '💃✨',
    anim: 'spindance',
    chatText: 'vừa tung tăng nhảy xoay vòng 360 độ cùng',
    soloText: 'đang nhảy xoay vòng đón hoa đào rơi! 💃🌸',
    color: 'from-pink-500 to-fuchsia-500'
  },
  {
    id: 'highfive',
    name: 'Đập Tay High-Five',
    icon: '🙌⚡',
    anim: 'highfive',
    chatText: 'vừa bật nhảy ĐẬP TAY HIGH-FIVE cực kêu với',
    soloText: 'giơ cao tay tìm đồng đội đập tay High-Five! 🙌✨',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    id: 'giftflower',
    name: 'Tặng Hoa Thả Tim',
    icon: '💐💖',
    anim: 'giftflower',
    chatText: 'vừa cúi chào lịch sự và tặng một bó hoa tươi thắm cho',
    soloText: 'đang nâng niu bó hoa thơm ngát tặng mọi người! 💐💖',
    color: 'from-pink-400 to-rose-500'
  }
];

// Helper to animate any Chibi Character Mesh (Both Local & Remote Online Players)
function applyChibiCharacterAnimation(charMesh, animName, elapsed) {
  if (!charMesh || !charMesh.userData) return;
  const ud = charMesh.userData;

  // Reset baseline transforms before applying active animation
  ud.headGroup.position.set(0, 1.95, 0);
  ud.headGroup.rotation.set(0, 0, 0);
  ud.torsoGroup.rotation.set(0, 0, 0);
  ud.leftArm.rotation.set(0, 0, 0.25);
  ud.rightArm.rotation.set(0, 0, -0.25);
  ud.leftLeg.rotation.set(0, 0, 0);
  ud.rightLeg.rotation.set(0, 0, 0);

  if (animName === 'walk') {
    charMesh.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.14;
    ud.leftLeg.rotation.x = Math.sin(elapsed * 12) * 0.65;
    ud.rightLeg.rotation.x = -Math.sin(elapsed * 12) * 0.65;
    ud.leftArm.rotation.x = -Math.sin(elapsed * 12) * 0.5;
    ud.rightArm.rotation.x = Math.sin(elapsed * 12) * 0.5;
  } else if (animName === 'jump') {
    charMesh.position.y = Math.abs(Math.sin(elapsed * 8)) * 1.1;
    ud.leftArm.rotation.z = 2.5;
    ud.rightArm.rotation.z = -2.5;
  } else if (animName === 'wave') {
    charMesh.position.y = 0;
    ud.rightArm.rotation.z = -2.5 + Math.sin(elapsed * 12) * 0.4;
    ud.headGroup.rotation.z = Math.sin(elapsed * 5) * 0.12;
  } else if (animName === 'dance') {
    charMesh.position.y = Math.abs(Math.sin(elapsed * 10)) * 0.3;
    ud.torsoGroup.rotation.y = Math.sin(elapsed * 6) * 0.35;
    ud.leftArm.rotation.z = 2.0 + Math.sin(elapsed * 10) * 0.45;
    ud.rightArm.rotation.z = -2.0 + Math.cos(elapsed * 10) * 0.45;
  } else if (animName === 'sit') {
    charMesh.position.y = -0.25;
    ud.leftLeg.rotation.x = -Math.PI / 2.2;
    ud.rightLeg.rotation.x = -Math.PI / 2.2;
  } else if (animName === 'headlock') {
    // Hành động Kê Đầu / Cốc đầu trêu bạn: nhảy chồm nhẹ, tay trái vòng kẹp cổ, tay phải xoa/cốc liên hồi
    charMesh.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.22;
    ud.torsoGroup.rotation.x = 0.28;
    ud.torsoGroup.rotation.y = Math.sin(elapsed * 12) * 0.2;
    ud.leftArm.rotation.x = -1.35;
    ud.leftArm.rotation.z = -0.45;
    ud.rightArm.rotation.x = -1.7 + Math.sin(elapsed * 22) * 0.45;
    ud.rightArm.rotation.z = 0.35 + Math.cos(elapsed * 22) * 0.25;
    ud.headGroup.rotation.z = Math.sin(elapsed * 10) * 0.18;
  } else if (animName === 'taunt') {
    // Hành động Chọc Quê (Lêu lêu): nghiêng đầu lắc lư, 2 tay đưa lên hai bên tai vẫy trêu chọc, lắc hông
    charMesh.position.y = Math.abs(Math.sin(elapsed * 14)) * 0.18;
    ud.headGroup.rotation.z = Math.sin(elapsed * 14) * 0.32;
    ud.headGroup.rotation.y = Math.cos(elapsed * 7) * 0.25;
    ud.torsoGroup.rotation.z = -Math.sin(elapsed * 14) * 0.22;
    ud.leftArm.rotation.z = 2.25 + Math.sin(elapsed * 20) * 0.35;
    ud.rightArm.rotation.z = -2.25 - Math.sin(elapsed * 20) * 0.35;
    ud.leftLeg.rotation.z = Math.max(0, Math.sin(elapsed * 14) * 0.4);
    ud.rightLeg.rotation.z = Math.min(0, Math.sin(elapsed * 14) * 0.4);
  } else if (animName === 'hiphop') {
    // Hành động Nhảy Hip-Hop: nhún nhảy nhịp đôi, đá chân và đánh tay chéo cực chất
    const beat = elapsed * 13;
    charMesh.position.y = Math.abs(Math.sin(beat)) * 0.42;
    ud.torsoGroup.rotation.y = Math.sin(beat * 0.5) * 0.5;
    ud.torsoGroup.rotation.x = Math.cos(beat) * 0.2;
    ud.headGroup.position.y = 1.95 + Math.abs(Math.cos(beat)) * 0.08;
    ud.leftArm.rotation.x = Math.sin(beat) * 1.3;
    ud.rightArm.rotation.x = -Math.sin(beat) * 1.3;
    ud.leftArm.rotation.z = 1.1 + Math.cos(beat) * 0.5;
    ud.rightArm.rotation.z = -1.1 - Math.cos(beat) * 0.5;
    ud.leftLeg.rotation.x = -Math.sin(beat) * 0.7;
    ud.rightLeg.rotation.x = Math.sin(beat) * 0.7;
  } else if (animName === 'spindance') {
    // Hành động Nhảy Xoay Vòng 360 độ
    charMesh.position.y = Math.abs(Math.sin(elapsed * 10)) * 0.55;
    charMesh.rotation.y += 0.18;
    ud.leftArm.rotation.z = 2.4;
    ud.rightArm.rotation.z = -2.4;
    ud.leftLeg.rotation.z = 0.35;
    ud.rightLeg.rotation.z = -0.35;
  } else if (animName === 'highfive') {
    // Hành động Đập Tay High-Five trên cao
    charMesh.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.75;
    ud.rightArm.rotation.x = -2.6 + Math.sin(elapsed * 14) * 0.35;
    ud.leftArm.rotation.x = -2.6 + Math.sin(elapsed * 14) * 0.35;
    ud.headGroup.rotation.x = -0.25;
  } else if (animName === 'giftflower') {
    // Hành động Tặng Hoa & Cúi chào đáng yêu
    charMesh.position.y = 0;
    ud.torsoGroup.rotation.x = 0.25 + Math.sin(elapsed * 4) * 0.1;
    ud.headGroup.rotation.x = 0.2 + Math.sin(elapsed * 4) * 0.1;
    ud.leftArm.rotation.x = -1.25;
    ud.rightArm.rotation.x = -1.25;
    ud.leftArm.rotation.z = -0.3;
    ud.rightArm.rotation.z = 0.3;
  } else {
    charMesh.position.y = Math.sin(elapsed * 2.5) * 0.03;
  }
}

// ==========================================
// 3. PROCEDURAL 3D MESH BUILDERS (THREE.JS)
// ==========================================

// Build a complete distinct 3D Chibi Character based on Zodiac + Outfit
function createChibiCharacterMesh(zodiacId, outfitId) {
  const group = new THREE.Group();
  const zodiac = ZODIAC_CHARS.find(z => z.id === zodiacId) || ZODIAC_CHARS[0];
  const outfit = OUTFITS.find(o => o.id === outfitId) || OUTFITS[0];

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFE4E1, roughness: 0.6 });
  const zodiacMainMat = new THREE.MeshStandardMaterial({ color: zodiac.color, roughness: 0.5 });
  const zodiacAccentMat = new THREE.MeshStandardMaterial({ color: zodiac.accent, roughness: 0.4 });
  const outfitMainMat = new THREE.MeshStandardMaterial({ color: outfit.primary, roughness: 0.5 });
  const outfitSecMat = new THREE.MeshStandardMaterial({ color: outfit.secondary, roughness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2 });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xFF8A9A, transparent: true, opacity: 0.65 });

  // 1. Chibi Legs (Pivot for walking animation)
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.55, 12), outfitSecMat);
  leftLeg.position.set(-0.22, 0.27, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.55, 12), outfitSecMat);
  rightLeg.position.set(0.22, 0.27, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // 2. Chibi Body / Outfit Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.9, 0);

  const baseBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.85, 16), outfitMainMat);
  baseBody.castShadow = true;
  torsoGroup.add(baseBody);

  // Distinct Outfit Geometry Additions
  if (outfit.id === 'aodai' || outfit.id === 'tet') {
    // Flowing Ao Dai panels front & back
    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.08), outfitMainMat);
    frontPanel.position.set(0, -0.15, 0.42);
    torsoGroup.add(frontPanel);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), outfitSecMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.42, 0);
    torsoGroup.add(collar);
  } else if (outfit.id === 'tuthan' || outfit.id === 'dantoc') {
    // Layered skirt & sash
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.7, 16), outfitSecMat);
    skirt.position.set(0, -0.15, 0);
    torsoGroup.add(skirt);
  } else if (outfit.id === 'cyberpunk' || outfit.id === 'tuonglai') {
    const neonMat = new THREE.MeshStandardMaterial({ color: outfit.secondary, emissive: outfit.secondary, emissiveIntensity: 0.8 });
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 8, 20), neonMat);
    belt.rotation.x = Math.PI / 2;
    torsoGroup.add(belt);
  } else if (outfit.id === 'phihanhgia') {
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.35), outfitSecMat);
    backpack.position.set(0, 0.05, -0.45);
    torsoGroup.add(backpack);
  }

  group.add(torsoGroup);

  // 3. Chibi Arms
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.6, 12), outfitMainMat);
  leftArm.position.set(-0.54, 0.95, 0);
  leftArm.rotation.z = 0.25;
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.6, 12), outfitMainMat);
  rightArm.position.set(0.54, 0.95, 0);
  rightArm.rotation.z = -0.25;
  rightArm.castShadow = true;
  group.add(rightArm);

  // 4. Big Cute Chibi Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.95, 0);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), skinMat);
  headSphere.scale.set(1.08, 0.96, 1.0);
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  // Hair / Hood cap in Zodiac pastel color
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
    zodiacMainMat
  );
  hairCap.rotation.x = -0.15;
  hairCap.position.set(0, 0.04, -0.02);
  headGroup.add(hairCap);

  // Big Expressive Eyes
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), darkMat);
  leftEye.position.set(-0.26, -0.04, 0.66);
  leftEye.scale.set(1, 1.3, 0.5);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), darkMat);
  rightEye.position.set(0.26, -0.04, 0.66);
  rightEye.scale.set(1, 1.3, 0.5);
  headGroup.add(rightEye);

  // Eye Sparkles
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const sparkleL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), whiteMat);
  sparkleL.position.set(-0.23, 0.01, 0.71);
  headGroup.add(sparkleL);

  const sparkleR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), whiteMat);
  sparkleR.position.set(0.29, 0.01, 0.71);
  headGroup.add(sparkleR);

  // Rosy Cheeks
  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), blushMat);
  cheekL.position.set(-0.42, -0.16, 0.58);
  cheekL.scale.set(1.3, 0.7, 0.4);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), blushMat);
  cheekR.position.set(0.42, -0.16, 0.58);
  cheekR.scale.set(1.3, 0.7, 0.4);
  headGroup.add(cheekR);

  // 5. DISTINCT 12 ZODIAC EARS / HORNS / FEATURES (Not just color swap!)
  if (zodiac.id === 'ty') {
    // Big round mouse ears
    [-0.55, 0.55].forEach(xPos => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 20), zodiacMainMat);
      ear.rotation.x = Math.PI / 2;
      ear.position.set(xPos, 0.58, 0);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), zodiacAccentMat);
      inner.rotation.x = Math.PI / 2;
      inner.position.set(xPos, 0.58, 0.01);
      headGroup.add(ear, inner);
    });
  } else if (zodiac.id === 'suu') {
    // Curved Buffalo Horns
    [-0.48, 0.48].forEach((xPos, i) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 12), darkMat);
      horn.position.set(xPos, 0.65, 0);
      horn.rotation.z = i === 0 ? 0.65 : -0.65;
      headGroup.add(horn);
    });
  } else if (zodiac.id === 'dan') {
    // Tiger ears + forehead king stripe
    [-0.48, 0.48].forEach(xPos => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), zodiacAccentMat);
      ear.position.set(xPos, 0.62, 0);
      headGroup.add(ear);
    });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.1), darkMat);
    stripe.position.set(0, 0.32, 0.7);
    headGroup.add(stripe);
  } else if (zodiac.id === 'mao') {
    // Pointed Cat Ears
    [-0.45, 0.45].forEach((xPos, i) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 4), zodiacMainMat);
      ear.position.set(xPos, 0.68, 0);
      ear.rotation.z = i === 0 ? 0.25 : -0.25;
      headGroup.add(ear);
    });
  } else if (zodiac.id === 'thin') {
    // Dragon Antlers & Whiskers
    [-0.38, 0.38].forEach((xPos, i) => {
      const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.65, 8), zodiacAccentMat);
      antler.position.set(xPos, 0.78, -0.05);
      antler.rotation.z = i === 0 ? 0.3 : -0.3;
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), zodiacAccentMat);
      branch.position.set(xPos * 1.2, 0.85, 0.05);
      headGroup.add(antler, branch);
    });
  } else if (zodiac.id === 'ty_snake') {
    // Snake Crown Gem & small fangs
    const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), zodiacAccentMat);
    crown.position.set(0, 0.78, 0.25);
    headGroup.add(crown);
  } else if (zodiac.id === 'ngo') {
    // Horse Upright Ears + Center Mane Crest
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.75), zodiacAccentMat);
    mane.position.set(0, 0.58, -0.15);
    headGroup.add(mane);
  } else if (zodiac.id === 'mui') {
    // Fluffy Sheep/Goat Curled Horns
    [-0.58, 0.58].forEach(xPos => {
      const curl = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 10, 16), zodiacAccentMat);
      curl.position.set(xPos, 0.35, 0);
      headGroup.add(curl);
    });
  } else if (zodiac.id === 'than') {
    // Monkey Side Ears + Golden Headband
    [-0.72, 0.72].forEach(xPos => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
      ear.position.set(xPos, 0.05, 0);
      headGroup.add(ear);
    });
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.04, 8, 24), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
    band.rotation.x = Math.PI / 2;
    band.position.set(0, 0.28, 0);
    headGroup.add(band);
  } else if (zodiac.id === 'dau') {
    // Red Rooster Comb on top
    for (let i = -1; i <= 1; i++) {
      const comb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), zodiacAccentMat);
      comb.position.set(0, 0.72 + (1 - Math.abs(i)) * 0.08, i * 0.22);
      headGroup.add(comb);
    }
  } else if (zodiac.id === 'tuat') {
    // Floppy Dog Ears
    [-0.65, 0.65].forEach((xPos, i) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.28), zodiacAccentMat);
      ear.position.set(xPos, 0.2, 0);
      ear.rotation.z = i === 0 ? 0.35 : -0.35;
      headGroup.add(ear);
    });
  } else if (zodiac.id === 'hoi') {
    // Cute Pig Snout + Folded Ears
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16), zodiacAccentMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.12, 0.72);
    headGroup.add(snout);
  }

  // 6. OUTFIT HATS / ACCESSORIES
  if (outfit.hat === 'non_quai_thao') {
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 24), outfitMainMat);
    hat.position.set(0, 0.76, 0);
    headGroup.add(hat);
  } else if (outfit.hat === 'khan_dong' || outfit.hat === 'mao_vang') {
    const khan = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 12, 24), outfitMainMat);
    khan.rotation.x = Math.PI / 2;
    khan.position.set(0, 0.56, 0);
    headGroup.add(khan);
  } else if (outfit.hat === 'visor') {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.22, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.7, transparent: true, opacity: 0.85 })
    );
    visor.position.set(0, 0.02, 0.62);
    headGroup.add(visor);
  } else if (outfit.hat === 'helmet') {
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(0.92, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xE0F7FA, transparent: true, opacity: 0.32, roughness: 0.1 })
    );
    headGroup.add(glass);
  }

  group.add(headGroup);

  // 7. Zodiac Tail at the back
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), zodiacAccentMat);
  tail.position.set(0, 0.65, -0.48);
  if (zodiac.id === 'thin' || zodiac.id === 'dan' || zodiac.id === 'mao') {
    tail.scale.set(0.7, 0.7, 2.2);
    tail.position.z = -0.62;
  }
  group.add(tail);

  group.userData = { leftLeg, rightLeg, leftArm, rightArm, headGroup, torsoGroup, tail };
  return group;
}

// Build a HIGHLY DETAILED Multi-Part 3D Winged Insect Fairy Pet
function createFairyPetMesh(petId) {
  const group = new THREE.Group();
  const pet = FAIRY_PETS.find(p => p.id === petId) || FAIRY_PETS[0];

  const primaryMat = new THREE.MeshStandardMaterial({
    color: pet.color,
    roughness: 0.32,
    metalness: 0.1
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: pet.glow,
    emissive: pet.glow,
    emissiveIntensity: 0.85,
    roughness: 0.2
  });
  const darkStripeMat = new THREE.MeshStandardMaterial({ color: 0x1E1B18, roughness: 0.4 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFE8D6, roughness: 0.5 });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xFF758F, transparent: true, opacity: 0.7 });
  const eyeDarkMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  const wingMat = new THREE.MeshStandardMaterial({
    color: pet.glow,
    emissive: pet.color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.25
  });

  const innerBodyGroup = new THREE.Group();
  group.add(innerBodyGroup);

  // 1. DETAILED CHIBI HEAD (All species share expressive eyes, specular shine, rosy cheeks & curved antennae)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.16, 0.28);

  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    pet.id === 'tien_hoa' ? skinMat : primaryMat
  );
  headMesh.scale.set(1.08, 0.96, 0.95);
  headGroup.add(headMesh);

  // Expressive Eyes + Dual Specular Highlights
  [-0.075, 0.075].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), eyeDarkMat);
    eye.position.set(ex, 0.02, 0.155);
    eye.scale.set(1, 1.2, 0.6);
    headGroup.add(eye);

    const shineBig = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), eyeSparkleMat);
    shineBig.position.set(ex + 0.012, 0.035, 0.178);
    headGroup.add(shineBig);

    const shineSmall = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), eyeSparkleMat);
    shineSmall.position.set(ex - 0.012, 0.005, 0.176);
    headGroup.add(shineSmall);
  });

  // Rosy Cheeks
  [-0.12, 0.12].forEach((cx) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), blushMat);
    cheek.position.set(cx, -0.025, 0.145);
    cheek.scale.set(1.3, 0.7, 0.4);
    headGroup.add(cheek);
  });

  // Curved Antennae with Glowing Tips
  const antennae = [];
  [-0.065, 0.065].forEach((ax, idx) => {
    const antPivot = new THREE.Group();
    antPivot.position.set(ax, 0.15, 0.06);
    antPivot.rotation.z = idx === 0 ? 0.35 : -0.35;
    antPivot.rotation.x = 0.45;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.014, 0.22, 8), darkStripeMat);
    stem.position.y = 0.11;
    antPivot.add(stem);

    const tipOrb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), glowMat);
    tipOrb.position.y = 0.23;
    antPivot.add(tipOrb);

    headGroup.add(antPivot);
    antennae.push(antPivot);
  });

  innerBodyGroup.add(headGroup);

  // 2. SPECIES-SPECIFIC SEGMENTED THORAX, ABDOMEN & ACCESSORIES
  const leftWingGroup = new THREE.Group();
  leftWingGroup.position.set(-0.08, 0.12, 0.02);
  const rightWingGroup = new THREE.Group();
  rightWingGroup.position.set(0.08, 0.12, 0.02);
  innerBodyGroup.add(leftWingGroup, rightWingGroup);

  let tailGlowMesh = null;

  if (pet.id === 'ong_mat') {
    // HONEY BEE: Fluffy golden thorax, striped abdomen, stinger, & pollen baskets
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 18), primaryMat);
    thorax.position.set(0, 0.05, 0.05);
    innerBodyGroup.add(thorax);

    // Striped Abdomen (3 alternating segments)
    const abdomenGroup = new THREE.Group();
    abdomenGroup.position.set(0, -0.04, -0.22);
    [-0.12, -0.04, 0.04, 0.12].forEach((zOff, sIdx) => {
      const ringRadius = 0.21 - Math.abs(zOff) * 0.45;
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(ringRadius, ringRadius, 0.075, 16),
        sIdx % 2 === 0 ? darkStripeMat : primaryMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.z = zOff;
      abdomenGroup.add(ring);
    });
    // Tiny Bee Stinger
    const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 10), darkStripeMat);
    stinger.rotation.x = -Math.PI / 2;
    stinger.position.z = -0.22;
    abdomenGroup.add(stinger);
    innerBodyGroup.add(abdomenGroup);

    // Golden Pollen Baskets on hind legs
    [-0.16, 0.16].forEach(px => {
      const pollen = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), glowMat);
      pollen.position.set(px, -0.12, -0.06);
      innerBodyGroup.add(pollen);
    });

    // Double Rounded Bee Wings
    const foreWingL = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), wingMat);
    foreWingL.scale.set(1.3, 0.75, 1);
    foreWingL.position.set(-0.28, 0.06, 0);
    leftWingGroup.add(foreWingL);

    const foreWingR = foreWingL.clone();
    foreWingR.position.set(0.28, 0.06, 0);
    rightWingGroup.add(foreWingR);

  } else if (pet.id === 'bo_rua') {
    // LADYBUG: Glossy red split elytra shell with 7 black spots + translucent inner wings
    const underBody = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), darkStripeMat);
    underBody.scale.set(1.05, 0.75, 1.25);
    innerBodyGroup.add(underBody);

    // Left & Right Red Elytra Domes (slightly open while flying)
    [-1, 1].forEach((dir) => {
      const shellGroup = new THREE.Group();
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.235, 18, 18, 0, Math.PI, 0, Math.PI / 2),
        primaryMat
      );
      shell.scale.set(1.0, 0.9, 1.25);
      shellGroup.add(shell);

      // Black Polka Dots on Shell
      [[0.08 * dir, 0.18, 0.05], [0.14 * dir, 0.12, -0.08], [0.06 * dir, 0.16, -0.16]].forEach(([dx, dy, dz]) => {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), darkStripeMat);
        spot.position.set(dx, dy, dz);
        shellGroup.add(spot);
      });

      shellGroup.position.set(dir * 0.04, 0.02, -0.05);
      shellGroup.rotation.z = -dir * 0.32;
      shellGroup.rotation.y = dir * 0.18;
      innerBodyGroup.add(shellGroup);
    });

    // Translucent Flying Wings beneath shell
    const wingL = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), wingMat);
    wingL.scale.set(1.35, 0.65, 1);
    wingL.position.set(-0.3, 0.02, -0.05);
    leftWingGroup.add(wingL);

    const wingR = wingL.clone();
    wingR.position.set(0.3, 0.02, -0.05);
    rightWingGroup.add(wingR);

  } else if (pet.id === 'chuon_chuon' || pet.id === 'chuon_pha_le') {
    // DRAGONFLY & CRYSTAL DRAGONFLY: Long segmented tail & 4 iridescent veined wings
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), primaryMat);
    thorax.scale.set(0.9, 0.95, 1.3);
    thorax.position.set(0, 0.06, 0.06);
    innerBodyGroup.add(thorax);

    // 6-Segment Slender Tail
    for (let s = 0; s < 6; s++) {
      const segRadius = 0.075 - s * 0.007;
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(segRadius, segRadius * 0.88, 0.11, 12),
        s % 2 === 0 ? primaryMat : glowMat
      );
      seg.rotation.x = Math.PI / 2;
      seg.position.set(0, 0.04 - s * 0.01, -0.14 - s * 0.1);
      innerBodyGroup.add(seg);
    }

    // 4 Long Dragonfly Wings (Forewings & Hindwings)
    const createDragonflyWing = (isLeft, isFore) => {
      const wHolder = new THREE.Group();
      const length = isFore ? 0.56 : 0.48;
      const blade = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), wingMat);
      blade.scale.set(length, 0.15, 1);
      blade.position.x = (isLeft ? -1 : 1) * (length * 0.48);
      wHolder.add(blade);

      // Glowing Vein Bar along leading edge
      const vein = new THREE.Mesh(new THREE.BoxGeometry(length * 0.95, 0.015, 0.015), glowMat);
      vein.position.set((isLeft ? -1 : 1) * (length * 0.48), 0.03, 0.01);
      wHolder.add(vein);

      wHolder.position.z = isFore ? 0.06 : -0.08;
      wHolder.rotation.z = (isLeft ? 1 : -1) * (isFore ? -0.12 : 0.15);
      return wHolder;
    };

    leftWingGroup.add(createDragonflyWing(true, true), createDragonflyWing(true, false));
    rightWingGroup.add(createDragonflyWing(false, true), createDragonflyWing(false, false));

  } else if (pet.id === 'dom_dom') {
    // FIREFLY: Cute beetle thorax + Large Radiant Bioluminescent Tail Lantern
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), darkStripeMat);
    thorax.position.set(0, 0.05, 0.06);
    innerBodyGroup.add(thorax);

    // Glowing Lantern Abdomen
    tailGlowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 20), glowMat);
    tailGlowMesh.scale.set(1.0, 0.95, 1.35);
    tailGlowMesh.position.set(0, -0.02, -0.22);
    innerBodyGroup.add(tailGlowMesh);

    // Outer Halo Ring around tail
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 16, 16),
      new THREE.MeshBasicMaterial({ color: pet.glow, transparent: true, opacity: 0.3 })
    );
    tailGlowMesh.add(halo);

    // Cute Wing Covers + Inner Wings
    const wingL = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), wingMat);
    wingL.scale.set(1.3, 0.7, 1);
    wingL.position.set(-0.28, 0.05, -0.04);
    leftWingGroup.add(wingL);

    const wingR = wingL.clone();
    wingR.position.set(0.28, 0.05, -0.04);
    rightWingGroup.add(wingR);

  } else if (pet.id === 'tien_hoa') {
    // FLOWER BLOSSOM FAIRY: Chibi humanoid fairy body + layered flower petal skirt + stamen crown
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 6), glowMat);
    crown.position.set(0, 0.21, 0);
    headGroup.add(crown);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.26, 12), primaryMat);
    torso.position.set(0, -0.06, 0.18);
    innerBodyGroup.add(torso);

    // 6-Petal Blossom Skirt
    const skirtGroup = new THREE.Group();
    skirtGroup.position.set(0, -0.18, 0.18);
    for (let p = 0; p < 6; p++) {
      const angle = (p / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 8), p % 2 === 0 ? primaryMat : glowMat);
      petal.position.set(Math.cos(angle) * 0.11, -0.05, Math.sin(angle) * 0.11);
      petal.rotation.z = Math.cos(angle) * 0.45;
      petal.rotation.x = -Math.sin(angle) * 0.45;
      skirtGroup.add(petal);
    }
    innerBodyGroup.add(skirtGroup);

    // 4 Petal-shaped Fairy Wings
    const createPetalWing = (isLeft) => {
      const wG = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), wingMat);
      upper.scale.set(1.25, 0.85, 1);
      upper.position.set((isLeft ? -1 : 1) * 0.28, 0.12, 0);
      upper.rotation.z = (isLeft ? -1 : 1) * 0.25;

      const lower = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), wingMat);
      lower.scale.set(1.15, 0.75, 1);
      lower.position.set((isLeft ? -1 : 1) * 0.22, -0.1, -0.02);
      lower.rotation.z = (isLeft ? 1 : -1) * 0.2;

      wG.add(upper, lower);
      return wG;
    };
    leftWingGroup.add(createPetalWing(true));
    rightWingGroup.add(createPetalWing(false));

  } else {
    // BUTTERFLY FAIRY (buom_tien) & MOONLIGHT MOTH (buom_dem):
    // Slender body + Ornate Multi-Layered Upper & Lower Wings with Decorative Eye-Spots
    const thorax = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 12), primaryMat);
    thorax.rotation.x = Math.PI / 2;
    thorax.position.set(0, 0.04, -0.02);
    innerBodyGroup.add(thorax);

    const buildButterflySide = (isLeft) => {
      const side = new THREE.Group();
      const dir = isLeft ? -1 : 1;

      // Large Upper Forewing
      const upperWing = new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), wingMat);
      upperWing.scale.set(1.25, 0.92, 1);
      upperWing.position.set(dir * 0.34, 0.14, 0.02);
      upperWing.rotation.z = -dir * 0.22;
      side.add(upperWing);

      // Decorative Glowing Inner Pattern Spot on Upper Wing
      const patternSpot = new THREE.Mesh(new THREE.CircleGeometry(0.13, 14), glowMat);
      patternSpot.position.set(dir * 0.42, 0.18, 0.03);
      side.add(patternSpot);

      // Lower Hindwing
      const lowerWing = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), wingMat);
      lowerWing.scale.set(1.15, 0.85, 1);
      lowerWing.position.set(dir * 0.26, -0.12, -0.02);
      lowerWing.rotation.z = dir * 0.25;
      side.add(lowerWing);

      return side;
    };

    leftWingGroup.add(buildButterflySide(true));
    rightWingGroup.add(buildButterflySide(false));
  }

  // 3. SIX TINY TUCKED INSECT LEGS
  [-0.08, 0.08].forEach((lx) => {
    [-0.06, 0.04, 0.12].forEach((lz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.12, 6), darkStripeMat);
      leg.position.set(lx, -0.11, lz);
      leg.rotation.z = lx < 0 ? 0.3 : -0.3;
      innerBodyGroup.add(leg);
    });
  });

  // 4. SPARKLING FAIRY DUST TRAIL ORBS (Animated in loop)
  const dustTrailGroup = new THREE.Group();
  const dustOrbs = [];
  for (let d = 0; d < 6; d++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.038 - d * 0.004, 8, 8),
      new THREE.MeshBasicMaterial({ color: pet.glow, transparent: true, opacity: 0.85 - d * 0.12 })
    );
    orb.position.set(0, 0, -0.25 - d * 0.16);
    dustTrailGroup.add(orb);
    dustOrbs.push(orb);
  }
  group.add(dustTrailGroup);

  // 5. POINT LIGHT FOR GLOWING AMBIENCE
  const petLight = new THREE.PointLight(pet.glow, pet.id === 'dom_dom' ? 1.8 : 0.7, 7.5);
  petLight.position.set(0, 0.1, 0);
  group.add(petLight);

  group.userData = {
    leftWing: leftWingGroup,
    rightWing: rightWingGroup,
    antennae,
    dustOrbs,
    tailGlowMesh,
    innerBodyGroup,
    petLight
  };
  return group;
}

// Helper to animate the detailed Fairy Pet in both Turntable & World
function animateDetailedFairyPet(petMesh, elapsed, isMoving = false, happySpinUntil = 0) {
  if (!petMesh || !petMesh.userData) return;
  const { leftWing, rightWing, antennae, dustOrbs, tailGlowMesh, innerBodyGroup } = petMesh.userData;

  // High-frequency wing flapping
  const flapSpeed = isMoving ? 38 : 26;
  const flapAmp = isMoving ? 0.72 : 0.55;
  if (leftWing && rightWing) {
    leftWing.rotation.y = 0.25 + Math.sin(elapsed * flapSpeed) * flapAmp;
    rightWing.rotation.y = -0.25 - Math.sin(elapsed * flapSpeed) * flapAmp;
  }

  // Gentle antennae bobbing
  if (antennae && antennae.length === 2) {
    antennae[0].rotation.x = 0.45 + Math.sin(elapsed * 6) * 0.12;
    antennae[1].rotation.x = 0.45 + Math.cos(elapsed * 6) * 0.12;
  }

  // Sparkling Fairy Dust Trail wave
  if (dustOrbs) {
    dustOrbs.forEach((orb, idx) => {
      orb.position.x = Math.sin(elapsed * 8 + idx * 1.1) * (0.08 + idx * 0.02);
      orb.position.y = Math.cos(elapsed * 7 + idx * 0.9) * 0.08 - idx * 0.02;
      const scalePulse = 0.7 + Math.sin(elapsed * 10 + idx) * 0.35;
      orb.scale.setScalar(scalePulse);
    });
  }

  // Firefly bioluminescent pulse
  if (tailGlowMesh) {
    const pulse = 1.0 + Math.sin(elapsed * 5) * 0.12;
    tailGlowMesh.scale.set(pulse, pulse * 0.95, pulse * 1.35);
  }

  // Forward tilt when flying fast or joyful spin when petted/fed
  if (innerBodyGroup) {
    if (Date.now() < happySpinUntil) {
      innerBodyGroup.rotation.y += 0.28;
      innerBodyGroup.position.y = Math.sin(elapsed * 18) * 0.15;
    } else {
      innerBodyGroup.rotation.y *= 0.85;
      innerBodyGroup.position.y = 0;
      innerBodyGroup.rotation.x = isMoving ? 0.28 : 0.05;
    }
  }
}

// Build 3D Plant Model for each of the 6 growth stages
function createPlantStageMesh(seedId, stage) {
  const group = new THREE.Group();
  const seed = SEEDS_DATA.find(s => s.id === seedId) || SEEDS_DATA[0];
  const greenMat = new THREE.MeshStandardMaterial({ color: seed.stemColor || 0x4CAF50, roughness: 0.6 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: seed.color, roughness: 0.4 });
  const soilMoundMat = new THREE.MeshStandardMaterial({ color: 0x4E342E, roughness: 0.9 });

  if (stage <= 0) return group;

  // Stage 1: Đất vừa gieo hạt (Seeded mound)
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), soilMoundMat);
  group.add(mound);
  if (stage === 1) return group;

  // Stage 2: Hạt giống nảy mầm (Tiny sprout)
  const stemHeight = stage === 2 ? 0.35 : stage === 3 ? 0.75 : 1.15;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, stemHeight, 8), greenMat);
  stem.position.y = stemHeight / 2;
  group.add(stem);

  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), greenMat);
  leaf1.scale.set(1.8, 0.4, 1);
  leaf1.position.set(0.14, stemHeight * 0.6, 0);
  group.add(leaf1);

  if (stage === 2) return group;

  // Stage 3: Cây con (Seedling with more leaves)
  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), greenMat);
  leaf2.scale.set(1.8, 0.4, 1);
  leaf2.position.set(-0.15, stemHeight * 0.75, 0);
  group.add(leaf2);

  if (stage === 3) return group;

  // Stage 4: Cây trưởng thành (Mature foliage bush/canopy)
  const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), greenMat);
  bush.position.y = stemHeight;
  group.add(bush);

  if (stage === 4) return group;

  // Stage 5: Ra hoa hoặc kết trái (Budding/Flowering)
  const budCount = stage === 5 ? 3 : 6;
  for (let i = 0; i < budCount; i++) {
    const angle = (i / budCount) * Math.PI * 2;
    const radius = 0.32;
    const blossomSize = stage === 6 ? 0.24 : 0.14;
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(blossomSize, 12, 12), flowerMat);
    bloom.position.set(
      Math.cos(angle) * radius,
      stemHeight + 0.22 + (i % 2) * 0.12,
      Math.sin(angle) * radius
    );
    group.add(bloom);
  }

  // Stage 6: Có thể thu hoạch (Full Crown + Golden Sparkle Ring)
  if (stage === 6) {
    const topCrown = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), flowerMat);
    topCrown.position.y = stemHeight + 0.45;
    group.add(topCrown);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, wireframe: true });
    const readyRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 20), ringMat);
    readyRing.rotation.x = Math.PI / 2;
    readyRing.position.y = stemHeight + 0.5;
    group.add(readyRing);
  }

  return group;
}

// Build a Vietnamese House Architecture Mesh based on style
function createVietnameseHouseMesh(styleId) {
  const group = new THREE.Group();
  const houseStyle = HOUSE_STYLES.find(h => h.id === styleId) || HOUSE_STYLES[0];

  const wallMat = new THREE.MeshStandardMaterial({ color: houseStyle.wallColor, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: houseStyle.roofColor, roughness: 0.5 });
  const woodMat = new THREE.MeshStandardMaterial({ color: houseStyle.woodColor, roughness: 0.8 });
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xFF5252, emissive: 0xFF8A80, emissiveIntensity: 0.8 });

  const isStilt = houseStyle.id === 'nhasan';
  const baseElevation = isStilt ? 1.8 : 0.3;

  // Foundation or Stilts
  if (isStilt) {
    for (let x = -3.5; x <= 3.5; x += 3.5) {
      for (let z = -2.2; z <= 2.2; z += 2.2) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.0, 8), woodMat);
        post.position.set(x, 1.0, z);
        group.add(post);
      }
    }
  } else {
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.4, 6.4), woodMat);
    foundation.position.y = 0.2;
    group.add(foundation);
  }

  // Main 3-bay house walls (Nhà 3 gian)
  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.4, 5.2), wallMat);
  mainBody.position.y = baseElevation + 1.7;
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  group.add(mainBody);

  // Wooden Pillars along the front porch
  for (let x = -3.6; x <= 3.6; x += 2.4) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.4, 10), woodMat);
    pillar.position.set(x, baseElevation + 1.7, 2.75);
    group.add(pillar);
  }

  // Front Door & Side Windows
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.15), woodMat);
  door.position.set(0, baseElevation + 1.15, 2.62);
  group.add(door);

  // Curved Vietnamese Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 2.8, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.3, 1, 0.95);
  roof.position.y = baseElevation + 4.7;
  roof.castShadow = true;
  group.add(roof);

  // Hanging Front Lanterns
  [-2.4, 2.4].forEach(xPos => {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), lanternMat);
    lantern.scale.set(1, 1.3, 1);
    lantern.position.set(xPos, baseElevation + 3.0, 2.95);
    group.add(lantern);
  });

  // Outdoor Tea Table Set in front yard
  const teaTable = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.55, 16), woodMat);
  teaTable.position.set(3.5, 0.3, 5.2);
  group.add(teaTable);

  return group;
}

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================
interface PlayerData {
  uid: string;
  name: string;
  x: number;
  y?: number;
  z: number;
  rotY?: number;
  anim?: string;
  zodiac?: string;
  outfit?: string;
  pet?: string;
  petName?: string;
  plotIndex?: number;
  distance?: number;
  [key: string]: unknown;
}

interface PlotData {
  ownerId?: string;
  ownerName?: string;
  houseStyle?: string;
  protected?: boolean;
  homePets?: string[];
  beds?: unknown[];
  [key: string]: unknown;
}

interface RemotePlayerEntry {
  charGroup: THREE.Group;
  petGroup?: THREE.Group | null;
}

interface PlotSceneEntry {
  yardPet?: THREE.Group | null;
}
export default function App() {
  // Authentication & Room States
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('wardrobe'); // 'wardrobe' | 'world'
  const [roomCode, setRoomCode] = useState('VIETNAM01');
  const [roomInput, setRoomInput] = useState('VIETNAM01');

  // Player Profile & Customization State
  const [playerName, setPlayerName] = useState('Chibi Lữ Khách');
  const [selectedZodiac, setSelectedZodiac] = useState('mao');
  const [selectedOutfit, setSelectedOutfit] = useState('aodai');
  const [selectedPet, setSelectedPet] = useState('buom_tien');
  const [petCustomName, setPetCustomName] = useState('Tiên Nhỏ');
  const [petLevel, setPetLevel] = useState(3);
  const [petAffection, setPetAffection] = useState(85);
  const [selectedHouseStyle, setSelectedHouseStyle] = useState('bagian');
  const [myPlotIndex, setMyPlotIndex] = useState(0);

  // Economy, Inventory & Quests
  const [coins, setCoins] = useState(250);
  const [selectedSeed, setSelectedSeed] = useState('hoa_dao');
  const [harvestedBag, setHarvestedBag] = useState({ hoa_dao: 2, hoa_sen: 1 });
  const [myHomePets, setMyHomePets] = useState(['meo_mun', 'ca_koi']);
  const [houseProtection, setHouseProtection] = useState(false);
  const [stealCooldown, setStealCooldown] = useState(0);

  // World Environment States
  const [isNight, setIsNight] = useState(false);
  const [weather, setWeather] = useState('blossom'); // 'sunny' | 'blossom' | 'rain' | 'autumn'
  const [currentZone, setCurrentZone] = useState('Công Viên Thiên Nhiên Trung Tâm');
  const [activeAnim, setActiveAnim] = useState('idle'); // 'idle' | 'walk' | 'jump' | 'wave' | 'dance' | 'sit'

  // Overview Map & Camera Mode States
  const [isEagleEyeView, setIsEagleEyeView] = useState(false);
  const [minimapExpanded, setMinimapExpanded] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState(WORLD_LANDMARKS[0]);
  const [hudPlayerPos, setHudPlayerPos] = useState({ x: 0, z: 12, rotY: 0 });

  // Collapsible Chat States
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastSeenChatCountRef = useRef(0);
  const chatInputDomRef = useRef(null);

  // Multiplayer & Real-Time Firestore States
  const [onlinePlayers, setOnlinePlayers] = useState<Record<string, PlayerData>>({});  const [plotsData, setPlotsData] = useState<Record<string, PlotData>>({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // UI Modal / Panel States
  const [activeModal, setActiveModal] = useState(null); // 'map' | 'pet' | 'garden' | 'house' | 'culture' | 'quests' | 'roadmap' | 'folkgame'
  const [toastMsg, setToastMsg] = useState(null);
  const [nearbyPrompt, setNearbyPrompt] = useState(null);
  const [nearbyFriend, setNearbyFriend] = useState(null);
  const [showEmoteWheel, setShowEmoteWheel] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);

  // O An Quan Mini Folk Game State
  const [oAnQuanBoard, setOAnQuanBoard] = useState([10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5]);
  const [oAnQuanScore, setOAnQuanScore] = useState(0);

  // Personal & Group Quests Progress
  const [quests, setQuests] = useState([
    { id: 'q_plant', title: 'Trồng 3 mầm cây trong Khu Vườn 3D', type: 'Cá Nhân', progress: 0, target: 3, reward: 60, done: false },
    { id: 'q_water', title: 'Tưới nước chăm sóc khu vườn 3 lần', type: 'Cá Nhân', progress: 0, target: 3, reward: 45, done: false },
    { id: 'q_visit', title: 'Khám phá Nhà Thờ Gothic & Chùa Việt Nam', type: 'Văn Hóa', progress: 0, target: 2, reward: 80, done: false },
    { id: 'q_quiz', title: 'Giải đố Lịch Sử & Văn Hóa Việt Nam', type: 'Nhóm 4 Người', progress: 0, target: 2, reward: 100, done: false }
  ]);

  // Refs for Three.js World & Character Controller
  const worldMountRef = useRef(null);
  const turntableMountRef = useRef(null);
  const playerPosRef = useRef({ x: 0, y: 0, z: 12, rotY: 0, anim: 'idle' });
  const onlinePlayersRef = useRef<Record<string, any>>({});
  const keysPressedRef = useRef({});
  const joystickRef = useRef({ active: false, dx: 0, dy: 0 });
  const cameraOrbitRef = useRef({ theta: 0, phi: 0.42, distance: 11.5 });
  const eagleEyeModeRef = useRef(false);
  const petHappySpinUntilRef = useRef(0);
  const lastSyncTimeRef = useRef(0);
  const cameraInstanceRef = useRef(null);
  const [playerScreenTags, setPlayerScreenTags] = useState([]);

  // Auto-read ?room=CODE from URL so friends opening a shared link join the same room
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        const cleanCode = urlRoom.trim().toUpperCase().slice(0, 12);
        setRoomCode(cleanCode);
        setRoomInput(cleanCode);
      }
    } catch (e) {
      // Ignore URL parse restrictions in sandboxed iframe
    }
  }, []);

  // Copy Invite Text & Room Code to Clipboard (Safe for Iframe)
  const handleCopyInviteLink = () => {
    let shareUrl = window.location.href;
    try {
      const urlObj = new URL(window.location.href);
      urlObj.searchParams.set('room', roomCode);
      shareUrl = urlObj.toString();
    } catch (e) {
      // Fallback
    }
    const inviteMessage = `🌸 Vào chơi KHU TỰ TRỊ LIAM WORLD cùng mình nhé!\n🔑 Mã Phòng: ${roomCode}\n🌐 Link vào thẳng phòng: ${shareUrl}`;
    const textArea = document.createElement('textarea');
    textArea.value = inviteMessage;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`Đã sao chép Lời Mời & Mã Phòng [${roomCode}]! Hãy dán gửi cho bạn bè!`, '📋');
    } catch (err) {
      showToast(`Mã phòng của bạn là: ${roomCode}`, '🔑');
    }
    document.body.removeChild(textArea);
  };

  // Generate a brand-new random 6-character Room Code for private friend group
  const handleCreatePrivateRoom = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newCode = `LIAM${randomNum}`;
    setRoomInput(newCode);
    setRoomCode(newCode);
    showToast(`Đã tạo phòng riêng mới: ${newCode}! Hãy gửi mã này cho 3 người bạn!`, '🎉');
  };

  // Spawn or move a Companion Friend in the current room so single testers can immediately test 2-player interactions
  const handleSpawnTestFriend = async () => {
    if (!user) return;
    const friendUid = `friend_companion_${roomCode}`;
    const randomZodiac = ZODIAC_CHARS[Math.floor(Math.random() * ZODIAC_CHARS.length)].id;
    const randomOutfit = OUTFITS[Math.floor(Math.random() * OUTFITS.length)].id;
    const randomPet = FAIRY_PETS[Math.floor(Math.random() * FAIRY_PETS.length)].id;
    const fx = Number((playerPosRef.current.x + (Math.random() * 5 - 2.5)).toFixed(2));
    const fz = Number((playerPosRef.current.z - 2.6).toFixed(2));

    try {
      const pRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_players`, friendUid);
      await setDoc(pRef, {
        uid: friendUid,
        name: 'Bạn Cùng Phòng (Thử Nghiệm)',
        zodiac: randomZodiac,
        outfit: randomOutfit,
        pet: randomPet,
        petName: 'Đom Đóm Nhỏ',
        x: fx,
        y: 0,
        z: fz,
        rotY: 0,
        anim: 'wave',
        plotIndex: (myPlotIndex + 1) % 4,
        lastChat: 'Chào bạn nha! Lại gần kê đầu hoặc nhảy Hip-Hop cùng mình đi! 👋😄',
        updatedAt: Date.now()
      });
      showToast('Đã gọi một Bạn Cùng Phòng xuất hiện ngay trước mặt bạn để thử tương tác!', '🤝');
    } catch (e) {
      console.error('Spawn test friend error:', e);
    }
  };

  useEffect(() => {
    onlinePlayersRef.current = onlinePlayers;
  }, [onlinePlayers]);

  useEffect(() => {
    eagleEyeModeRef.current = isEagleEyeView;
  }, [isEagleEyeView]);

  // Track Unread Chat Messages when Chat Box is Collapsed
  useEffect(() => {
    if (isChatCollapsed) {
      const diff = Math.max(0, chatMessages.length - lastSeenChatCountRef.current);
      setUnreadChatCount(diff);
    } else {
      lastSeenChatCountRef.current = chatMessages.length;
      setUnreadChatCount(0);
    }
  }, [chatMessages, isChatCollapsed]);

  // Update Minimap HUD position periodically
  useEffect(() => {
    if (screen !== 'world') return;
    const timer = setInterval(() => {
      setHudPlayerPos({
        x: playerPosRef.current.x,
        z: playerPosRef.current.z,
        rotY: playerPosRef.current.rotY
      });
    }, 180);
    return () => clearInterval(timer);
  }, [screen]);

  // Helper notification toast
  const showToast = (text, icon = '✨') => {
    setToastMsg({ text, icon });
    setTimeout(() => {
      setToastMsg(prev => (prev?.text === text ? null : prev));
    }, 3800);
  };

  // Quest progression updater
  const incrementQuest = (questId, amount = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.done) {
        const nextProg = Math.min(q.target, q.progress + amount);
        const justFinished = nextProg >= q.target;
        if (justFinished) {
          setCoins(c => c + q.reward);
          showToast(`Hoàn thành nhiệm vụ: ${q.title} (+${q.reward} Xu!)`, '🏆');
        }
        return { ...q, progress: nextProg, done: justFinished };
      }
      return q;
    }));
  };

  // ==========================================
  // 5. FIREBASE AUTH & MULTIPLAYER SYNC
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setPlayerName(`Chibi_${currentUser.uid.slice(0, 4).toUpperCase()}`);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load saved profile from private Firestore on login
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.playerName) setPlayerName(data.playerName);
          if (data.selectedZodiac) setSelectedZodiac(data.selectedZodiac);
          if (data.selectedOutfit) setSelectedOutfit(data.selectedOutfit);
          if (data.selectedPet) setSelectedPet(data.selectedPet);
          if (data.petCustomName) setPetCustomName(data.petCustomName);
          if (data.selectedHouseStyle) setSelectedHouseStyle(data.selectedHouseStyle);
          if (typeof data.coins === 'number') setCoins(data.coins);
        }
      } catch (e) {
        console.error('Profile load error:', e);
      }
    };
    loadProfile();
  }, [user]);

  // Save profile helper
  const saveProfileToCloud = async () => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
      await setDoc(profileRef, {
        playerName,
        selectedZodiac,
        selectedOutfit,
        selectedPet,
        petCustomName,
        selectedHouseStyle,
        coins,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.error('Save profile error:', e);
    }
  };

  // Real-Time Multiplayer Listeners (Players, Gardens/Plots, Chat)
  useEffect(() => {
    if (!user) return;

    // 1. Listen to Room Players
    const playersCol = collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_players`);
    const unsubPlayers = onSnapshot(playersCol, (snap) => {
      const map = {};
      snap.forEach(d => {
        const data = d.data();
        // Filter active players in last 2 minutes
        if (Date.now() - (data.updatedAt || 0) < 120000) {
          map[d.id] = data;
        }
      });
      setOnlinePlayers(map);
    }, (err) => console.error('Players sync error:', err));

    // Heartbeat every 12 seconds so friends always see us online even when standing still
    const heartbeat = setInterval(() => {
      syncMyPlayerState(true);
    }, 12000);

    // 2. Listen to Room 4 House Plots & 3D Gardens
    const plotsCol = collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`);
    const unsubPlots = onSnapshot(plotsCol, (snap) => {
      const pMap = {};
      snap.forEach(d => {
        const raw = d.data();
        pMap[d.id] = {
          ...raw,
          beds: typeof raw.beds === 'string' ? JSON.parse(raw.beds) : (raw.beds || [])
        };
      });
      setPlotsData(pMap);
    }, (err) => console.error('Plots sync error:', err));

    // 3. Listen to Room Chat Messages
    const chatCol = collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_chat`);
    const unsubChat = onSnapshot(chatCol, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChatMessages(list.slice(-30));
    }, (err) => console.error('Chat sync error:', err));

    return () => {
      clearInterval(heartbeat);
      unsubPlayers();
      unsubPlots();
      unsubChat();
    };
  }, [user, roomCode]);

  // Initialize or Claim My House Plot when entering the 3D World
  const claimOrInitMyPlot = async (plotIdx) => {
    if (!user) return;
    const plotId = `plot_${plotIdx}`;
    try {
      const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, plotId);
      const existing = plotsData[plotId];
      const defaultBeds = Array.from({ length: 8 }, (_, i) => ({
        bedIndex: i,
        seedId: i < 2 ? 'hoa_dao' : null,
        plantedAt: i < 2 ? Date.now() - 20000 : 0,
        watered: true,
        fertilized: false
      }));

      await setDoc(plotRef, {
        plotIndex: plotIdx,
        ownerId: user.uid,
        ownerName: playerName,
        houseStyle: selectedHouseStyle,
        protected: houseProtection,
        homePets: myHomePets,
        beds: JSON.stringify(existing && existing.ownerId === user.uid ? existing.beds : defaultBeds),
        updatedAt: Date.now()
      }, { merge: true });

      setMyPlotIndex(plotIdx);
    } catch (e) {
      console.error('Claim plot error:', e);
    }
  };

  // Broadcast local player state to Firestore
  const syncMyPlayerState = async (force = false) => {
    if (!user || screen !== 'world') return;
    const now = Date.now();
    if (!force && now - lastSyncTimeRef.current < 260) return;
    lastSyncTimeRef.current = now;

    try {
      const pRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_players`, user.uid);
      await setDoc(pRef, {
        uid: user.uid,
        name: playerName,
        zodiac: selectedZodiac,
        outfit: selectedOutfit,
        pet: selectedPet,
        petName: petCustomName,
        x: Number(playerPosRef.current.x.toFixed(2)),
        y: Number(playerPosRef.current.y.toFixed(2)),
        z: Number(playerPosRef.current.z.toFixed(2)),
        rotY: Number(playerPosRef.current.rotY.toFixed(2)),
        anim: playerPosRef.current.anim || 'idle',
        plotIndex: myPlotIndex,
        updatedAt: now
      });
    } catch (e) {
      // Ignore transient network lag
    }
  };

  // Send Chat or Emote
  const handleSendChat = async (customText = null, customAnim = null) => {
    if (!user) return;
    const textToSend = customText || chatInput.trim();
    if (!textToSend) return;
    setChatInput('');
    if (customAnim) {
      playerPosRef.current.anim = customAnim;
      setActiveAnim(customAnim);
      syncMyPlayerState(true);
      setTimeout(() => {
        if (playerPosRef.current.anim === customAnim) {
          playerPosRef.current.anim = 'idle';
          setActiveAnim('idle');
          syncMyPlayerState(true);
        }
      }, 4200);
    }

    try {
      // Also attach latest chat bubble on player's realtime doc so 3D floating overhead bubble updates
      const pRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_players`, user.uid);
      await setDoc(pRef, { lastChat: textToSend, lastChatAt: Date.now(), updatedAt: Date.now() }, { merge: true });

      const chatCol = collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_chat`);
      await addDoc(chatCol, {
        uid: user.uid,
        sender: playerName,
        text: textToSend,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error('Send chat error:', e);
    }
  };

  // Trigger a social action (Kê đầu, Chọc quê, Nhảy Hip-Hop, High-Five...) with a nearby friend or solo
  const triggerSocialAction = (actionObj, targetPlayer = null) => {
    const friend = targetPlayer || nearbyFriend;

    if (friend && friend.uid !== user?.uid) {
      // Dash closer & face the friend so the 3D interaction feels real
      const dx = (friend.x || 0) - playerPosRef.current.x;
      const dz = (friend.z || 0) - playerPosRef.current.z;
      const dist = Math.hypot(dx, dz);
      const angleToFriend = Math.atan2(dx, dz);
      playerPosRef.current.rotY = angleToFriend;

      if (dist > 1.6 && dist < 16) {
        playerPosRef.current.x = (friend.x || 0) - Math.sin(angleToFriend) * 1.25;
        playerPosRef.current.z = (friend.z || 0) - Math.cos(angleToFriend) * 1.25;
      }

      petHappySpinUntilRef.current = Date.now() + 3000;
      showToast(`${actionObj.icon} Bạn ${actionObj.chatText} ${friend.name}!`, '🎉');
      handleSendChat(`${actionObj.icon} ${playerName} ${actionObj.chatText} ${friend.name}!`, actionObj.anim);
    } else {
      petHappySpinUntilRef.current = Date.now() + 2500;
      showToast(`${actionObj.icon} ${playerName} ${actionObj.soloText}`, '✨');
      handleSendChat(`${actionObj.icon} ${playerName} ${actionObj.soloText}`, actionObj.anim);
    }
  };

  // Cooldown timer for stealing mechanic
  useEffect(() => {
    if (stealCooldown <= 0) return;
    const timer = setInterval(() => {
      setStealCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [stealCooldown]);

  // ==========================================
  // 6. 3D TURNTABLE PREVIEW (CHARACTER SCREEN)
  // ==========================================
  useEffect(() => {
    if (screen !== 'wardrobe' || !turntableMountRef.current) return;
    const container = turntableMountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF5F8);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 6.2);
    camera.lookAt(0, 1.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Pastel Studio Lighting
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.85);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xFFF8E1, 0.9);
    dirLight.position.set(4, 8, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Circular Pastel Pedestal
    const pedestalGroup = new THREE.Group();
    const baseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.95, 0.28, 36),
      new THREE.MeshStandardMaterial({ color: 0xFFE4E1, roughness: 0.4 })
    );
    baseDisc.position.y = -0.14;
    baseDisc.receiveShadow = true;
    pedestalGroup.add(baseDisc);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.05, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0xFFD54F, metalness: 0.5, roughness: 0.2 })
    );
    goldRing.rotation.x = Math.PI / 2;
    pedestalGroup.add(goldRing);

    // Add 3D Chibi Model & Winged Fairy Pet on Turntable
    const charMesh = createChibiCharacterMesh(selectedZodiac, selectedOutfit);
    pedestalGroup.add(charMesh);

    const petMesh = createFairyPetMesh(selectedPet);
    petMesh.position.set(1.15, 2.1, 0.3);
    pedestalGroup.add(petMesh);

    scene.add(pedestalGroup);

    // Interactive Drag-to-Rotate 360 & Zoom
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;
    let zoomDist = 6.2;

    const onDown = (e) => {
      isDragging = true;
      prevX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - prevX;
      prevX = clientX;
      targetRotY += delta * 0.012;
    };
    const onUp = () => { isDragging = false; };
    const onWheel = (e) => {
      zoomDist = Math.max(4.0, Math.min(9.0, zoomDist + e.deltaY * 0.004));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onDown);
    domElem.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    domElem.addEventListener('touchstart', onDown, { passive: true });
    domElem.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    domElem.addEventListener('wheel', onWheel, { passive: true });

    let frameId;
    const clock = new THREE.Clock();

    const animateTurntable = () => {
      frameId = requestAnimationFrame(animateTurntable);
      const t = clock.getElapsedTime();

      pedestalGroup.rotation.y += (targetRotY - pedestalGroup.rotation.y) * 0.12;
      if (!isDragging) targetRotY += 0.0035; // gentle auto turn

      camera.position.z += (zoomDist - camera.position.z) * 0.1;

      // Animate character pose on turntable
      applyChibiCharacterAnimation(charMesh, activeAnim, t);

      // Animate Fairy Pet wings, antennae, dust trail & hover on Turntable
      petMesh.position.y = 2.05 + Math.sin(t * 4.5) * 0.18;
      petMesh.position.x = Math.cos(t * 1.5) * 1.15;
      petMesh.position.z = Math.sin(t * 1.5) * 1.15;
      petMesh.rotation.y = -t * 1.5 + Math.PI;
      animateDetailedFairyPet(petMesh, t, false, petHappySpinUntilRef.current);

      renderer.render(scene, camera);
    };
    animateTurntable();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domElem && domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
    };
  }, [screen, selectedZodiac, selectedOutfit, selectedPet, activeAnim]);

  // ==========================================
  // 7. MAIN 3D OPEN WORLD ENGINE (THREE.JS)
  // ==========================================
  const sceneObjectsRef = useRef<{
  scene: THREE.Scene | null;
  remotePlayerMeshes: Record<string, {
    charGroup: THREE.Group;
    petGroup: THREE.Group;
    meshKey: string;
  }>;
  plotGroups: Record<string, {
    yardPet?: THREE.Object3D;
    [key: string]: any;
  }>;
  nightLights: THREE.Object3D[];
  ambientLight: THREE.Light | null;
  sunLight: THREE.Light | null;
  skyParticles: THREE.Object3D | null;
  fireflies: THREE.Object3D | null;
  localCharMesh: THREE.Group | null;
  localPetMesh: THREE.Group | null;
}>({
  scene: null,
  remotePlayerMeshes: {},
  plotGroups: {},
  nightLights: [],
  ambientLight: null,
  sunLight: null,
  skyParticles: null,
  fireflies: null,
  localCharMesh: null,
  localPetMesh: null
});

  useEffect(() => {
    if (screen !== 'world' || !worldMountRef.current) return;
    const container = worldMountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xBDE0FE);
    scene.fog = new THREE.FogExp2(0xBDE0FE, 0.0055);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 350);
    cameraInstanceRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. LIGHTING (Day & Night adaptable)
    const ambientLight = new THREE.AmbientLight(0xFFFDF9, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF3E0, 1.1);
    sunLight.position.set(45, 75, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    const d = 85;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const nightLights = [];

    // 2. CENTRAL NATURE PARK TERRAIN & STREAM
    const groundGeo = new THREE.CircleGeometry(135, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xA8E6CF, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Distant Pastel Mountains Ring
    const mountainColors = [0x88D4AB, 0x78C6A3, 0x98E2C6, 0xB5E2FA];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 112 + (i % 3) * 8;
      const mHeight = 26 + (i % 4) * 9;
      const mRadius = 18 + (i % 3) * 5;
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(mRadius, mHeight, 7),
        new THREE.MeshStandardMaterial({ color: mountainColors[i % mountainColors.length], roughness: 0.9 })
      );
      mountain.position.set(Math.cos(angle) * dist, mHeight / 2 - 2, Math.sin(angle) * dist);
      scene.add(mountain);
    }

    // Flowing Blue Stream & Central Lotus Pond
    const pondMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x48CAE4, roughness: 0.15, metalness: 0.25 })
    );
    pondMesh.position.set(0, 0.05, 0);
    scene.add(pondMesh);

    const streamMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 190),
      new THREE.MeshStandardMaterial({ color: 0x48CAE4, roughness: 0.15, metalness: 0.25 })
    );
    streamMesh.rotation.x = -Math.PI / 2;
    streamMesh.rotation.z = Math.PI / 4;
    streamMesh.position.set(0, 0.04, 0);
    scene.add(streamMesh);

    // Lotus Pads & Pink Lotus Flowers in Central Pond
    const padMat = new THREE.MeshStandardMaterial({ color: 0x52B788 });
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xFF85A1 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 4.5 + (i % 3) * 2.1;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 12), padMat);
      pad.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
      scene.add(pad);
      if (i % 2 === 0) {
        const flower = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 8), lotusMat);
        flower.position.set(Math.cos(a) * r, 0.32, Math.sin(a) * r);
        scene.add(flower);
      }
    }

    // Arched Wooden Bridge across the Stream & Pond
    const bridgeGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.8 });
    const redWoodMat = new THREE.MeshStandardMaterial({ color: 0xC62828, roughness: 0.6 });
    for (let i = -6; i <= 6; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 0.85), woodMat);
      const archY = Math.cos((i / 7) * (Math.PI / 2)) * 1.45;
      plank.position.set(0, archY, i * 0.95);
      bridgeGroup.add(plank);
    }
    [-1.7, 1.7].forEach(xRail => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 12.5), redWoodMat);
      rail.position.set(xRail, 1.4, 0);
      bridgeGroup.add(rail);
    });
    scene.add(bridgeGroup);

    // LIAM WORLD central plaza: 3D Earth globe + permanent ADIVA brand sign
    const liamPlaza = new THREE.Group();
    liamPlaza.position.set(0, 0, 10);
    const globePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.45, 0.65, 48),
      new THREE.MeshStandardMaterial({ color: 0xD6B36A, metalness: 0.55, roughness: 0.35 })
    );
    globePedestal.position.y = 0.34;
    liamPlaza.add(globePedestal);
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.75, 48, 32),
      new THREE.MeshStandardMaterial({ color: 0x3197B8, metalness: 0.22, roughness: 0.48, emissive: 0x082D4A, emissiveIntensity: 0.18 })
    );
    globe.position.y = 2.45;
    liamPlaza.add(globe);
    const globeRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.055, 12, 96),
      new THREE.MeshStandardMaterial({ color: 0xF7D98A, metalness: 0.7, roughness: 0.25 })
    );
    globeRing.position.y = 2.45;
    globeRing.rotation.x = Math.PI / 2.7;
    liamPlaza.add(globeRing);
    const adivaCanvas = document.createElement('canvas');
    adivaCanvas.width = 1024; adivaCanvas.height = 256;
    const adivaCtx = adivaCanvas.getContext('2d');
    if (adivaCtx) {
      const grad = adivaCtx.createLinearGradient(0, 0, 1024, 0);
      grad.addColorStop(0, '#173B50'); grad.addColorStop(0.5, '#287B86'); grad.addColorStop(1, '#173B50');
      adivaCtx.fillStyle = grad; adivaCtx.fillRect(0, 0, 1024, 256);
      adivaCtx.strokeStyle = '#E8C879'; adivaCtx.lineWidth = 10; adivaCtx.strokeRect(12, 12, 1000, 232);
      adivaCtx.fillStyle = '#FFF8E7'; adivaCtx.font = 'bold 150px Georgia'; adivaCtx.textAlign = 'center'; adivaCtx.textBaseline = 'middle';
      adivaCtx.fillText('ADIVA', 512, 132);
    }
    const adivaTexture = new THREE.CanvasTexture(adivaCanvas);
    adivaTexture.colorSpace = THREE.SRGBColorSpace;
    const adivaSign = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 2.4),
      new THREE.MeshBasicMaterial({ map: adivaTexture, transparent: false, side: THREE.DoubleSide })
    );
    adivaSign.position.set(0, 5.6, 0);
    liamPlaza.add(adivaSign);
    scene.add(liamPlaza);

    // Tea Pavilion & Park Benches (Chòi nghỉ & Bàn trà)
    const pavilion = new THREE.Group();
    pavilion.position.set(-16, 0, 8);
    const pavBase = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.4, 8), woodMat);
    pavBase.position.y = 0.2;
    pavilion.add(pavBase);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.6, 8), redWoodMat);
      col.position.set(Math.cos(a) * 3.5, 2.0, Math.sin(a) * 3.5);
      pavilion.add(col);
    }
    const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.4, 6), redWoodMat);
    pavRoof.position.y = 4.8;
    pavilion.add(pavRoof);
    scene.add(pavilion);

    // Cherry Blossom Trees (Hoa Đào) around Park
    const blossomPinkMat = new THREE.MeshStandardMaterial({ color: 0xFFB3C6, roughness: 0.6 });
    const treePositions = [
      [-14, -12], [15, -14], [-22, 16], [19, 14], [-8, 22], [12, -24], [-28, -6], [28, 5]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8), woodMat);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.3, 1), blossomPinkMat);
      crown1.position.set(0, 3.8, 0);
      crown1.castShadow = true;
      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7, 1), blossomPinkMat);
      crown2.position.set(1.2, 3.3, 0.6);
      tree.add(crown1, crown2);
      scene.add(tree);
    });

    // 3. GOTHIC-VIETNAMESE CHURCH (North: x=0, z=-58)
    const churchGroup = new THREE.Group();
    churchGroup.position.set(0, 0, -58);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xF5EBE0, roughness: 0.7 });
    const churchRoofMat = new THREE.MeshStandardMaterial({ color: 0x5E6472, roughness: 0.6 });

    const nave = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 22), stoneMat);
    nave.position.y = 5;
    nave.castShadow = true;
    nave.receiveShadow = true;
    churchGroup.add(nave);

    const churchRoof = new THREE.Mesh(new THREE.ConeGeometry(11.5, 6, 4), churchRoofMat);
    churchRoof.rotation.y = Math.PI / 4;
    churchRoof.scale.set(1, 1, 1.55);
    churchRoof.position.y = 13;
    churchGroup.add(churchRoof);

    // Tall Bell Tower
    const bellTower = new THREE.Mesh(new THREE.BoxGeometry(5.5, 19, 5.5), stoneMat);
    bellTower.position.set(0, 9.5, 10);
    bellTower.castShadow = true;
    churchGroup.add(bellTower);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 8.5, 4), churchRoofMat);
    spire.rotation.y = Math.PI / 4;
    spire.position.set(0, 23.2, 10);
    churchGroup.add(spire);

    // Stained Glass Rose Window (Glowing at night)
    const stainedGlassMat = new THREE.MeshStandardMaterial({
      color: 0xFFCA3A,
      emissive: 0xFF9F1C,
      emissiveIntensity: 0.9
    });
    const roseWin = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), stainedGlassMat);
    roseWin.position.set(0, 11.5, 12.8);
    churchGroup.add(roseWin);

    const churchLight = new THREE.PointLight(0xFFD166, 0, 28);
    churchLight.position.set(0, 9, 15);
    churchGroup.add(churchLight);
    nightLights.push(churchLight);

    scene.add(churchGroup);

    // 4. VIETNAMESE TRADITIONAL PAGODA - NGÔI CHÙA (West: x=-62, z=0)
    const pagodaGroup = new THREE.Group();
    pagodaGroup.position.set(-62, 0, 0);
    pagodaGroup.rotation.y = Math.PI / 2;

    // Tam Quan Gate (Cổng Tam Quan)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 18);
    [-5.5, -2.0, 2.0, 5.5].forEach(gx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 5.5, 12), redWoodMat);
      col.position.set(gx, 2.75, 0);
      gateGroup.add(col);
    });
    const gateRoofCenter = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), redWoodMat);
    gateRoofCenter.rotation.y = Math.PI / 4;
    gateRoofCenter.position.set(0, 6.2, 0);
    gateGroup.add(gateRoofCenter);
    pagodaGroup.add(gateGroup);

    // Main Pagoda Hall & Multi-tiered Curved Roof
    const pagodaHall = new THREE.Mesh(
      new THREE.BoxGeometry(14, 6.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFF3B0, roughness: 0.7 })
    );
    pagodaHall.position.y = 3.25;
    pagodaHall.castShadow = true;
    pagodaGroup.add(pagodaHall);

    const pRoof1 = new THREE.Mesh(new THREE.ConeGeometry(12, 3.5, 4), redWoodMat);
    pRoof1.rotation.y = Math.PI / 4;
    pRoof1.position.y = 8.0;
    const pRoof2 = new THREE.Mesh(new THREE.ConeGeometry(8.5, 3.0, 4), redWoodMat);
    pRoof2.rotation.y = Math.PI / 4;
    pRoof2.position.y = 10.6;
    pagodaGroup.add(pRoof1, pRoof2);

    // Golden Buddha Statue in Courtyard
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.65, roughness: 0.25 });
    const buddhaBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 1.2, 16), lotusMat);
    buddhaBase.position.set(0, 0.6, 9);
    const buddhaBody = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.8, 16), goldMat);
    buddhaBody.position.set(0, 2.4, 9);
    const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 16), goldMat);
    buddhaHead.position.set(0, 4.1, 9);
    pagodaGroup.add(buddhaBase, buddhaBody, buddhaHead);

    // Large Bodhi Tree (Cây Bồ Đề)
    const bodhiGroup = new THREE.Group();
    bodhiGroup.position.set(-10, 0, 10);
    const bTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 5.5, 10), woodMat);
    bTrunk.position.y = 2.75;
    const bCrown = new THREE.Mesh(
      new THREE.DodecahedronGeometry(4.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x40916C, roughness: 0.7 })
    );
    bCrown.position.y = 6.8;
    bodhiGroup.add(bTrunk, bCrown);
    pagodaGroup.add(bodhiGroup);

    const pagodaLight = new THREE.PointLight(0xFF9F1C, 0, 26);
    pagodaLight.position.set(0, 6, 10);
    pagodaGroup.add(pagodaLight);
    nightLights.push(pagodaLight);

    scene.add(pagodaGroup);

    // 5. FOLK GAMES ZONE - KHU TRÒ CHƠI DÂN GIAN (East: x=56, z=0)
    const folkZone = new THREE.Group();
    folkZone.position.set(56, 0, 0);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xFFE5D9, roughness: 0.6 });
    const oAnQuanCourt = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 5), boardMat);
    oAnQuanCourt.position.y = 0.1;
    folkZone.add(oAnQuanCourt);

    // Decorative Festive Banners
    [-5, 5].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 8), redWoodMat);
      pole.position.set(px, 3, -3.5);
      folkZone.add(pole);
    });
    scene.add(folkZone);

    // 6. FOUR PLAYER HOUSE PLOTS & 8-BED 3D GARDENS
    const plotGroups = {};
    PLOT_COORDS.forEach((coord) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(coord.x, 0, coord.z);
      pGroup.rotation.y = coord.rotY;

      // Plot Grass Courtyard & Wooden Fence
      const yard = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.12, 22),
        new THREE.MeshStandardMaterial({ color: 0xC7F9CC, roughness: 0.85 })
      );
      yard.position.y = 0.06;
      yard.receiveShadow = true;
      pGroup.add(yard);

      // House Container (Updated dynamically when houseStyle changes)
      const houseHolder = new THREE.Group();
      houseHolder.position.set(0, 0.1, -4.5);
      houseHolder.add(createVietnameseHouseMesh('bagian'));
      pGroup.add(houseHolder);

      // 8 Interactive 3D Soil Beds in the Front Garden
      const bedsHolder = new THREE.Group();
      bedsHolder.position.set(-5.2, 0.12, 4.2);
      const bedMeshes = [];
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.95 });

      for (let b = 0; b < 8; b++) {
        const row = Math.floor(b / 4);
        const col = b % 4;
        const bedGroup = new THREE.Group();
        bedGroup.position.set(col * 3.4, 0, row * 3.2);

        const soilBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.28, 2.2), soilMat);
        soilBox.position.y = 0.14;
        soilBox.receiveShadow = true;
        bedGroup.add(soilBox);

        const plantHolder = new THREE.Group();
        plantHolder.position.y = 0.28;
        bedGroup.add(plantHolder);

        bedsHolder.add(bedGroup);
        bedMeshes.push({ bedGroup, soilBox, plantHolder, currentKey: '' });
      }
      pGroup.add(bedsHolder);

      // Home Pet roaming inside the yard
      const yardPet = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xFFE0B2 })
      );
      yardPet.position.set(6.5, 0.5, 3.0);
      pGroup.add(yardPet);

      // Warm House Lantern Light for Night Mode
      const plotLight = new THREE.PointLight(0xFFB703, 0, 22);
      plotLight.position.set(0, 5, 2);
      pGroup.add(plotLight);
      nightLights.push(plotLight);

      scene.add(pGroup);
      plotGroups[`plot_${coord.index}`] = {
        pGroup,
        houseHolder,
        bedMeshes,
        yardPet,
        currentStyle: 'bagian'
      };
    });

    // 7. FALLING CHERRY BLOSSOM PETALS & NIGHT FIREFLIES PARTICLES
    const pCount = 260;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 140;
      pPositions[i * 3 + 1] = Math.random() * 35 + 2;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xFFB3C6, size: 0.55, transparent: true, opacity: 0.85 });
    const skyParticles = new THREE.Points(pGeo, pMat);
    scene.add(skyParticles);

    // Night Glowing Fireflies (Đom đóm bay lên từ bãi cỏ)
    const fCount = 120;
    const fGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(fCount * 3);
    for (let i = 0; i < fCount; i++) {
      fPos[i * 3] = (Math.random() - 0.5) * 110;
      fPos[i * 3 + 1] = Math.random() * 6 + 0.5;
      fPos[i * 3 + 2] = (Math.random() - 0.5) * 110;
    }
    fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    const fMat = new THREE.PointsMaterial({ color: 0xCCFF90, size: 0.48, transparent: true, opacity: 0 });
    const fireflies = new THREE.Points(fGeo, fMat);
    scene.add(fireflies);

    // 8. LOCAL PLAYER 3D CHARACTER & WINGED FAIRY PET
    const localCharMesh = createChibiCharacterMesh(selectedZodiac, selectedOutfit);
    localCharMesh.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
    scene.add(localCharMesh);

    const localPetMesh = createFairyPetMesh(selectedPet);
    localPetMesh.position.set(playerPosRef.current.x + 1.2, 2.2, playerPosRef.current.z - 1.0);
    scene.add(localPetMesh);

    sceneObjectsRef.current = {
      scene,
      remotePlayerMeshes: {},
      plotGroups,
      nightLights,
      ambientLight,
      sunLight,
      skyParticles,
      fireflies,
      localCharMesh,
      localPetMesh
    };

    // 9. KEYBOARD & MOUSE CAMERA CONTROLS
    const onKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.code === 'Escape') (document.activeElement as HTMLElement)?.blur();
        return;
      }
      const code = e.code;
      keysPressedRef.current[code] = true;
      if (code === 'Space') {
        playerPosRef.current.anim = 'jump';
        setActiveAnim('jump');
      } else if (code === 'KeyM') {
        setActiveModal(prev => (prev === 'map' ? null : 'map'));
      } else if (code === 'Enter') {
        setIsChatCollapsed(false);
        setTimeout(() => chatInputDomRef.current?.focus(), 60);
      }
    };
    const onKeyUp = (e) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'Space' && playerPosRef.current.anim === 'jump') {
        playerPosRef.current.anim = 'idle';
        setActiveAnim('idle');
      }
    };

    let isCamDragging = false;
    let prevCamX = 0;
    let prevCamY = 0;
    const onMouseDown = (e) => {
      isCamDragging = true;
      prevCamX = e.clientX;
      prevCamY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isCamDragging) return;
      const dx = e.clientX - prevCamX;
      const dy = e.clientY - prevCamY;
      prevCamX = e.clientX;
      prevCamY = e.clientY;
      cameraOrbitRef.current.theta -= dx * 0.007;
      cameraOrbitRef.current.phi = Math.max(0.18, Math.min(1.15, cameraOrbitRef.current.phi + dy * 0.006));
    };
    const onMouseUp = () => { isCamDragging = false; };
    const onWheel = (e) => {
      cameraOrbitRef.current.distance = Math.max(5.5, Math.min(24, cameraOrbitRef.current.distance + e.deltaY * 0.01));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    // 10. MAIN GAME & PHYSICS ANIMATION LOOP
    let animFrameId;
    const clock = new THREE.Clock();

    const animateWorld = () => {
      animFrameId = requestAnimationFrame(animateWorld);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Calculate Movement Input (WASD / Arrows / Touch Joystick)
      let moveX = 0;
      let moveZ = 0;
      const keys = keysPressedRef.current;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      if (joystickRef.current.active) {
        moveX = joystickRef.current.dx;
        moveZ = joystickRef.current.dy;
      }

      const isMoving = Math.hypot(moveX, moveZ) > 0.08;
      const speedMultiplier = selectedPet === 'chuon_pha_le' ? 10.5 : 9.0;

      if (isMoving) {
        // Move relative to camera yaw angle
        const camYaw = cameraOrbitRef.current.theta;
        const inputAngle = Math.atan2(moveX, moveZ);
        const targetAngle = camYaw + inputAngle;

        playerPosRef.current.x = Math.max(-95, Math.min(95, playerPosRef.current.x + Math.sin(targetAngle) * speedMultiplier * dt));
        playerPosRef.current.z = Math.max(-95, Math.min(95, playerPosRef.current.z + Math.cos(targetAngle) * speedMultiplier * dt));
        playerPosRef.current.rotY = targetAngle;
        if (playerPosRef.current.anim !== 'jump') {
          playerPosRef.current.anim = 'walk';
        }
        syncMyPlayerState(false);
      } else if (playerPosRef.current.anim === 'walk') {
        playerPosRef.current.anim = 'idle';
        syncMyPlayerState(true);
      }

      // Update Local Character Mesh Position & Limb Animations
      const lChar = sceneObjectsRef.current.localCharMesh;
      if (lChar) {
        lChar.position.x = playerPosRef.current.x;
        lChar.position.z = playerPosRef.current.z;
        if (playerPosRef.current.anim !== 'spindance') {
          lChar.rotation.y = playerPosRef.current.rotY;
        }
        applyChibiCharacterAnimation(lChar, playerPosRef.current.anim, elapsed);
      }

      // Smoothly Interpolate & Animate All Remote Online Players in the Room
      Object.entries(sceneObjectsRef.current.remotePlayerMeshes as Record<string, { charGroup: THREE.Group; petGroup: THREE.Group; meshKey: string }>).forEach(([uid, rEntry]) => {
        const pData = onlinePlayersRef.current[uid];
        if (!pData || !rEntry.charGroup) return;

        rEntry.charGroup.position.x += ((pData.x || 0) - rEntry.charGroup.position.x) * 0.18;
        rEntry.charGroup.position.z += ((pData.z || 0) - rEntry.charGroup.position.z) * 0.18;
        if (pData.anim !== 'spindance') {
          rEntry.charGroup.rotation.y = pData.rotY || 0;
        }
        applyChibiCharacterAnimation(rEntry.charGroup, pData.anim || 'idle', elapsed);

        if (rEntry.petGroup) {
          const targetPX = rEntry.charGroup.position.x + Math.cos(elapsed * 1.4) * 1.3;
          const targetPZ = rEntry.charGroup.position.z + Math.sin(elapsed * 1.4) * 1.3;
          rEntry.petGroup.position.x += (targetPX - rEntry.petGroup.position.x) * 0.12;
          rEntry.petGroup.position.z += (targetPZ - rEntry.petGroup.position.z) * 0.12;
          rEntry.petGroup.position.y = 2.1 + Math.sin(elapsed * 4.5) * 0.2;
          animateDetailedFairyPet(rEntry.petGroup, elapsed, pData.anim === 'walk', 0);
        }
      });

      // Detect Closest Online Friend for Social Interaction (Kê đầu / Chọc quê / High-Five)
      let closestP = null;
      let minDist = 14.0;
      Object.values(onlinePlayersRef.current).forEach((p) => {
        if (!p || p.uid === auth.currentUser?.uid) return;
        const d = Math.hypot((p.x || 0) - playerPosRef.current.x, (p.z || 0) - playerPosRef.current.z);
        if (d < minDist) {
          minDist = d;
          closestP = { ...p, distance: Math.round(d * 10) / 10 };
        }
      });
      setNearbyFriend(closestP);

      // Smoothly Follow Local Player with Detailed Winged Fairy Pet
      const lPet = sceneObjectsRef.current.localPetMesh;
      if (lPet) {
        if (isMoving) {
          const targetPX = playerPosRef.current.x - Math.sin(playerPosRef.current.rotY - 0.6) * 1.45;
          const targetPZ = playerPosRef.current.z - Math.cos(playerPosRef.current.rotY - 0.6) * 1.45;
          lPet.position.x += (targetPX - lPet.position.x) * 0.11;
          lPet.position.z += (targetPZ - lPet.position.z) * 0.11;
          lPet.position.y = 2.18 + Math.sin(elapsed * 6.5) * 0.18;
          lPet.rotation.y = playerPosRef.current.rotY;
        } else if (playerPosRef.current.anim === 'sit') {
          // Rest gently right next to sitting player
          const restX = playerPosRef.current.x + 0.85;
          const restZ = playerPosRef.current.z + 0.45;
          lPet.position.x += (restX - lPet.position.x) * 0.08;
          lPet.position.z += (restZ - lPet.position.z) * 0.08;
          lPet.position.y += (1.1 - lPet.position.y) * 0.08;
        } else {
          // Orbit playfully around player when standing still
          const orbitAngle = elapsed * 1.35;
          const orbitX = playerPosRef.current.x + Math.cos(orbitAngle) * 1.45;
          const orbitZ = playerPosRef.current.z + Math.sin(orbitAngle) * 1.45;
          lPet.position.x += (orbitX - lPet.position.x) * 0.08;
          lPet.position.z += (orbitZ - lPet.position.z) * 0.08;
          lPet.position.y = 2.1 + Math.sin(elapsed * 4.5) * 0.22;
          lPet.rotation.y = -orbitAngle + Math.PI;
        }
        animateDetailedFairyPet(lPet, elapsed, isMoving, petHappySpinUntilRef.current);
      }

      // Smooth 3rd-Person Camera OR 3D Eagle-Eye Overview Camera
      if (eagleEyeModeRef.current) {
        const overviewCamPos = new THREE.Vector3(
          playerPosRef.current.x * 0.35,
          92,
          playerPosRef.current.z * 0.35 + 48
        );
        camera.position.lerp(overviewCamPos, 0.08);
        camera.lookAt(0, 0, 0);
      } else {
        const { theta, phi, distance } = cameraOrbitRef.current;
        const camX = playerPosRef.current.x + distance * Math.sin(theta) * Math.cos(phi);
        const camY = Math.max(1.5, distance * Math.sin(phi) + 1.6);
        const camZ = playerPosRef.current.z + distance * Math.cos(theta) * Math.cos(phi);
        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.15);
        camera.lookAt(playerPosRef.current.x, 1.65, playerPosRef.current.z);
      }

      // Project 3D Overhead Name Tags & Chat Bubbles for All Online Players
      if (Math.floor(elapsed * 20) % 2 === 0 && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const tags = [];

        Object.entries(sceneObjectsRef.current.remotePlayerMeshes as Record<string, { charGroup: THREE.Group; petGroup: THREE.Group; meshKey: string }>).forEach(([uid, rEntry]) => {
          const pData = onlinePlayersRef.current[uid];
          if (!pData || !rEntry.charGroup) return;
          const worldVec = new THREE.Vector3(
            rEntry.charGroup.position.x,
            rEntry.charGroup.position.y + 3.15,
            rEntry.charGroup.position.z
          );
          worldVec.project(camera);
          if (worldVec.z < 1) {
            const sx = (worldVec.x * 0.5 + 0.5) * w;
            const sy = (-(worldVec.y * 0.5) + 0.5) * h;
            if (sx > -50 && sx < w + 50 && sy > -50 && sy < h + 50) {
              tags.push({
                uid,
                name: pData.name || 'Bạn chơi',
                petName: pData.petName || 'Pet',
                anim: pData.anim || 'idle',
                lastChat: (Date.now() - (pData.lastChatAt || pData.updatedAt || 0) < 18000) ? pData.lastChat : null,
                x: sx,
                y: sy
              });
            }
          }
        });
        setPlayerScreenTags(tags);
      }

      // Animate Falling Petals / Weather Particles
      const sParts = sceneObjectsRef.current.skyParticles;
      if (sParts) {
        const posArr = sParts.geometry.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
          posArr[i * 3 + 1] -= 0.06;
          posArr[i * 3] += Math.sin(elapsed + i) * 0.02;
          if (posArr[i * 3 + 1] < 0) posArr[i * 3 + 1] = 34;
        }
        sParts.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Yard Pets roaming in the 4 plots
      Object.values(sceneObjectsRef.current.plotGroups as Record<string, { yardPet?: THREE.Object3D }>).forEach((pg, idx) => {
        if (pg.yardPet) {
          pg.yardPet.position.x = 6.0 + Math.cos(elapsed * 1.4 + idx) * 2.2;
          pg.yardPet.position.z = 3.0 + Math.sin(elapsed * 1.4 + idx) * 2.2;
          pg.yardPet.position.y = 0.42 + Math.abs(Math.sin(elapsed * 5 + idx)) * 0.25;
        }
      });

      // Check Zone & Contextual Interaction Prompts
      const px = playerPosRef.current.x;
      const pz = playerPosRef.current.z;
      if (Math.hypot(px - 0, pz - (-52)) < 16) {
        setCurrentZone('Nhà Thờ Gothic Việt Nam (Khu Tôn Nghiêm)');
        setNearbyPrompt({ type: 'church', label: 'Khám phá Lịch Sử Nhà Thờ & Chụp Ảnh Nhóm' });
      } else if (Math.hypot(px - (-55), pz - 0) < 16) {
        setCurrentZone('Chùa Truyền Thống Việt Nam (Khu Văn Hóa)');
        setNearbyPrompt({ type: 'pagoda', label: 'Tham quan Chùa Việt & Giải Đố Văn Hóa' });
      } else if (Math.hypot(px - 54, pz - 0) < 12) {
        setCurrentZone('Khu Trò Chơi Dân Gian');
        setNearbyPrompt({ type: 'folkgame', label: 'Chơi Ô Ăn Quan Dân Gian' });
      } else {
        // Check proximity to any of the 4 Player House Plots
        let foundPlot = null;
        PLOT_COORDS.forEach(c => {
          if (Math.hypot(px - c.x, pz - c.z) < 17) {
            foundPlot = c;
          }
        });
        if (foundPlot) {
          setCurrentZone(foundPlot.name);
          setNearbyPrompt({
            type: 'plot',
            plotIndex: foundPlot.index,
            label: foundPlot.index === myPlotIndex
              ? 'Quản lý Khu Vườn 3D & Trang Trí Nhà Của Tôi'
              : `Thăm Vườn Lô ${foundPlot.index + 1} (Có thể Hái Trộm Hoa)`
          });
        } else {
          setCurrentZone('Công Viên Thiên Nhiên Trung Tâm');
          setNearbyPrompt(null);
        }
      }

      renderer.render(scene, camera);
    };
    animateWorld();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    };
  }, [screen]);

  // Dynamically update Local Player 3D Mesh if Zodiac, Outfit, or Pet changes while in World
  useEffect(() => {
    const { scene, localCharMesh, localPetMesh } = sceneObjectsRef.current;
    if (!scene || screen !== 'world') return;

    if (localCharMesh) scene.remove(localCharMesh);
    if (localPetMesh) scene.remove(localPetMesh);

    const newChar = createChibiCharacterMesh(selectedZodiac, selectedOutfit);
    newChar.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
    scene.add(newChar);

    const newPet = createFairyPetMesh(selectedPet);
    newPet.position.set(playerPosRef.current.x + 1.2, 2.2, playerPosRef.current.z - 1.0);
    scene.add(newPet);

    sceneObjectsRef.current.localCharMesh = newChar;
    sceneObjectsRef.current.localPetMesh = newPet;
    syncMyPlayerState(true);
  }, [selectedZodiac, selectedOutfit, selectedPet]);

  // Dynamically update Day/Night Cycle & Weather in the 3D Scene
  useEffect(() => {
    const { scene, ambientLight, sunLight, nightLights, skyParticles, fireflies } = sceneObjectsRef.current;
    if (!scene) return;

    if (isNight) {
      scene.background = new THREE.Color(0x0F172A);
      scene.fog.color.setHex(0x0F172A);
      ambientLight.intensity = 0.28;
      sunLight.intensity = 0.22;
      sunLight.color.setHex(0x90CAF9);
      nightLights.forEach(l => { l.intensity = 1.65; });
      if (fireflies) fireflies.material.opacity = 0.95;
    } else {
      const skyHex = weather === 'rain' ? 0x90A4AE : weather === 'autumn' ? 0xFFE0B2 : 0xBDE0FE;
      scene.background = new THREE.Color(skyHex);
      scene.fog.color.setHex(skyHex);
      ambientLight.intensity = 0.8;
      sunLight.intensity = 1.1;
      sunLight.color.setHex(0xFFF3E0);
      nightLights.forEach(l => { l.intensity = 0; });
      if (fireflies) fireflies.material.opacity = 0;
    }

    if (skyParticles) {
      if (weather === 'rain') {
        skyParticles.material.color.setHex(0x81D4FA);
        skyParticles.material.size = 0.35;
      } else if (weather === 'autumn') {
        skyParticles.material.color.setHex(0xFFB74D);
        skyParticles.material.size = 0.65;
      } else {
        skyParticles.material.color.setHex(0xFFB3C6);
        skyParticles.material.size = 0.55;
      }
    }
  }, [isNight, weather, screen]);

  // Dynamically Sync Other Real Online Players (Max 4 per room) into the 3D Scene
  useEffect(() => {
    const { scene, remotePlayerMeshes } = sceneObjectsRef.current;
    if (!scene || screen !== 'world' || !user) return;

    const activeIds = new Set();

    Object.entries(onlinePlayers).forEach(([uid, pData]) => {
      if (uid === user.uid) return; // Skip local player
      activeIds.add(uid);

      const meshKey = `${pData.zodiac}_${pData.outfit}_${pData.pet}`;
      if (!remotePlayerMeshes[uid] || remotePlayerMeshes[uid].meshKey !== meshKey) {
        if (remotePlayerMeshes[uid]) {
          scene.remove(remotePlayerMeshes[uid].charGroup);
          scene.remove(remotePlayerMeshes[uid].petGroup);
        }
        const charGroup = createChibiCharacterMesh(pData.zodiac || 'ty', pData.outfit || 'aodai');
        const petGroup = createFairyPetMesh(pData.pet || 'buom_tien');
        scene.add(charGroup);
        scene.add(petGroup);
        remotePlayerMeshes[uid] = { charGroup, petGroup, meshKey };
      }

      const entry = remotePlayerMeshes[uid];
      entry.charGroup.position.set(pData.x || 0, pData.y || 0, pData.z || 0);
      entry.charGroup.rotation.y = pData.rotY || 0;
      entry.petGroup.position.set((pData.x || 0) + 1.1, 2.2, (pData.z || 0) - 0.9);
      animateDetailedFairyPet(entry.petGroup, performance.now() * 0.001, false, 0);
    });

    // Remove disconnected players
    Object.keys(remotePlayerMeshes).forEach(uid => {
      if (!activeIds.has(uid)) {
        scene.remove(remotePlayerMeshes[uid].charGroup);
        scene.remove(remotePlayerMeshes[uid].petGroup);
        delete remotePlayerMeshes[uid];
      }
    });
  }, [onlinePlayers, screen, user]);

  // Dynamically Rebuild 3D Gardens & House Styles when plotsData updates or time passes
  useEffect(() => {
    if (screen !== 'world') return;

    const refresh3DGardens = () => {
      const { plotGroups } = sceneObjectsRef.current;
      if (!plotGroups) return;

      PLOT_COORDS.forEach((coord) => {
        const plotId = `plot_${coord.index}`;
        const pData = plotsData[plotId];
        const pGroupObj = plotGroups[plotId];
        if (!pGroupObj || !pData) return;

        // Update Vietnamese House Architecture if changed
        if (pData.houseStyle && pData.houseStyle !== pGroupObj.currentStyle) {
          pGroupObj.houseHolder.clear();
          pGroupObj.houseHolder.add(createVietnameseHouseMesh(pData.houseStyle));
          pGroupObj.currentStyle = pData.houseStyle;
        }

        // Update 8 Soil Beds & 6 Growth Stages
                 const beds = (pData.beds || []) as Array<any>;

        pGroupObj.bedMeshes.forEach((bedObj, idx) => {
          const bedState = beds[idx];
          const stage = getBedGrowthStage(bedState);
          const seedKey = bedState?.seedId ? `${bedState.seedId}_stage_${stage}` : 'empty';

          // Visual wet soil color
          bedObj.soilBox.material.color.setHex(bedState?.watered ? 0x3E2723 : 0x6D4C41);

          if (bedObj.currentKey !== seedKey) {
            bedObj.plantHolder.clear();
            if (bedState?.seedId && stage > 0) {
              bedObj.plantHolder.add(createPlantStageMesh(bedState.seedId, stage));
            }
            bedObj.currentKey = seedKey;
          }
        });
      });
    };

    refresh3DGardens();
    const interval = setInterval(refresh3DGardens, 2000);
    return () => clearInterval(interval);
  }, [plotsData, screen]);

  // ==========================================
  // 8. GARDEN PLANTING, WATERING, HARVEST & STEALING LOGIC
  // ==========================================
  const getBedGrowthStage = (bed) => {
    if (!bed || !bed.seedId || !bed.plantedAt) return 0;
    const seed = SEEDS_DATA.find(s => s.id === bed.seedId);
    if (!seed) return 1;
    const elapsedSec = (Date.now() - bed.plantedAt) / 1000;
    const speedFactor = (bed.watered ? 1.35 : 0.8) * (bed.fertilized ? 1.4 : 1.0) * (selectedPet === 'tien_hoa' ? 1.35 : 1.0);
    const ratio = (elapsedSec * speedFactor) / seed.growTime;
    if (ratio < 0.18) return 1; // Đất vừa gieo hạt
    if (ratio < 0.38) return 2; // Hạt giống nảy mầm
    if (ratio < 0.58) return 3; // Cây con
    if (ratio < 0.78) return 4; // Cây trưởng thành
    if (ratio < 1.0) return 5;  // Ra hoa / kết trái
    return 6;                   // Có thể thu hoạch
  };

  // Plant a seed in my plot
  const handlePlantBed = async (plotIdx, bedIdx) => {
    if (!user) return;
    const seed = SEEDS_DATA.find(s => s.id === selectedSeed);
    if (!seed) return;
    if (coins < seed.cost) {
      showToast('Không đủ Xu để mua hạt giống này!', '🪙');
      return;
    }

    const plotId = `plot_${plotIdx}`;
    const existingPlot = plotsData[plotId] || {};
    const beds = [...(existingPlot.beds || Array.from({ length: 8 }, (_, i) => ({ bedIndex: i, seedId: null })))];
    beds[bedIdx] = {
      bedIndex: bedIdx,
      seedId: selectedSeed,
      plantedAt: Date.now(),
      watered: false,
      fertilized: false
    };

    setCoins(c => c - seed.cost);
    incrementQuest('q_plant', 1);
    showToast(`Đã gieo hạt ${seed.name} vào ô đất số ${bedIdx + 1}!`, '🌱');

    const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, plotId);
    await setDoc(plotRef, {
      plotIndex: plotIdx,
      ownerId: user.uid,
      ownerName: playerName,
      houseStyle: selectedHouseStyle,
      protected: houseProtection,
      beds: JSON.stringify(beds),
      updatedAt: Date.now()
    }, { merge: true });
  };

  // Water or Fertilize a bed
  const handleCareBed = async (plotIdx, bedIdx, actionType) => {
    const plotId = `plot_${plotIdx}`;
    const existingPlot = plotsData[plotId];
    if (!existingPlot) return;
    const beds = [...(existingPlot.beds || [])];
    if (!beds[bedIdx] || !beds[bedIdx].seedId) return;

    if (actionType === 'water') {
      beds[bedIdx].watered = true;
      incrementQuest('q_water', 1);
      showToast('Đã tưới nước mát lành! Cây phát triển nhanh hơn.', '💧');
    } else if (actionType === 'fertilize') {
      if (coins < 8) {
        showToast('Cần 8 Xu để bón phân hữu cơ!', '🪙');
        return;
      }
      setCoins(c => c - 8);
      beds[bedIdx].fertilized = true;
      showToast('Đã bón phân dinh dưỡng! Cây lớn nhanh vượt trội.', '✨');
    }

    const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, plotId);
    await updateDoc(plotRef, { beds: JSON.stringify(beds), updatedAt: Date.now() });
  };

  // Harvest my crop OR Steal from neighbor's plot
  const handleHarvestOrSteal = async (plotIdx, bedIdx) => {
    const plotId = `plot_${plotIdx}`;
    const existingPlot = plotsData[plotId];
    if (!existingPlot) return;
    const beds = [...((existingPlot.beds || []) as Array<any>)];
    const targetBed = beds[bedIdx];
    if (!targetBed || getBedGrowthStage(targetBed) < 6) {
      showToast('Cây chưa đến giai đoạn thu hoạch (Giai đoạn 6/6)!', '⏳');
      return;
    }

    const seed = SEEDS_DATA.find(s => s.id === targetBed.seedId) || SEEDS_DATA[0];
    const isMyOwnPlot = existingPlot.ownerId === user?.uid || plotIdx === myPlotIndex;

    if (!isMyOwnPlot) {
      // Stealing checks
      if (currentZone.includes('Nhà Thờ') || currentZone.includes('Chùa')) {
        showToast('Khu vực tôn nghiêm, không thể thực hiện hành động trộm!', '🙏');
        return;
      }
      if (existingPlot.protected) {
        showToast(`Chuông báo động nhà ${existingPlot.ownerName} reo vang! Bạn bị phát hiện!`, '🚨');
        handleSendChat(`🚨 Chuông báo động! ${playerName} vừa lén vào vườn nhà ${existingPlot.ownerName}!`);
        return;
      }
      if (stealCooldown > 0) {
        showToast(`Cần chờ hồi chiêu ${stealCooldown}s trước khi hái trộm tiếp!`, '⏱️');
        return;
      }
      setStealCooldown(25);
      showToast(`Hái trộm thành công ${seed.name} từ vườn của ${existingPlot.ownerName}! (+${seed.sell} Xu)`, '🦊');
      handleSendChat(`🌸 ${playerName} vừa lén hái trộm một bông ${seed.name} tại Lô ${plotIdx + 1}!`);
    } else {
      const petBonus = selectedPet === 'ong_mat' ? Math.round(seed.sell * 0.2) : 0;
      showToast(`Thu hoạch ${seed.name}! +${seed.sell + petBonus} Xu`, '🧺');
    }

    const bonusGold = selectedPet === 'ong_mat' ? Math.round(seed.sell * 0.2) : 0;
    setCoins(c => c + seed.sell + bonusGold);
    setHarvestedBag(prev => ({ ...prev, [seed.id]: (prev[seed.id] || 0) + 1 }));

    beds[bedIdx] = { bedIndex: bedIdx, seedId: null, plantedAt: 0, watered: false, fertilized: false };
    const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, plotId);
    await updateDoc(plotRef, { beds: JSON.stringify(beds), updatedAt: Date.now() });
  };

  // Folk Game: Play O An Quan Move
  const playOAnQuanMove = (pitIdx) => {
    if (pitIdx === 0 || pitIdx === 6 || oAnQuanBoard[pitIdx] === 0) return;
    const board = [...oAnQuanBoard];
    let stones = board[pitIdx];
    board[pitIdx] = 0;
    let cur = pitIdx;
    while (stones > 0) {
      cur = (cur + 1) % 12;
      board[cur] += 1;
      stones--;
    }
    const nextPit = (cur + 1) % 12;
    let captured = 0;
    if (board[nextPit] === 0 && board[(nextPit + 1) % 12] > 0) {
      captured = board[(nextPit + 1) % 12];
      board[(nextPit + 1) % 12] = 0;
      setOAnQuanScore(s => s + captured);
      setCoins(c => c + captured * 3);
      showToast(`Ăn quan đắc thắng! Nhận ${captured} sỏi (+${captured * 3} Xu)`, '🎲');
    }
    setOAnQuanBoard(board);
  };

  // Start Adventure from Character Screen
  const handleStartAdventure = async () => {
    await saveProfileToCloud();
    await claimOrInitMyPlot(myPlotIndex);
    setScreen('world');
    showToast(`Chào mừng ${playerName} và thú cưng ${petCustomName} đến với KHU TỰ TRỊ LIAM WORLD!`, '🌸');
  };

  // Teleport helper for fast exploration
  const teleportTo = (x, z, label) => {
    playerPosRef.current.x = x;
    playerPosRef.current.z = z;
    syncMyPlayerState(true);
    showToast(`Đã di chuyển đến: ${label}`, '🧭');
  };

  // ==========================================
  // 9. RENDER UI: 3D CHARACTER SELECTION SCREEN
  // ==========================================
  if (screen === 'wardrobe') {
    const currentZodiacObj = ZODIAC_CHARS.find(z => z.id === selectedZodiac) || ZODIAC_CHARS[0];
    const currentOutfitObj = OUTFITS.find(o => o.id === selectedOutfit) || OUTFITS[0];
    const currentPetObj = FAIRY_PETS.find(p => p.id === selectedPet) || FAIRY_PETS[0];

    return (
      <div key="wardrobe-screen" className="min-h-screen w-full bg-gradient-to-br from-rose-100 via-amber-50 to-teal-100 text-slate-800 flex flex-col justify-between p-3 md:p-5 select-none overflow-x-hidden">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-3xl shadow-sm border border-pink-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-400 to-amber-300 flex items-center justify-center text-white shadow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-teal-600 bg-clip-text text-transparent">
                KHU TỰ TRỊ LIAM WORLD
              </h1>
              <p className="text-xs text-slate-500">Thế giới mở 3D Chibi • Văn hóa Việt Nam • Multiplayer 4 Người</p>
              <p className="text-[11px] font-black tracking-[0.35em] text-amber-600">ADIVA • THƯƠNG HIỆU TẠI QUẢNG TRƯỜNG TRUNG TÂM</p>
            </div>
          </div>

          {/* Room & Player Name Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-pink-50 border border-pink-200 rounded-2xl px-3 py-1.5">
              <User className="w-4 h-4 text-pink-500 mr-1.5" />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tên nhân vật..."
                className="bg-transparent text-sm font-semibold focus:outline-none w-28 md:w-36"
              />
            </div>

            <div className="flex items-center bg-teal-50 border border-teal-200 rounded-2xl px-3 py-1.5">
              <Users className="w-4 h-4 text-teal-600 mr-1.5" />
              <span className="text-xs text-slate-500 mr-1">Mã Phòng:</span>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                className="bg-transparent text-sm font-bold text-teal-800 focus:outline-none w-24 uppercase"
              />
              <button
                onClick={() => {
                  const clean = (roomInput || 'VIETNAM01').trim().toUpperCase();
                  setRoomCode(clean);
                  showToast(`Đã vào phòng: ${clean} (${Object.keys(onlinePlayers).length}/4 người)`, '🔑');
                }}
                className="ml-1 bg-teal-500 hover:bg-teal-600 text-white text-xs px-2.5 py-1 rounded-xl font-bold transition"
              >
                Vào Phòng
              </button>
            </div>

            <button
              onClick={handleCreatePrivateRoom}
              className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-2 rounded-2xl transition"
            >
              <UserPlus className="w-4 h-4" /> Tạo Phòng Mới
            </button>

            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-2xl shadow transition"
            >
              <Share2 className="w-4 h-4" /> Copy Link Mời Bạn
            </button>
          </div>
        </header>

        {/* Public Server Channels Bar for Quick Co-op Matchmaking */}
        <div className="mt-2 bg-white/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-teal-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-teal-800 flex items-center gap-1">
              <Globe className="w-4 h-4 text-teal-600" /> Chọn Nhanh Kênh Chung Để Gặp Bạn Bè:
            </span>
            {PUBLIC_SERVERS.map((srv) => (
              <button
                key={srv.code}
                onClick={() => {
                  setRoomInput(srv.code);
                  setRoomCode(srv.code);
                  showToast(`Đã chuyển sang ${srv.name} (Mã: ${srv.code})`, '🌐');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  roomCode === srv.code
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                    : 'bg-white hover:bg-teal-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{srv.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  roomCode === srv.code ? 'bg-amber-300 text-slate-900' : 'bg-teal-100 text-teal-800'
                }`}>
                  {srv.code}
                </span>
              </button>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            💡 Mẹo: Bạn và bạn bè chỉ cần nhập chung <strong>Mã Phòng</strong> là sẽ nhìn thấy nhau ngay!
          </span>
        </div>

        {/* Main 3-Column Layout: Left 12 Zodiacs | Center 3D Turntable | Right Outfits & Fairy Pets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3 flex-1 items-stretch">
          
          {/* Left Column: 12 Con Giáp Chibi */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-pink-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-pink-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4" /> 1. Chọn Nhân Vật 12 Con Giáp (Mô Hình 3D Riêng)
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-72 lg:max-h-80 overflow-y-auto pr-1">
                {ZODIAC_CHARS.map((z) => {
                  const isSel = selectedZodiac === z.id;
                  return (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZodiac(z.id)}
                      className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSel
                          ? 'bg-gradient-to-br from-pink-100 to-rose-200 border-pink-500 shadow-sm scale-[1.02]'
                          : 'bg-white/70 hover:bg-pink-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: z.accent }} />
                        {isSel && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                      </div>
                      <div className="mt-1.5">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{z.animal}</p>
                        <p className="text-[10px] text-slate-500 truncate">{z.name.split('–')[0]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-rose-50/90 border border-rose-200">
              <p className="text-xs font-bold text-rose-700">{currentZodiacObj.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">{currentZodiacObj.desc}</p>
            </div>
          </div>

          {/* Center Column: Interactive 360 3D Turntable */}
          <div className="lg:col-span-4 bg-white/85 backdrop-blur-md rounded-3xl p-3 shadow-sm border border-pink-200 flex flex-col justify-between relative">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-pink-500" /> Kéo chuột xoay 360° • Lăn chuột thu phóng
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                Studio 3D
              </span>
            </div>

            {/* 3D Canvas Container */}
            <div
              ref={turntableMountRef}
              className="w-full h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-pink-100"
            />

            {/* Animation Pose Tester Buttons */}
            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
              {[
                { id: 'idle', label: 'Đứng' },
                { id: 'wave', label: 'Vẫy Tay' },
                { id: 'headlock', label: '🤜 Kê Đầu' },
                { id: 'taunt', label: '😜 Chọc Quê' },
                { id: 'hiphop', label: '🕺 Hip-Hop' },
                { id: 'spindance', label: '💃 Xoay Vòng' }
              ].map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => setActiveAnim(pose.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                    activeAnim === pose.id
                      ? 'bg-pink-500 text-white shadow'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  }`}
                >
                  {pose.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: 10 Outfits & 8 Winged Fairy Pets */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-pink-100 flex flex-col justify-between space-y-3">
            {/* Outfit Selector */}
            <div>
              <h2 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shirt className="w-4 h-4" /> 2. Thử Trang Phục (10 Bộ Truyền Thống & Tương Lai)
              </h2>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {OUTFITS.map((o) => {
                  const isSel = selectedOutfit === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOutfit(o.id)}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                        isSel
                          ? 'bg-teal-100/90 border-teal-500 font-bold shadow-sm'
                          : 'bg-white/70 hover:bg-teal-50/50 border-slate-200'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0 border border-white shadow" style={{ backgroundColor: o.primary }} />
                      <span className="text-xs truncate">{o.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">{currentOutfitObj.desc}</p>
            </div>

            {/* Fairy Pet Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 3. Thú Cưng Côn Trùng Có Cánh (Fairy Pets)
                </h2>
                <input
                  type="text"
                  value={petCustomName}
                  onChange={(e) => setPetCustomName(e.target.value)}
                  className="text-xs bg-purple-50 border border-purple-200 rounded-xl px-2 py-0.5 w-28 font-semibold text-purple-800"
                  placeholder="Đặt tên pet..."
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {FAIRY_PETS.map((p) => {
                  const isSel = selectedPet === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPet(p.id)}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                        isSel
                          ? 'bg-purple-100 border-purple-500 font-bold shadow-sm'
                          : 'bg-white/70 hover:bg-purple-50/50 border-slate-200'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 p-2 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <strong>Kỹ năng đồng hành:</strong> {currentPetObj.skill}
              </div>
            </div>

            {/* Plot & House Style Selection */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-600 block">Chọn Lô Nhà Riêng (1–4):</label>
                <select
                  value={myPlotIndex}
                  onChange={(e) => setMyPlotIndex(Number(e.target.value))}
                  className="w-full mt-0.5 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                >
                  {PLOT_COORDS.map((c) => (
                    <option key={c.index} value={c.index}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-600 block">Kiến Trúc Nhà Việt:</label>
                <select
                  value={selectedHouseStyle}
                  onChange={(e) => setSelectedHouseStyle(e.target.value)}
                  className="w-full mt-0.5 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                >
                  {HOUSE_STYLES.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <footer className="bg-white/85 backdrop-blur-md px-5 py-3 rounded-3xl shadow-sm border border-pink-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
            <span>👥 <strong>Phòng {roomCode}:</strong> {Object.keys(onlinePlayers).length}/4 người chơi trực tuyến</span>
            <span>•</span>
            <span>🎮 <strong>Điều khiển:</strong> WASD / Phím mũi tên để đi dạo, Kéo chuột xoay góc nhìn</span>
          </div>

          <button
            onClick={handleStartAdventure}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 flex items-center gap-2 transition transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" /> BẮT ĐẦU PHIÊU LƯU VÀO THẾ GIỚI 3D
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================
  // 10. RENDER UI: IN-GAME 3D WORLD & HUD OVERLAYS
  // ==========================================
  const currentPlotObj = plotsData[`plot_${myPlotIndex}`] || { beds: [] };
  const currentFairyPetObj = FAIRY_PETS.find(p => p.id === selectedPet) || FAIRY_PETS[0];

  // Convert world coordinates (-95..95) to percentage (5%..95%) for Radar Minimap & 2D Overview Map
  const worldToMapPercent = (wx, wz) => ({
    left: `${Math.max(5, Math.min(95, ((wx + 95) / 190) * 100))}%`,
    top: `${Math.max(5, Math.min(95, ((wz + 95) / 190) * 100))}%`
  });

  return (
    <div key="world-screen" className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* 3D WebGL Viewport */}
      <div ref={worldMountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 3D Floating Player Nameplates & Live Chat Bubbles Above Friends' Heads */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {playerScreenTags.map((tag) => (
          <div
            key={tag.uid}
            style={{
              left: `${tag.x}px`,
              top: `${tag.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
            className="absolute flex flex-col items-center transition-all duration-75"
          >
            {tag.lastChat && (
              <div className="mb-1 max-w-[200px] bg-white/95 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-2xl shadow-lg border border-pink-300 text-center break-words animate-bounce">
                💬 {tag.lastChat}
              </div>
            )}
            <div className="bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full border border-white/40 shadow flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-extrabold whitespace-nowrap">{tag.name}</span>
              <span className="text-[9px] text-amber-300 font-semibold whitespace-nowrap">• 🦋 {tag.petName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Left HUD: Player Info & Live Radar Minimap */}
      <div className="fixed top-3 left-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-pink-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-extrabold text-sm shadow">
            {playerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800">{playerName}</span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                🪙 {coins} Xu
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
              <MapPin className="w-3.5 h-3.5" /> {currentZone}
            </div>
          </div>
          <button
            onClick={() => setActiveModal('multiplayer')}
            className="ml-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-[11px] font-extrabold shadow flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" /> Mời Bạn ({Object.keys(onlinePlayers).length}/4)
          </button>
        </div>

        {/* LIVE RADAR MINIMAP WIDGET */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border-2 border-teal-200 overflow-hidden transition-all w-48 sm:w-52">
          <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
            <span className="text-[11px] font-extrabold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> MAP QUAN SÁT
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsEagleEyeView(!isEagleEyeView);
                  showToast(
                    !isEagleEyeView
                      ? 'Đã bật Camera 3D Toàn Cảnh Trên Cao!'
                      : 'Đã trở về Camera Góc Nhìn Thứ Ba!',
                    '🦅'
                  );
                }}
                title="Góc nhìn 3D Toàn Cảnh Trên Cao"
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  isEagleEyeView ? 'bg-amber-300 text-slate-900' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                3D Cao
              </button>
              <button
                onClick={() => setActiveModal('map')}
                title="Mở Bản Đồ Tổng Quan Lớn (Phím M)"
                className="p-0.5 rounded bg-white/20 hover:bg-white/30"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setMinimapExpanded(!minimapExpanded)}
                className="p-0.5 rounded bg-white/20 hover:bg-white/30"
              >
                {minimapExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {minimapExpanded && (
            <div className="p-2">
              <div
                onClick={() => setActiveModal('map')}
                className="relative w-full h-32 rounded-xl bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border border-emerald-300 overflow-hidden cursor-pointer group"
              >
                {/* Stream & Central Lotus Pond on Minimap */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-2 bg-sky-300/70 -rotate-45 transform" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sky-400/80 border border-white" />

                {/* Landmarks Icons on Minimap */}
                {WORLD_LANDMARKS.map((lm) => {
                  const pos = worldToMapPercent(lm.x, lm.z);
                  return (
                    <div
                      key={lm.id}
                      style={pos}
                      title={lm.name}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] leading-none select-none drop-shadow"
                    >
                      {lm.icon}
                    </div>
                  );
                })}

                {/* Other Online Players Dots on Minimap */}
                {Object.values(onlinePlayers).map((p) => {
                  if (p.uid === user?.uid) return null;
                  const pos = worldToMapPercent(p.x || 0, p.z || 0);
                  return (
                    <div
                      key={p.uid}
                      style={pos}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow" />
                      <span className="text-[8px] font-bold bg-slate-900/75 text-white px-1 rounded mt-0.5 truncate max-w-[44px]">
                        {p.name}
                      </span>
                    </div>
                  );
                })}

                {/* Local Player Pulsing Direction Marker */}
                <div
                  style={worldToMapPercent(hudPlayerPos.x, hudPlayerPos.z)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-md animate-pulse" />
                </div>

                <div className="absolute bottom-1 right-1 bg-slate-900/65 text-white text-[9px] px-1.5 py-0.5 rounded opacity-80 group-hover:opacity-100">
                  Nhấn mở rộng [M]
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 font-semibold px-0.5">
                <span>Tọa độ: ({Math.round(hudPlayerPos.x)}, {Math.round(hudPlayerPos.z)})</span>
                <button
                  onClick={() => setActiveModal('map')}
                  className="text-teal-700 hover:underline font-bold"
                >
                  Bản đồ lớn →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Center HUD: Compact Fast Teleport Bar & Eagle-Eye Indicator */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto max-w-[46vw]">
        {isEagleEyeView && (
          <div className="bg-amber-400 text-slate-900 px-3.5 py-1 rounded-2xl shadow-lg font-extrabold text-xs flex items-center gap-2 border-2 border-white">
            <Eye className="w-4 h-4 shrink-0" />
            <span className="truncate">CAMERA 3D TOÀN CẢNH TRÊN CAO</span>
            <button
              onClick={() => setIsEagleEyeView(false)}
              className="ml-1 bg-slate-900 text-white px-2 py-0.5 rounded-xl text-[10px] shrink-0"
            >
              Thoát
            </button>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-md border border-slate-200 overflow-x-auto">
          <button onClick={() => teleportTo(0, 12, 'Công Viên Trung Tâm')} className="text-[11px] px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold shrink-0">
            🌸 Công Viên
          </button>
          <button onClick={() => teleportTo(0, -42, 'Nhà Thờ Gothic')} className="text-[11px] px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold shrink-0">
            ⛪ Nhà Thờ
          </button>
          <button onClick={() => teleportTo(-45, 0, 'Chùa Truyền Thống')} className="text-[11px] px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold shrink-0">
            🏮 Ngôi Chùa
          </button>
          <button onClick={() => teleportTo(48, 0, 'Khu Trò Chơi Dân Gian')} className="text-[11px] px-2 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold shrink-0">
            🎲 Dân Gian
          </button>
          <button
            onClick={() => {
              const myCoord = PLOT_COORDS[myPlotIndex];
              teleportTo(myCoord.x * 0.78, myCoord.z * 0.78, myCoord.name);
            }}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold shrink-0"
          >
            🏡 Nhà Lô {myPlotIndex + 1}
          </button>
        </div>
      </div>

      {/* Top Right HUD: Day/Night & Weather Switcher */}
      <div className="fixed top-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-pink-200 pointer-events-auto">
        <button
          onClick={() => {
            setIsNight(!isNight);
            showToast(!isNight ? 'Chuyển sang Ban Đêm: Đom đóm và đèn lồng tỏa sáng!' : 'Chuyển sang Ban Ngày: Nắng dịu và chim hót!', !isNight ? '🌙' : '☀️');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            isNight ? 'bg-indigo-900 text-amber-200' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {isNight ? 'Ban Đêm' : 'Ban Ngày'}
        </button>

        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="blossom">🌸 Hoa Đào Rơi</option>
          <option value="sunny">☀️ Nắng Đẹp</option>
          <option value="rain">🌧️ Mưa Phùn</option>
          <option value="autumn">🍂 Mùa Thu</option>
        </select>
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border-2 border-pink-300 flex items-center gap-2 animate-bounce">
          <span className="text-lg">{toastMsg.icon}</span>
          <span className="text-xs md:text-sm font-bold text-slate-800">{toastMsg.text}</span>
        </div>
      )}

      {/* PROXIMITY FRIEND INTERACTION BAR: Pops up automatically when near another player, or when Emote Wheel is toggled */}
      {(nearbyFriend || showEmoteWheel) && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-3xl shadow-2xl border-2 border-rose-300 flex flex-col items-center gap-2 max-w-[95vw]">
          <div className="flex items-center justify-between w-full gap-4 px-1">
            <span className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">
              {nearbyFriend ? (
                <>
                  <Users className="w-4 h-4 text-rose-600 animate-bounce" />
                  Đang đứng gần bạn chơi: <strong className="text-slate-900 underline">{nearbyFriend.name}</strong> ({nearbyFriend.distance}m) – Chọn hành động tương tác ngay!
                </>
              ) : (
                <>
                  <Smile className="w-4 h-4 text-pink-600" />
                  Bảng Hành Động Nhảy Múa & Trêu Chọc Bạn Chơi Cùng
                </>
              )}
            </span>
            {showEmoteWheel && (
              <button
                onClick={() => setShowEmoteWheel(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-1.5"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {SOCIAL_ACTIONS.map((act) => (
              <button
                key={act.id}
                onClick={() => triggerSocialAction(act, nearbyFriend)}
                className={`px-3 py-1.5 rounded-2xl bg-gradient-to-r ${act.color} hover:opacity-95 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95`}
              >
                <span>{act.icon}</span>
                <span>{act.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Nearby Interaction Button (Church, Pagoda, Plot Garden, Folk Game) */}
      {nearbyPrompt && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              if (nearbyPrompt.type === 'church' || nearbyPrompt.type === 'pagoda') {
                incrementQuest('q_visit', 1);
                setActiveModal('culture');
              } else if (nearbyPrompt.type === 'folkgame') {
                setActiveModal('folkgame');
              } else if (nearbyPrompt.type === 'plot') {
                setActiveModal('garden');
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs md:text-sm shadow-lg flex items-center gap-2 border-2 border-white"
          >
            <Sparkles className="w-4 h-4" /> [Nhấn để Tương Tác] {nearbyPrompt.label}
          </button>
        </div>
      )}

      {/* Left Bottom Panel: Collapsible Online Players & Live Chat Box */}
      <div className="fixed bottom-20 left-3 z-20 w-72 sm:w-80 flex flex-col gap-2 pointer-events-none">
        {isChatCollapsed ? (
          /* COLLAPSED COMPACT CHAT PILL */
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsChatCollapsed(false)}
              className="flex items-center justify-between gap-3 w-full bg-white/90 hover:bg-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border-2 border-pink-300 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <MessageCircle className="w-5 h-5 text-pink-600 shrink-0" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {unreadChatCount}
                    </span>
                  )}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-extrabold text-slate-800">
                    Chat & Phòng {roomCode} ({Object.keys(onlinePlayers).length}/4)
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {chatMessages.length > 0
                      ? `${chatMessages[chatMessages.length - 1].sender}: ${chatMessages[chatMessages.length - 1].text}`
                      : 'Nhấn hoặc ấn [Enter] để mở khung chat...'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-xl bg-pink-100 text-pink-700 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                Mở <ChevronUp className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        ) : (
          /* EXPANDED FULL CHAT & ROOM PLAYERS PANEL */
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-pink-200 flex flex-col transition-all">
            {/* Header with Collapse / Hide Down Button */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-2 mb-2">
              <div>
                <span className="text-xs font-extrabold text-teal-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Phòng {roomCode} ({Object.keys(onlinePlayers).length}/4 Người)
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.values(onlinePlayers).map((p) => (
                    <span
                      key={p.uid}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-50 border border-pink-200 font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsChatCollapsed(true)}
                title="Ẩn khung chat xuống"
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-700 text-[11px] font-bold flex items-center gap-1 transition self-start"
              >
                Ẩn xuống <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="h-28 overflow-y-auto space-y-1 pr-1 text-xs mb-2">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Hãy gửi lời chào tới bạn bè trong làng...</p>
              ) : (
                chatMessages.map((m) => (
                  <div key={m.id} className="leading-snug">
                    <span className="font-bold text-pink-600">{m.sender}: </span>
                    <span className="text-slate-700">{m.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Emotes & Actions */}
            <div className="flex items-center gap-1 mb-1.5 overflow-x-auto pb-1">
              <button onClick={() => triggerSocialAction(SOCIAL_ACTIONS[0])} className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold shrink-0">
                🤜 Kê đầu
              </button>
              <button onClick={() => triggerSocialAction(SOCIAL_ACTIONS[1])} className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold shrink-0">
                😜 Chọc quê
              </button>
              <button onClick={() => triggerSocialAction(SOCIAL_ACTIONS[2])} className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold shrink-0">
                🕺 Hip-Hop
              </button>
              <button onClick={() => triggerSocialAction(SOCIAL_ACTIONS[4])} className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 font-bold shrink-0">
                🙌 Đập tay
              </button>
              <button onClick={() => handleSendChat('🍵 Mời bạn ghé bàn trà nghỉ chân!', 'sit')} className="text-[11px] px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold shrink-0">
                🧘 Ngồi nghỉ
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={chatInputDomRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhắn tin trực tuyến (Enter)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-pink-400"
              />
              <button type="submit" className="p-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile / Touch Virtual Joystick (Bottom Right) */}
      <div className="fixed bottom-20 right-4 z-20 flex flex-col items-center gap-2 md:hidden">
        <div
          onTouchStart={() => {
            joystickRef.current.active = true;
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            joystickRef.current.dx = Math.max(-1, Math.min(1, (touch.clientX - cx) / 35));
            joystickRef.current.dy = Math.max(-1, Math.min(1, (touch.clientY - cy) / 35));
          }}
          onTouchEnd={() => {
            joystickRef.current.active = false;
            joystickRef.current.dx = 0;
            joystickRef.current.dy = 0;
          }}
          className="w-24 h-24 rounded-full bg-white/60 backdrop-blur-md border-2 border-pink-300 flex items-center justify-center shadow-lg"
        >
          <div className="w-10 h-10 rounded-full bg-pink-500/80 shadow" />
        </div>
      </div>

      {/* Bottom Dock Bar: Core Feature Buttons */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-3 py-2 rounded-3xl shadow-xl border border-pink-200 flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-[96vw]">
        <button
          onClick={() => setScreen('wardrobe')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold shrink-0 transition"
        >
          <Shirt className="w-4 h-4" /> Nhân Vật
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'multiplayer' ? null : 'multiplayer')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'multiplayer'
              ? 'bg-teal-600 text-white shadow'
              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
          }`}
        >
          <Users className="w-4 h-4" /> Phòng Chơi & Mời Bạn ({Object.keys(onlinePlayers).length}/4)
        </button>

        <button
          onClick={() => setShowEmoteWheel(!showEmoteWheel)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            showEmoteWheel
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
          }`}
        >
          <Smile className="w-4 h-4" /> Hành Động & Trêu Bạn
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'map' ? null : 'map')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'map' ? 'bg-sky-600 text-white shadow' : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
          }`}
        >
          <Map className="w-4 h-4" /> Bản Đồ Tổng Quan
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'pet' ? null : 'pet')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'pet' ? 'bg-fuchsia-600 text-white shadow' : 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Thú Cưng ({petCustomName})
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'garden' ? null : 'garden')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'garden' ? 'bg-emerald-500 text-white shadow' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
          }`}
        >
          <Sprout className="w-4 h-4" /> Khu Vườn 3D
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'house' ? null : 'house')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'house' ? 'bg-amber-500 text-white shadow' : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
          }`}
        >
          <Home className="w-4 h-4" /> Nhà Việt
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'culture' ? null : 'culture')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'culture' ? 'bg-rose-500 text-white shadow' : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
          }`}
        >
          <Landmark className="w-4 h-4" /> Văn Hóa
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'folkgame' ? null : 'folkgame')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'folkgame' ? 'bg-purple-500 text-white shadow' : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Ô Ăn Quan
        </button>

        <button
          onClick={() => setActiveModal(activeModal === 'quests' ? null : 'quests')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${
            activeModal === 'quests' ? 'bg-teal-600 text-white shadow' : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
          }`}
        >
          <Award className="w-4 h-4" /> Nhiệm Vụ ({quests.filter(q => q.done).length}/{quests.length})
        </button>
      </div>

      {/* ========================================== */}
      {/* 11. INTERACTIVE MODALS (MULTIPLAYER LOBBY, OVERVIEW MAP, FAIRY PET, GARDEN, HOUSE, CULTURE, FOLK GAME, QUESTS) */}
      {/* ========================================== */}

      {/* MODAL 00: MULTIPLAYER CO-OP LOBBY & INVITE FRIENDS */}
      {activeModal === 'multiplayer' && (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border-2 border-teal-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-teal-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" /> PHÒNG CHƠI ONLINE & MỜI BẠN BÈ CÙNG CHƠI
                </h3>
                <p className="text-xs text-slate-500">
                  Hỗ trợ tối đa 4 người chơi thật trong cùng một phòng • Đồng bộ vị trí 3D, hành động kê đầu/chọc quê, thú cưng và khu vườn theo thời gian thực.
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            {/* Current Room & One-Click Copy Invite Link */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-sky-50 border border-teal-200 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-teal-700 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Mã Phòng Hiện Tại Của Bạn
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black tracking-wider text-slate-900 bg-white px-3.5 py-1 rounded-xl border border-teal-300 shadow-sm">
                    {roomCode}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {Object.keys(onlinePlayers).length}/4 Người Trong Phòng
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyInviteLink}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold shadow flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> Sao Chép Lời Mời & Link Phòng
                </button>
                <button
                  onClick={handleCreatePrivateRoom}
                  className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-extrabold"
                >
                  + Tạo Phòng Riêng Mới
                </button>
              </div>
            </div>

            {/* Switch Room or Join Public Server */}
            <div className="mb-4">
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                Nhập Mã Phòng Của Bạn Bè Hoặc Chọn Kênh Chung:
              </label>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã phòng (VD: VIETNAM01)..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => {
                    const clean = (roomInput || 'VIETNAM01').trim().toUpperCase();
                    setRoomCode(clean);
                    showToast(`Đã chuyển sang phòng ${clean}!`, '🔑');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold"
                >
                  Chuyển Phòng
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PUBLIC_SERVERS.map((srv) => (
                  <button
                    key={srv.code}
                    onClick={() => {
                      setRoomInput(srv.code);
                      setRoomCode(srv.code);
                      showToast(`Đã vào ${srv.name} (${srv.code})!`, '🌐');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      roomCode === srv.code
                        ? 'bg-teal-100 border-teal-500 font-bold'
                        : 'bg-slate-50 hover:bg-teal-50/60 border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-slate-800 truncate">{srv.name}</p>
                    <p className="text-[10px] text-teal-700 font-bold mt-0.5">Mã: {srv.code} • {srv.tag}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* List of Active Players in Current Room */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase">
                  Danh Sách Người Chơi Trong Phòng {roomCode}:
                </h4>
                <button
                  onClick={handleSpawnTestFriend}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold flex items-center gap-1"
                >
                  🤖 + Gọi 1 Bạn Cùng Phòng Thử Nghiệm
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(onlinePlayers).map((p) => (
                  <div
                    key={p.uid}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {p.name} {p.uid === user?.uid && <span className="text-[10px] text-pink-600">(Bạn)</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Thú cưng: <strong>{p.petName || 'Tiên Nhỏ'}</strong> • Lô đất #{(p.plotIndex || 0) + 1}
                      </p>
                    </div>

                    {p.uid !== user?.uid && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            teleportTo((p.x || 0) + 1.3, (p.z || 0) + 1.3, `Vị trí của ${p.name}`);
                            setActiveModal(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[11px] font-bold"
                        >
                          🏃 Dịch chuyển tới
                        </button>
                        <button
                          onClick={() => {
                            setActiveModal(null);
                            triggerSocialAction(SOCIAL_ACTIONS[0], p);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold"
                        >
                          🤜 Kê đầu
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions to play with friends across devices or tabs */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 space-y-1">
              <p className="font-extrabold text-amber-900">🌐 Cách Chơi Cùng Bạn Bè Trên Web:</p>
              <p>1. Nhấn <strong>"Sao Chép Lời Mời & Link Phòng"</strong> rồi gửi mã phòng <strong>{roomCode}</strong> cho bạn bè (hoặc mở thêm 1 Tab trình duyệt nữa để tự test 2 người).</p>
              <p>2. Khi bạn bè nhập đúng Mã Phòng <strong>{roomCode}</strong>, nhân vật 3D và thú cưng của nhau sẽ xuất hiện trực tiếp trên bản đồ.</p>
              <p>3. Đi lại gần nhau để bật thanh <strong>Kê đầu / Chọc quê / Nhảy Hip-Hop / Đập tay</strong> hoặc sang thăm vườn và hái trộm hoa của nhau!</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 0A: FULL WORLD OVERVIEW MAP & 3D EAGLE-EYE CONTROLLER */}
      {activeModal === 'map' && (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 shadow-2xl border-2 border-sky-200 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-sky-900 flex items-center gap-2">
                  <Map className="w-5 h-5 text-sky-600" /> BẢN ĐỒ TỔNG QUAN KHU TỰ TRỊ LIAM WORLD
                </h3>
                <p className="text-xs text-slate-500">
                  Quan sát vị trí thời gian thực của cả 4 người chơi, các công trình văn hóa và nhấn vào bất kỳ địa danh nào để dịch chuyển tức thời!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEagleEyeView(!isEagleEyeView);
                    setActiveModal(null);
                    showToast(
                      !isEagleEyeView
                        ? 'Đang bật Camera 3D Toàn Cảnh Trên Cao!'
                        : 'Đã tắt Camera 3D Toàn Cảnh Trên Cao!',
                      '🦅'
                    );
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-extrabold flex items-center gap-1.5 shadow"
                >
                  <Eye className="w-4 h-4" /> {isEagleEyeView ? 'Tắt Camera 3D Trên Cao' : 'Xem Camera 3D Toàn Cảnh Trên Cao'}
                </button>
                <button onClick={() => setActiveModal(null)} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                  Đóng ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Interactive 2D World Radar Canvas */}
              <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[380px] rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100 border-2 border-emerald-300 shadow-inner overflow-hidden">
                {/* Compass Directions */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">BẮC (NHÀ THỜ)</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">NAM</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">TÂY (CHÙA VIỆT)</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">ĐÔNG (DÂN GIAN)</span>

                {/* Stream & Lotus Pond Illustration */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[130%] h-5 bg-sky-300/60 -rotate-45 border-y border-sky-400/40" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-sky-300/80 border-2 border-white shadow flex items-center justify-center text-[10px] font-bold text-sky-900">
                  Hồ Sen
                </div>

                {/* Clickable Landmarks on Overview Map */}
                {WORLD_LANDMARKS.map((lm) => {
                  const pos = worldToMapPercent(lm.x, lm.z);
                  const isSel = selectedLandmark?.id === lm.id;
                  return (
                    <button
                      key={lm.id}
                      style={pos}
                      onClick={() => setSelectedLandmark(lm)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 px-2 py-1 rounded-2xl border transition flex items-center gap-1 shadow-md ${
                        isSel
                          ? 'bg-slate-900 text-white border-amber-400 scale-110 z-30'
                          : 'bg-white/95 hover:bg-amber-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      <span className="text-sm">{lm.icon}</span>
                      <span className="text-[10px] font-extrabold whitespace-nowrap">{lm.name.split(' (')[0]}</span>
                    </button>
                  );
                })}

                {/* Online Players Real-Time Markers */}
                {Object.values(onlinePlayers).map((p) => {
                  if (p.uid === user?.uid) return null;
                  const pos = worldToMapPercent(p.x || 0, p.z || 0);
                  return (
                    <div
                      key={p.uid}
                      style={pos}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
                    >
                      <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md" />
                      <span className="text-[10px] font-extrabold bg-amber-500 text-white px-1.5 py-0.2 rounded-full shadow mt-0.5">
                        {p.name}
                      </span>
                    </div>
                  );
                })}

                {/* Local Player Marker */}
                <div
                  style={worldToMapPercent(hudPlayerPos.x, hudPlayerPos.z)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-lg animate-bounce flex items-center justify-center text-[10px] text-white">
                    ★
                  </div>
                  <span className="text-[10px] font-extrabold bg-rose-600 text-white px-1.5 rounded-full shadow mt-0.5">
                    Bạn ({playerName})
                  </span>
                </div>
              </div>

              {/* Right Column: Selected Landmark Details & Online Players Locator */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                {selectedLandmark && (
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{selectedLandmark.icon}</span>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        Tọa độ: ({selectedLandmark.x}, {selectedLandmark.z})
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 mt-2">{selectedLandmark.name}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedLandmark.desc}</p>
                    <button
                      onClick={() => {
                        teleportTo(
                          selectedLandmark.x === 0 ? 0 : selectedLandmark.x * 0.78,
                          selectedLandmark.z === 0 ? 10 : selectedLandmark.z * 0.78,
                          selectedLandmark.name
                        );
                        setActiveModal(null);
                      }}
                      className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" /> Dịch Chuyển Tức Thời Đến Địa Điểm Này
                    </button>
                  </div>
                )}

                {/* Player Locator List */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-1">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" /> Vị Trí 4 Người Chơi Trong Phòng ({roomCode})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {Object.values(onlinePlayers).map((p) => (
                      <div key={p.uid} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Tọa độ: ({Math.round(p.x || 0)}, {Math.round(p.z || 0)}) • Thú cưng: {p.petName || 'Pet'}
                          </span>
                        </div>
                        {p.uid !== user?.uid && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                teleportTo((p.x || 0) + 1.4, (p.z || 0) + 1.4, `Chỗ của ${p.name}`);
                                setActiveModal(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 font-bold text-[10px]"
                            >
                              Đến gặp
                            </button>
                            <button
                              onClick={() => {
                                setActiveModal(null);
                                triggerSocialAction(SOCIAL_ACTIONS[0], p);
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px]"
                            >
                              🤜 Kê đầu
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 0B: DETAILED FAIRY PET CARE, INTERACTION & SKILL ACTIVATION */}
      {activeModal === 'pet' && (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border-2 border-fuchsia-200 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-fuchsia-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-600" /> THÚ CƯNG CÔN TRÙNG CÓ CÁNH CHI TIẾT (FAIRY PETS)
                </h3>
                <p className="text-xs text-slate-500">
                  Mô hình 3D đa bộ phận có râu chạm phát sáng, đốt thân, gân cánh phản quang và vệt bụi tiên lấp lánh bay theo sau!
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            {/* Active Pet Status & Care Actions */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-50 via-pink-50 to-amber-50 border border-fuchsia-200 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase text-fuchsia-700">Bạn đồng hành hiện tại</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      value={petCustomName}
                      onChange={(e) => setPetCustomName(e.target.value)}
                      className="text-base font-extrabold text-slate-800 bg-white/80 border border-fuchsia-300 rounded-xl px-2.5 py-0.5 w-44"
                    />
                    <span className="text-xs font-bold bg-fuchsia-600 text-white px-2.5 py-0.5 rounded-full">
                      Cấp {petLevel}
                    </span>
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                      ❤️ Độ thân thiết: {petAffection}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5">
                    <strong>Loài:</strong> {currentFairyPetObj.name} • <strong>Kỹ năng:</strong> {currentFairyPetObj.skill}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  onClick={() => {
                    petHappySpinUntilRef.current = Date.now() + 2500;
                    setPetAffection(a => Math.min(100, a + 5));
                    showToast(`${petCustomName} xoay vòng vui sướng khi được bạn vuốt ve!`, '💖');
                  }}
                  className="py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-extrabold shadow"
                >
                  👋 Vuốt Ve & Chơi Đùa
                </button>
                <button
                  onClick={() => {
                    if (coins < 10) {
                      showToast('Cần 10 Xu để mua mật hoa thượng hạng cho thú cưng!', '🪙');
                      return;
                    }
                    setCoins(c => c - 10);
                    petHappySpinUntilRef.current = Date.now() + 3000;
                    setPetLevel(l => l + 1);
                    setPetAffection(100);
                    showToast(`${petCustomName} đã ăn mật hoa và thăng lên Cấp ${petLevel + 1}!`, '🍯');
                  }}
                  className="py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow"
                >
                  🍯 Cho Ăn Mật Hoa (10🪙)
                </button>
                <button
                  onClick={() => {
                    petHappySpinUntilRef.current = Date.now() + 2800;
                    setCoins(c => c + 15);
                    showToast(`${petCustomName} kích hoạt kỹ năng [${currentFairyPetObj.name}] mang về +15 Xu thưởng!`, '🪄');
                  }}
                  className="py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow"
                >
                  🪄 Kích Hoạt Kỹ Năng
                </button>
              </div>
            </div>

            {/* Switch between all 8 Detailed 3D Winged Fairy Pets */}
            <h4 className="text-xs font-extrabold text-slate-700 uppercase mb-2">
              Đổi Thú Cưng Đồng Hành (8 Loài Côn Trùng Thần Tiên Mô Hình 3D Chi Tiết):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FAIRY_PETS.map((p) => {
                const isSel = selectedPet === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPet(p.id);
                      petHappySpinUntilRef.current = Date.now() + 2000;
                      showToast(`Đã gọi ${p.name} bay đồng hành bên cạnh bạn!`, '🦋');
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                      isSel
                        ? 'bg-fuchsia-100/90 border-fuchsia-500 shadow-sm'
                        : 'bg-slate-50 hover:bg-fuchsia-50/50 border-slate-200'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 mt-0.5 border-2 border-white shadow"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{p.skill}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: 3D GARDEN & STEALING SYSTEM */}
      {activeModal === 'garden' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 shadow-2xl border-2 border-emerald-200 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" /> HỆ THỐNG KHU VƯỜN 3D & TƯƠNG TÁC TRỘM HOA
                </h3>
                <p className="text-xs text-slate-500">
                  Mỗi cây trồng hiển thị 6 giai đoạn mô hình 3D trực tiếp ngoài sân vườn: Gieo hạt → Nảy mầm → Cây con → Trưởng thành → Ra hoa/kết trái → Thu hoạch!
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            {/* Seed Selector Bar */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">1. Chọn Hạt Giống Để Gieo (Hoa, Rau Củ, Cây Ăn Quả):</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {SEEDS_DATA.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeed(s.id)}
                    className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                      selectedSeed === s.id
                        ? 'bg-emerald-100 border-emerald-500 font-bold'
                        : 'bg-slate-50 hover:bg-emerald-50/50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.category} • {s.growTime}s</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-lg">
                      {s.cost}🪙
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* My Plot 8 Soil Beds Control */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold uppercase text-emerald-700">
                  2. Khu Vườn Nhà Của Tôi – Lô {myPlotIndex + 1} (8 Luống Đất 3D)
                </h4>
                <button
                  onClick={() => {
                    const c = PLOT_COORDS[myPlotIndex];
                    teleportTo(c.x * 0.78, c.z * 0.78, c.name);
                    setActiveModal(null);
                  }}
                  className="text-xs text-teal-600 hover:underline font-bold"
                >
                  📍 Đưa nhân vật về đứng cạnh vườn
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: 8 }, (_, idx) => {
                  const bed = ((currentPlotObj.beds || []) as Array<{
                      bedIndex?: number;
                      seedId: string | null;
                     plantedAt: number;
                     watered: boolean;
                     fertilized: boolean;
}>)[idx] || {
  seedId: null,
  plantedAt: 0,
  watered: false,
  fertilized: false
};
                  const stage = getBedGrowthStage(bed);
                  const seedObj = SEEDS_DATA.find(s => s.id === bed.seedId);
                  const stageNames = [
                    'Đất trống',
                    '1/6: Vừa gieo hạt',
                    '2/6: Nảy mầm',
                    '3/6: Cây con',
                    '4/6: Trưởng thành',
                    '5/6: Đang kết hoa/trái',
                    '6/6: Chín rộ (Thu hoạch!)'
                  ];

                  return (
                    <div key={idx} className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>Ô Đất #{idx + 1}</span>
                          {bed.watered && <span className="text-sky-600">💧 Đã tưới</span>}
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 mt-1">
                          {seedObj ? seedObj.name : 'Chưa gieo hạt'}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {stageNames[stage]}
                        </p>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {!bed.seedId ? (
                          <button
                            onClick={() => handlePlantBed(myPlotIndex, idx)}
                            className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
                          >
                            🌱 Gieo Hạt
                          </button>
                        ) : stage < 6 ? (
                          <>
                            <button
                              onClick={() => handleCareBed(myPlotIndex, idx, 'water')}
                              className="flex-1 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold"
                            >
                              💧 Tưới
                            </button>
                            <button
                              onClick={() => handleCareBed(myPlotIndex, idx, 'fertilize')}
                              className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold"
                            >
                              ✨ Bón phân
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleHarvestOrSteal(myPlotIndex, idx)}
                            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-extrabold shadow animate-pulse"
                          >
                            🧺 Thu Hoạch (+{seedObj?.sell}🪙)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Neighbor Plots Inspection & Stealing */}
            <div className="border-t border-slate-200 pt-3">
              <h4 className="text-xs font-extrabold uppercase text-rose-700 mb-2">
                3. Ghé Thăm Vườn Bạn Bè & Hái Trộm Hoa Vui Nhộn (Hồi chiêu: {stealCooldown}s)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PLOT_COORDS.filter(c => c.index !== myPlotIndex).map((coord) => {
                  const nPlot = plotsData[`plot_${coord.index}`];
                  const readyIdx = (nPlot?.beds || []).findIndex(b => getBedGrowthStage(b) >= 6);
                  return (
                    <div key={coord.index} className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{coord.name}</p>
                        <p className="text-[11px] text-slate-600">
                          Chủ nhà: <strong>{nPlot?.ownerName || 'Đang mở tự do'}</strong>
                        </p>
                        <p className="text-[11px] mt-1">
                          Bảo vệ: {nPlot?.protected ? '🔒 Có chuông báo động' : '🔓 Không khóa'}
                        </p>
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={() => {
                            teleportTo(coord.x * 0.78, coord.z * 0.78, coord.name);
                            setActiveModal(null);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 text-[11px] font-bold"
                        >
                          🏃 Đến thăm
                        </button>
                        {readyIdx !== -1 && (
                          <button
                            onClick={() => handleHarvestOrSteal(coord.index, readyIdx)}
                            className="flex-1 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold"
                          >
                            🦊 Hái trộm ô #{readyIdx + 1}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIETNAMESE HOUSE ARCHITECTURE & HOME PETS */}
      {activeModal === 'house' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border-2 border-amber-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-amber-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-600" /> KIẾN TRÚC NHÀ VIỆT NAM & THÚ CƯNG TRONG NHÀ
                </h3>
                <p className="text-xs text-slate-500">Tùy chỉnh phong cách kiến trúc ngôi nhà 3D trên Lô {myPlotIndex + 1} và hệ thống chuông chống trộm</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            {/* 6 Vietnamese House Styles */}
            <h4 className="text-xs font-bold text-slate-700 mb-2">1. Chọn Kiến Trúc Ngôi Nhà 3D (Thay đổi trực tiếp trên bản đồ):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {HOUSE_STYLES.map((h) => {
                const isSel = selectedHouseStyle === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={async () => {
                      setSelectedHouseStyle(h.id);
                      const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, `plot_${myPlotIndex}`);
                      await setDoc(plotRef, { houseStyle: h.id, updatedAt: Date.now() }, { merge: true });
                      showToast(`Đã đổi kiến trúc nhà sang: ${h.name}!`, '🏡');
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSel ? 'bg-amber-100 border-amber-500 shadow-sm' : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-slate-800">{h.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{h.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Alarm Protection Toggle */}
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" /> Bẫy & Chuông Báo Động Bảo Vệ Vườn Hoa
                </p>
                <p className="text-[11px] text-slate-600">Khi bật, người chơi khác lén hái trộm hoa sẽ bị chuông báo động phát hiện!</p>
              </div>
              <button
                onClick={async () => {
                  const nextVal = !houseProtection;
                  setHouseProtection(nextVal);
                  const plotRef = doc(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_plots`, `plot_${myPlotIndex}`);
                  await setDoc(plotRef, { protected: nextVal }, { merge: true });
                  showToast(nextVal ? 'Đã bật Chuông báo động bảo vệ nhà!' : 'Đã mở cửa vườn tự do!', nextVal ? '🔒' : '🔓');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  houseProtection ? 'bg-teal-600 text-white' : 'bg-white border border-teal-300 text-teal-800'
                }`}
              >
                {houseProtection ? '🔒 Đang Bảo Vệ' : '🔓 Đang Mở'}
              </button>
            </div>

            {/* Home Pets (Thú nuôi sân vườn) */}
            <h4 className="text-xs font-bold text-slate-700 mb-2">2. Nuôi Thú Cưng Trong Sân Nhà (Chó, Mèo, Thỏ, Gà, Cá Koi):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOME_PETS_DATA.map((hp) => {
                const owned = myHomePets.includes(hp.id);
                return (
                  <div key={hp.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{hp.name}</p>
                      <p className="text-[10px] text-slate-500">{owned ? 'Đang chạy nhảy ở sân' : `${hp.cost} Xu`}</p>
                    </div>
                    {owned ? (
                      <button
                        onClick={() => showToast(`Bạn vừa cho ${hp.name} ăn hạt thơm ngon! (+Tình cảm)`, '❤️')}
                        className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 text-[11px] font-bold"
                      >
                        Cho ăn ❤️
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (coins < hp.cost) {
                            showToast('Chưa đủ Xu để nhận nuôi thú cưng này!', '🪙');
                            return;
                          }
                          setCoins(c => c - hp.cost);
                          setMyHomePets([...myHomePets, hp.id]);
                          showToast(`Đã nhận nuôi ${hp.name} về sân vườn!`, '🐾');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold"
                      >
                        Nuôi
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIETNAMESE CULTURE EXPLORATION & QUIZ */}
      {activeModal === 'culture' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border-2 border-rose-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-rose-800 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-rose-600" /> KHÁM PHÁ VĂN HÓA, KIẾN TRÚC & LỊCH SỬ VIỆT NAM
                </h3>
                <p className="text-xs text-slate-500">Tìm hiểu kiến trúc Nhà Thờ, Ngôi Chùa truyền thống và trả lời câu đố nhận thưởng</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            {/* Architectural Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200">
                <h4 className="text-xs font-extrabold text-amber-900">⛪ Nhà Thờ Kiến Trúc Gothic Kết Hợp Bản Địa</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Nổi bật với tháp chuông cao, các ô cửa vòm nhọn và cửa kính hoa hồng rực rỡ. Đây là không gian cộng đồng trang nghiêm, nơi 4 người bạn có thể ngồi nghỉ và chụp ảnh kỷ niệm.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200">
                <h4 className="text-xs font-extrabold text-rose-900">🏮 Ngôi Chùa Truyền Thống Việt Nam</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Mang đậm bản sắc Việt với Cổng Tam Quan, mái đao cong lợp ngói đỏ, hồ sen thanh tịnh và gốc cây Bồ Đề cổ thụ tỏa bóng mát. Khu vực tôn nghiêm không có hoạt động trộm cắp.
                </p>
              </div>
            </div>

            {/* Interactive Cultural Quiz */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-rose-700 uppercase">
                  Câu Đố Văn Hóa ({quizIndex + 1}/{CULTURAL_QUIZZES.length})
                </span>
                <span className="text-xs font-bold text-amber-700">Phần thưởng: +{CULTURAL_QUIZZES[quizIndex].reward} Xu</span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-3">
                {CULTURAL_QUIZZES[quizIndex].q}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CULTURAL_QUIZZES[quizIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const currentQ = CULTURAL_QUIZZES[quizIndex];
                      if (idx === currentQ.ans) {
                        setCoins(c => c + currentQ.reward);
                        incrementQuest('q_quiz', 1);
                        setQuizFeedback({ ok: true, text: `Chính xác! ${currentQ.explain}` });
                        showToast(`Giải đố chính xác! +${currentQ.reward} Xu`, '🎉');
                      } else {
                        setQuizFeedback({ ok: false, text: 'Chưa chính xác, bạn hãy thử suy nghĩ lại nhé!' });
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-200 text-left text-xs font-semibold text-slate-800 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className={`mt-3 p-3 rounded-xl text-xs ${quizFeedback.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                  <p className="font-bold">{quizFeedback.text}</p>
                  {quizFeedback.ok && (
                    <button
                      onClick={() => {
                        setQuizIndex((quizIndex + 1) % CULTURAL_QUIZZES.length);
                        setQuizFeedback(null);
                      }}
                      className="mt-2 px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                    >
                      Câu đố tiếp theo →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FOLK GAMES ZONE (Ô ĂN QUAN MINI GAME) */}
      {activeModal === 'folkgame' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border-2 border-purple-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-purple-900 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-purple-600" /> TRÒ CHƠI DÂN GIAN: Ô ĂN QUAN
                </h3>
                <p className="text-xs text-slate-500">Nhấn vào một ô dân để rải sỏi. Khi ô tiếp theo trống, bạn ăn được sỏi ở ô kế tiếp và nhận Xu!</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-2">
              {/* Left Mandarin Pit (Ô Quan Trái - Index 0) */}
              <div className="w-16 h-28 rounded-l-full bg-amber-200 border-2 border-amber-500 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-amber-900">Ô QUAN</span>
                <span className="text-lg font-extrabold text-amber-900">🪨 {oAnQuanBoard[0]}</span>
              </div>

              {/* 10 Citizen Pits (2 rows of 5) */}
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => playOAnQuanMove(idx)}
                    className="h-12 rounded-xl bg-white hover:bg-purple-100 border border-amber-300 flex flex-col items-center justify-center transition"
                  >
                    <span className="text-[10px] text-slate-400">Ô {idx}</span>
                    <span className="text-xs font-extrabold text-slate-800">⚪ {oAnQuanBoard[idx]}</span>
                  </button>
                ))}
                {[11, 10, 9, 8, 7].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => playOAnQuanMove(idx)}
                    className="h-12 rounded-xl bg-white hover:bg-purple-100 border border-amber-300 flex flex-col items-center justify-center transition"
                  >
                    <span className="text-[10px] text-slate-400">Ô {idx}</span>
                    <span className="text-xs font-extrabold text-slate-800">⚪ {oAnQuanBoard[idx]}</span>
                  </button>
                ))}
              </div>

              {/* Right Mandarin Pit (Ô Quan Phải - Index 6) */}
              <div className="w-16 h-28 rounded-r-full bg-amber-200 border-2 border-amber-500 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-amber-900">Ô QUAN</span>
                <span className="text-lg font-extrabold text-amber-900">🪨 {oAnQuanBoard[6]}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">Điểm sỏi đã ăn: {oAnQuanScore} 🪨</span>
              <button
                onClick={() => setOAnQuanBoard([10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5])}
                className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold"
              >
                Xếp lại bàn mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: QUESTS & REWARDS */}
      {activeModal === 'quests' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border-2 border-teal-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-teal-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" /> BẢNG NHIỆM VỤ CÁ NHÂN & NHÓM
              </h3>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {quests.map((q) => (
                <div key={q.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">{q.type}</span>
                      <span className="text-xs font-bold text-slate-800">{q.title}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-teal-500 h-full transition-all"
                        style={{ width: `${(q.progress / q.target) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-amber-700 block">+{q.reward} 🪙</span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {q.done ? '✅ Hoàn thành' : `${q.progress}/${q.target}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: TRANSPARENT STATUS & DEVELOPMENT ROADMAP */}
      {activeModal === 'roadmap' && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border-2 border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                TRẠNG THÁI TÍNH NĂNG & KIẾN TRÚC (LIAM WORLD 3D)
              </h3>
              <button onClick={() => setActiveModal(null)} className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">
                Đóng ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                ✅ <strong> Đã hoạt động thực tế (Live):</strong> Thế giới mở 3D Three.js (Công viên, Cầu gỗ, Suối, Hồ sen, Hoa đào rơi, Đom đóm ban đêm, Nhà thờ Gothic, Chùa Việt Nam, 4 Khu đất riêng), Màn hình xoay 360° chọn 12 Con Giáp với mô hình tai/sừng/đuôi riêng biệt, 10 Trang phục, 8 Thú cưng côn trùng vỗ cánh bay theo nhân vật, Khu vườn 3D 6 giai đoạn phát triển, Hái trộm hoa & Chuông báo động, Ô Ăn Quan, Câu đố văn hóa, Đồng bộ Multiplayer 4 người thật & Chat qua Firebase Firestore.
              </p>
              <p className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                🚧 <strong>Đang mở rộng trong các phiên bản tiếp theo:</strong> Hệ thống Voice Chat trực tiếp (WebRTC), Mini-game Kéo co & Nhảy dây vật lý 4 người cùng lúc, và Nội thất chi tiết nhiều tầng bên trong từng ngôi nhà.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}