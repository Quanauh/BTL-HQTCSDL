import requests
import time

from models.product import Product

def crawl_tiki():

    url = "https://tiki.vn/api/personalish/v1/blocks/listings"

    headers = {
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0",
        "referer": "https://tiki.vn/dien-thoai-may-tinh-bang/c1789"
    }

    all_products = []

    page = 1

    while True:

        print(f"\n========== PAGE {page} ==========")

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

        products = data.get(
            "data",
            []
        )

        # hết dữ liệu
        if not products:

            print("Đã crawl hết dữ liệu!")

            break

        print(
            f"Tìm thấy {len(products)} sản phẩm"
        )

        for p in products:

            try:

                product = Product(
                    p.get("name"),
                    p.get("brand_name"),
                    p.get("price"),
                    p.get("thumbnail_url"),
                    f"https://tiki.vn/{p.get('url_path')}"
                )

                all_products.append(product)

                print("✔", p.get("name"))

            except Exception as e:

                print("Lỗi:", e)

        page += 1

        time.sleep(1)

    return all_products