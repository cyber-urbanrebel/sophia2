class RecommendationEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes
  }

  async getPersonalizedRecommendations(userData, userBehavior) {
    const cacheKey = `recs_${JSON.stringify(userData)}_${JSON.stringify(userBehavior)}`;

    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    // TODO: Route through backend API instead of calling LLM directly from client
    const recommendations = this.getFallbackRecommendations(userData);

    this.cache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now(),
    });

    return recommendations;
  }

  getFallbackRecommendations(userData = {}) {
    const recommendations = [];

    // Basic fallback recommendations based on user data
    if (userData.goals && userData.goals.length === 0) {
      recommendations.push({
        type: 'goal_suggestion',
        title: 'Set Your First Goal',
        description: 'Start your personal development journey by setting a SMART goal',
        reason: 'Goals provide direction and motivation for growth',
        priority: 'high',
        action: 'Create a goal in the Goals section'
      });
    }

    if (userData.habits && userData.habits.filter(h => h.completedToday).length === 0) {
      recommendations.push({
        type: 'habit_reminder',
        title: 'Complete a Habit Today',
        description: 'Building consistency through daily habits',
        reason: 'Small daily actions lead to big changes',
        priority: 'high',
        action: 'Check off a habit in your list'
      });
    }

    recommendations.push(
      {
        type: 'wisdom_item',
        title: 'Daily Wisdom',
        description: 'Read a curated piece of wisdom to inspire your day',
        reason: 'Wisdom provides perspective and guidance',
        priority: 'medium',
        action: 'Visit the Wisdom Library'
      },
      {
        type: 'journal_prompt',
        title: 'Reflect on Your Progress',
        description: 'Take a moment to journal about your recent achievements',
        reason: 'Reflection helps consolidate learning and growth',
        priority: 'medium',
        action: 'Write in your journal'
      },
      {
        type: 'study_topic',
        title: 'Learn Something New',
        description: 'Dedicate time to learning and skill development',
        reason: 'Continuous learning is key to personal growth',
        priority: 'low',
        action: 'Start a study session'
      }
    );

    return recommendations;
  }

  async getWisdomRecommendations(userBookmarks = [], userInterests = []) {
    // Simple content-based filtering for wisdom items
    const recommendations = [];

    // If user has bookmarked stoic content, recommend more
    if (userBookmarks.some(b => b.category === 'stoicism')) {
      recommendations.push({
        type: 'wisdom_item',
        title: 'More Stoic Wisdom',
        description: 'Explore additional Stoic philosophy',
        reason: 'Based on your interest in Stoicism',
        priority: 'medium',
        action: 'Browse Stoicism category'
      });
    }

    // If user has psychology bookmarks, recommend related content
    if (userBookmarks.some(b => b.category === 'psychology')) {
      recommendations.push({
        type: 'wisdom_item',
        title: 'Psychological Insights',
        description: 'More frameworks for understanding human behavior',
        reason: 'Following your psychology interests',
        priority: 'medium',
        action: 'Check Psychology category'
      });
    }

    return recommendations;
  }
}

export default new RecommendationEngine();