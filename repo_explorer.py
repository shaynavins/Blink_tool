import requests
import json
import sys
import os 
from dotenv import load_dotenv

GITHUB_API = "https://api.github.com"

def get(url, token):
    """Generic GET helper with authentication and error handling."""
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code} on {url}")
        error_data = response.json()
        print(f"   Message: {error_data.get('message', 'No error message')}")
        
        if "community/profile" in url and response.status_code == 404:
            print("   (This repo may not have a community profile.)")
            return None
        if "contents" in url and response.status_code == 404:
            print("   (Repo appears to be empty or contents are not accessible.)")
            return []
            
        return None

def fetch_repo_metadata(owner, repo, token):
    """Fetch basic repository metadata."""
    print("Fetching metadata...")
    return get(f"{GITHUB_API}/repos/{owner}/{repo}", token)

def fetch_commits(owner, repo, token, limit=5):
    """Fetch the latest commits."""
    print("Fetching commits...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/commits?per_page={limit}", token)
    if data:
        return [{"sha": c["sha"], "message": c["commit"]["message"], "date": c["commit"]["author"]["date"]} for c in data]
    return []

def fetch_contributors(owner, repo, token, limit=5):
    """Fetch contributors (limited)."""
    print("Fetching contributors...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/contributors?per_page={limit}&anon=true", token)
    if data:
        return [{"login": c.get("login", "Anonymous"), "contributions": c.get("contributions")} for c in data]
    return []

def fetch_issues(owner, repo, token, state="open", limit=5):
    """Fetch open issues."""
    print("Fetching issues...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/issues?state={state}&per_page={limit}", token)
    if data:
        issues = [i for i in data if "pull_request" not in i]
        return [{"title": i["title"], "number": i["number"], "user": i["user"]["login"], "created_at": i["created_at"]} for i in issues]
    return []

def fetch_pull_requests(owner, repo, token, state="open", limit=5):
    """Fetch pull requests."""
    print("Fetching pull requests...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/pulls?state={state}&per_page={limit}", token)
    if data:
        return [{"title": p["title"], "number": p["number"], "user": p["user"]["login"], "created_at": p["created_at"]} for p in data]
    return []

def fetch_releases(owner, repo, token, limit=3):
    """Fetch release info."""
    print("Fetching releases...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/releases?per_page={limit}", token)
    if data:
        return [{"name": r["name"], "tag_name": r["tag_name"], "published_at": r["published_at"]} for r in data]
    return []

def fetch_branches(owner, repo, token, limit=5):
    """Fetch branch info."""
    print("Fetching branches...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/branches?per_page={limit}", token)
    if data:
        return [b["name"] for b in data]
    return []

def fetch_community_profile(owner, repo, token):
    """Fetch community health files like README, LICENSE, etc."""
    print("Fetching community profile...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/community/profile", token)
    if data:
        return data.get("files", {})
    return None

def fetch_repo_contents(owner, repo, token):
    """Fetch root-level repo contents to infer structure."""
    print("Fetching repo contents...")
    data = get(f"{GITHUB_API}/repos/{owner}/{repo}/contents", token)
    if data:
        return [{"name": item["name"], "type": item["type"]} for item in data]
    return []

def deep_scan_repo(owner, repo, token):
    """Perform a full repo scan and print organized info."""
    print(f"\n🔍 Scanning repository: {owner}/{repo}")
    print("-" * 60)

    info = {
        "metadata": fetch_repo_metadata(owner, repo, token),
        "commits": fetch_commits(owner, repo, token),
        "contributors": fetch_contributors(owner, repo, token),
        "issues": fetch_issues(owner, repo, token),
        "pull_requests": fetch_pull_requests(owner, repo, token),
        "releases": fetch_releases(owner, repo, token),
        "branches": fetch_branches(owner, repo, token),
        "community_profile": fetch_community_profile(owner, repo, token),
        "contents": fetch_repo_contents(owner, repo, token),
    }

    if not info["metadata"]:
        print(f"\nCRITICAL: Could not fetch main metadata for {owner}/{repo}.")
        return None

    print("\n--- General Scan Complete ---")
    return info
def detect_tech_stack(contents):
    """Use Google Gemini to describe the repo's tech stack in natural language
    based on its file names and structure."""
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GEMINI_API_KEY:
        print("GOOGLE_API_KEY not found. Skipping AI tech stack summary.")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL_ID)
    except Exception as e:
        print(f"Gemini config failed: {e}")
        return None

    file_list = "\n".join([item["name"] for item in contents])

    prompt = f"""
        You are a senior software architect.  
        Analyze this list of files from a GitHub repository and infer what technologies, frameworks, and deployment patterns are used.  
        Then summarize the tech stack in **one short descriptive paragraph** suitable for a dashboard.

        Example:
        Input files:
        requirements.txt, main.py, Dockerfile, .github/workflows/deploy.yml, README.md

        Output:
        "This repository is a Python-based web backend using FastAPI, containerized with Docker, and automated using GitHub Actions for CI/CD."

        Files:
        {file_list}
    """
    try:
        response = model.generate_content(prompt)
        summary = response.text.strip()
        print("AI Tech Stack Summary received.")
        return summary
    except Exception as e:
        print(f"Gemini AI Error (tech stack): {e}")
        return None
        



if __name__ == "__main__":
    """Allows running this script standalone for data gathering."""
    load_dotenv()
    token = os.getenv("GITHUB_TOKEN")

    if not token:
        print("GITHUB_TOKEN not found in your .env file or environment.")
        sys.exit(1)
        
    owner = input("Enter repository owner (username/org): ").strip()
    repo = input("Enter repository name: ").strip()

    if not owner or not repo:
        print("Owner and repo name are required.")
        sys.exit(1)

    results = deep_scan_repo(owner, repo, token)
    
    if results:
        filename = f"{owner}_{repo}_scan.json"
        with open(filename, "w") as f:
            json.dump(results, f, indent=4)
        print(f"\nStandalone scan complete. Results saved to {filename}")