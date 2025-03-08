const puppeteer = require("puppeteer");
const credentials = require("./credentials.json");
const readline = require("readline");
const { timeout } = require("puppeteer");

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

// Custom waitForXPath function since page.waitForXPath isn't available.
// Custom waitForXPath helper using evaluateHandle instead of page.$x
async function waitForXPath(page, xpath, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    // Evaluate the XPath in the page context.
    const elementHandle = await page.evaluateHandle((xp) => {
      const result = document.evaluate(
        xp,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    }, xpath);
    if (elementHandle.asElement()) {
      return [elementHandle];
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Timeout waiting for XPath: ${xpath}`);
}

(async () => {
  // Launch the browser; set headless: false to see the actions in a visible browser window.
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  // Log in to GitHub
  await page.goto("https://github.com/login", { waitUntil: "networkidle0" });
  await page.type("#login_field", credentials.username, { delay: 100 });
  await page.type("#password", credentials.password, { delay: 100 });
  await page.click('input[name="commit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  try {
    await page.waitForSelector('input[name="otp"]', { timeout: 10000 });
    const twoFactorCode = await askQuestion("Enter your 2FA code: ");
    await page.type('input[name="otp"]', twoFactorCode, { delay: 100 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log("2FA complete, logged in successfully.");
  } catch (error) {
    console.log("No 2FA prompt detected or timeout exceeded.");
  }

  // List of repositories to star
  const repos = ["cheeriojs/cheerio", "axios/axios", "puppeteer/puppeteer"];

  // Star each repository if not already starred.
  for (const repo of repos) {
    await page.goto(`https://github.com/${repo}`, {
      waitUntil: "networkidle0",
    });

    // Evaluate whether the button inside the "unstarred" container is visible
    const isUnstarredButtonVisible = await page.evaluate(() => {
      console.log("hlkjslkfj");
      const btn = document.querySelector('div.unstarred button');
      console.log("dumb fuck");
      if (!btn) return false;
      const style = window.getComputedStyle(btn);
      console.log(style.display);
      return style.display !== 'none';
    });

    console.log(isUnstarredButtonVisible);

    if (isUnstarredButtonVisible) {
      const starButton = await page.$('div.unstarred button');
      await starButton.click();
      console.log("Clicked the visible star button (repository was not starred).");
    } else {
      console.log("Repository is already starred or the star button is hidden.");
    }



  } // End of repository starring loop

  // Create a new starred repositories list named "Node Libraries".
  // Navigate to your starred repositories page.
  await page.goto(`https://github.com/${credentials.username}?tab=stars`, {
    waitUntil: "networkidle0",
  });

  // Click the "Create list" summary button to open the modal.
  // Using XPath since we need to match the text "Create list".
  const createListXPath = '//summary[contains(., "Create list")]';
  const createListElements = await waitForXPath(page, createListXPath, 5000);
  const createListButton = createListElements[0];
  if (createListButton) {
    await createListButton.click();
    console.log("Clicked the Create list summary button.");
  } else {
    console.error("Create list button not found.");
  }

  // Wait for the "Create list" modal to appear.
  await page.waitForSelector('details-dialog[aria-label="Create list"]', {
    timeout: 5000,
  });
  console.log("Create list modal detected.");

  // Type the list name into the input field within the modal.
  await page.type(
    'details-dialog[aria-label="Create list"] input[name="user_list[name]"]',
    "Node Libraries",
    { delay: 100 }
  );

  // Optionally, type a description for the list.
  await page.type(
    'details-dialog[aria-label="Create list"] textarea[name="user_list[description]"]',
    "A list for Node Libraries",
    { delay: 100 }
  );

  // Wait for the Create button to be enabled (initially disabled until valid input is entered).
  await page.waitForSelector(
    'details-dialog[aria-label="Create list"] button[type="submit"]:not([disabled])',
    { timeout: 5000 }
  );

  // Click the Create button to submit the form.
  await page.click(
    'details-dialog[aria-label="Create list"] button[type="submit"]',
  );
  console.log("Clicked the Create list button.");

  await new Promise(resolve => setTimeout(resolve, 1000)); // Waits for 1 seconds

  // Add each starred repository to the "Node Libraries" list.
  // This assumes each repository page has an "Add to list" button.
  for (const repo of repos) {
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36");
    await page.goto(`https://github.com/${repo}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000 // 30 seconds
    });
    // Wait for the "Add to list" button to appear (update the selector as needed).
    await page.waitForSelector("details.details-reset.details-overlay.BtnGroup-parent.js-user-list-menu.d-inline-block.position-relative");
    await page.click("details.details-reset.details-overlay.BtnGroup-parent.js-user-list-menu.d-inline-block.position-relative");

    // Wait for the dropdown containing available lists to appear.
    await page.waitForSelector(`div.SelectMenu-modal`);

    await page.waitForSelector(`div[role="list"]`);
    // Select the "Node Libraries" list from the dropdown.
    await page.evaluate(() => {
      // Select all list item elements (the checkboxes) inside the container.
      const listItems = document.querySelectorAll('div[role="list"] .form-checkbox');
      for (const item of listItems) {
        // This console.log runs in the browser context; to see it in Node, add a page.on('console') listener.
        const textElement = item.querySelector('.Truncate-text');
        if (textElement && textElement.textContent.trim() === "Node Libraries") {
          // Click the checkbox inside this list item.
          const checkbox = item.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.click();
          }
          break;
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000)); // Waits for 1 seconds

    console.log(`Added ${repo} to "Node Libraries" list.`);
  }

  console.log("Script execution completed.");
  await browser.close();
})();
