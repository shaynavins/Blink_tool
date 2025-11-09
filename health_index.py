import json
import sys
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

from repo_explorer import deep_scan_repo
from ai_summarizer import analyze_dependencies

load_dotenv()


WEIGHTS = {
    "activity": 40,
    "community": 30,
    "popularity": 30,
}

def parse_date(date_string):
    """Safely parse an ISO 8601 date string."""
    if not date_string:
        return None
    try:
        if date_string.endswith('Z'):
            date_string = date_string[:-1] + '+00:00'
        return datetime.fromisoformat(date_string)
    except (ValueError, TypeError):
        return None

def score_activity(metadata, commits, releases, max_points=WEIGHTS["activity"]):
    """Scores the project's recent activity."""
    score = 0
    report = []
    updated_at = parse_date(metadata.get("updated_at"))
    if updated_at:
        days_since_update = (datetime.now(timezone.utc) - updated_at).days
        
        if days_since_update <= 30:
            score += 25
            report.append(f"[+25] Excellent: Updated {days_since_update} days ago.")
        elif days_since_update <= 90:
            score += 15
            report.append(f"[+15] Good: Updated {days_since_update} days ago.")
        elif days_since_update <= 365:
            score += 5
            report.append(f"[+5] Fair: Updated {days_since_update} days ago.")
        else:
            report.append(f"[+0] Poor: Last update was over a year ago ({days_since_update} days).")
    else:
        report.append("[+0] Could not determine last update.")
    if releases and len(releases) > 0:
        score += 10
        report.append(f"[+10] Good: Has {len(releases)} recent release(s).")
    else:
        report.append("[+0] Poor: No recent releases found.")
    if metadata.get("has_issues"):
        score += 5
        report.append("[+5] Good: Issues are enabled.")
    else:
        report.append("[+0] Neutral: Issues are disabled.")
    return min(score, max_points), report

def score_community(community_profile, metadata, max_points=WEIGHTS["community"]):
    """Scores the project's community documentation."""
    score = 0
    report = []
    if not community_profile:
        report.append("[+0] Note: 'community_profile' data not found.")
        return 0, report
    if community_profile.get("readme"):
        score += 10
        report.append("[+10] Excellent: Has a README file.")
    else:
        report.append("[+0] Poor: Missing a README file.")
    if community_profile.get("license") or metadata.get("license"):
        score += 10
        report.append("[+10] Excellent: Has a LICENSE file.")
    else:
        report.append("[+0] Poor: Missing a LICENSE file.")
    if community_profile.get("contributing"):
        score += 5
        report.append("[+5] Good: Has a CONTRIBUTING.md file.")
    else:
        report.append("[+0] Neutral: Missing a CONTRIBUTING.md file.")
    if community_profile.get("code_of_conduct"):
        score += 5
        report.append("[+5] Good: Has a CODE_OF_CONDUCT.md file.")
    else:
        report.append("[+0] Neutral: Missing a CODE_OF_CONDUCT.md file.")
    return min(score, max_points), report

def score_popularity(metadata, max_points=WEIGHTS["popularity"]):
    """Scores the project's popularity."""
    score = 0
    report = []
    stars = metadata.get("stargazers_count", 0)
    forks = metadata.get("forks_count", 0)
    if stars >= 10000:
        score += 20
        report.append(f"[+20] Elite: {stars} stars.")
    elif stars >= 1000:
        score += 15
        report.append(f"[+15] Excellent: {stars} stars.")
    elif stars >= 100:
        score += 10
        report.append(f"[+10] Good: {stars} stars.")
    elif stars >= 10:
        score += 5
        report.append(f"[+5] Fair: {stars} stars.")
    else:
        report.append(f"[+0] Poor: {stars} stars.")
    if forks >= 5000:
        score += 10
        report.append(f"[+10] Elite: {forks} forks.")
    elif forks >= 500:
        score += 7
        report.append(f"[+7] Excellent: {forks} forks.")
    elif forks >= 50:
        score += 3
        report.append(f"[+3] Good: {forks} forks.")
    else:
        report.append(f"[+0] Poor: {forks} forks.")
    return min(score, max_points), report

def get_grade(score):
    """Assign a letter grade based on the score."""
    if score >= 90: return "A+ (Excellent)"
    if score >= 80: return "A (Great)"
    if score >= 70: return "B (Good)"
    if score >= 60: return "C (Fair)"
    if score >= 50: return "D (Poor)"
    return "F (Very Poor)"

def calculate_health_index(data):
    """Main function to calculate the full score and generate a report."""
    metadata = data.get("metadata", {})
    if not metadata:
        print("Error: 'metadata' key is missing or empty in the JSON file.")
        return

    activity_score, activity_report = score_activity(
        metadata, data.get("commits", []), data.get("releases", []))
    community_score, community_report = score_community(
        data.get("community_profile"), metadata)
    popularity_score, popularity_report = score_popularity(metadata)

    total_score = activity_score + community_score + popularity_score
    grade = get_grade(total_score)
    report_data = {
        "full_name": metadata.get('full_name', 'Unknown Repo'),
        "total_score": total_score,
        "grade": grade,
        "scores": {
            "activity": (activity_score, WEIGHTS['activity'], activity_report),
            "community": (community_score, WEIGHTS['community'], community_report),
            "popularity": (popularity_score, WEIGHTS['popularity'], popularity_report)
        }
    }

    # --- Print Report ---
    print("\n" + "=" * 60)
    print(f"Health Index Report for: {report_data['full_name']}")
    print("=" * 60)
    print(f"\nActivity Score: {activity_score} / {WEIGHTS['activity']}")
    for line in activity_report: print(f"   {line}")
    print(f"\nCommunity Score: {community_score} / {WEIGHTS['community']}")
    for line in community_report: print(f"   {line}")
    print(f"\nPopularity Score: {popularity_score} / {WEIGHTS['popularity']}")
    for line in popularity_report: print(f"   {line}")
    print("\n" + "-" * 60)
    print(f"Total Score: {total_score} / 100")
    print(f"Final Grade: {grade}")
    print("=" * 60)
    
    return report_data


if __name__ == "__main__":
    
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("GITHUB_TOKEN not found in your .env file or environment.")
        print("   Please create a .env file and add: GITHUB_TOKEN=your_token_here")
        sys.exit(1)

    owner = input("Enter Repo Owner: ").strip()
    repo_name = input("Enter the repo name: ").strip()

    if not owner or not repo_name:
        print("Owner and repo name are required.")
        sys.exit(1)

    general_results = deep_scan_repo(owner, repo_name, token)
    from ai_summarizer import summarize_tech_stack_ai

    if not general_results:
        print(f"Failed to scan {owner}/{repo_name}. Exiting.")
        sys.exit(1)


    report_data = calculate_health_index(general_results)
    if not report_data:
         print("Could not calculate health score. Exiting.")
         sys.exit(1)


    ai_summary, dependencies = analyze_dependencies(owner, repo_name, token)
    ai_stack_summary = summarize_tech_stack_ai(general_results.get("contents", []))


    final_report = {
        "health_report": report_data,
        "dependency_report": {
            "ai_summary": ai_summary,
            "dependencies": dependencies
        },
        "tech_stack_summary": ai_stack_summary,
        "raw_data": general_results
    }
    
    filename = f"{owner}_{repo_name}_FINAL_REPORT.json"
    with open(filename, "w") as f:
        json.dump(final_report, f, indent=4)
    print(f"\nComplete analysis saved to {filename}")
    print(f"\nYou can now open 'report_viewer.html' to view this file.")