// --- INITIALIZATION --- //
document.addEventListener('DOMContentLoaded', () => {
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
});

// --- ASTRONOMICAL CONSTANTS --- //
const LUNAR_CYCLE = 29.530588853;
const NEW_MOON_EPOCH = new Date('2000-01-06T18:14:00Z');

// --- GLOBAL STATE --- //
let lastRenderedDay = null;

// --- MOON PHASE CALCULATION --- //
function getMoonPhase(date) {
    const msInDay = 1000 * 60 * 60 * 24;
    const daysSinceEpoch = (date.getTime() - NEW_MOON_EPOCH.getTime()) / msInDay;
    const age = daysSinceEpoch % LUNAR_CYCLE;
    if (age < 1.84566) return { name: 'New Moon', emoji: '🌑', isMajor: true };
    if (age < 5.53699) return { name: 'Waxing Crescent', emoji: '🌒', isMajor: false };
    if (age < 9.22831) return { name: 'First Quarter', emoji: '🌓', isMajor: true };
    if (age < 12.91963) return { name: 'Waxing Gibbous', emoji: '🌔', isMajor: false };
    if (age < 16.61096) return { name: 'Full Moon', emoji: '🌕', isMajor: true };
    if (age < 20.30228) return { name: 'Waning Gibbous', emoji: '🌖', isMajor: false };
    if (age < 23.99361) return { name: 'Last Quarter', emoji: '🌗', isMajor: true };
    if (age < 27.68493) return { name: 'Waning Crescent', emoji: '🌘', isMajor: false };
    return { name: 'New Moon', emoji: '🌑', isMajor: true };
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
    if (now.getDate() !== lastRenderedDay) {
        renderAllCalendars();
        lastRenderedDay = now.getDate();
    }
}

// --- CALENDAR RENDERING --- //
function renderAllCalendars() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';

    // EDIT MONTHS/YEAR HERE, or make dynamic if preferred
    const monthsToDisplay = [6, 7, 8, 9, 10, 11]; // July to December (0-indexed)
    const year = 2025;

    monthsToDisplay.forEach(monthIndex => {
        const calendarHTML = createMonthCalendar(monthIndex, year);
        container.innerHTML += calendarHTML;
    });
}

function createMonthCalendar(monthIndex, year) {
    // Use the REAL system date for highlights
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let calendar = `<div class="calendar mb-6">
        <div class="calendar-header flex justify-between items-center mb-2">
            <span class="font-bold text-lg">${monthName} ${year}</span>
        </div>
        <div class="calendar-grid grid grid-cols-7 gap-1">
    `;

    // Days of week header
    daysOfWeek.forEach(day =>
        calendar += `<div class="calendar-day-header text-center font-bold">${day}</div>`
    );

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendar += `<div class="calendar-cell empty"></div>`;
    }

    // Days with lunar icons and today/major highlights
    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, monthIndex, d);
        const moon = getMoonPhase(cellDate);

        // Determine if this is "today"
        let cellClasses = "calendar-cell text-center p-1 rounded ";
        if (
            d === currentDay &&
            monthIndex === currentMonth &&
            year === currentYear
        ) {
            cellClasses += " today";
        } else if (moon.isMajor) {
            cellClasses += " major-phase";
        }

        calendar += `<div class="${cellClasses}">
            <div class="text-xl">${moon.emoji}</div>
            <div class="text-xs">${d}</div>
        </div>`;
    }

    calendar += `</div></div>`;
    return calendar;
}

