// --- INITIALIZATION --- //
document.addEventListener('DOMContentLoaded', () => {
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
});

// --- ASTRONOMICAL CONSTANTS --- //
const LUNAR_CYCLE = 29.530588853; // Average length of lunar month in days
const NEW_MOON_EPOCH = new Date('2000-01-06T18:14:00Z'); // Known new moon reference epoch UTC

// --- GLOBAL STATE --- //
let lastRenderedDay = null;

// --- MOON PHASE + ILLUMINATION CALCULATION --- //
/**
 * Calculates moon phase, emoji, major phases, and illumination percentage for a given date.
 * @param {Date} date - The date to calculate moon phase for.
 * @returns {object} - { name, emoji, isMajor, illumination }
 */
function getMoonPhase(date) {
    const msInDay = 1000 * 60 * 60 * 24;

    // Days since known new moon epoch
    let daysSinceEpoch = (date.getTime() - NEW_MOON_EPOCH.getTime()) / msInDay;

    // Normalize daysSinceEpoch for positive remainder
    daysSinceEpoch = daysSinceEpoch - Math.floor(daysSinceEpoch / LUNAR_CYCLE) * LUNAR_CYCLE;

    // Compute illumination fraction: 0 to 1
    // Formula: 0.5 * (1 - cos(2 * pi * age / lunar cycle))
    const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * daysSinceEpoch / LUNAR_CYCLE));
    const illuminationPercent = Math.round(illumination * 100);

    // Assign phases based on lunar "age" with refined ranges for better accuracy
    const age = daysSinceEpoch;

    /*
    Adjusted phase thresholds for better clarity:
    New Moon: 0 - 1.84566 days
    Waxing Crescent: 1.84566 - 5.53699
    First Quarter: 5.53699 - 9.22831
    Waxing Gibbous: 9.22831 - 12.91963
    Full Moon: 12.91963 - 16.61096
    Waning Gibbous: 16.61096 - 20.30228
    Last Quarter: 20.30228 - 23.99361
    Waning Crescent: 23.99361 - 27.68493
    New Moon: 27.68493 - 29.530588853 (cycle end)
    */

    // Assign phase with emoji, indicating major phases
    if (age < 1.84566 || age >= 27.68493) return { name: 'New Moon', emoji: '🌑', isMajor: true, illumination: illuminationPercent };
    else if (age < 5.53699) return { name: 'Waxing Crescent', emoji: '🌒', isMajor: false, illumination: illuminationPercent };
    else if (age < 9.22831) return { name: 'First Quarter', emoji: '🌓', isMajor: true, illumination: illuminationPercent };
    else if (age < 12.91963) return { name: 'Waxing Gibbous', emoji: '🌔', isMajor: false, illumination: illuminationPercent };
    else if (age < 16.61096) return { name: 'Full Moon', emoji: '🌕', isMajor: true, illumination: illuminationPercent };
    else if (age < 20.30228) return { name: 'Waning Gibbous', emoji: '🌖', isMajor: false, illumination: illuminationPercent };
    else if (age < 23.99361) return { name: 'Last Quarter', emoji: '🌗', isMajor: true, illumination: illuminationPercent };
    else if (age < 27.68493) return { name: 'Waning Crescent', emoji: '🌘', isMajor: false, illumination: illuminationPercent };

    // Fallback (should not reach here)
    return { name: 'New Moon', emoji: '🌑', isMajor: true, illumination: illuminationPercent };
}

// --- LIVE CLOCK --- //
function updateClockAndDate() {
    const now = new Date();
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        clockElement.textContent = now.toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Kolkata'
        });
    }
    // Only re-render calendars if day has changed
    if (now.getDate() !== lastRenderedDay) {
        renderAllCalendars();
        lastRenderedDay = now.getDate();
    }
}

// --- CALENDAR RENDERING --- //
/**
 * Renders all monthly calendars inside the container.
 */
function renderAllCalendars() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';

    // Months to display: July to December 2025 (0-indexed)
    const monthsToDisplay = [6, 7, 8, 9, 10, 11];
    const year = 2025;

    monthsToDisplay.forEach(monthIndex => {
        const calendarHTML = createMonthCalendar(monthIndex, year);
        container.innerHTML += calendarHTML;
    });
}

/**
 * Creates a single month's calendar HTML string.
 * @param {number} monthIndex - 0-based month number (0=Jan)
 * @param {number} year - Four digit year
 * @returns {string} - HTML string for the month calendar
 */
function createMonthCalendar(monthIndex, year) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let calendar = `<div class="calendar mb-6 max-w-md w-full bg-gray-800 rounded-lg p-3">
        <div class="calendar-header flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
            <span class="font-bold text-lg">${monthName} ${year}</span>
        </div>
        <div class="calendar-grid grid grid-cols-7 gap-1">`;

    // Days of week header
    daysOfWeek.forEach(day =>
        calendar += `<div class="calendar-day-header text-center font-semibold text-gray-400 text-xs">${day}</div>`
    );

    // Leading empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendar += `<div class="calendar-cell empty"></div>`;
    }

    // Days with lunar icons, today's highlight, major phase highlights, and illumination percentage
    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, monthIndex, d);
        const moon = getMoonPhase(cellDate);

        let cellClasses = "calendar-cell text-center p-1 rounded cursor-default select-none ";
        if (
            d === currentDay &&
            monthIndex === currentMonth &&
            year === currentYear
        ) {
            cellClasses += "today"; // Highlight today's date
        } else if (moon.isMajor) {
            cellClasses += "major-phase"; // Highlight major phases
        } else {
            cellClasses += "hover:bg-gray-700";
        }

        calendar += `<div class="${cellClasses}">
            <div class="text-xl">${moon.emoji}</div>
            <div class="text-xs font-medium">${d}</div>
            <div class="text-[10px] text-gray-400">${moon.illumination}%</div>
        </div>`;
    }

    calendar += `</div></div>`;
    return calendar;
}


