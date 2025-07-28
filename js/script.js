// --- INITIALIZATION ---
// This event listener ensures the script runs after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    updateClockAndDate(); 
    setInterval(updateClockAndDate, 1000); // Update the clock every second
});

// --- ASTRONOMICAL CONSTANTS ---
const LUNAR_CYCLE = 29.530588853; // The average length of a lunar month
// A known new moon, serves as a reference point (epoch) for calculations.
const NEW_MOON_EPOCH = new Date('2000-01-06T18:14:00Z');

// --- GLOBAL STATE ---
let lastRenderedDay = null; // Tracks the last day rendered to avoid unnecessary re-draws

/**
 * Calculates the moon phase for a given date.
 * @param {Date} date - The date to calculate the phase for.
 * @returns {object} An object with phase name, emoji, and if it's a major phase.
 */
function getMoonPhase(date) {
    const msInDay = 1000 * 60 * 60 * 24;
    // Calculate how many days have passed since our known new moon
    const daysSinceEpoch = (date.getTime() - NEW_MOON_EPOCH.getTime()) / msInDay;
    // Get the remainder to find the "age" of the moon in the current cycle
    const age = daysSinceEpoch % LUNAR_CYCLE;

    // Determine phase based on age (in days)
    if (age < 1.84566) return { name: 'New Moon', emoji: '🌑', isMajor: true };
    if (age < 5.53699) return { name: 'Waxing Crescent', emoji: '🌒', isMajor: false };
    if (age < 9.22831) return { name: 'First Quarter', emoji: '🌓', isMajor: true };
    if (age < 12.91963) return { name: 'Waxing Gibbous', emoji: '🌔', isMajor: false };
    if (age < 16.61096) return { name: 'Full Moon', emoji: '🌕', isMajor: true };
    if (age < 20.30228) return { name: 'Waning Gibbous', emoji: '🌖', isMajor: false };
    if (age < 23.99361) return { name: 'Last Quarter', emoji: '🌗', isMajor: true };
    if (age < 27.68493) return { name: 'Waning Crescent', emoji: '🌘', isMajor: false };
    return { name: 'New Moon', emoji: '🌑', isMajor: true }; // Nearing new moon again
}

/**
 * Updates the live clock and checks if the date has changed, triggering a re-render if it has.
 */
function updateClockAndDate() {
    const now = new Date();
    const clockElement = document.getElementById('live-clock');
    
    if (clockElement) {
        // Format the date and time for Chennai's time zone
        clockElement.textContent = now.toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Kolkata'
        });
    }

    // If the day has changed since the last check, re-render all the calendars
    if (now.getDate() !== lastRenderedDay) {
        renderAllCalendars();
        lastRenderedDay = now.getDate();
    }
}

/**
 * Renders all calendars defined in the configuration.
 */
function renderAllCalendars() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = ''; // Clear previous calendars before re-rendering
    
    // --- CONFIGURATION ---
    const monthsToDisplay = [6, 7, 8, 9, 10, 11]; // July to December (JS months are 0-indexed)
    const year = 2025;

    monthsToDisplay.forEach(monthIndex => {
        const calendarHTML = createMonthCalendar(monthIndex, year);
        container.innerHTML += calendarHTML;
    });
}

/**
 * Creates the complete HTML string for a single month's calendar.
 * @param {number} monthIndex - The month index (0-11).
 * @param {number} year - The full year.
 * @returns {string} The HTML string for the calendar.
 */
function createMonthCalendar(monthIndex, year) {
    // --- SIMULATED DATE FOR DEMO ---
    // To show the 'today' feature, we pretend today is July 28, 2025.
    // To use the REAL current date, replace this line with: const today = new Date();
    const today = new Date('2025-07-28T15:47:00'); 
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0=Sun, 1=Mon, ...

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let calendar = `<div class="bg-gray-800 rounded-lg p-3 w-full max-w-sm shadow-2xl border border-gray-700">`;
    calendar += `<h3 class="text-xl font-semibold text-center text-yellow-400 mb-3">${monthName} ${year}</h3>`;
    
    calendar += `<div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 font-bold mb-2">`;
    daysOfWeek.forEach(day => calendar += `<div>${day}</div>`);
    calendar += `</div>`;

    calendar += `<div class="grid grid-cols-7 gap-1">`;

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) calendar += `<div></div>`;

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDay && monthIndex === currentMonth && year === currentYear;
        const cellDate = new Date(year, monthIndex, day);
        const phase = getMoonPhase(cellDate);
        
        let dayClasses = ['h-14', 'rounded-lg', 'flex', 'flex-col', 'items-center', 'justify-center', 'transition-all', 'duration-300', 'ease-in-out', 'relative', 'text-xs'];
        let dayContent = `<span class="text-2xl">${phase.emoji}</span><span>${day}</span>`;

        if (phase.isMajor) {
            dayClasses.push('major-phase');
        }
        
        if (isToday) {
            dayClasses.push('today');
        }
        
        calendar += `<div class="${dayClasses.join(' ')}">${dayContent}</div>`;
    }
    calendar += `</div></div>`; // Close grid and card
    return calendar;
}
