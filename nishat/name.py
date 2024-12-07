import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import json
import os

# Path to the chromedriver
webdriver_service = Service('./chromedriver.exe')

# Chrome options to ignore SSL certificate errors
chrome_options = Options()
chrome_options.add_argument('--ignore-certificate-errors')
chrome_options.add_argument('--ignore-ssl-errors')

# Create a new instance of Chrome WebDriver with SSL certificate error disabled
driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

# File paths
csv_file = "nishat_women.csv"
processed_file = "processed_links.txt"
completed_file = "completed_links.txt"

# Load processed URLs and completed URLs
processed_links = set()
if os.path.exists(processed_file):
    with open(processed_file, 'r') as f:
        processed_links = set(f.read().splitlines())

completed_links = set()
if os.path.exists(completed_file):
    with open(completed_file, 'r') as f:
        completed_links = set(f.read().splitlines())

# Create a list to track new completed links
new_completed_links = []

# Read the CSV file
if not os.path.exists(csv_file):
    print(f"CSV file {csv_file} does not exist.")
    driver.quit()
    exit()

with open(csv_file, 'r', newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    rows = list(reader)

# Create a dictionary to quickly find rows by URL
url_to_row = {row['url']: row for row in rows}

# Process links
for url in processed_links:
    if url in completed_links:
        print(f"Skipping already completed URL: {url}")
        continue

    if url in url_to_row:
        try:
            print(f"Fetching product name for {url}...")
            driver.get(url)
            time.sleep(2)  # Wait for the page to load

            # Extract the JSON containing product information
            try:
                script_element = driver.find_element(By.ID, 'em_product_selected_or_first_available_variant')
                json_data = json.loads(script_element.get_attribute('innerHTML'))

                # Fetch product name from the JSON data
                product_name = json_data.get('name', 'No product name found').strip()
                url_to_row[url]['title'] = product_name
                print(f"Product name fetched: {product_name}")

            except Exception as e:
                print(f"Error extracting product name: {e}")
                continue

            # Add the URL to new completed links list
            new_completed_links.append(url)

            # Write the updated CSV row by row to ensure real-time update
            with open(csv_file, 'w', newline='', encoding='utf-8') as file:
                fieldnames = ["title", "money", "description", "url", "images"]
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                writer.writeheader()  # Write the header
                writer.writerows(url_to_row.values())  # Write the updated data

            # Immediately update the completed links file
            with open(completed_file, 'a') as f:
                f.write(f"{url}\n")

        except Exception as e:
            print(f"Error processing URL {url}: {e}")

# Close the browser after completion
driver.quit()

print("CSV updated with product titles, and completed links saved.")
