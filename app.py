from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

from dotenv import load_dotenv
from repo_explorer import deep_scan_repo
from health_index import calculate_health_index
from ai_summarizer import analyze_dependencies, summarize_tech_stack_ai
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}}, supports_credentials=True)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/analyze', methods=['POST'])
def analyze_repo():
    data = request.get_json()
    owner = data.get('owner')
    repo = data.get('repo')
    token = data.get('token')

    if not owner or not repo or not token:
        return jsonify({"error": "Missing required parameters"}), 400

    print(f"Analyzing {owner}/{repo}...")

    general_results = deep_scan_repo(owner, repo, token)
    if not general_results:
        return jsonify({"error": "Repository scan failed"}), 500

    report_data = calculate_health_index(general_results)
    ai_summary, dependencies = analyze_dependencies(owner, repo, token)
    ai_stack_summary = summarize_tech_stack_ai(general_results.get("contents", []))

    print("All analysis complete. Returning JSON.")

    return jsonify({
        "health_report": report_data,
        "dependency_report": {
            "ai_summary": ai_summary,
            "dependencies": dependencies
        },
        "tech_stack_summary": ai_stack_summary,
        "raw_data": general_results
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
