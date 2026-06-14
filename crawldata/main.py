from utils.driver_setup import create_driver

from crawler.lazada_crawler import crawl_lazada

from storage.csv_storage import save_to_csv

from config.settings import OUTPUT_FILE

def main():

    driver = create_driver()

    try:

        products = crawl_lazada(driver)

        save_to_csv(
            products,
            OUTPUT_FILE
        )

    finally:

        driver.quit()

if __name__ == "__main__":

    main()