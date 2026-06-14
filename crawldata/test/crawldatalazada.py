import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time

# =========================
# BRAND LIST
# =========================

brands = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "OPPO",
    "vivo",
    "realme",
    "HONOR",
    "Nokia",
    "TECNO",
    "Infinix",
    "Huawei"
]

def get_brand(product_name):

    for brand in brands:

        if brand.lower() in product_name.lower():
            return brand

    return "Unknown"

# =========================
# CHROME OPTIONS
# =========================

options = webdriver.ChromeOptions()

options.add_argument(
    "--disable-blink-features=AutomationControlled"
)

options.add_experimental_option(
    "excludeSwitches",
    ["enable-automation"]
)

options.add_experimental_option(
    "useAutomationExtension",
    False
)

# =========================
# OPEN CHROME
# =========================

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

driver.execute_script(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
)

driver.maximize_window()

# =========================
# DATA LIST
# =========================

all_titles = []
all_links = []
all_prices = []
all_images = []
all_brands = []

# =========================
# LOOP 84 PAGES
# =========================

for page in range(1,61):

    print(f"\n========== PAGE {page} ==========")

    url = f'https://www.lazada.vn/dien-thoai-di-dong?page={page}'

    driver.get(url)

    # đợi m vượt captcha
    input(
        f"Page {page}: vượt captcha xong thì nhấn Enter..."
    )

    # chờ render thêm
    time.sleep(3)

    # =========================
    # GET NAME + LINK
    # =========================

    elems = driver.find_elements(
        By.CSS_SELECTOR,
        '.RfADt a'
    )

    elems_price = driver.find_elements(
        By.CSS_SELECTOR,
        '.aBrP0'
    )

    elems_img = driver.find_elements(
        By.CSS_SELECTOR,
        '._95X4G img'
    )

    print("Tên SP:", len(elems))
    print("Giá:", len(elems_price))
    print("Ảnh:", len(elems_img))

    # =========================
    # LOOP PRODUCTS
    # =========================

    min_len = min(
        len(elems),
        len(elems_price),
        len(elems_img)
    )

    for i in range(min_len):

        try:

            title = elems[i].text

            link = elems[i].get_attribute(
                'href'
            )

            price = elems_price[i].text

            image = elems_img[i].get_attribute(
                'src'
            )

            if not image:
                image = elems_img[i].get_attribute(
                    'data-src'
                )

            brand = get_brand(title)

            # add data
            all_titles.append(title)
            all_links.append(link)
            all_prices.append(price)
            all_images.append(image)
            all_brands.append(brand)

            print("✔", title)

        except Exception as e:

            print("Lỗi:", e)

# =========================
# DATAFRAME
# =========================

df = pd.DataFrame({
    'ten_san_pham': all_titles,
    'thuong_hieu': all_brands,
    'gia': all_prices,
    'anh': all_images,
    'link': all_links
})

# =========================
# CLEAN DATA
# =========================

df = df[df['ten_san_pham'] != ""]

df = df.drop_duplicates(
    subset=['ten_san_pham']
)

# =========================
# EXPORT CSV
# =========================

df.to_csv(
    'lazada_phones2.csv',
    index=False,
    encoding='utf-8-sig'
)

print("\n========== DONE ==========")
print(df.head())
print(f"\nTổng sản phẩm: {len(df)}")

driver.quit()