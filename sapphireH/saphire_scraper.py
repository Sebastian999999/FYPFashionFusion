import csv
import random
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent  # Randomizes User-Agent

def setup_driver():
    """Initializes and returns a Chrome WebDriver with anti-bot settings."""
    chrome_options = Options()

    # Uncomment the line below to run the browser headlessly
    # chrome_options.add_argument("--headless")
    
    # Use a fake user-agent to mimic different browsers
    user_agent = UserAgent().random
    chrome_options.add_argument(f"user-agent={user_agent}")

    # Add arguments to make the browser more like a real user's browser
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Initialize the WebDriver with the above options
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.implicitly_wait(10)  # Implicit wait to handle dynamic page elements
    return driver

def extract_product_info(url, driver):
    """Extracts product information from a specific URL."""
    driver.get(url)
    product_info = {}

    try:
        title_element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'h1.t4s-product__title')))
        product_info['title'] = title_element.text
    except Exception as e:
        print(f"Error extracting title: {e}")
        product_info['title'] = None

    try:
        price_element = driver.find_element(By.CSS_SELECTOR, '.t4s-product-price')
        product_info['price'] = price_element.text
    except Exception as e:
        print(f"Error extracting price: {e}")
        product_info['price'] = None

    try:
        image_element = driver.find_element(By.CSS_SELECTOR, 'img[data-master]')
        product_info['image_link'] = image_element.get_attribute('data-master')
    except Exception as e:
        print(f"Error extracting image link: {e}")
        product_info['image_link'] = None

    try:
        description_element = driver.find_element(By.CSS_SELECTOR, '.sample')
        product_info['description'] = description_element.text
    except Exception as e:
        print(f"Error extracting description: {e}")
        product_info['description'] = None

    return product_info

def random_delay():
    """Introduce a random delay to simulate human-like browsing."""
    delay = random.uniform(2, 5)  # Random delay between 2 to 5 seconds
    time.sleep(delay)

# Setup WebDriver
driver = setup_driver()

# CSV and processed links setup
csv_file = 'product_data.csv'
csv_columns = ['title', 'price', 'image_link', 'description']

# Check if the CSV file exists to write the header only once
try:
    with open(csv_file, 'x', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=csv_columns)
        writer.writeheader()
except FileExistsError:
    pass  # File already exists, so skip writing the header

# Read the list of already processed links
processed_links = set()
try:
    with open('processed_links.txt', 'r') as file:
        processed_links = set(line.strip() for line in file.readlines())
except FileNotFoundError:
    pass  # If the file doesn't exist, it means no links have been processed yet

# Read the URLs from the unique links file
with open('unique_links.txt', 'r') as file:
    urls = file.readlines()

# Loop through each URL and scrape data
for url in urls:
    url = url.strip()
    if url and url not in processed_links:
        print(f'Extracting from: {url}')
        product_info = extract_product_info(url, driver)
        print(product_info)

        # Write the data to the CSV file in real-time
        with open(csv_file, 'a', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=csv_columns)
            writer.writerow(product_info)

        # Mark the link as processed by adding it to the processed_links file
        with open('processed_links.txt', 'a') as file:
            file.write(url + '\n')

        random_delay()  # Add a random delay to avoid detection

# Close the WebDriver
driver.quit()
print(f"Data saved to {csv_file}")
