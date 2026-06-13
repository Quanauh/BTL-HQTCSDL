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