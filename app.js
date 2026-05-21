const apiKey = 'ZWPD26FNK8TNRY9ZQAWPWWKHG'; 

// 1. Turn fetchWeather into a function that accepts a location name
async function fetchWeather(location = "Luqa,Malta") {
    try {
        // Dynamic URL based on what location is passed in
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${apiKey}&contentType=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        const current = data.currentConditions;
        const today = data.days[0];
        const tomorrow = data.days[1];

        // ... Keep ALL your existing display logic here (Current Card, Moon, Legal Times, Forecast) ...
        // (Just make sure you don't accidentally delete your inner code!)

   } catch (e) {
        console.error("Weather Fetch Error: ", e);
    }
}

// 2. Listen for the dropdown changing on the screen
document.addEventListener('DOMContentLoaded', () => {
    const locSelect = document.getElementById('location-select');
    
    if (locSelect) {
        locSelect.addEventListener('change', (event) => {
            // When the user picks a new town, fetch the new weather!
            fetchWeather(event.target.value);
        });
    }
});

// 3. Initial load when the app first opens
fetchWeather("Luqa,Malta");

// --- HELPER FUNCTIONS ---

function getUpcomingMoonPhases(currentPhase, currentDate) {
    const cycleDays = 29.53;
    const phases = [
        { name: 'New Moon', target: 0, icon: '🌑' },
        { name: '1st Quarter', target: 0.25, icon: '🌓' },
        { name: 'Full Moon', target: 0.5, icon: '🌕' },
        { name: 'Last Quarter', target: 0.75, icon: '🌗' }
    ];

    let results = [];
    const baseDate = new Date(currentDate);

    phases.forEach(p => {
        let diff = p.target - currentPhase;
        if (diff <= 0) diff += 1; 
        const daysAway = diff * cycleDays;
        const phaseDate = new Date(baseDate);
        phaseDate.setDate(baseDate.getDate() + Math.round(daysAway));
        results.push({
            name: p.name,
            icon: p.icon,
            daysAway: daysAway,
            date: phaseDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
        });
    });
    return results.sort((a, b) => a.daysAway - b.daysAway);
}

function getBeaufort(kmh) {
    if (kmh < 1) return 0;
    if (kmh <= 5) return 1;
    if (kmh <= 11) return 2;
    if (kmh <= 19) return 3;
    if (kmh <= 28) return 4;
    if (kmh <= 38) return 5;
    if (kmh <= 49) return 6;
    if (kmh <= 61) return 7;
    if (kmh <= 74) return 8;
    if (kmh <= 88) return 9;
    if (kmh <= 102) return 10;
    if (kmh <= 117) return 11;
    return 12;
}

function getWindDirection(deg) {
    const malteseWinds = [
        'Tramuntana (N)', 'Grig it-Tramuntana (NNE)', 'Grigal (NE)', 'Grig il-Lvant (ENE)', 
        'Lvant (E)', 'Xlokk il-Lvant (ESE)', 'Xlokk (SE)', 'Nofsinhar ix-Xlokk (SSE)', 
        'Nofsinhar (S)', 'Nofsinhar il-Lbiċ (SSW)', 'Lbiċ (SW)', 'Punent il-Lbiċ (WSW)', 
        'Punent (W)', 'Punent Majjistru (WNW)', 'Majjistral (NW)', 'Tramuntana Majjistru (NNW)'
    ];
    return malteseWinds[Math.round(deg / 22.5) % 16];
}

function getWeatherEmoji(iconId) {
    if (!iconId) return '☀️';
    const id = iconId.toLowerCase();
    if (id.includes('thunder')) return '⛈️';
    if (id.includes('rain') || id.includes('showers')) return '🌧️';
    if (id === 'cloudy') return '☁️';
    if (id.includes('partly-cloudy')) return '⛅';
    if (id.includes('clear')) return '☀️';
    if (id.includes('fog')) return '🌫️';
    if (id.includes('wind')) return '💨';
    return '☀️';
}

function getMoonPhaseName(phase) {
    if (phase === 0 || phase === 1) return 'New Moon';
    if (phase > 0 && phase < 0.25) return 'Waxing Crescent';
    if (phase === 0.25) return 'First Quarter';
    if (phase > 0.25 && phase < 0.5) return 'Waxing Gibbous';
    if (phase === 0.5) return 'Full Moon';
    if (phase > 0.5 && phase < 0.75) return 'Waning Gibbous';
    if (phase === 0.75) return 'Last Quarter';
    return 'Waning Crescent';
}

function modifyHours(timeStr, hoursToModify) {
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10) + hoursToModify;
    if (hours < 0) hours += 24;
    if (hours >= 24) hours -= 24;
    return `${String(hours).padStart(2, '0')}:${parts[1]}`;
}

const maltaHolidays = ['01-01', '02-10', '03-19', '03-31', '05-01', '06-07', '06-29', '08-15', '09-08', '09-21', '12-08', '12-13', '12-25'];

function isPublicHoliday(dateObj) {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return maltaHolidays.includes(`${month}-${day}`);
}

function calculateLegalTimes(sunriseStr, sunsetStr, dateStr) {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay(); 
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    const firstLight = modifyHours(sunriseStr, -2);
    let lastLight = (dayOfWeek === 0 || isPublicHoliday(targetDate)) ? "13:00" :
                    ((month === 9 && day >= 15) || (month === 10 && day <= 7)) ? "19:00" :
                    modifyHours(sunsetStr, 2);

    return { firstLight, lastLight };
}

function getActiveSeasons(dateStr) {
    const targetDate = new Date(dateStr);
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    let seasons = [];

    if ((month >= 9 && month <= 12) || (month === 1)) seasons.push({ label: (month === 1) ? "🦆 Bird Hunting Open Only" : "🦆 Bird Hunting Open", icon: "🦆", type: 'open' });
    if (month >= 6 && month <= 12) seasons.push({ label: (month < 9) ? "🐇 Rabbit Hunting Open Only" : "🐇 Rabbit Hunting Open", icon: "🐇", type: 'open' });
    if ((month === 10 && day >= 20) || (month === 11) || (month === 12) || (month === 1 && day <= 10)) seasons.push({ label: "🕸️ Trapping Season Open", icon: "🕸️", type: 'open' });

    if (seasons.length === 0) {
        let msg = (month >= 2 && month < 6) || (month === 6 && day < 1) ? "Next season opening: 1st June for Rabbit 🐇" : "Season Currently Closed";
        seasons.push({ label: msg, icon: "⏳", type: 'next' });
    }
    return seasons;
}

function formatDateString(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB'); 
}

// Universal UI Helper
const updateText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
};

// --- MAIN FETCH FUNCTION ---

async function fetchWeather() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const current = data.currentConditions;
        const todayData = data.days[0];
        const tomorrowData = data.days[1];

        // 0. Safety Check
        if (!document.getElementById('current-temp')) return;

        // 1. Basic Info
        updateText('today-date-header', `Today's Weather (${formatDateString(todayData.datetime)})`);
        updateText('tomorrow-date', formatDateString(tomorrowData.datetime));
        
        const currentIconEmoji = getWeatherEmoji(current.icon);
        updateText('current-temp', `${currentIconEmoji} ${Math.round(current.temp)}°C`);
        updateText('current-desc', current.conditions);
        updateText('wind-dir', getWindDirection(current.winddir));
        updateText('wind-bft', `${getBeaufort(current.windspeed)} BFT`);
        updateText('moon-phase', getMoonPhaseName(todayData.moonphase));

        // 2. Moon Calendar
        const moonCalContainer = document.getElementById('moon-calendar');
        if (moonCalContainer) {
            const upcomingPhases = getUpcomingMoonPhases(todayData.moonphase, todayData.datetime);
            moonCalContainer.innerHTML = ''; 
            upcomingPhases.forEach(phase => {
                moonCalContainer.innerHTML += `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);"><span>${phase.icon} ${phase.name}</span><span style="color: #a4b0be;">${phase.date}</span></div>`;
            });
        }

        // 3. Rain Tracker
        let rainTime = "No rain expected today";
        if (todayData.hours) {
            for (let hour of todayData.hours) {
                if (hour.precip > 0 && hour.precipprob > 30) {
                    rainTime = `Rain expected at ${hour.datetime.substring(0, 5)}`;
                    break;
                }
            }
        }
        updateText('rain-info', rainTime);

        // 4. Laws & Seasons
        const todayLaw = calculateLegalTimes(todayData.sunrise, todayData.sunset, todayData.datetime);
        const tomLaw = calculateLegalTimes(tomorrowData.sunrise, tomorrowData.sunset, tomorrowData.datetime);

        updateText('sunrise', todayData.sunrise.substring(0, 5));
        updateText('sunset', todayData.sunset.substring(0, 5));
        updateText('first-light', todayLaw.firstLight);
        updateText('last-light', todayLaw.lastLight);
        updateText('tom-sunrise', tomorrowData.sunrise.substring(0, 5));
        updateText('tom-sunset', tomorrowData.sunset.substring(0, 5));
        updateText('tom-first-light', tomLaw.firstLight);
        updateText('tom-last-light', tomLaw.lastLight);

        const todaySeasons = getActiveSeasons(todayData.datetime);
        const badgeContainer = document.getElementById('season-badge-container');
        const anyOpen = todaySeasons.some(s => s.type === 'open');

        if (badgeContainer) {
            badgeContainer.innerHTML = '';
            const todayBlock = document.getElementById('today-law-block');
            const tomBlock = document.getElementById('tomorrow-law-block');

            if (!anyOpen) {
                if (todayBlock) todayBlock.style.display = 'none';
                if (tomBlock) tomBlock.style.display = 'none';
                todaySeasons.forEach(s => {
                    badgeContainer.innerHTML += `<div style="background: rgba(236,204,104,0.1); color: #eccc68; padding: 20px; border-radius: 12px; text-align: center; border: 1px dashed #eccc68; margin: 20px 0;"><strong>${s.label}</strong></div>`;
                });
            } else {
                if (todayBlock) todayBlock.style.display = 'block';
                if (tomBlock) tomBlock.style.display = 'block';
                todaySeasons.forEach(s => {
                    badgeContainer.innerHTML += `<div style="background: rgba(116,185,255,0.1); color: #ffffff; padding: 8px 12px; border-radius: 6px; font-weight: bold; border: 1px solid #74b9ff; margin-bottom: 5px;">${s.label}</div>`;
                });
            }
        }

        // 5. Live Status
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const statusBox = document.getElementById('hunting-status-box');
        if (statusBox) {
            if (anyOpen && currentHHMM >= todayLaw.firstLight && currentHHMM <= todayLaw.lastLight) {
                statusBox.className = "status-box legal-hunting";
                updateText('hunting-status', "LEGAL HUNTING WINDOW OPEN");
                updateText('hunting-icon', `🟢 ${todaySeasons.filter(s => s.type==='open').map(s => s.icon).join(' ')}`);
            } else {
                statusBox.className = "status-box illegal-hunting";
                updateText('hunting-status', "HUNTING CLOSED / FORBIDDEN NOW");
                updateText('hunting-icon', "🛑");
            }
        }

        // 6. Forecast
        const forecastContainer = document.getElementById('forecast-container');
        if (forecastContainer) {
            forecastContainer.innerHTML = ''; 
            for (let i = 1; i <= 5; i++) {
                const day = data.days[i];
                const dateObj = new Date(day.datetime);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                forecastContainer.innerHTML += `
                    <div class="forecast-card">
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <strong>${dayName} (${dateObj.getDate()}/${dateObj.getMonth() + 1})</strong>
                            <strong>${Math.round(day.tempmax)}°C</strong>
                        </div>
                        <div style="font-size: 0.9rem; color: #a4b0be;">${getWeatherEmoji(day.icon)} ${day.conditions}</div>
                        <div style="font-size: 0.85rem; color: #ffffff; background: rgba(116, 185, 255, 0.15); padding: 3px 8px; border-radius: 4px; margin-top: 4px;">
                            💨 ${getWindDirection(day.winddir)} @ ${getBeaufort(day.windspeed)} BFT
                        </div>
                    </div>`;
            }
        }
    } catch (e) { 
        console.error("Weather failed to load:", e);
        updateText('current-desc', "Error loading data.");
    }
}

// Start the fetch
fetchWeather();

// --- TAB NAVIGATION ---
function openTab(tabId, btnElement) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
    window.scrollTo(0, 0);
}

// Register the Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered!', reg))
      .catch(err => console.log('Service Worker failed:', err));
  });
}
