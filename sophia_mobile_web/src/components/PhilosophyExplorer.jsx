import React, { useState } from 'react';

const PhilosophyExplorer = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState('values');
  const [ikigaiAnswers, setIkigaiAnswers] = useState(profile.ikigaiAnswers || {});
  const [dilemmaText, setDilemmaText] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const values = [
    'Integrity', 'Freedom', 'Growth', 'Courage', 'Discipline', 'Wisdom',
    'Compassion', 'Excellence', 'Authenticity', 'Resilience', 'Service',
    'Creativity', 'Family', 'Solitude', 'Adventure', 'Mastery', 'Justice',
    'Presence', 'Gratitude', 'Loyalty', 'Curiosity', 'Humility', 'Ambition', 'Balance'
  ];

  const selectedValues = profile.values || [];

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setProfile(prev => ({ ...prev, values: prev.values.filter(v => v !== value) }));
    } else if (selectedValues.length < 7) {
      setProfile(prev => ({ ...prev, values: [...prev.values, value] }));
    }
  };

  const updateIkigaiAnswer = (key, value) => {
    const newAnswers = { ...ikigaiAnswers, [key]: value };
    setIkigaiAnswers(newAnswers);
    setProfile(prev => ({ ...prev, ikigaiAnswers: newAnswers }));
  };

  const getIkigaiStatement = () => {
    const { love, goodAt, worldNeeds, paidFor } = ikigaiAnswers;
    if (love && goodAt && worldNeeds && paidFor) {
      return `I am someone who ${love}, equipped with ${goodAt}, driven to ${worldNeeds}, and able to ${paidFor}. This is my reason for being.`;
    }
    return null;
  };

  const analyzeDilemma = () => {
    if (!dilemmaText.trim()) return;

    // Simple analysis logic
    const analysis = `────────────────────────────────────
STOIC ANALYSIS: "${dilemmaText}"
────────────────────────────────────
1. CONTROL CHECK
   What you control: Your response, preparation, and attitude toward this situation.
   What you don't: The outcome, others' reactions, and external circumstances.
   → Focus your energy only on the first column.

2. WORST CASE
   Realistic worst outcome: Consider what could actually go wrong, not what might.
   Could you recover? Yes — human resilience is remarkable.
   → Fear loses power when you name it clearly.

3. WISEST SELF
   What would the most disciplined, clear-headed version of you choose?
   → Choose the path that aligns with your core values and long-term growth.

4. VIRTUE CHECK
   The virtue being tested here: Courage (acting despite fear) or Wisdom (right judgment).
   → Apply this virtue to guide your decision.

5. LONG-TERM VIEW
   In 5 years, what will matter most about this decision?
   → The character you build and the person you become.

SUMMARY: Trust your judgment. You know what aligns with your values. Take the step.
────────────────────────────────────`;

    const newAnalysis = {
      dilemma: dilemmaText,
      analysis,
      date: new Date().toISOString()
    };

    setProfile(prev => ({
      ...prev,
      dilemmaHistory: [newAnalysis, ...(prev.dilemmaHistory || [])]
    }));

    setDilemmaText('');
  };

  const stoicQuestions = [
    {
      id: 1,
      question: 'Is this within my control?',
      expanded: 'Epictetus taught that we only control our judgments, intentions, desires, and aversions. External outcomes, other people, reputation, and possessions are NOT in our control. Ask: am I agonizing over something I cannot change? If yes — release it.'
    },
    {
      id: 2,
      question: 'What is the worst realistic case?',
      expanded: 'This is premeditatio malorum — negative visualization. Seneca wrote: \'Let us prepare our minds as if we had come to the very end of life.\' Imagining the worst removes its power. Now ask: could I survive it? Could I recover? Almost always — yes.'
    },
    {
      id: 3,
      question: 'What would my wisest self do?',
      expanded: 'Picture the person you are working to become. Not who you are today — who you are becoming. What would that version of you choose? Act from that identity, not from fear or impulse.'
    },
    {
      id: 4,
      question: 'What does virtue require here?',
      expanded: 'The Stoics believed the four cardinal virtues are the only true goods: Wisdom (right judgment), Justice (treating others well), Courage (doing what is right despite fear), Temperance (self-control and balance). Which virtue is being tested in this moment?'
    },
    {
      id: 5,
      question: 'Will this matter in 5 years?',
      expanded: 'Marcus Aurelius wrote: \'How soon will you be ashes or bare bones, and either a name or not even a name.\' This is not pessimism — it is perspective. Most urgent-feeling problems dissolve under long-term view.'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-8">
        <button
          onClick={() => setActiveTab('values')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'values' ? 'bg-cyan-400 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          ⚖️ Values
        </button>
        <button
          onClick={() => setActiveTab('purpose')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'purpose' ? 'bg-cyan-400 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          🌟 Purpose
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'decisions' ? 'bg-cyan-400 text-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          🧭 Decisions
        </button>
      </div>

      {/* Values Tab */}
      {activeTab === 'values' && (
        <div>
          <h2 className="text-2xl font-display font-bold text-cyan-400 mb-6">Core Values Assessment</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {values.map(value => (
              <button
                key={value}
                onClick={() => toggleValue(value)}
                className={`p-3 rounded-lg font-semibold transition-all ${
                  selectedValues.includes(value)
                    ? 'bg-cyan-400 text-black'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {selectedValues.length >= 7 && (
            <div className="bg-red-400 bg-opacity-20 border border-red-400 rounded-lg p-3 mb-6">
              Choose your top 7. More values = less clarity.
            </div>
          )}

          <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
            <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">Your Core Identity</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedValues.map(value => (
                <span key={value} className="bg-cyan-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  {value}
                </span>
              ))}
            </div>
            <p className="text-neutral-400 text-sm">
              These values are your compass. Every major decision should align with at least one.
            </p>
          </div>
        </div>
      )}

      {/* Purpose Tab */}
      {activeTab === 'purpose' && (
        <div>
          <h2 className="text-2xl font-display font-bold text-cyan-400 mb-6">Purpose Builder</h2>
          
          <div className="mb-6">
            <p className="text-neutral-300 mb-4">
              Ikigai is the Japanese concept of your 'reason for being'. It sits at the intersection of four questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
              <div className="text-green-400 text-2xl mb-2">💚</div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">What do you love doing?</h3>
              <p className="text-neutral-400 text-sm mb-4">things that make you lose track of time</p>
              <textarea
                value={ikigaiAnswers.love || ''}
                onChange={(e) => updateIkigaiAnswer('love', e.target.value)}
                placeholder="e.g. helping others learn, creating art, solving complex problems..."
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24"
              />
            </div>

            <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
              <div className="text-yellow-400 text-2xl mb-2">💛</div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">What are you good at?</h3>
              <p className="text-neutral-400 text-sm mb-4">your natural talents and trained skills</p>
              <textarea
                value={ikigaiAnswers.goodAt || ''}
                onChange={(e) => updateIkigaiAnswer('goodAt', e.target.value)}
                placeholder="e.g. teaching, writing, coding, leadership..."
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24"
              />
            </div>

            <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
              <div className="text-orange-400 text-2xl mb-2">🧡</div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">What does the world need?</h3>
              <p className="text-neutral-400 text-sm mb-4">problems you care about solving</p>
              <textarea
                value={ikigaiAnswers.worldNeeds || ''}
                onChange={(e) => updateIkigaiAnswer('worldNeeds', e.target.value)}
                placeholder="e.g. education access, mental health support, environmental protection..."
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24"
              />
            </div>

            <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
              <div className="text-blue-400 text-2xl mb-2">💙</div>
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">What can you be paid for?</h3>
              <p className="text-neutral-400 text-sm mb-4">skills others value and will compensate</p>
              <textarea
                value={ikigaiAnswers.paidFor || ''}
                onChange={(e) => updateIkigaiAnswer('paidFor', e.target.value)}
                placeholder="e.g. consulting, content creation, software development..."
                className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24"
              />
            </div>
          </div>

          <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
            <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">YOUR IKIGAI STATEMENT</h3>
            {getIkigaiStatement() ? (
              <p className="text-neutral-200 font-heading italic text-lg leading-relaxed">
                {getIkigaiStatement()}
              </p>
            ) : (
              <p className="text-neutral-400">
                Answer all four questions to reveal your purpose statement.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Decisions Tab */}
      {activeTab === 'decisions' && (
        <div>
          <h2 className="text-2xl font-display font-bold text-cyan-400 mb-6">Stoic Decision Framework</h2>

          {/* Stoic Questions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-200 mb-4">THE 5 STOIC QUESTIONS</h3>
            <div className="space-y-3">
              {stoicQuestions.map(question => (
                <div key={question.id} className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                    className="w-full text-left p-4 font-semibold text-neutral-200 hover:text-cyan-400 transition-colors"
                  >
                    {question.question}
                  </button>
                  {expandedQuestion === question.id && (
                    <div className="px-4 pb-4 text-neutral-400 text-sm">
                      {question.expanded}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Dilemma Tool */}
          <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-neutral-200 mb-4">PERSONAL DILEMMA TOOL</h3>
            <p className="text-neutral-400 mb-4">Describe a decision you're facing right now</p>
            
            <textarea
              value={dilemmaText}
              onChange={(e) => setDilemmaText(e.target.value)}
              placeholder="e.g. Should I drop out to start my business? Should I confront my friend? Should I take this job offer?"
              className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24 mb-4"
            />
            
            <button
              onClick={analyzeDilemma}
              disabled={!dilemmaText.trim()}
              className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-neutral-600 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
            >
              Analyse with Stoic Filter
            </button>
          </div>

          {/* Dilemma History */}
          {(profile.dilemmaHistory || []).length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-neutral-200 mb-4">RECENT ANALYSES</h3>
              <div className="space-y-4">
                {(profile.dilemmaHistory || []).slice(0, 3).map((item, index) => (
                  <details key={index} className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl">
                    <summary className="p-4 font-semibold text-neutral-200 cursor-pointer">
                      {item.dilemma.length > 50 ? item.dilemma.substring(0, 50) + '...' : item.dilemma}
                    </summary>
                    <div className="px-4 pb-4">
                      <pre className="text-neutral-400 text-sm whitespace-pre-wrap font-mono">
                        {item.analysis}
                      </pre>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhilosophyExplorer;