# Shop Thời Trang Nữ

Website bán quần áo nữ với Laravel API + Next.js + Docker.

## Chạy lần đầu

```bash
docker compose up --build -d
```

Chờ khoảng 2-3 phút để build xong. Sau đó vào:

- **Website**: http://localhost
- **Admin**: http://localhost/admin/login
  - Email: `admin@shop.com`
  - Password: `Admin@123`

## Cấu hình Facebook

Thêm link Facebook của shop vào `docker-compose.yml`:

```yaml
frontend:
  environment:
    NEXT_PUBLIC_FB_PAGE: https://facebook.com/your-page
```

Sau đó rebuild: `docker compose up -d --build frontend`

## Quản trị

| Tính năng | Mô tả |
|-----------|-------|
| Thêm/sửa/xóa sản phẩm | Tên, mô tả, giá, giá khuyến mãi, link FB |
| Quản lý size | Thêm size tuỳ chỉnh, bật/tắt còn hàng |
| Upload ảnh | Nén tự động, tạo thumbnail |
| Bật/tắt sản phẩm | Ẩn sản phẩm không cần xóa |
| Banner slider | Upload banner cho trang chủ |

## Dừng / restart

```bash
docker compose down       # dừng
docker compose up -d      # chạy lại (không build lại)
docker compose down -v    # xóa luôn dữ liệu
```

## Lưu ý

- Ảnh upload được nén tự động: full 1200px (80% quality), thumbnail 500px (75%)
- Không dùng cache, không lưu log (nhẹ nhất có thể)
- Admin mặc định: `admin@shop.com` / `Admin@123` — đổi mật khẩu trực tiếp trong DB
# shopping
