import { useState } from 'react'
import App from './App'
import WorkflowBuilder from './components/WorkflowBuilder'

const AppRouter = () => {
  const [currentView, setCurrentView] = useState('landing')

  if (currentView === 'workflow') {
    return <WorkflowBuilder />
  }

  return (
    <div onClick={(e) => {
      // Navigate to workflow builder when clicking "Get started" buttons
      if (e.target.classList.contains('btn-hero-primary') || 
          e.target.classList.contains('btn-primary') ||
          e.target.textContent.includes('Get started')) {
        setCurrentView('workflow')
      }
    }}>
      <App />
    </div>
  )
}

export default AppRouter
