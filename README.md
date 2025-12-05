# BioChemHub - Biochemistry Quiz & Tools

A modern, interactive educational platform for biochemistry students. Features topic-wise MCQs, research news feed, and essential lab calculators.

## Features
-   **Interactive Quizzes**: "One Question at a Time" mode with instant feedback and scoring.
-   **Lab Tools**: Calculators for Michaelis-Menten kinetics, pH, Kw, Gibbs Free Energy, and Unit Conversions.
-   **Research Feed**: Fetches latest biochemistry updates from Google Sheets.
-   **Responsive Design**: Glassmorphism UI that works on mobile and desktop.

## How to Run Locally
1.  Ensure you have Python installed.
2.  Open a terminal in this folder.
3.  Run the server script:
    ```bash
    python3 server.py
    ```
4.  The website will open automatically in your browser.

## How to Deploy (Make it Live)
The easiest way to host this website for free is using **GitHub Pages**.

### Step 1: Create a GitHub Repository
1.  Log in to [GitHub](https://github.com).
2.  Click the **+** icon in the top-right and select **New repository**.
3.  Name it `biochem-quiz` (or similar).
4.  Make sure it is **Public**.
5.  Click **Create repository**.

### Step 2: Upload Your Code
You can use the command line or the web interface.

**Option A: Web Interface (Easiest)**
1.  In your new repository, click **uploading an existing file**.
2.  Drag and drop all the files from your folder (`index.html`, `style.css`, `script.js`, `README.md`, etc.) into the browser window.
3.  Click **Commit changes**.

**Option B: Command Line (Git)**
1.  Initialize git in your folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Link to your remote repository (replace `YOUR_USERNAME` with your actual username):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/biochem-quiz.git
    git branch -M main
    git push -u origin main
    ```

### Step 3: Enable GitHub Pages
1.  Go to your repository **Settings** tab.
2.  Click on **Pages** in the left sidebar.
3.  Under **Build and deployment**, select **Source** as `Deploy from a branch`.
4.  Under **Branch**, select `main` and folder `/ (root)`.
5.  Click **Save**.

Wait a minute or two, and GitHub will give you a live URL (e.g., `https://your-username.github.io/biochem-quiz/`). Your site is now online!