# GitHub Repository Analyzer - Frontend

A modern, n8n-inspired UI for analyzing GitHub repositories with AI-powered insights.

## Features

-  **Modern UI** - Clean, professional interface inspired by n8n
-  **Health Scoring** - Comprehensive repository health analysis
-  **Dependency Analysis** - Check for outdated packages
-  **AI Insights** - Google Gemini-powered summaries
- s **Real-time Analysis** - Instant feedback on repository quality

## Tech Stack

**Frontend:**
- React 19
- Vite
- CSS3 with custom animations

**Backend:**
- Python 3.x
- Flask API
- GitHub API
- Google Gemini AI

## Setup Instructions

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
GITHUB_TOKEN=your_github_personal_access_token
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 2. Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install flask flask-cors requests python-dotenv google-generativeai packaging
```

### 3. Install Frontend Dependencies

```bash
cd ui/ai-analyzer
npm install
```

## Running the Application

### Start the Backend API

In the root directory:

```bash
python api.py
```

The API will start on `http://localhost:5000`

### Start the Frontend

In a new terminal, from `ui/ai-analyzer`:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Open your browser** to `http://localhost:5173`

2. **Enter repository details:**
   - Owner/Organization (e.g., `facebook`)
   - Repository name (e.g., `react`)
   - Your GitHub Personal Access Token

3. **Click "Analyze Repository"**

4. **View Results:**
   - Overview tab: See all scores at a glance
   - Activity tab: Commit and update frequency
   - Community tab: Documentation and guidelines
   - Dependencies tab: Package versions and AI recommendations

## API Endpoints

### POST /analyze
Analyzes a GitHub repository

**Request:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "token": "your_github_token"
}
```

**Response:**
```json
{
  "health_report": {
    "full_name": "facebook/react",
    "total_score": 95,
    "grade": "A+ (Excellent)",
    "scores": {
      "activity": [40, 40, [...]],
      "community": [30, 30, [...]],
      "popularity": [25, 30, [...]]
    }
  },
  "dependency_report": {
    "ai_summary": "...",
    "dependencies": {...}
  }
}
```

### GET /health
Health check endpoint

## Getting GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`
4. Copy the token

## Getting Google Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and add to `.env`

## Project Structure

```
.
├── api.py                      # Flask backend API
├── ai_summarizer.py            # Dependency analysis with AI
├── health_index.py             # Health score calculator
├── repo_explorer.py            # GitHub API wrapper
├── ui/
│   └── ai-analyzer/
│       ├── src/
│       │   ├── App.jsx         # Main React component
│       │   ├── App.css         # Styles
│       │   └── main.jsx        # Entry point
│       └── package.json
└── .env                        # Environment variables

```

## Features by Tab

### Overview Tab
- Combined health score (0-100)
- Letter grade (A+ to F)
- Breakdown of all metrics

### Activity Tab
- Last update time
- Recent releases
- Issue tracking status

### Community Tab
- README presence
- License information
- Contributing guidelines
- Code of conduct

### Dependencies Tab
- AI-generated summary
- List of all packages
- Version information
- Outdated package warnings

## Troubleshooting

**CORS Errors:**
- Make sure the Flask API is running
- Check that `flask-cors` is installed

**API Not Responding:**
- Verify `.env` file exists with valid tokens
- Check Python dependencies are installed
- Ensure port 5000 is not in use

**No AI Summary:**
- Verify `GOOGLE_API_KEY` is set in `.env`
- Check Google Gemini API quota

## Development

To modify the frontend:
```bash
cd ui/ai-analyzer
npm run dev
```

Changes will hot-reload automatically.

To modify the backend:
- Edit Python files
- Restart `python api.py`

## License

MIT License - feel free to use for your projects!

## Credits

- UI Design inspired by [n8n.io](https://n8n.io)
- Built with React, Vite, and Flask
- Powered by GitHub API and Google Gemini AI
