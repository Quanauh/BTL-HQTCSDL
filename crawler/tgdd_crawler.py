import time

from selenium.webdriver.common.by import By

from selenium.webdriver.common.action_chains import ActionChains

from models.product import Product

from utils.brand_detector import get_brand

def crawl_tgdd(driver):

    all_products = []

    print("\n========== THE GIOI DI DONG ==========")

    url = "https://www.thegioididong.com/dtdd"

    driver.get(url)

    # captcha
    input(
        "TGDD: vượt captcha xong thì nhấn Enter..."
    )

    time.sleep(3)

    # =========================
    # CLICK XEM THEM
    # =========================

    for i in range(8):

        try:

            # scroll xuống cuối
            driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);"
            )

            time.sleep(2)

            # nút xem thêm
            btn = driver.find_element(
                By.CSS_SELECTOR,
                ".view-more a"
            )

            # click
            ActionChains(driver)\
                .move_to_element(btn)\
                .click()\
                .perform()

            print(
                f"Đã bấm xem thêm lần {i+1}"
            )

            time.sleep(3)

        except Exception as e:

            print(
                "Không tìm thấy nút xem thêm:",
                e
            )

            break

    # =========================
    # GET PRODUCTS
    # =========================

    elems = driver.find_elements(
        By.CSS_SELECTOR,
        ".listproduct li"
    )

    print("Tổng products:", len(elems))

    for item in elems:

        try:

            title = item.find_element(
                By.CSS_SELECTOR,
                ".product-title"
            ).text

            link = item.find_element(
                By.TAG_NAME,
                "a"
            ).get_attribute(
                "href"
            )

            price = item.find_element(
                By.CSS_SELECTOR,
                ".price"
            ).text

            image = item.find_element(
                By.CSS_SELECTOR,
                ".item-img img"
            ).get_attribute(
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