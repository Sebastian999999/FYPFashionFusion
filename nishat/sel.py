import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

# Path to the chromedriver
webdriver_service = Service('./chromedriver.exe')

# Create a new instance of Chrome WebDriver
driver = webdriver.Chrome(service=webdriver_service)

# Read the URLs from the 'links.txt' file
with open('links.txt', 'r') as f:
    all_links = f.readlines()

# Remove any extra whitespace characters (like newlines)
all_links = [url.strip() for url in all_links]

# List to store dictionaries for each product
data = []

# Loop through each link and visit them
for idx, url in enumerate(all_links):
    driver.get(url)
    
    # Wait for the page to load
    time.sleep(2)
    
    try:
        # Extract price and description
        price = driver.find_element(By.CSS_SELECTOR, ".t4s-product-price").text
        description = driver.find_element(By.CSS_SELECTOR, ".t4s-rte.t4s-tab-content").text
        
        # Store the data in a dictionary
        data.append({
            "money": price,
            "description": description,
            "url": url
        })
        
        # Print progress
        print(f"Processed link {idx + 1}/{len(all_links)}: {url}")
    
    except Exception as e:
        print(f"Error on page {url}: {e}")

# Close the browser after completion
driver.quit()

# Save the data to a CSV file
csv_file = "nishat_women.csv"
with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=["money", "description", "url"])
    writer.writeheader()
    writer.writerows(data)

# Print the final result
print(f"Data saved to {csv_file}")
