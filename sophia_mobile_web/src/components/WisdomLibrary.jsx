import React, { useState, useEffect } from 'react';

const WisdomLibrary = ({ favourites, setFavourites }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Library');
  const [reflectionModal, setReflectionModal] = useState(null);
  const [reflectionText, setReflectionText] = useState('');

  const categoryColors = {
    stoicism: '#00FFFF',
    habits: '#00FF88',
    growth: '#FFD23F',
    purpose: '#FF6B35',
    motivation: '#BB88FF',
    relationships: '#FF88AA',
    health: '#44AAFF'
  };

  const wisdomData = [
    // Stoicism - 5 entries
    { id: 1, category: 'stoicism', quote: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius', source: 'Meditations' },
    { id: 2, category: 'stoicism', quote: 'It is not the man who has too little, but the man who craves more, that is poor.', author: 'Seneca', source: 'Letters from a Stoic' },
    { id: 3, category: 'stoicism', quote: 'Man is disturbed not by things, but by the views he takes of them.', author: 'Epictetus', source: 'Enchiridion' },
    { id: 4, category: 'stoicism', quote: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius', source: 'Meditations' },
    { id: 5, category: 'stoicism', quote: 'The best revenge is not to be like your enemy.', author: 'Marcus Aurelius', source: 'Meditations' },

    // Habits - 5 entries
    { id: 6, category: 'habits', quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', source: 'Nicomachean Ethics' },
    { id: 7, category: 'habits', quote: 'Your habits will determine your future.', author: 'Jack Canfield', source: 'The Success Principles' },
    { id: 8, category: 'habits', quote: 'The chains of habit are too weak to be felt until they are too strong to be broken.', author: 'Samuel Johnson', source: 'The Rambler' },
    { id: 9, category: 'habits', quote: 'Habit is a cable; we weave a thread each day, and at last we cannot break it.', author: 'Horace Mann', source: 'Lectures and Annual Reports' },
    { id: 10, category: 'habits', quote: 'Successful people are simply those with successful habits.', author: 'Brian Tracy', source: 'Maximum Achievement' },

    // Growth - 5 entries
    { id: 11, category: 'growth', quote: 'Be not afraid of growing slowly; be afraid only of standing still.', author: 'Chinese Proverb', source: 'Traditional Wisdom' },
    { id: 12, category: 'growth', quote: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.', author: 'Alan Watts', source: 'The Wisdom of Insecurity' },
    { id: 13, category: 'growth', quote: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson', source: 'Essays' },
    { id: 14, category: 'growth', quote: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King', source: 'Interview' },
    { id: 15, category: 'growth', quote: 'Growth is the only evidence of life.', author: 'John Henry Newman', source: 'Sermons' },

    // Purpose - 5 entries
    { id: 16, category: 'purpose', quote: 'The two most important days in your life are the day you are born and the day you find out why.', author: 'Mark Twain', source: 'Quote' },
    { id: 17, category: 'purpose', quote: 'Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.', author: 'Steve Jobs', source: 'Stanford Commencement' },
    { id: 18, category: 'purpose', quote: 'The meaning of life is to find your gift. The purpose of life is to give it away.', author: 'Pablo Picasso', source: 'Quote' },
    { id: 19, category: 'purpose', quote: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche', source: 'Twilight of the Idols' },
    { id: 20, category: 'purpose', quote: 'Your purpose in life is to find your purpose and give your whole heart and soul to it.', author: 'Buddha', source: 'Teaching' },

    // Motivation - 5 entries
    { id: 21, category: 'motivation', quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', source: 'Stanford Commencement' },
    { id: 22, category: 'motivation', quote: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', source: 'Quote' },
    { id: 23, category: 'motivation', quote: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', source: 'Quote' },
    { id: 24, category: 'motivation', quote: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky', source: 'Quote' },
    { id: 25, category: 'motivation', quote: 'The only limit to our realization of tomorrow will be our doubts of today.', author: 'Franklin D. Roosevelt', source: 'Quote' },

    // Relationships - 5 entries
    { id: 26, category: 'relationships', quote: 'The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.', author: 'Helen Keller', source: 'Quote' },
    { id: 27, category: 'relationships', quote: 'A real friend is one who walks in when the rest of the world walks out.', author: 'Walter Winchell', source: 'Quote' },
    { id: 28, category: 'relationships', quote: 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.', author: 'Unknown', source: 'Quote' },
    { id: 29, category: 'relationships', quote: 'The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.', author: 'Victor Hugo', source: 'Les Misérables' },
    { id: 30, category: 'relationships', quote: 'Friendship is born at that moment when one person says to another, \'What! You too? I thought I was the only one.\'', author: 'C.S. Lewis', source: 'The Four Loves' },

    // Health - 5 entries
    { id: 31, category: 'health', quote: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn', source: 'Quote' },
    { id: 32, category: 'health', quote: 'Health is not valued till sickness comes.', author: 'Thomas Fuller', source: 'Gnomologia' },
    { id: 33, category: 'health', quote: 'The first wealth is health.', author: 'Ralph Waldo Emerson', source: 'Essays' },
    { id: 34, category: 'health', quote: 'A healthy outside starts from the inside.', author: 'Robert Urich', source: 'Quote' },
    { id: 35, category: 'health', quote: 'Your body hears everything your mind says.', author: 'Naomi Judd', source: 'Quote' }
  ];

  // Get day of year for deterministic daily wisdom
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dailyWisdom = wisdomData[getDayOfYear() % wisdomData.length];

  const filteredWisdom = wisdomData.filter(item => {
    const matchesSearch = item.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedWisdom = activeTab === 'Library' ? filteredWisdom : 
                         wisdomData.filter(item => favourites.includes(item.id));

  const toggleFavourite = (id) => {
    setFavourites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const openReflectionModal = (wisdom) => {
    const reflections = JSON.parse(localStorage.getItem('sophia_reflections') || '{}');
    setReflectionText(reflections[wisdom.id] || '');
    setReflectionModal(wisdom);
  };

  const saveReflection = () => {
    const reflections = JSON.parse(localStorage.getItem('sophia_reflections') || '{}');
    reflections[reflectionModal.id] = reflectionText;
    localStorage.setItem('sophia_reflections', JSON.stringify(reflections));
    setReflectionModal(null);
    setReflectionText('');
  };

  const getReflections = () => {
    return JSON.parse(localStorage.getItem('sophia_reflections') || '{}');
  };

  const reflections = getReflections();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Daily Wisdom Card */}
      <div className="bg-cyan-400 bg-opacity-10 border border-cyan-400 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold text-black"
            style={{ backgroundColor: categoryColors[dailyWisdom.category] }}
          >
            {dailyWisdom.category.toUpperCase()}
          </div>
        </div>
        <blockquote className="text-2xl font-heading italic text-neutral-200 mb-4">
          "{dailyWisdom.quote}"
        </blockquote>
        <cite className="text-neutral-400 text-sm">
          — {dailyWisdom.author}, {dailyWisdom.source}
        </cite>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search quotes or authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-4"
        />
        
        <div className="flex flex-wrap gap-2">
          {['All', 'stoicism', 'habits', 'growth', 'purpose', 'motivation', 'relationships', 'health'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === category 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {category === 'All' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab('Library')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'Library' 
              ? 'bg-cyan-400 text-black' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Library ({filteredWisdom.length})
        </button>
        <button
          onClick={() => setActiveTab('Favourites')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'Favourites' 
              ? 'bg-cyan-400 text-black' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Favourites ({favourites.length})
        </button>
      </div>

      {/* Wisdom Grid */}
      {displayedWisdom.length === 0 && activeTab === 'Favourites' ? (
        <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-2xl font-display font-bold text-cyan-400 mb-2">No favourites yet</h3>
          <p className="text-neutral-400">Star some wisdom entries to see them here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {displayedWisdom.map(wisdom => (
            <div key={wisdom.id} className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold text-black"
                  style={{ backgroundColor: categoryColors[wisdom.category] }}
                >
                  {wisdom.category.toUpperCase()}
                </div>
                <button
                  onClick={() => toggleFavourite(wisdom.id)}
                  className="text-2xl"
                >
                  {favourites.includes(wisdom.id) ? '★' : '☆'}
                </button>
              </div>
              
              <blockquote className="text-lg font-heading italic text-neutral-200 mb-3">
                "{wisdom.quote}"
              </blockquote>
              
              <cite className="text-neutral-400 text-xs mb-4 block">
                — {wisdom.author}, {wisdom.source}
              </cite>
              
              {reflections[wisdom.id] && (
                <>
                  <hr className="border-neutral-700 mb-2" />
                  <p className="text-neutral-500 italic text-sm mb-2">My reflection:</p>
                  <p className="text-neutral-400 text-sm italic">{reflections[wisdom.id]}</p>
                </>
              )}
              
              <button
                onClick={() => openReflectionModal(wisdom)}
                className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
              >
                {reflections[wisdom.id] ? '✏️ Edit reflection' : '💭 Add reflection'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reflection Modal */}
      {reflectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-black bg-opacity-90 backdrop-blur-lg border border-cyan-400 rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-display font-bold text-cyan-400 mb-4">Reflect on this wisdom</h3>
            
            <blockquote className="text-lg font-heading italic text-neutral-200 mb-4">
              "{reflectionModal.quote}"
            </blockquote>
            
            <cite className="text-neutral-400 text-sm mb-6 block">
              — {reflectionModal.author}, {reflectionModal.source}
            </cite>
            
            <textarea
              placeholder="What does this mean to you? How can you apply it today?"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-32 mb-4"
            />
            
            <div className="flex gap-2">
              <button
                onClick={saveReflection}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
              >
                Save Reflection
              </button>
              <button
                onClick={() => setReflectionModal(null)}
                className="bg-red-400 hover:bg-red-300 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WisdomLibrary;