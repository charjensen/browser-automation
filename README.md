# GitHub Browser Automation

This project automates a series of actions on **GitHub** using **Puppeteer**. The script performs the following tasks:

**Login to GitHub** using credentials stored in a local `credentials.json` file.  
**Star a list of repositories** if they are not already starred.  
**Create a starred list** named **"Node Libraries"** to organize your starred repositories.  
**Add starred repositories** to the "Node Libraries" list. 

---

## 🚀 Setup Instructions

### 1. **Clone the Repository or Download the Files**

git clone https://github.com/your-username/your-repo.git
2. Initialize the Node Project
Open your terminal in the project directory and run:

npm init -y
3. Install Puppeteer

npm install puppeteer
4. Create credentials.json
Create a credentials.json file in the root directory with the following structure:

{
  "username": "YOUR_GITHUB_USERNAME",
  "password": "YOUR_GITHUB_PASSWORD"
}
⚠️ Important: Do not commit this file to any public repository as it contains sensitive login information.

How It Works
1. Logging In
The script launches a non-headless browser and navigates to GitHub's login page.
It fills in your username and password from credentials.json and logs you in.
If a 2FA prompt appears, you'll be asked to enter the OTP via the terminal.
2. Starring Repositories
It visits each repository URL in a predefined list.
If the repository is not already starred, it clicks the correct (visible) star button.
3. Creating a Starred List
The script navigates to your GitHub stars page.
It clicks the "Create list" button to open the modal.
It fills in the list name ("Node Libraries") and description.
Once the "Create" button is enabled, the script clicks it.
4. Adding Repositories to the List
For each starred repository:
Opens the repository page.
Clicks the "Add to list" button.
Searches through the list items.
Selects and clicks the checkbox for "Node Libraries."

Usage
To run the script:
node app.js
The browser window will open, and the script will proceed through the login, starring, and list creation steps automatically.
Watch the terminal for prompts and log messages.

Troubleshooting & Notes
Two-Factor Authentication (2FA):
If your GitHub account uses 2FA, you'll be prompted to enter the code in your terminal.

Element Selectors & UI Changes:
GitHub's UI may change over time. If the script stops working, verify that the CSS selectors (for the star buttons, create list modal, and list menu) still match the current GitHub UI.

Delays & Timeouts:
The script includes delays and timeout waits to ensure the page has loaded before interacting with elements. You might need to adjust these values based on your network speed or system performance.

Project Structure
├── app.js                # Main Puppeteer script for automation
├── credentials.json      # GitHub credentials (do not commit)
├── package.json          # Node project configuration
└── README.md             # Project documentation

License
This project is provided for educational purposes.
Feel free to modify and extend the code to suit your needs.
