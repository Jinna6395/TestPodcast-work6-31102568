<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1f2S8_qhWUSlGKkyIqvKHqaAMwiCYCCE9

## Run Locally

**Prerequisites:**  Node.js (v18 or higher recommended)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your Gemini API key:**
   - Copy the example environment file:
     ```bash
     cp .env.local.example .env.local
     ```
   - Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Open `.env.local` and replace `your_api_key_here` with your actual API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Run the app:**
   ```bash
   npm run dev
   ```
   
4. **Open your browser:**
   - Navigate to http://localhost:3000
   - Click "Play Podcast" to generate and play Thai language audio
