import pandas as pd

def save_to_csv(products, filename):

    data = []

    for product in products:

        data.append(
            product.to_dict()
        )

    df = pd.DataFrame(data)

    # clean data
    df = df[
        df["ten_san_pham"] != ""
    ]

    df = df.drop_duplicates(
        subset=["ten_san_pham"]
    )

    df.to_csv(
        filename,
        index=False,
        encoding="utf-8-sig"
    )

    print("\n========== DONE ==========")

    print(df.head())

    print(
        f"\nTổng sản phẩm: {len(df)}"
    )