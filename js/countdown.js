/**
 * ----------------------------------------------------
 * 🎂 YOUR BIRTHDAY CONFIGURATION (Set Her Birthday Here!)
 * ----------------------------------------------------
 * month: Month number (1 = Jan, 2 = Feb, ..., 8 = Aug, 12 = Dec)
 * day: Day of the month (1 to 31)
 */
const YOUR_BIRTHDAY_CONFIG = {
  month: 9, // Set Month (1-12)
  day: 24   // Set Day (1-31)
};

/**
 * Romantic Birthday Countdown Engine
 */
document.addEventListener('DOMContentLoaded', () => {
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  const sectionTitle = document.querySelector('.birthday-section .section-title');
  const sectionSub = document.querySelector('.birthday-section .section-subtitle');

  const birthMonth = Math.max(0, Math.min(11, YOUR_BIRTHDAY_CONFIG.month - 1));
  const birthDay = Math.max(1, Math.min(31, YOUR_BIRTHDAY_CONFIG.day));

  function calculateTargetDate() {
    const now = new Date();
    let currentYear = now.getFullYear();

    let bdayEndThisYear = new Date(currentYear, birthMonth, birthDay, 23, 59, 59);

    if (now > bdayEndThisYear) {
      return new Date(currentYear + 1, birthMonth, birthDay, 0, 0, 0);
    } else {
      return new Date(currentYear, birthMonth, birthDay, 0, 0, 0);
    }
  }

  let targetDate = calculateTargetDate();

  function formatTwoDigits(num) {
    return String(Math.max(0, num)).padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const bdayStart = new Date(currentYear, birthMonth, birthDay, 0, 0, 0);
    const bdayEnd = new Date(currentYear, birthMonth, birthDay, 23, 59, 59);

    // --- CASE 2: ON THE BIRTHDAY DATE ITSELF ---
    if (now >= bdayStart && now <= bdayEnd) {
      if (cdDays) cdDays.textContent = '🎉';
      if (cdHours) cdHours.textContent = '🎂';
      if (cdMinutes) cdMinutes.textContent = '💖';
      if (cdSeconds) cdSeconds.textContent = '✨';

      if (sectionTitle) sectionTitle.textContent = "IT'S YOUR BIRTHDAY TODAY! 🎂🎉";
      if (sectionSub) sectionSub.textContent = 'Today is all about you! Happy Birthday my favorite person in the world! 💕✨';

      if (window.effectsEngine && Math.random() < 0.1) {
        window.effectsEngine.spawnSparkleBurst(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight * 0.6
        );
      }
      return;
    }

    // --- CASE 3: AFTER BIRTHDAY DATE (Rolls over to Next Year) ---
    if (now > bdayEnd) {
      targetDate = new Date(currentYear + 1, birthMonth, birthDay, 0, 0, 0);
    }

    // --- CASE 1: BEFORE BIRTHDAY DATE (Live Ticking Countdown) ---
    const diff = targetDate.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (sectionTitle) sectionTitle.textContent = 'Countdown to My Special Day 🎂✨';
    if (sectionSub) sectionSub.textContent = 'Counting down every second to the day my world became brighter — Your Birthday 💖';

    if (cdDays) cdDays.textContent = formatTwoDigits(days);
    if (cdHours) cdHours.textContent = formatTwoDigits(hours);
    if (cdMinutes) cdMinutes.textContent = formatTwoDigits(minutes);
    if (cdSeconds) cdSeconds.textContent = formatTwoDigits(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
