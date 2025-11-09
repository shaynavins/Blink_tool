from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

from repo_explorer import deep_scan_repo
from health_index import calculate_health_index
from ai_summarizer import analyze_dependencies

load_dotenv()

app = Flask(__name__)
CORS(app)  

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    API endpoint to analyze a GitHub repository.
    Expects JSON: { "owner": "...", "repo": "...", "token": "..." }
    """
    try:
        data = request.json
        owner = data.get('owner')
        repo = data.get('repo')
        token = data.get('token')
        
        if not owner or not repo or not token:
            return jsonify({'error': 'Missing required fields: owner, repo, token'}), 400
        
        
        print(f"Scanning {owner}/{repo}...")
        general_results = deep_scan_repo(owner, repo, token)
        if not general_results:
            return jsonify({'error': 'Failed to scan repository'}), 500
        
        
        print("Calculating health index...")
        health_report = calculate_health_index(general_results)
        if not health_report:
            return jsonify({'error': 'Failed to calculate health index'}), 500
        
        
        print("Analyzing dependencies...")
        ai_summary, dependencies = analyze_dependencies(owner, repo, token)
        
        
        response = {
            'health_report': health_report,
            'dependency_report': {
                'ai_summary': ai_summary,
                'dependencies': dependencies
            },
            'raw_data': general_results
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    print("GitHub Analyzer API starting...")
    print("Make sure GOOGLE_API_KEY is set in your .env file for AI summaries")
    app.run(debug=True, port=5000)
