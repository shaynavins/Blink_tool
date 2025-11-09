import { useState } from 'react'
import './App.css'

function App() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');

  const handleChat = async () => {
    if (!question) return;
    const res = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        repo_data: results.raw_data
      })
    });
    const data = await res.json();
    setChatAnswer(data.answer || data.error);
  };

  const analyzeRepo = async () => {
    if (!owner || !repo || !githubToken) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call your Python backend API
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          token: githubToken
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return '#4ade80'
    if (grade?.startsWith('B')) return '#60a5fa'
    if (grade?.startsWith('C')) return '#fbbf24'
    if (grade?.startsWith('D')) return '#fb923c'
    return '#ef4444'
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-text">GitHub Analyzer</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#docs">Docs</a>
          </div>
          <div className="nav-actions">
            <button className="btn-secondary" onClick={() => {
              setResults(null)
              setOwner('')
              setRepo('')
            }}>
              Reset
            </button>
          </div>
        </div>
      </nav>

      {!results ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content-analyzer">
              <h1 className="hero-title">
                AI-Powered GitHub
                <br />
                <span className="gradient-text">Repository Analysis</span>
              </h1>
              <p className="hero-subtitle">
                Analyze any GitHub repository's health, dependencies, and community metrics.
                <br />
                Get instant insights powered by Google Gemini AI.
              </p>

              {/* Analysis Form */}
              <div className="analysis-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Owner/Organization (e.g., facebook)"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Repository name (e.g., react)"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="input-field"
                  />
                </div>
                <input
                  type="password"
                  placeholder="GitHub Personal Access Token"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="input-field"
                />
                
                {error && <div className="error-message">{error}</div>}
                
                <button 
                  className="btn-analyze" 
                  onClick={analyzeRepo}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      
                      Analyze Repository
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="repo-illustration">
                <svg viewBox="0 0 200 200" className="illustration-svg">
                  <defs>
                    <linearGradient id="repo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.8 }} />
                      <stop offset="50%" style={{ stopColor: '#4ecdc4', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#45b7d1', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="url(#repo-gradient)" className="pulse-circle" />
                  <text x="100" y="110" textAnchor="middle" fontSize="48" fill="#fff"></text>
                </svg>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features">
            <h2 className="section-title">What We Analyze</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Activity Score</h3>
                <p>Recent commits, updates, and release frequency</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Community Health</h3>
                <p>README, LICENSE, contributing guidelines, and more</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Popularity Metrics</h3>
                <p>Stars, forks, and community engagement</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Dependency Analysis</h3>
                <p>Check for outdated packages and security risks</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Tech Stack Analysis</h3>
                <p>Provides an AI generated overview of the tech stack used in the project</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Results Section */
        <section className="results-section">
          <div className="results-header">
            <div className="repo-title">
              <h1>{results.health_report?.full_name || `${owner}/${repo}`}</h1>
              <div className="grade-badge" style={{ backgroundColor: getGradeColor(results.health_report?.grade) }}>
                {results.health_report?.grade || 'N/A'}
              </div>
            </div>
            <div className="score-display">
              <div className="score-circle">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={getGradeColor(results.health_report?.grade)}
                    strokeWidth="10"
                    strokeDasharray={`${(results.health_report?.total_score || 0) * 3.14} ${314 - (results.health_report?.total_score || 0) * 3.14}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="70" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">
                    {results.health_report?.total_score || 0}
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="results-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
            <button 
              className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              Community
            </button>
            <button 
              className={`tab-btn ${activeTab === 'dependencies' ? 'active' : ''}`}
              onClick={() => setActiveTab('dependencies')}
            >
              Dependencies
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-grid">
                <div className="metric-card">
                  <h3>Activity</h3>
                  <div className="metric-score">
                    {results.health_report?.scores?.activity?.[0]} / {results.health_report?.scores?.activity?.[1]}
                  </div>
                  <ul className="metric-details">
                    {results.health_report?.scores?.activity?.[2]?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="metric-card">
                  <h3>Community</h3>
                  <div className="metric-score">
                    {results.health_report?.scores?.community?.[0]} / {results.health_report?.scores?.community?.[1]}
                  </div>
                  <ul className="metric-details">
                    {results.health_report?.scores?.community?.[2]?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="metric-card">
                  <h3>Popularity</h3>
                  <div className="metric-score">
                    {results.health_report?.scores?.popularity?.[0]} / {results.health_report?.scores?.popularity?.[1]}
                  </div>
                  <ul className="metric-details">
                    {results.health_report?.scores?.popularity?.[2]?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-section">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Recent Commits</h3>
                    <div className="commits-list">
                      {results.raw_data?.commits?.slice(0, 5).map((commit, idx) => (
                        <div key={idx} className="commit-item">
                          <div className="commit-sha">{commit.sha?.substring(0, 7)}</div>
                          <div className="commit-message">{commit.message?.split('\n')[0]}</div>
                          <div className="commit-date">{new Date(commit.date).toLocaleDateString()}</div>
                        </div>
                      )) || <p>No recent commits found</p>}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Recent Releases</h3>
                    <div className="releases-list">
                      {results.raw_data?.releases?.map((release, idx) => (
                        <div key={idx} className="release-item">
                          <div className="release-name">{release.name || release.tag_name}</div>
                          <div className="release-date">{new Date(release.published_at).toLocaleDateString()}</div>
                        </div>
                      )) || <p>No releases found</p>}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Branches</h3>
                    <div className="branches-list">
                      {results.raw_data?.branches?.map((branch, idx) => (
                        <div key={idx} className="branch-item">
                          <span className="branch-icon">🌿</span> {branch}
                        </div>
                      )) || <p>No branches found</p>}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Top Contributors</h3>
                    <div className="contributors-list">
                      {results.raw_data?.contributors?.map((contributor, idx) => (
                        <div key={idx} className="contributor-item">
                          <span className="contributor-name">{contributor.login}</span>
                          <span className="contributor-count">{contributor.contributions} contributions</span>
                        </div>
                      )) || <p>No contributors data</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="community-section">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Documentation</h3>
                    <div className="doc-list">
                      {results.raw_data?.community_profile?.readme && (
                        <div className="doc-item available">
                          <span className="doc-icon"></span> README.md
                        </div>
                      )}
                      {results.raw_data?.community_profile?.license && (
                        <div className="doc-item available">
                          <span className="doc-icon"></span> LICENSE
                        </div>
                      )}
                      {results.raw_data?.community_profile?.contributing && (
                        <div className="doc-item available">
                          <span className="doc-icon"></span> CONTRIBUTING.md
                        </div>
                      )}
                      {results.raw_data?.community_profile?.code_of_conduct && (
                        <div className="doc-item available">
                          <span className="doc-icon"></span> CODE_OF_CONDUCT.md
                        </div>
                      )}
                      {!results.raw_data?.community_profile?.readme && (
                        <div className="doc-item missing">
                          <span className="doc-icon"></span> README.md (Missing)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Repository Stats</h3>
                    <div className="stats-list">
                      <div className="stat-item">
                        <span className="stat-label">Stars:</span>
                        <span className="stat-value">{results.raw_data?.metadata?.stargazers_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Forks:</span>
                        <span className="stat-value">{results.raw_data?.metadata?.forks_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Watchers:</span>
                        <span className="stat-value">{results.raw_data?.metadata?.watchers_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Open Issues:</span>
                        <span className="stat-value">{results.raw_data?.metadata?.open_issues_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Size:</span>
                        <span className="stat-value">{(results.raw_data?.metadata?.size / 1024)?.toFixed(2) || 0} MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Recent Issues</h3>
                    <div className="issues-list">
                      {results.raw_data?.issues?.map((issue, idx) => (
                        <div key={idx} className="issue-item">
                          <div className="issue-number">#{issue.number}</div>
                          <div className="issue-title">{issue.title}</div>
                          <div className="issue-user">by {issue.user}</div>
                        </div>
                      )) || <p>No issues found</p>}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Pull Requests</h3>
                    <div className="prs-list">
                      {results.raw_data?.pull_requests?.map((pr, idx) => (
                        <div key={idx} className="pr-item">
                          <div className="pr-number">#{pr.number}</div>
                          <div className="pr-title">{pr.title}</div>
                          <div className="pr-user">by {pr.user}</div>
                        </div>
                      )) || <p>No pull requests found</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="dependencies-section">
                {results.dependency_report?.ai_summary ? (
                  <div className="ai-summary">
                    <h3>AI Tech Stack & Dependency Analysis</h3>
                    <div className="summary-content">
                      {results.dependency_report.ai_summary}
                    </div>
                  </div>
                ) : (
                  <div className="ai-summary-empty">
                    <h3>AI Analysis</h3>
                    <p>No AI summary available. Make sure GOOGLE_API_KEY is set in your .env file.</p>
                  </div>
                )}
                
                {results.dependency_report?.dependencies && Object.keys(results.dependency_report.dependencies).length > 0 ? (
                  <div className="dependencies-list">
                    <h3>Package Details</h3>
                    <div className="deps-grid">
                      {Object.entries(results.dependency_report.dependencies).map(([pkg, info]) => (
                        <div key={pkg} className={`dep-item ${info.outdated ? 'outdated' : 'uptodate'}`}>
                          <div className="dep-name">{pkg}</div>
                          <div className="dep-version">
                            Current: {info.current_version}
                            {info.latest_version && info.latest_version !== 'N/A' && (
                              <span className="dep-latest"> → Latest: {info.latest_version}</span>
                            )}
                          </div>
                          {info.outdated && <span className="dep-badge outdated-badge">Outdated</span>}
                          {!info.outdated && info.latest_version && <span className="dep-badge uptodate-badge">Up-to-date</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="dependencies-list">
                    <h3>Package Details</h3>
                    <p className="empty-state">No dependency file found (requirements.txt, package.json, or pom.xml)</p>
                  </div>
                )}
              </div>
            )}
            {/* Chat-with-Repo Section */}
            {results && (
              <div className="chat-section">
                <h3 className="chat-title">💬 Chat with this Repo</h3>
                <div className="chat-box">
                  <input
                    type="text"
                    placeholder="Ask something about this repo..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="chat-input"
                  />
                  <button onClick={handleChat} className="chat-btn">Ask</button>
                </div>

                {chatAnswer && (
                  <div className="chat-response">
                    <strong>AI:</strong> {chatAnswer}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>
      )}
    </div>
  )
}

export default App
