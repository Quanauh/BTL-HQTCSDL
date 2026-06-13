import time

from selenium.webdriver.common.by import By

from models.product import Product

from utils.brand_detector import get_brand

def crawl_cps(driver):

    all_products = []

    print("\n========== CELLPHONES ==========")

    url = "https://cellphones.com.vn/mobile.html"

    driver.get(url)

    # captcha
    input(
        "CellphoneS: vượt captcha xong thì nhấn Enter..."
    )

    time.sleep(3)

    # =========================
    # GET ELEMENTS
    # =========================

    elems = driver.find_elements(
        By.CSS_SELECTOR,
        ".product-info a"
    )

    elems_names = driver.find_elements(
        By.CSS_SELECTOR,
        ".product__name h3"
    )

    elems_price = driver.find_elements(
        By.CSS_SELECTOR,
        ".product__price--show"
    )

    elems_img = driver.find_elements(
        By.CSS_SELECTOR,
        ".product__image img"
    )

    print("Tên SP:", len(elems_names))
    print("Giá:", len(elems_price))
    print("Ảnh:", len(elems_img))

    # =========================
    # LOOP PRODUCTS
    # =========================

    min_len = min(
        len(elems),
        len(elems_names),
        len(elems_price),
        len(elems_img)
    )

    for i in range(min_len):

        try:

            title = elems_names[i].text

            link = elems[i].get_attribute(
                "href"
            )

            price = elems_price[i].text

            image = elems_img[i].get_attribute(
                "src"
            )

            brand = get_brand(title)

            product = Product(
                title,
                brand,
                price,
                image,
                link
            )

            all_products.append(product)

            print("✔", title)

        except Exception as e:

            print("Lỗi:", e)

    return all_products