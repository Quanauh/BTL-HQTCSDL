class Product:

    def __init__(
        self,
        title,
        brand,
        price,
        image,
        link
    ):

        self.title = title
        self.brand = brand
        self.price = price
        self.image = image
        self.link = link

    def to_dict(self):

        return {
            "ten_san_pham": self.title,
            "thuong_hieu": self.brand,
            "gia": self.price,
            "anh": self.image,
            "link": self.link
        }