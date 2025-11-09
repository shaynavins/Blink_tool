import { useState } from 'react'
import './App.css'

function App() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('health')

  const useCases = [
    {
      id: 'IT Ops',
      title: 'IT Ops',
      subtitle: 'can',
      icon: '⚡',
      description: 'On-board new employees',
      features: [
        'Automate user provisioning',
        'Set up access permissions',
        'Configure tools & systems'
      ]
    },
    {
      id: 'Sec Ops',
      title: 'Sec Ops',
      subtitle: 'can',
      icon: '🔒',
      description: 'Enrich security incident tickets',
      features: [
        'Automatic threat detection',
        'Incident response automation',
        'Security audit workflows'
      ]
    },
    {
      id: 'Dev Ops',
      title: 'Dev Ops',
      subtitle: 'can',
      icon: '🚀',
      description: 'Convert natural language into API calls',
      features: [
        'Deploy applications automatically',
        'Monitor system health',
        'Automate CI/CD pipelines'
      ]
    },
    {
      id: 'Sales',
      title: 'Sales',
      subtitle: 'can',
      icon: '💼',
      description: 'Generate customer insights from reviews',
      features: [
        'Lead scoring automation',
        'Email campaign workflows',
        'CRM data synchronization'
      ]
    },
    {
      id: 'You',
      title: 'You',
      subtitle: 'can',
      icon: '🎯',
      description: 'Watch this video to hear our pitch',
      features: [
        'Build custom workflows',
        'Integrate any service',
        'Automate your processes'
      ]
    }
  ]

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">∞</div>
            <span className="logo-text">n8n</span>
          </div>
          <div className="nav-links">
            <a href="#">Product</a>
            <a href="#">Use cases</a>
            <a href="#">Docs</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
            <a href="#">Pricing</a>
          </div>
          <div className="nav-actions">
            <div className="github-stars">
              <span>⭐ GitHub</span>
              <span className="star-count">★ 154,815</span>
            </div>
            <button className="btn-secondary">Sign in</button>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Flexible AI workflow automation
            <br />
            <span className="gradient-text">for technical teams</span>
          </h1>
          <p className="hero-subtitle">
            Build with the precision of code or the speed of drag-n-drop. Host with
            <br />
            on-prem control or in-the-cloud convenience. n8n gives you more
            <br />
            freedom to implement multi-step AI agents and integrate apps than
            <br />
            any other tool.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary">Get started for free</button>
            <button className="btn-hero-secondary">Talk to sales</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="lightning-bolt">
            <svg viewBox="0 0 100 200" className="bolt-svg">
              <path
                d="M60 0 L40 80 L60 80 L40 200 L80 70 L60 70 Z"
                fill="url(#lightning-gradient)"
                className="bolt-path"
              />
              <defs>
                <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff6b35', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#f7931e', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ffd700', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases">
        <div className="use-cases-tabs">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              className={`tab ${activeTab === useCase.id ? 'active' : ''}`}
              onClick={() => setActiveTab(useCase.id)}
            >
              <span className="tab-icon">{useCase.icon}</span>
              <div className="tab-text">
                <span className="tab-title">{useCase.title}</span>
                <span className="tab-subtitle">{useCase.subtitle}</span>
              </div>
              <div className="tab-description">{useCase.description}</div>
            </button>
          ))}
        </div>

        {/* Workflow Canvas */}
        <div className="workflow-canvas">
          <div className="canvas-grid"></div>
          <div className="workflow-nodes">
            <div className="node node-trigger">
              <div className="node-icon">▶</div>
              <div className="node-label">Trigger</div>
            </div>
            <div className="connector"></div>
            <div className="node node-action">
              <div className="node-icon">⚙</div>
              <div className="node-label">Process</div>
            </div>
            <div className="connector"></div>
            <div className="node node-integration">
              <div className="node-icon">🔗</div>
              <div className="node-label">Integrate</div>
            </div>
            <div className="connector"></div>
            <div className="node node-output">
              <div className="node-icon">✓</div>
              <div className="node-label">Complete</div>
            </div>
            <div className="add-node-button">
              <button className="btn-add-node">+</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Build workflows your way</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Visual Builder</h3>
            <p>Drag and drop to create complex workflows without code</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Code When Needed</h3>
            <p>Write JavaScript when you need full control</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3>400+ Integrations</h3>
            <p>Connect to your favorite tools and services</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Build intelligent agents with LLM integrations</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
