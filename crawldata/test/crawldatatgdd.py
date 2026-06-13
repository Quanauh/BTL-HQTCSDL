import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
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
# OPEN PAGE 1
# =========================

url = 'https://www.thegioididong.com/dtdd'

driver.get(url)

input("Vượt captcha xong nhấn Enter...")

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

        # tìm nút xem thêm
        btn = driver.find_element(
            By.CSS_SELECTOR,
            '.view-more a'
        )

        # click
        ActionChains(driver).move_to_element(btn).click().perform()

        print(f"Đã bấm xem thêm lần {i+1}")

        time.sleep(3)

    except Exception as e:

        print("Không tìm thấy nút xem thêm:", e)
        break

# =========================
# GET DATA
# =========================

all_titles = []
all_links = []
all_prices = []
all_images = []
all_brands = []

elems = driver.find_elements(
    By.CSS_SELECTOR,
    '.listproduct li'
)

print("Tổng products:", len(elems))

for item in elems:

    try:

        title = item.find_element(
            By.CSS_SELECTOR,
            '.product-title'
        ).text

        link = item.find_element(
            By.TAG_NAME,
            'a'
        ).get_attribute('href')

        price = item.find_element(
            By.CSS_SELECTOR,
            '.price'
        ).text

        image = item.find_element(
            By.CSS_SELECTOR,
            '.item-img img'
        ).get_attribute('src')

        brand = get_brand(title)

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
# CLEAN
# =========================

df = df[df['ten_san_pham'] != ""]

df = df.drop_duplicates(
    subset=['ten_san_pham']
)

# =========================
# EXPORT
# =========================

df.to_csv(
    'thegioididong_data.csv',
    index=False,
    encoding='utf-8-sig'
)

print("\n========== DONE ==========")
print(df.head())
print(f"\nTổng sản phẩm: {len(df)}")

driver.quit()