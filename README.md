# FULLSTACK REAL-TIME CHAT APPLICATION

Ứng dụng nhắn tin thời gian thực cao cấp được phát triển dựa trên kiến trúc MERN Stack hiện đại (MongoDB, Express, React, Node.js) tích hợp truyền thông thời gian thực qua WebRTC và Socket.IO.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG
*   **Frontend:** React, Zustand (Quản lý trạng thái), Tailwind CSS, DaisyUI.
*   **Backend:** Node.js, Express, Socket.IO.
*   **Cơ sở dữ liệu:** MongoDB Atlas (Cloud Database).
*   **Lưu trữ truyền thông:** Cloudinary (Lưu trữ ảnh & tin nhắn thoại).
*   **Xác thực & Bảo mật:** JSON Web Token (JWT) dạng HTTP-Only Cookie, BcryptJS.
*   **Cuộc gọi trực tuyến:** WebRTC (RTCPeerConnection).

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT
1.  **Gọi thoại & Gọi video trực tuyến (WebRTC):** Thiết lập kết nối Peer-to-Peer thời gian thực với đầy đủ chức năng điều khiển (tắt mic, tắt camera, kết thúc cuộc gọi).
2.  **Tin nhắn thoại (Voice Messages):** Ghi âm trực tiếp từ micro và phát lại qua trình phát âm thanh tùy chỉnh.
3.  **Xem & Tìm kiếm lịch sử tin nhắn:** Bộ lọc thời gian thực và tự động làm nổi bật từ khóa trong lịch sử trò chuyện.
4.  **Nhãn dán động (Stickers):** Bộ nhãn dán GIF hoạt hình sinh động, tự động hiển thị với nền trong suốt tinh tế.

---

## 📖 TÀI LIỆU KỸ THUẬT & BẢO MẬT HỆ THỐNG

### 1.2.3.1 Mã hóa mật khẩu bằng bcrypt
Mật khẩu là thông tin quan trọng nhất của người dùng trong hệ thống. Để khắc phục nguy cơ rò rỉ dữ liệu khi hệ thống bị tấn công, ứng dụng sử dụng thư viện **bcrypt** để mã hóa mật khẩu trước khi lưu vào MongoDB Atlas.

#### Nguyên lý băm mật khẩu (Hashing):
1.  **Tạo Salt (Muối):** Sinh chuỗi ký tự ngẫu nhiên với độ phức tạp cao (`bcrypt.genSalt(10)`).
2.  **Băm mật khẩu:** Kết hợp mật khẩu gốc và muối vừa sinh để tạo chuỗi băm một chiều dài 60 ký tự không thể dịch ngược.

#### Minh họa mã nguồn thực tế:

*   **Mã hóa mật khẩu khi Đăng ký (`backend/src/controllers/auth.controller.js`):**
```javascript
// Sinh muối ngẫu nhiên với Salt Rounds = 10
const salt = await bcrypt.genSalt(10);

// Băm mật khẩu gốc kết hợp với muối
const hashedPassword = await bcrypt.hash(password, salt);

// Tạo thực thể người dùng mới
const newUser = new User({
    fullName: fullName,
    email: email,
    password: hashedPassword // Lưu chuỗi đã băm an toàn vào Database
});

await newUser.save();
```

*   **Kiểm tra mật khẩu khi Đăng nhập (`backend/src/controllers/auth.controller.js`):**
```javascript
const user = await User.findOne({ email });
if (!user) {
    return res.status(400).json({ message: "Invalid Credentials" });
}

// So sánh mật khẩu đầu vào với mật khẩu đã băm trong database
const isPasswordCorrect = await bcrypt.compare(password, user.password);
if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid Credentials" });
}
```

---

### 1.2.3.2 Xác thực đăng nhập bằng JWT (JSON Web Token)
Để kiểm soát quyền truy cập và bảo vệ tài nguyên hệ thống, ứng dụng sử dụng cơ chế xác thực không trạng thái (stateless) dựa trên **JWT (JSON Web Token)** được lưu trữ dưới dạng Cookie an toàn.

#### Cơ chế hoạt động:
1.  **Cấp phát Token:** Sau khi xác thực thông tin đăng nhập đúng, Server ký số tạo ra JWT chứa mã định danh người dùng (`userId`).
2.  **Lưu trữ an toàn:** Gửi Token về Client qua HTTP-Only Cookie nhằm triệt tiêu hoàn toàn nguy cơ bị lấy cắp qua các cuộc tấn công XSS.
3.  **Xác thực tự động:** Mỗi yêu cầu gửi đi từ Client sẽ mang theo Cookie này, Middleware `protectRoute` giải mã và kiểm duyệt chữ ký Token để cấp quyền truy cập.

#### Minh họa mã nguồn thực tế:

*   **Cấp phát và gán Token vào HTTP-Only Cookie (`backend/src/lib/utils.js`):**
```javascript
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    // Tạo token JWT có thời hạn 7 ngày
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    
    // Gán token vào Cookie bảo mật cao
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,                  // Chống tấn công XSS
        sameSite: "strict",               // Chống tấn công CSRF
        secure: process.env.NODE_ENV !== "development" 
    });

    return token;
};
```

*   **Middleware xác thực và bảo vệ tuyến đường (`backend/src/middleware/auth.middleware.js`):**
```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        // Giải mã và xác thực token bằng khóa bí mật
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
             return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        // Truy vấn thông tin người dùng từ cơ sở dữ liệu
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
             return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next(); // Hợp lệ, cho phép truy cập tiếp
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
```

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

### 1. Cài đặt các biến môi trường tại thư mục `backend/.env`
```env
PORT=5001
MONGO_URL=<Đường_dẫn_MongoDB_Atlas_của_bạn>
JWT_SECRET=<Chuỗi_khóa_bí_mật_bất_kỳ>
CLOUDINARY_CLOUD_NAME=<Tên_Cloudinary_của_bạn>
CLOUDINARY_API_KEY=<API_Key_của_bạn>
CLOUDINARY_API_SECRET=<API_Secret_của_bạn>
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Khởi chạy Backend
```bash
cd backend
npm run dev
```

### 3. Khởi chạy Frontend
```bash
cd frontend
npm run dev
```
Truy cập vào ứng dụng tại: **[http://localhost:5173](http://localhost:5173)**
