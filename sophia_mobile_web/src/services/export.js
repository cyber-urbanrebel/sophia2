// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

class ExportService {
  // Export habits data as CSV
  exportHabitsCSV(habits) {
    const headers = ['Name', 'Description', 'Frequency', 'Target Count', 'Streak', 'Longest Streak', 'Completed Today'];
    const rows = habits.map(habit => [
      habit.name,
      habit.description || '',
      habit.frequency,
      habit.targetCount,
      habit.streak,
      habit.longestStreak,
      habit.completedToday ? 'Yes' : 'No'
    ]);

    this.downloadCSV('habits.csv', [headers, ...rows]);
  }

  // Export goals data as CSV
  exportGoalsCSV(goals) {
    const headers = ['Title', 'Description', 'Category', 'Target Date', 'Progress %', 'Status'];
    const rows = goals.map(goal => [
      goal.title,
      goal.description || '',
      goal.category,
      goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '',
      goal.progressPercentage,
      goal.status
    ]);

    this.downloadCSV('goals.csv', [headers, ...rows]);
  }

  // Export journal entries as CSV
  exportJournalCSV(entries) {
    const headers = ['Date', 'Content', 'Mood', 'Tags'];
    const rows = entries.map(entry => [
      new Date(entry.date).toLocaleDateString(),
      entry.content,
      entry.mood || '',
      (entry.tags || []).join(', ')
    ]);

    this.downloadCSV('journal.csv', [headers, ...rows]);
  }

  // Export study sessions as CSV
  exportStudyCSV(sessions) {
    const headers = ['Date', 'Duration (min)', 'Subject', 'Techniques', 'Notes'];
    const rows = sessions.map(session => [
      new Date(session.date).toLocaleDateString(),
      session.duration,
      session.subject || '',
      (session.techniques || []).join(', '),
      session.notes || ''
    ]);

    this.downloadCSV('study-sessions.csv', [headers, ...rows]);
  }

  // Generate comprehensive weekly progress PDF report
  async generateWeeklyReport(userData, weekStart = new Date()) {
    // Temporarily disabled - PDF generation requires jsPDF
    console.log('Weekly report generation - PDF export temporarily disabled');
    console.log('User data:', userData);
    alert('PDF export is temporarily disabled. Check console for data.');
  }

  // Generate monthly summary PDF
  async generateMonthlyReport(userData, month = new Date()) {
    // Temporarily disabled - PDF generation requires jsPDF
    console.log('Monthly report generation - PDF export temporarily disabled');
    console.log('User data:', userData);
    alert('PDF export is temporarily disabled. Check console for data.');
  }

  calculateAchievements(userData) {
    const achievements = [];

    // Habit achievements
    const longStreaks = userData.habits?.filter(h => h.longestStreak >= 30) || [];
    if (longStreaks.length > 0) {
      achievements.push(`${longStreaks.length} habit(s) with 30+ day streaks`);
    }

    // Goal achievements
    const completedGoals = userData.goals?.filter(g => g.status === 'completed') || [];
    if (completedGoals.length > 0) {
      achievements.push(`${completedGoals.length} goal(s) completed`);
    }

    // Study achievements
    if (userData.study?.totalMinutes >= 1000) {
      achievements.push('1000+ minutes of study time');
    }

    // Journal achievements
    if (userData.journal?.totalEntries >= 30) {
      achievements.push('30+ journal entries');
    }

    return achievements;
  }

  // Utility function to download CSV
  downloadCSV(filename, data) {
    const csvContent = data.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export default new ExportService();