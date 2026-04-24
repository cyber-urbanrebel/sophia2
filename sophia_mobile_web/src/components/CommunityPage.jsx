import React, { useState, useEffect } from 'react';

const CommunityPage = ({ user }) => {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('sophia_community_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [newPost, setNewPost] = useState({ message: '', type: 'milestone', tags: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [weeklyChallengeCompleted, setWeeklyChallengeCompleted] = useState(() => {
    return localStorage.getItem('sophia_weekly_challenge_completed') === 'true';
  });

  const postTypes = {
    milestone: { color: '#00FF88', label: 'Milestone' },
    insight: { color: '#00FFFF', label: 'Insight' },
    challenge: { color: '#FFD23F', label: 'Challenge' },
    question: { color: '#FF6B35', label: 'Question' },
    reflection: { color: '#BB88FF', label: 'Reflection' },
    gratitude: { color: '#FF88AA', label: 'Gratitude' }
  };

  const challenges = [
    "Complete your top 3 habits every single day this week — no exceptions.",
    "Write a journal entry every morning before opening your phone.",
    "Read 20 pages of a non-fiction book each day this week.",
    "Do one act of intentional kindness for someone every day.",
    "Spend 30 minutes in deep focused work before checking any messages.",
    "No social media before 12pm every day this week.",
    "Write down 3 things you are grateful for each night before sleeping.",
    "Do a 10-minute mindfulness session every morning this week."
  ];

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const currentChallenge = challenges[getWeekNumber() % challenges.length];

  const markChallengeComplete = () => {
    setWeeklyChallengeCompleted(true);
    localStorage.setItem('sophia_weekly_challenge_completed', 'true');
  };

  const submitPost = () => {
    if (!newPost.message.trim()) return;

    const post = {
      id: Date.now(),
      userId: user?.id || 'anonymous',
      userName: user?.fullName || 'Anonymous User',
      avatar: user?.avatar || '',
      message: newPost.message,
      type: newPost.type,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      replies: []
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('sophia_community_posts', JSON.stringify(updatedPosts));
    setNewPost({ message: '', type: 'milestone', tags: '' });
  };

  const toggleLike = (postId) => {
    if (!user?.id) return;

    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          const likedBy = post.likedBy || [];
          const isLiked = likedBy.includes(user.id);
          
          return {
            ...post,
            likedBy: isLiked 
              ? likedBy.filter(id => id !== user.id)
              : [...likedBy, user.id],
            likes: isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      });
      
      localStorage.setItem('sophia_community_posts', JSON.stringify(updatedPosts));
      return updatedPosts;
    });
  };

  const submitReply = (postId) => {
    if (!replyText.trim() || !user?.id) return;

    const reply = {
      id: Date.now(),
      userId: user.id,
      userName: user.fullName || 'Anonymous User',
      message: replyText,
      createdAt: new Date().toISOString()
    };

    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...(post.replies || []), reply]
          };
        }
        return post;
      });
      
      localStorage.setItem('sophia_community_posts', JSON.stringify(updatedPosts));
      return updatedPosts;
    });

    setReplyingTo(null);
    setReplyText('');
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Most Liked') return post.likes > 0;
    return post.type === activeFilter.toLowerCase();
  });

  const leaderboard = posts
    .filter(post => {
      const postDate = new Date(post.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return postDate >= weekAgo;
    })
    .reduce((acc, post) => {
      const userId = post.userId;
      if (!acc[userId]) {
        acc[userId] = { name: post.userName, posts: 0, likes: 0 };
      }
      acc[userId].posts += 1;
      acc[userId].likes += post.likes;
      return acc;
    }, {});

  const leaderboardArray = Object.entries(leaderboard)
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      score: data.posts * 2 + data.likes
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Weekly Challenge Banner */}
      <div className="bg-yellow-400 bg-opacity-10 border border-yellow-400 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-mono font-bold text-yellow-400 mb-2">🏆 THIS WEEK'S CHALLENGE</h2>
            <p className="text-neutral-200">{currentChallenge}</p>
          </div>
          {!weeklyChallengeCompleted && (
            <button
              onClick={markChallengeComplete}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Mark Complete
            </button>
          )}
          {weeklyChallengeCompleted && (
            <div className="text-green-400 font-semibold">✓ Completed</div>
          )}
        </div>
      </div>

      {/* Post Composer */}
      <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(postTypes).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setNewPost(prev => ({ ...prev, type }))}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                newPost.type === type 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <textarea
          placeholder={
            newPost.type === 'milestone' ? "Share a win — big or small. Every step forward counts." :
            newPost.type === 'insight' ? "Share something you learned or understood today." :
            newPost.type === 'challenge' ? "Challenge the community to try something this week." :
            newPost.type === 'question' ? "Ask the community — no question is too small." :
            newPost.type === 'reflection' ? "Share a moment of honest self-reflection." :
            "Who or what are you grateful for today?"
          }
          value={newPost.message}
          onChange={(e) => setNewPost(prev => ({ ...prev, message: e.target.value }))}
          className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-3 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 h-24 mb-4"
        />

        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newPost.tags}
            onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
            className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-2 text-neutral-200 flex-1 mr-4 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            onClick={submitPost}
            disabled={!newPost.message.trim()}
            className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-neutral-600 text-black font-semibold py-2 px-5 rounded-lg transition-all duration-200"
          >
            Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Most Liked', ...Object.keys(postTypes).map(type => postTypes[type].label)].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
              activeFilter === filter 
                ? 'bg-cyan-400 text-black' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-display font-bold text-cyan-400 mb-2">Be the first to share</h3>
              <p className="text-neutral-400">The community starts with a single voice.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black font-semibold">
                    {post.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-200">{post.userName}</span>
                      <span className="text-neutral-400 text-sm">{timeAgo(post.createdAt)}</span>
                    </div>
                    <div
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-black mb-2"
                      style={{ backgroundColor: postTypes[post.type].color }}
                    >
                      {postTypes[post.type].label}
                    </div>
                  </div>
                </div>

                <p className="text-neutral-200 mb-4">{post.message}</p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 ${post.likedBy?.includes(user?.id) ? 'text-red-400' : 'text-neutral-400 hover:text-red-400'}`}
                  >
                    {post.likedBy?.includes(user?.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button
                    onClick={() => setReplyingTo(post.id)}
                    className="text-neutral-400 hover:text-cyan-400"
                  >
                    Reply
                  </button>
                </div>

                {replyingTo === post.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    <textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-black bg-opacity-50 border border-cyan-400 border-opacity-30 rounded-lg px-4 py-2 text-neutral-200 w-full focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReply(post.id)}
                        className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-1 px-3 rounded transition-all duration-200"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="bg-neutral-600 hover:bg-neutral-500 text-neutral-200 font-semibold py-1 px-3 rounded transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {post.replies && post.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-neutral-800 bg-opacity-50 rounded-lg p-3 ml-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-200 text-sm">{reply.userName}</span>
                          <span className="text-neutral-400 text-xs">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-neutral-300 text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-black bg-opacity-50 backdrop-blur-lg border border-cyan-400 border-opacity-20 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">TOP CONTRIBUTORS THIS WEEK</h3>
            {leaderboardArray.length === 0 ? (
              <p className="text-neutral-400 text-sm">No activity this week yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboardArray.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-neutral-200 font-semibold text-sm">{user.name}</div>
                      <div className="text-neutral-400 text-xs">{user.score} points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;