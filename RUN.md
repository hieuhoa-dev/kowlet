Self-host Supabase cho môi trường Production: Tức là muốn gộp toàn bộ hơn 10 services của Supabase vào chung file docker-compose.yml này để tự chạy backend trên server của bạn (thay vì dùng dịch vụ cloud của Supabase). Việc này sẽ tạo ra một file docker-compose rất dài (~300 dòng) và cần thiết lập rất nhiều mật khẩu/secret.

Chạy local để phát triển (Development): Thông thường trong lúc dev, bạn chỉ cần gõ lệnh npx supabase start (Supabase CLI sẽ tự động tải và chạy các container cần thiết dưới nền) chứ không cần thêm thủ công vào file docker-compose.yml của frontend.


Mình đã thiết lập xong hệ thống cân bằng tải (Load Balancer) bằng Nginx cho dự án của bạn.

Dưới đây là những thay đổi cụ thể:

1. **Cập nhật `docker-compose.yml`**:
   - Thêm một service mới tên là `loadbalancer` sử dụng Nginx.
   - Bỏ thuộc tính `container_name` ở service `web` để có thể nhân bản (scale) nhiều container.
   - Chuyển việc mở port ra ngoài từ service `web` sang cho Nginx (Nginx nhận port `80` và trỏ vào port nội bộ `3000` của cụm `web`).

2. **Thêm file cấu hình `nginx/nginx.conf`**:
   - Sử dụng khối `upstream` trỏ thẳng vào domain nội bộ `web:3000`. Docker DNS sẽ tự động phân giải domain này thành danh sách các IP thực tế của tất cả các container Next.js đang chạy, và Nginx sẽ tự động phân bổ đều luồng truy cập theo thuật toán Round-Robin.

**Cách sử dụng (Scale nhiều instances):**
Bây giờ, nếu bạn muốn chạy **3 bản sao** của Next.js app để chịu tải tốt hơn, bạn hãy thêm tham số `--scale` khi khởi chạy bằng lệnh sau:

```bash
docker compose up -d --scale web=3 --build
```
Hệ thống lúc này sẽ tự khởi tạo 3 container Next.js và 1 container Nginx. Mọi truy cập từ người dùng vào cổng 80 sẽ được Nginx chia đều tải cho cả 3 ứng dụng web.