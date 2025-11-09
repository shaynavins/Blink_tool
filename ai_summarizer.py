import requests
import json
import re
import base64
import os
from packaging import version
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

GITHUB_API = "https://api.github.com"
GEMINI_MODEL_ID = "gemini-2.5-flash"

def _get(url, token):
    """Local GET helper for this module."""
    headers = {"Authorization": f"token {token}"}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"{r.status_code} → {url}")
        return None

def _fetch_file_content(owner, repo, path, token):
    """Fetch dependency file (like requirements.txt) from GitHub repo."""
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    data = _get(url, token)
    if not data or "content" not in data:
        return None
    return base64.b64decode(data["content"]).decode("utf-8")

def _parse_requirements(content):
    deps = {}
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        # Remove version constraints
        match = re.match(r"^[a-zA-Z0-9_\-]+", line)
        if match:
            pkg = match.group(0)
            # Try to find a version
            ver_match = re.search(r"==([0-9\.]+)", line)
            if ver_match:
                deps[pkg] = ver_match.group(1)
            else:
                deps[pkg] = "any"
    return deps

def _parse_package_json(content):
    try:
        data = json.loads(content)
        deps = data.get("dependencies", {})
        deps.update(data.get("devDependencies", {}))
        # Clean versions: remove ^, ~, etc.
        cleaned_deps = {}
        for pkg, ver in deps.items():
            ver_match = re.search(r"[0-9\.]+", ver)
            cleaned_deps[pkg] = ver_match.group(0) if ver_match else "any"
        return cleaned_deps
    except json.JSONDecodeError:
        print("Could not parse package.json, file may be malformed.")
        return {}

def _parse_pom_xml(content):
    deps = re.findall(
        r"<dependency>.*?<artifactId>(.*?)</artifactId>.*?<version>(.*?)</version>.*?</dependency>",
        content,
        re.DOTALL
    )
    return {a: v for a, v in deps}

def _check_latest_pypi(pkg_name):
    url = f"https://pypi.org/pypi/{pkg_name}/json"
    r = requests.get(url)
    if r.status_code == 200:
        return r.json()["info"]["version"]
    return None

def _check_latest_npm(pkg_name):
    url = f"https://registry.npmjs.org/{pkg_name}/latest"
    r = requests.get(url)
    if r.status_code == 200:
        return r.json()["version"]
    return None


def _summarize_dependencies_gemini(deps):
    """Summarize dependency health using Google Gemini API."""
    
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GEMINI_API_KEY:
        print("GOOGLE_API_KEY not found in .env. Skipping AI summary.")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to configure Gemini: {e}")
        return None

    dep_list = "\n".join(
        f"- {pkg}: {info['current_version']} (latest: {info.get('latest_version', 'N/A')}) "
        f"{'Outdated' if info['outdated'] else 'Up-to-date'}"
        for pkg, info in deps.items()
    )

    prompt = f"""
You are a professional software dependency auditor.
Analyze this dependency list from a GitHub project and provide:
1.  A one-sentence summary of the key frameworks and their purpose (e.g., "This is a Python web app using Flask and SQLAlchemy...").
2.  A bulleted list of the most critical outdated dependencies.
3.  A final, short maintenance recommendation.

Dependencies:
{dep_list}
"""

    print("\nSummarizing dependencies with Google Gemini...")
    try:
        model = genai.GenerativeModel(GEMINI_MODEL_ID)
        response = model.generate_content(prompt)
        summary = response.text

        print("AI Dependency Summary received.")
        return summary

    except Exception as e:
        print(f" Gemini API Error: {e}")
        return None

def analyze_dependencies(owner, repo, token):
    """
    Public function to run the full dependency analysis.
    This is called by health_index.py.
    """
    print(f"\nAnalyzing dependencies for {owner}/{repo}")

    files_to_check = {
        "requirements.txt": (_parse_requirements, _check_latest_pypi),
        "package.json": (_parse_package_json, _check_latest_npm),
        "pom.xml": (_parse_pom_xml, None), # Maven check is complex, skip for now
    }
    
    found_file = None
    content = None
    parser = None
    latest_fetcher = None

    for f, (parser_func, fetcher_func) in files_to_check.items():
        content = _fetch_file_content(owner, repo, f, token)
        if content:
            found_file = f
            parser = parser_func
            latest_fetcher = fetcher_func
            print(f"Found and parsing {f}...")
            break

    if not found_file:
        print("   (No supported dependency file found. Skipping dep analysis.)")
        return None, None

    deps = parser(content)
    if not deps:
        print("   (Could not parse any dependencies from file.)")
        return None, None
        
    print(f"   ...found {len(deps)} dependencies.")
    results = {}

    for pkg, ver in deps.items():
        latest = None
        outdated = False
        if latest_fetcher and ver != "any":
            try:
                latest = latest_fetcher(pkg)
                if latest and version.parse(latest) > version.parse(ver):
                    outdated = True
            except Exception:
                latest = "N/A" # Handle parsing errors

        results[pkg] = {
            "current_version": ver,
            "latest_version": latest,
            "outdated": outdated
        }

    outdated_count = sum(1 for d in results.values() if d["outdated"])
    print(f"   ...{outdated_count} dependencies are outdated.")

    ai_summary = _summarize_dependencies_gemini(results)

    filename = f"{owner}_{repo}_dependencies.json"
    with open(filename, "w") as f:
        json.dump({"summary": ai_summary, "dependencies": results}, f, indent=4)
    print(f"Dependency analysis saved to {filename}")

    return ai_summary, results

def summarize_tech_stack_ai(contents):
    import google.generativeai as genai
    import os

    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GEMINI_API_KEY:
        print("❌ GOOGLE_API_KEY not found. Skipping AI tech stack summary.")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"❌ Gemini config failed: {e}")
        return None

    file_list = "\n".join([item["name"] for item in contents])
    if not file_list:
        print("❌ No files found in contents for AI analysis.")
        return None

    prompt = f"""
        You are a senior software architect.
        Analyze this list of files from a GitHub repository and infer what technologies, frameworks, and deployment patterns are used.
        Summarize the tech stack in a short, clear paragraph.

        Files:
        {file_list}
        """

    try:
        print("🧠 Calling Gemini for tech stack summary...")
        response = model.generate_content(prompt)
        print("✅ AI Tech Stack Summary received.")
        print(f"🔹 Gemini Output Preview:\n{response.text[:200]}...")
        return response.text.strip()
    except Exception as e:
        print(f"❌ Gemini AI Error: {e}")
        return None
