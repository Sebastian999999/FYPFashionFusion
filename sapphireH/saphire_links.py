from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import logging

# Setup logging for better debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def setup_driver():
    """Initializes and returns a Chrome WebDriver with proper settings."""
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Uncomment to run headlessly
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.implicitly_wait(10)  # Implicit wait to handle dynamic page elements
    return driver

def extract_links(driver, page_url):
    """Extracts product links from the given page URL."""
    unique_links = set()
    try:
        driver.get(page_url)
        logging.info(f"Loading page: {page_url}")

        # Wait for the container with product links to be visible
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".t4s_box_pr_grid"))
        )

        # Extract all the links within the container
        links = driver.find_elements(By.CSS_SELECTOR, ".t4s_box_pr_grid a")
        for link in links:
            href = link.get_attribute('href')
            if href:
                unique_links.add(href)
    except Exception as e:
        logging.error(f"Error extracting links from {page_url}: {e}")

    return unique_links

def save_links_to_file(filename, links):
    """Writes the extracted links to a text file."""
    try:
        with open(filename, 'w') as file:
            for link in links:
                file.write(link + '\n')
        logging.info(f"Saved {len(links)} unique links to {filename}")
    except IOError as e:
        logging.error(f"Error writing links to file: {e}")

def main():
    driver = setup_driver()
    all_unique_links = set()

    for page in range(1, 33):
        url = f'https://pk.sapphireonline.pk/collections/woman?page={page}'
        unique_links = extract_links(driver, url)
        all_unique_links.update(unique_links)
        logging.info(f"Extracted {len(unique_links)} links from page {page}")

    save_links_to_file('unique_links.txt', all_unique_links)
    driver.quit()
    logging.info("Scraping completed and browser closed.")

if __name__ == "__main__":
    main()
