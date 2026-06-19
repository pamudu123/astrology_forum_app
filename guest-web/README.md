# Swasthi Life Guest Web

This is the React + Vite + TypeScript application for public guest submissions of Hadahan and Porondam forms.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the API URL environment variable and run the development server:
   ```powershell
   # PowerShell
   $env:VITE_API_URL="http://localhost:8000"
   npm run dev
   ```

   ```bash
   # Bash
   VITE_API_URL="http://localhost:8000" npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## Production Build

To build the static assets for production:
```powershell
$env:VITE_API_URL="https://your-production-api.com"
npm run build
```
This generates optimized static files in the `dist/` directory.

## GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages using a GitHub Actions workflow when files in `guest-web` are pushed to the `main` branch.

### Prerequisites

To make the deployment work:
1. **GitHub Actions permissions**:
   * In your repository settings on GitHub, go to **Settings** > **Pages**.
   * Set **Build and deployment** > **Source** to **GitHub Actions**.
   * Under **Settings** > **Actions** > **General** > **Workflow permissions**, ensure **Read and write permissions** is selected.
2. **Environment Variable**:
   * Under **Settings** > **Secrets and variables** > **Variables**, add a new variable named `VITE_API_URL` and set its value to your live FastAPI backend URL (e.g. `https://api.yourdomain.com`).
