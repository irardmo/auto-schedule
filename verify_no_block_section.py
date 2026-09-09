import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://localhost:3000")
        await page.wait_for_selector("#tab-manage")

        # Click Manage Data tab
        await page.click("#tab-manage")
        await page.wait_for_timeout(500)

        # Click Subjects tab inside Manage Data
        await page.click("button[onclick*=\"switchManageSubTab('subjects')\"]")
        await page.wait_for_timeout(500)

        # Take screenshot of Manage Subjects view
        await page.screenshot(path="/home/jules/verification/subjects_no_block.png", full_page=True)

        # Check that subject-block element does not exist
        block_input = await page.query_selector("#subject-block")
        print("Subject block input exists:", block_input is not None)

        await browser.close()

asyncio.run(run())
