import csv
import logging
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Setup logging for debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def setup_driver():
    """Initializes and returns a Chrome WebDriver with proper settings."""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # chrome_options.add_argument("--headless")  # Uncomment to run headlessly

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.implicitly_wait(10)  # Implicit wait to handle dynamic page elements
    return driver

def extract_product_links(driver, base_url, total_pages):
    """Extracts product links from the given pages."""
    unique_links = set()
    for page in range(1, total_pages + 1):
        url = f"{base_url}?page={page}"
        try:
            driver.get(url)
            logging.info(f"Loading page: {url}")

            # Wait for the product grid to be visible
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".product-grid-item"))
            )

            # Extract all the links within the product grid
            links = driver.find_elements(By.CSS_SELECTOR, ".product-grid-item a")
            for link in links:
                href = link.get_attribute('href')
                if href:
                    unique_links.add(href)
        except Exception as e:
            logging.error(f"Error extracting links from {url}: {e}")

    logging.info(f"Total unique links extracted: {len(unique_links)}")
    return unique_links

def scrape_product_data(driver, product_links):
    """Scrapes product price and description from each link."""
    data = []
    for idx, url in enumerate(product_links):
        driver.get(url)
        time.sleep(2)  # Short delay to let the page load completely

        try:
            price = driver.find_element(By.CSS_SELECTOR, ".t4s-product-price").text
            description = driver.find_element(By.CSS_SELECTOR, ".t4s-rte.t4s-tab-content").text

            data.append({
                "money": price,
                "description": description,
                "url": url
            })
            logging.info(f"Processed link {idx + 1}/{len(product_links)}: {url}")

        except Exception as e:
            logging.error(f"Error on page {url}: {e}")

    return data

def save_data_to_csv(filename, data):
    """Saves scraped data to a CSV file."""
    try:
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=["money", "description", "url"])
            writer.writeheader()
            writer.writerows(data)
        logging.info(f"Data saved to {filename}")
    except IOError as e:
        logging.error(f"Error writing data to file: {e}")

def main():
    driver = setup_driver()

    # Step 1: Extract product links
    base_url = "https://nishatlinen.com/collections/woman"
    total_pages = 20  # Adjust this to the number of pages on the Nishat website
    product_links = extract_product_links(driver, base_url, total_pages)

    # Step 2: Scrape product details
    scraped_data = scrape_product_data(driver, product_links)

    # Step 3: Save data to CSV
    save_data_to_csv("nishat_women.csv", scraped_data)

    # Close the driver
    driver.quit()
    logging.info("Scraping completed and browser closed.")

if __name__ == "__main__":
    main()
