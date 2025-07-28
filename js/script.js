// --- INITIALIZATION --- //
document.addEventListener('DOMContentLoaded', () => {
    updateClockAndDate();
    // Set an interval to update the clock every second.
    setInterval(updateClockAndDate, 1000);
});

// --- ASTRONOMICAL CONSTANTS --- //
// The average number of days from one new moon to the next.
const LUNAR_CYCLE = 29.530588853;
// A known new moon to use as a reference point for calculations.
const NEW_MOON_EPOCH = new Date('2000-01-06T18:14:00Z');

// --- GLOBAL STATE --- //
// Tracks the last day the calendar was rendered to avoid unnecessary redraws.
let lastRenderedDay = null;

// --- MOON PHASE + ILLUMINATION CALCULATION (REVISED & MORE ACCURATE) --- //
/**
 * Calculates moon phase, emoji, major phases, and illumination percentage for a given date.
 * This revised function uses a more robust method based on the fractional phase.
 * @param {Date} date - The date to calculate moon phase for.
 * @returns {object} - An object containing the phase name, emoji, major phase status, and illumination percentage.
 */
function getMoonPhase(date) {
    const msInDay = 1000 * 60 * 60 * 24;

    // Calculate the number of days that have passed since the known new moon epoch.
    const daysSinceEpoch = (date.getTime() - NEW_MOON_EPOCH.getTime()) / msInDay;
    
    // Calculate the current phase of the moon as a fraction from 0 to 1.
    // 0 = New Moon, 0.5 = Full Moon, 1 = next New Moon.
    const phase = (daysSinceEpoch / LUNAR_CYCLE) % 1;

    // Calculate the illumination percentage using a cosine function based on the phase.
    const illumination = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
    const illuminationPercent = Math.round(illumination * 100);

    // Determine the phase name and emoji based on the fractional phase.
    // These thresholds provide more accurate phase names than the previous version.
    if (phase < 0.03 || phase > 0.97) return { name: 'New Moon', emoji: '🌑', isMajor: true, illumination: illuminationPercent };
    if (phase < 0.22) return { name: 'Waxing Crescent', emoji: '🌒', isMajor: false, illumination: illuminationPercent };
    if (phase < 0.28) return { name: 'First Quarter', emoji: '🌓', isMajor: true, illumination: illuminationPercent };
    if (phase < 0.47) return { name: 'Waxing Gibbous', emoji: '🌔', isMajor: false, illumination: illuminationPercent };
    if (phase < 0.53) return { name: 'Full Moon', emoji: '🌕', isMajor: true, illumination: illuminationPercent };
    if (phase < 0.72) return { name: 'Waning Gibbous', emoji: '🌖', isMajor: false, illumination: illuminationPercent };
    if (phase < 0.78) return { name: 'Last Quarter', emoji: '🌗', isMajor: true, illumination: illuminationPercent };
    // If none of the above, it must be a Waning Crescent.
    return { name: 'Waning Crescent', emoji: '🌘', isMajor: false, illumination: illuminationPercent };
}


// --- LIVE CLOCK & DATE MANAGEMENT --- //
/**
 * Updates the live clock and checks if the calendar needs to be re-rendered.
 */
function updateClockAndDate() {
    const now = new Date();
    const clockElement = document.getElementById('live-clock');
    
    if (clockElement) {
        // Display the current date and time, formatted for the specified timezone.
        clockElement.textContent = now.toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Kolkata'
        });
    }

    // To optimize performance, only re-render the entire calendar if the day has changed.
    if (now.getDate() !== lastRenderedDay) {
        renderAllCalendars();
        lastRenderedDay = now.getDate();
    }
}

// --- CALENDAR RENDERING --- //
/**
 * Renders all monthly calendars inside the main container.
 */
function renderAllCalendars() {
    const container = document.getElementById('calendar-container');
    // Clear the container before rendering new calendars.
    container.innerHTML = '';

    // Define the months and year to be displayed.
    const monthsToDisplay = [6, 7, 8, 9, 10, 11]; // July to December (0-indexed)
    const year = 2025;

    // Create and append a calendar for each specified month.
    monthsToDisplay.forEach(monthIndex => {
        const calendarHTML = createMonthCalendar(monthIndex, year);
        container.innerHTML += calendarHTML;
    });
}

/**
 * Creates the HTML string for a single month's calendar.
 * @param {number} monthIndex - The 0-based month number (0=January).
 * @param {number} year - The four-digit year.
 * @returns {string} - The complete HTML string for one month's calendar grid.
 */
function createMonthCalendar(monthIndex, year) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0=Sunday, 1=Monday...
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Start building the HTML string for the calendar.
    let calendar = `<div class="calendar mb-6 max-w-md w-full bg-gray-800 rounded-lg p-3">
        <div class="calendar-header flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
            <span class="font-bold text-lg">${monthName} ${year}</span>
        </div>
        <div class="calendar-grid grid grid-cols-7 gap-1">`;

    // Add the day-of-the-week headers (S, M, T, etc.).
    daysOfWeek.forEach(day =>
        calendar += `<div class="calendar-day-header text-center font-semibold text-gray-400 text-xs">${day}</div>`
    );

    // Add empty cells for the days before the first day of the month.
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendar += `<div class="calendar-cell empty"></div>`;
    }

    // Add a cell for each day of the month.
    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, monthIndex, d);
        const moon = getMoonPhase(cellDate);

        // Determine the CSS classes for the cell (e.g., for today's date, major phases).
        let cellClasses = "calendar-cell text-center p-1 rounded cursor-default select-none ";
        if (d === currentDay && monthIndex === currentMonth && year === currentYear) {
            cellClasses += "today"; // Special style for the current day.
        } else if (moon.isMajor) {
            cellClasses += "major-phase"; // Special style for major moon phases.
        } else {
            cellClasses += "hover:bg-gray-700";
        }

        // Add the cell's HTML, including the emoji, day number, and illumination percentage.
        calendar += `<div class="${cellClasses}">
            <div class="text-xl">${moon.emoji}</div>
            <div class="text-xs font-medium">${d}</div>
            <div class="text-[10px] text-gray-400">${moon.illumination}%</div>
        </div>`;
    }

    // Close the grid and the calendar container divs.
    calendar += `</div></div>`;
    return calendar;
}
