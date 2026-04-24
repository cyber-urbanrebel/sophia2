import React, { useState, useEffect, useRef } from 'react';

const AIAssistant = ({ user, habits, journalEntries, studySessions, tasks, goals }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('sophia_api_token') || '');
  const [showApiSetup, setShowApiSetup] = useState(!apiKey);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (apiKey && messages.length === 0) {
      // Welcome message
      const welcomeMessage = `Welcome back, ${user?.fullName || 'friend'}. I've reviewed your progress. What's on your mind today?`;
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [apiKey, user, messages.length]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('sophia_api_token', apiKey.trim());
      setShowApiSetup(false);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('sophia_api_token');
    setApiKey('');
    setShowApiSetup(true);
    setMessages([]);
  };

  const buildSystemPrompt = () => {
    const habitSummary = habits.map(h => `${h.name} (streak: ${h.streak || 0}, last: ${h.lastCompleted || 'never'})`).join(', ');
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
    const latestJournal = journalEntries.length > 0 ? journalEntries[journalEntries.length - 1].date : 'none';
    const totalStudyTime = studySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const goalSummary = goals.map(g => `${g.title} (${g.progress}%, ${g.daysRemaining || 0} days left)`).join(', ');

    return `You are SOPHIA, a wise and warm AI self-development coach. You are speaking with ${user?.fullName || 'a student'}.

Current data:
HABITS (${habits.length} total): ${habitSummary}
TASKS: ${pendingTasks} pending, ${overdueTasks} overdue
JOURNAL: ${journalEntries.length} entries. Latest: ${latestJournal}
STUDY: ${studySessions.length} sessions. Total time: ${totalStudyTime} minutes this week.
GOALS (${goals.length} total): ${goalSummary}

Your coaching style:
- Reference Stoic principles (Marcus Aurelius, Epictetus, Seneca) where relevant
- Apply the PERMA model (Seligman) when discussing wellbeing
- Use Atomic Habits principles (James Clear) when discussing habit improvement
- Be concise, warm, honest, and motivating
- Never lecture — respond to what the user actually said
- Speak in second person ("you", not "the user")
- Keep responses under 200 words unless asked for detail`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.content[0].text };
      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('AI API error:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API key and try again.' };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "How am I doing this week?",
    "Give me a Stoic insight",
    "What should I focus on?",
    "Review my goals"
  ];

  const sendQuickPrompt = (prompt) => {
    setInputMessage(prompt);
    setTimeout(() => sendMessage(), 100);
  };

  if (showApiSetup) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-cyan-400 mb-4">Setup AI Coaching</h2>
          <p className="text-neutral-300 mb-6">
            Paste your Anthropic API key to enable real AI coaching powered by Claude.
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-2">
              Get your key here →
            </a>
          </p>
          
          <input
            type="password"
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-4"
          />
          
          <div className="flex gap-2">
            <button
              onClick={saveApiKey}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
            >
              Save Key
            </button>
            {localStorage.getItem('sophia_api_token') && (
              <button
                onClick={clearApiKey}
                className="bg-red-400 hover:bg-red-300 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-cyan-400 bg-opacity-20 text-neutral-200 rounded-tr-none'
                : 'bg-black bg-opacity-60 border border-cyan-400 border-opacity-20 text-neutral-200 rounded-tl-none'
            }`}>
              {message.role === 'assistant' && (
                <div className="text-cyan-400 font-mono text-xs mb-1">SOPHIA</div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black bg-opacity-60 border border-cyan-400 border-opacity-20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
              <div className="text-cyan-400 font-mono text-xs mb-1">SOPHIA</div>
              <div className="text-neutral-200">SOPHIA is thinking...</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => sendQuickPrompt(prompt)}
              disabled={isLoading}
              className="bg-neutral-700 hover:bg-neutral-600 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-400 border-opacity-30 transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask SOPHIA anything..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-neutral-600 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;