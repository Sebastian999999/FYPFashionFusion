import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import json
import os
import requests
from webdriver_manager.chrome import ChromeDriverManager

# Path to the chromedriver
webdriver_service = Service(ChromeDriverManager().install())

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
image_dir = 'product_images'

# Ensure the directory for images exists
if not os.path.exists(image_dir):
    os.makedirs(image_dir)

# Read the URLs from the 'links.txt' file
with open('links.txt', 'r') as f:
    all_links = [url.strip() for url in f.readlines()]

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

# Function to download images
def download_image(image_url, file_name):
    try:
        response = requests.get(image_url)
        response.raise_for_status()  # Check if the request was successful
        with open(file_name, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded image: {file_name}")
    except Exception as e:
        print(f"Error downloading image {file_name}: {e}")

# Function to process links
def process_links(link_batch, batch_number):
    with open(csv_file, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=["money", "description", "url", "images", "title"])
        
        # Write the header only once (if the file is empty)
        if batch_number == 0 and file.tell() == 0:
            writer.writeheader()

        for idx, url in enumerate(link_batch):
            if url in processed_links:
                print(f"Skipping already processed URL: {url}")
                continue

            try:
                print(f"Processing {url} (Batch {batch_number + 1}) ...")
                driver.get(url)
                time.sleep(2)  # Wait for the page to load

                # Extract price, description, and product name from JSON data
                price = driver.find_element(By.CSS_SELECTOR, ".t4s-product-price").text
                description = driver.find_element(By.CSS_SELECTOR, ".t4s-rte.t4s-tab-content").text
                script_element = driver.find_element(By.ID, 'em_product_selected_or_first_available_variant')
                json_data = json.loads(script_element.get_attribute('innerHTML'))
                product_name = json_data.get('name', 'No product name found').strip()

                # Extract image URLs
                image_elements = driver.find_elements(By.CSS_SELECTOR, 'meta[property="og:image"]')
                image_urls = [img.get_attribute('content') for img in image_elements]

                # Download images and save file names
                image_files = []
                for i, image_url in enumerate(image_urls):
                    image_name = f"image_{batch_number + 1}_{idx + 1}_{i + 1}.jpg"
                    download_image(image_url, os.path.join(image_dir, image_name))
                    image_files.append(image_name)

                # Store the data
                row = {
                    "money": price,
                    "description": description,
                    "url": url,
                    "images": ", ".join(image_files),
                    "title": product_name
                }

                # Write the row to the CSV file
                writer.writerow(row)
                print(f"Data saved for {url} (Batch {batch_number + 1})")

                # Mark URL as processed
                with open(processed_file, 'a') as f:
                    f.write(url + '\n')
                processed_links.add(url)

            except Exception as e:
                print(f"Error processing page {url}: {e}")
                continue

# Number of links to process per batch
BATCH_SIZE = 1000
total_batches = (len(all_links) + BATCH_SIZE - 1) // BATCH_SIZE  # Calculate number of batches

# Process each batch
for batch_num in range(total_batches):
    start_index = batch_num * BATCH_SIZE
    end_index = min((batch_num + 1) * BATCH_SIZE, len(all_links))
    link_batch = all_links[start_index:end_index]

    # Process the batch of links
    process_links(link_batch, batch_num)

    # Add a delay between batches to avoid being blocked (e.g., 10 minutes)
    if batch_num < total_batches - 1:
        print(f"Batch {batch_num + 1} completed. Waiting for 10 minutes before processing next batch...")
        time.sleep(600)  # Wait for 10 minutes

# Close the browser after completion
driver.quit()

print(f"All data saved to {csv_file}")
