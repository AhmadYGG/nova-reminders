export async function register() {
  // Only run on server side, not during build
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startReminderScheduler } = await import('./lib/scheduler');
    startReminderScheduler();
  }
}
