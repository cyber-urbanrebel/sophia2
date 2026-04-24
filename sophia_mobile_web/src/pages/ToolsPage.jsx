import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUserMessage, setToolPrompt } from '../store/slices/chatSlice.js';
import recommendationEngine from '../services/recommendations.js';
import styles from '../styles/Tools.module.css';

const tools = [
  {
    id: 'code-assistant',
    icon: '🤖',
    name: 'Code Assistant',
    description: 'AI code generation',
    tag: 'AI',
    prompt: 'Help me generate production-quality code.',
  },
  {
    id: 'circuit-solver',
    icon: '📐',
    name: 'Circuit Solver',
    description: 'Ohm\'s law calculator',
    tag: 'FREE',
    prompt: 'Calculate the voltages and currents for a basic circuit.',
  },
  {
    id: 'data-analyser',
    icon: '📊',
    name: 'Data Analyser',
    description: 'Plot & analyse data',
    tag: 'AI',
    prompt: 'Analyse this dataset and produce insights.',
  },
  {
    id: 'doc-generator',
    icon: '📝',
    name: 'Doc Generator',
    description: 'Auto-write lab reports',
    tag: 'AI',
    prompt: 'Generate a lab report from notes.',
  },
  {
    id: 'math-solver',
    icon: '🔢',
    name: 'Math Solver',
    description: 'Step-by-step solutions',
    tag: 'FREE',
    prompt: 'Solve this math problem with steps.',
  },
  {
    id: 'api-tester',
    icon: '🌐',
    name: 'API Tester',
    description: 'Test REST endpoints',
    tag: 'BETA',
    prompt: 'Send a request to this API endpoint and show the response.',
  },
  {
    id: 'code-reviewer',
    icon: '🔒',
    name: 'Code Reviewer',
    description: 'Security & style audit',
    tag: 'AI',
    prompt: 'Review the following code for security and style.',
  },
  {
    id: 'algorithm-viz',
    icon: '⚡',
    name: 'Algorithm Viz',
    description: 'Visualise sorting/trees',
    tag: 'FREE',
    prompt: 'Visualise this algorithm step-by-step.',
  },
];

export default function ToolsPage({ setActiveTab }) {
  const dispatch = useDispatch();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock user data - in real app, this would come from the backend
  const userData = useSelector((state) => ({
    habits: [], // Would be populated from backend
    goals: [], // Would be populated from backend
    journal: { totalEntries: 0, avgSentiment: 0 },
    study: { totalSessions: 0, totalMinutes: 0, avgMinutes: 0 }
  }));

  const userBehavior = {
    lastActive: new Date().toISOString(),
    preferredTools: ['code-assistant', 'math-solver'],
    completedHabitsToday: 0,
    journalStreak: 0,
    studyStreak: 0
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recs = await recommendationEngine.getPersonalizedRecommendations(userData, userBehavior);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleToolClick = (tool) => {
    dispatch(addUserMessage(`Activate tool: ${tool.name}`));
    dispatch(setToolPrompt(tool.prompt));
    setActiveTab('chat');
  };

  const handleRecommendationClick = (rec) => {
    dispatch(addUserMessage(`I need help with: ${rec.title}`));
    setActiveTab('chat');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Tools</h2>

      {/* Personalized Recommendations */}
      {!loading && recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h3 className={styles.sectionTitle}>✨ Personalized for You</h3>
          <div className={styles.recommendationsGrid}>
            {recommendations.slice(0, 3).map((rec, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.card} ${styles.recommendationCard}`}
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className={styles.icon}>
                  {rec.type === 'wisdom_item' ? '📚' :
                   rec.type === 'goal_suggestion' ? '🎯' :
                   rec.type === 'habit_reminder' ? '✅' :
                   rec.type === 'study_topic' ? '📖' :
                   rec.type === 'journal_prompt' ? '📝' : '💡'}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{rec.title}</div>
                  <div className={styles.description}>{rec.description}</div>
                  <div className={styles.reason}>{rec.reason}</div>
                </div>
                <span className={`${styles.tag} ${styles.priorityTag} ${styles[rec.priority]}`}>
                  {rec.priority}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={styles.card}
            onClick={() => handleToolClick(tool)}
          >
            <div className={styles.icon}>{tool.icon}</div>
            <div className={styles.info}>
              <div className={styles.name}>{tool.name}</div>
              <div className={styles.description}>{tool.description}</div>
            </div>
            <span className={styles.tag}>{tool.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
