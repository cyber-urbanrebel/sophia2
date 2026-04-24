class NotificationService {
  constructor() {
    this.permission = null;
    this.registration = null;
  }

  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    if ('Notification' in window) {
      this.permission = Notification.permission;
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    try {
      if (this.registration) {
        await this.registration.showNotification(title, defaultOptions);
      } else {
        new Notification(title, defaultOptions);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Habit reminder notifications
  async scheduleHabitReminder(habitName, time = '09:00') {
    if (this.permission !== 'granted') return;

    // For now, we'll use a simple timeout. In production, you'd want to use
    // a more robust scheduling system or background sync
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification(
        'Habit Reminder',
        {
          body: `Don't forget to complete your habit: ${habitName}`,
          tag: `habit-${habitName}`,
          actions: [
            { action: 'complete', title: 'Mark Complete' },
            { action: 'snooze', title: 'Remind Later' }
          ]
        }
      );
    }, delay);
  }

  // Goal progress reminders
  async showGoalReminder(goalTitle, progressPercent) {
    if (this.permission !== 'granted') return;

    this.showNotification(
      'Goal Progress Update',
      {
        body: `${goalTitle} is at ${progressPercent}% complete. Keep up the great work!`,
        tag: 'goal-progress',
        icon: '/goal-icon.png'
      }
    );
  }

  // Study session reminders
  async showStudyReminder(subject) {
    if (this.permission !== 'granted') return;

    this.showNotification(
      'Study Time!',
      {
        body: `Time for your study session${subject ? ` in ${subject}` : ''}`,
        tag: 'study-reminder',
        actions: [
          { action: 'start', title: 'Start Now' },
          { action: 'later', title: '15 min' }
        ]
      }
    );
  }

  // Journal reminders
  async showJournalReminder() {
    if (this.permission !== 'granted') return;

    this.showNotification(
      'Journal Reminder',
      {
        body: 'Take a moment to reflect on your day. Your future self will thank you!',
        tag: 'journal-reminder',
        actions: [
          { action: 'write', title: 'Write Now' },
          { action: 'tomorrow', title: 'Tomorrow' }
        ]
      }
    );
  }

  // Check if notifications are supported and enabled
  isSupported() {
    return 'Notification' in window;
  }

  getPermissionStatus() {
    return this.permission || Notification.permission;
  }
}

export default new NotificationService();