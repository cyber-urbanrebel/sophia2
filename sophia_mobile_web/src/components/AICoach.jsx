import React, { useState, useCallback, useRef, useEffect } from 'react';

const AICoach = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('sophia_ai_coach_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        role: 'assistant',
        content: '🤖 Hi! I\'m your personal AI Coach. I have access to all your data and can provide personalized insights, motivation, and guidance. Ask me anything!',
        timestamp: new Date(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      localStorage.setItem('sophia_ai_coach_messages', JSON.stringify(updated));
      return updated;
    });

    setInput('');
    setLoading(true);

    // Simulate AI response (in production, call your Anthropic API)
    setTimeout(() => {
      const responses = [
        "That's an interesting question! Based on your recent activity, I recommend focusing on consistency. How can I help you improve your discipline score?",
        "I've noticed you've been on a great streak! Keep up this momentum. What area would you like to work on next?",
        "Your body metrics look good. For optimal results, consider adjusting your hydration habits. Would you like specific recommendations?",
        "Your mind seems a bit cluttered based on your journal entries. Have you considered starting a meditation practice?",
        "Amazing progress! You're 15% closer to your next level. What motivates you the most in your journey?",
      ];

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('sophia_ai_coach_messages', JSON.stringify(updated));
        return updated;
      });

      setLoading(false);
    }, 800);
  }, []);

  const handleSend = () => {
    sendMessage(input);
  };

  const suggestedQuestions = [
    'How can I improve my discipline score?',
    'What\'s my biggest strength?',
    'Give me motivation for today',
    'Analyze my sleep patterns',
    'Suggest a 30-day challenge',
  ];

  return (
    <div style={{ padding: '0', color: '#fff', background: 'transparent', fontFamily: '"DM Mono", monospace', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#00d4ff' }}>🤖 AI Coach</h2>

      {/* Chat Area */}
      <div style={{ flex: 1, background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px', marginBottom: '20px', overflowY: 'auto', maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', paddingTop: '40px' }}>
            <p>Start a conversation with your AI Coach</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#00d4ff' : '#161616',
                  color: msg.role === 'user' ? '#000' : '#fff',
                  border: msg.role === 'user' ? 'none' : '1px solid #222222',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  wordWrap: 'break-word',
                }}
              >
                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{msg.content}</p>
                <p style={{ margin: '0', fontSize: '11px', opacity: 0.7 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ textAlign: 'center', color: '#888', padding: '12px' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>●</span>
            <span style={{ marginLeft: '4px', animation: 'pulse 1s infinite 0.2s' }}>●</span>
            <span style={{ marginLeft: '4px', animation: 'pulse 1s infinite 0.4s' }}>●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Try asking:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                style={{
                  background: 'transparent',
                  border: '1px solid #222222',
                  color: '#00d4ff',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                → {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AICoach;
