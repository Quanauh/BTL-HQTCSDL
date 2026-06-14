import time

from selenium.webdriver.common.by import By

from models.product import Product

from utils.brand_detector import get_brand

from config.settings import BASE_URL
from config.settings import MAX_PAGE

def crawl_lazada(driver):

    all_products = []

    for page in range(1, MAX_PAGE + 1):

        print(f"\n========== PAGE {page} ==========")

        url = f"{BASE_URL}?page={page}"

        driver.get(url)

        input(
            f"Page {page}: vượt captcha xong thì nhấn Enter..."
        )

        time.sleep(3)

        elems = driver.find_elements(
            By.CSS_SELECTOR,
            ".RfADt a"
        )

        elems_price = driver.find_elements(
            By.CSS_SELECTOR,
            ".aBrP0"
        )

        elems_img = driver.find_elements(
            By.CSS_SELECTOR,
            "._95X4G img"
        )

        print("Tên SP:", len(elems))
        print("Giá:", len(elems_price))
        print("Ảnh:", len(elems_img))

        min_len = min(
            len(elems),
            len(elems_price),
            len(elems_img)
        )

        for i in range(min_len):

            try:

                title = elems[i].text

                link = elems[i].get_attribute(
                    "href"
                )

                price = elems_price[i].text

                image = elems_img[i].get_attribute(
                    "src"
                )

                if not image:

                    image = elems_img[i].get_attribute(
                        "data-src"
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