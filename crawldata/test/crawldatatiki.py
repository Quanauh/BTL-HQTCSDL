import requests
import pandas as pd
import time

url = "https://tiki.vn/api/personalish/v1/blocks/listings"

headers = {
    "accept": "application/json, text/plain, */*",
    "user-agent": "Mozilla/5.0",
    "referer": "https://tiki.vn/dien-thoai-may-tinh-bang/c1789"
}

all_products = []

page = 1

while True:

    print(f"Đang crawl page {page}...")

    params = {
        "limit": 40,
        "include": "advertisement",
        "aggregations": 2,
        "version": "home-persionalized",
        "category": 1789,
        "page": page,
        "urlKey": "dien-thoai-may-tinh-bang"
    }

    response = requests.get(
        url,
        headers=headers,
        params=params
    )

    data = response.json()

    # Lấy danh sách sản phẩm
    products = data.get("data", [])

    # Nếu hết sản phẩm thì dừng
    if not products:
        print("Đã crawl hết dữ liệu!")
        break

    print(f"Tìm thấy {len(products)} sản phẩm")

    for p in products:

        all_products.append({
            "san_pham_id": p.get("id"),
            "ten": p.get("name"),
            "mo_ta": p.get("name"),
            "gia": p.get("price"),
            "anh": p.get("thumbnail_url"),
            "con_hang": p.get("inventory_status"),
            "thuong_hieu": p.get("brand_name")
        })

    # Sang page tiếp theo
    page += 1

    # Nghỉ 1 giây tránh spam API
    time.sleep(1)

# Tạo DataFrame
df = pd.DataFrame(all_products)

# Xóa sản phẩm trùng ID
df = df.drop_duplicates(subset=["san_pham_id"])
  
# Xuất CSV
df.to_csv(
    "san_pham.csv",
    index=False,
    encoding="utf-8-sig"
)

print(f"Đã lưu {len(df)} sản phẩm vào san_pham.csv")