// ============================================================================
// 0. Configurable JAKIM Prayer Time Fetcher for Malaysia Zones
// ============================================================================

// Popular JAKIM Prayer Zones
const JAKIM_ZONES = {
    "PNG01": { name: "Penang (Pulau Pinang)", lat: 5.4164, lon: 100.3327 },
    "WLP01": { name: "Kuala Lumpur / Putrajaya", lat: 3.1390, lon: 101.6869 },
    "JHR01": { name: "Johor Bahru", lat: 1.4927, lon: 103.7414 },
    "SGR01": { name: "Selangor (Shah Alam)", lat: 3.0738, lon: 101.5183 },
    "PRK01": { name: "Perak (Ipoh)", lat: 4.5975, lon: 101.0901 },
    "KDH01": { name: "Kedah (Alor Setar)", lat: 6.1248, lon: 100.3678 },
    "PNG02": { name: "Balik Pulau / Seberang Perai", lat: 5.3533, lon: 100.2431 },
    "SWK01": { name: "Sarawak (Kuching)", lat: 1.5533, lon: 110.3592 },
    "SBH01": { name: "Sabah (Kota Kinabalu)", lat: 5.9804, lon: 116.0735 }
};

const DEFAULT_ZONE = "PNG01";

function getSelectedZone() {
    try {
        const stored = localStorage.getItem("penang_jakim_selected_zone");
        if (stored && JAKIM_ZONES[stored]) return stored;
    } catch (_) {}
    return DEFAULT_ZONE;
}

function setSelectedZone(zoneCode) {
    try {
        localStorage.setItem("penang_jakim_selected_zone", zoneCode);
    } catch (_) {}
}

const FALLBACK_PRAYERS = [
    { name: "Subuh", hour: 6, min: 0 },
    { name: "Syuruk", hour: 7, min: 10 },
    { name: "Zohor", hour: 13, min: 15 },
    { name: "Asar", hour: 16, min: 30 },
    { name: "Maghrib", hour: 19, min: 20 },
    { name: "Isyak", hour: 20, min: 30 }
];

let cachedPrayers = null;
let cachedPrayerKey = null;

function parsePrayerTimeValue(val) {
    if (typeof val === "number") {
        const dt = new Date(val * 1000);
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kuala_Lumpur",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).format(dt);
        const [hour, min] = parts.split(":").map(Number);
        return { hour, min };
    }
    if (typeof val === "string") {
        const clean = val.trim().split(" ")[0];
        const [hour, min] = clean.split(":").map(Number);
        if (!Number.isNaN(hour) && !Number.isNaN(min)) {
            return { hour, min };
        }
    }
    return null;
}

async function getPrayerTimesForZone(zoneCode, now = new Date()) {
    const mytParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(now);

    const year = Number(mytParts.find(p => p.type === "year").value);
    const month = Number(mytParts.find(p => p.type === "month").value);
    const day = Number(mytParts.find(p => p.type === "day").value);
    const cacheKey = `${zoneCode}_${year}-${month}-${day}`;

    if (cachedPrayers && cachedPrayerKey === cacheKey) {
        return cachedPrayers;
    }

    const storageKey = `jakim_prayers_${cacheKey}`;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length >= 5) {
                cachedPrayers = parsed;
                cachedPrayerKey = cacheKey;
                return parsed;
            }
        }
    } catch (_) {}

    // Primary API: Waktu Solat v2 (Official JAKIM e-Solat mirror)
    try {
        const res = await fetch(`https://api.waktusolat.app/v2/solat/${zoneCode}?year=${year}&month=${month}`);
        if (res.ok) {
            const data = await res.json();
            const todayEntry = Array.isArray(data.prayers)
                ? data.prayers.find(p => Number(p.day) === day)
                : null;

            if (todayEntry) {
                const mapping = [
                    { name: "Subuh", raw: todayEntry.fajr },
                    { name: "Syuruk", raw: todayEntry.syuruk },
                    { name: "Zohor", raw: todayEntry.dhuhr },
                    { name: "Asar", raw: todayEntry.asr },
                    { name: "Maghrib", raw: todayEntry.maghrib },
                    { name: "Isyak", raw: todayEntry.isha }
                ];
                const parsedList = mapping
                    .map(item => {
                        const hm = parsePrayerTimeValue(item.raw);
                        return hm ? { name: item.name, hour: hm.hour, min: hm.min } : null;
                    })
                    .filter(Boolean);

                if (parsedList.length >= 5) {
                    cachedPrayers = parsedList;
                    cachedPrayerKey = cacheKey;
                    try { localStorage.setItem(storageKey, JSON.stringify(parsedList)); } catch (_) {}
                    return parsedList;
                }
            }
        }
    } catch (err) {
        console.warn("Primary JAKIM API unreachable, trying Aladhan fallback:", err);
    }

    // Secondary Fallback API: Aladhan (Method 17 = JAKIM)
    try {
        const zoneInfo = JAKIM_ZONES[zoneCode] || JAKIM_ZONES[DEFAULT_ZONE];
        const ddMmYyyy = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
        const fallbackUrl = `https://api.aladhan.com/v1/timings/${ddMmYyyy}?latitude=${zoneInfo.lat}&longitude=${zoneInfo.lon}&method=17`;
        const res = await fetch(fallbackUrl);
        if (res.ok) {
            const json = await res.json();
            const t = json?.data?.timings;
            if (t) {
                const mapping = [
                    { name: "Subuh", raw: t.Fajr },
                    { name: "Syuruk", raw: t.Sunrise },
                    { name: "Zohor", raw: t.Dhuhr },
                    { name: "Asar", raw: t.Asr },
                    { name: "Maghrib", raw: t.Maghrib },
                    { name: "Isyak", raw: t.Isha }
                ];
                const parsedList = mapping
                    .map(item => {
                        const hm = parsePrayerTimeValue(item.raw);
                        return hm ? { name: item.name, hour: hm.hour, min: hm.min } : null;
                    })
                    .filter(Boolean);

                if (parsedList.length >= 5) {
                    cachedPrayers = parsedList;
                    cachedPrayerKey = cacheKey;
                    try { localStorage.setItem(storageKey, JSON.stringify(parsedList)); } catch (_) {}
                    return parsedList;
                }
            }
        }
    } catch (err) {
        console.warn("Aladhan fallback API unreachable, using defaults:", err);
    }

    return FALLBACK_PRAYERS;
}

function formatMalayPrayerTime(hour, min) {
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minPadded = String(min).padStart(2, "0");

    let period = "malam";
    if (hour >= 4 && hour < 12) period = "pagi";
    else if (hour === 12) period = "tengah hari";
    else if (hour >= 13 && hour < 19) period = "petang";

    return `${hour12}:${minPadded} ${period}`;
}

// ============================================================================
// 1. Multi-Timezone & Prayer Time Banner Formatter
// ============================================================================

async function getFormattedDateInfo() {
    const now = new Date();
    const currentZoneCode = getSelectedZone();
    const zoneDetails = JAKIM_ZONES[currentZoneCode] || JAKIM_ZONES[DEFAULT_ZONE];

    // 1. Malaysia Time (Current System Time / MYT)
    const myTimeFormat = new Intl.DateTimeFormat('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const myDateFormat = new Intl.DateTimeFormat('ms-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const myTimeFullFormat = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'shortOffset'
    });

    const myDateStr = myDateFormat.format(now);
    const myTimeFullStr = myTimeFullFormat.format(now);

    const myHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', hour12: false }).format(now), 10);
    const myMin = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', minute: 'numeric' }).format(now), 10);

    let myGreeting = "malam 🌑";
    if (myHour >= 6 && myHour < 12) myGreeting = "pagi 🌅";
    else if (myHour >= 12 && myHour < 15) myGreeting = "tengah hari ☀️";
    else if (myHour >= 15 && myHour < 19) myGreeting = "petang 🌇";

    // Live JAKIM Prayer Times for selected zone
    const prayers = await getPrayerTimesForZone(currentZoneCode, now);
    let nextPrayer = prayers[0];
    let isTomorrow = true;

    for (let i = 0; i < prayers.length; i++) {
        if (myHour < prayers[i].hour || (myHour === prayers[i].hour && myMin < prayers[i].min)) {
            nextPrayer = prayers[i];
            isTomorrow = false;
            break;
        }
    }

    const prayerTimeFormatted = formatMalayPrayerTime(nextPrayer.hour, nextPrayer.min);
    const tomorrowSuffix = isTomorrow ? " (esok)" : "";

    const timeFormattedMy = myTimeFormat.format(now).replace('PG', '').replace('PTG', '').trim();

    const myMain = `sekarang sudah jam ${timeFormattedMy} ${myGreeting}`;
    const mySubtitle = `${myDateStr} 🕐 ${myTimeFullStr} 🗺️ ${zoneDetails.name}. Waktu solat berikutnya: ${nextPrayer.name}${tomorrowSuffix} pada jam ${prayerTimeFormatted}`;

    // 2. Saudi Arabia Time
    const saudiTimeFormat = new Intl.DateTimeFormat('ar-SA', {
        timeZone: 'Asia/Riyadh',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const saudiHijriFormat = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        timeZone: 'Asia/Riyadh',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const saudiHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', hour: 'numeric', hour12: false }).format(now), 10);
    let saudiGreeting = "مساءً 🌑";
    if (saudiHour >= 5 && saudiHour < 12) saudiGreeting = "صباحاً 🌅";
    else if (saudiHour >= 12 && saudiHour < 15) saudiGreeting = "ظهراً ☀️";
    else if (saudiHour >= 15 && saudiHour < 18) saudiGreeting = "عصراً 🌇";

    const saudiMain = `الوقت الآن هو ${saudiTimeFormat.format(now)} ${saudiGreeting}`;
    const saudiSubtitle = `${saudiHijriFormat.format(now)} 🕐 ${new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'shortOffset', hour12: false }).format(now)} 🗺️ Riyadh, Mecca, Medina.`;

    // 3. Melbourne Time
    const melbTimeFormat = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Melbourne',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const melbDateFormat = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Melbourne',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const melbHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: 'numeric', hour12: false }).format(now), 10);
    const melbMin = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', minute: 'numeric' }).format(now), 10);

    let melbTimeStr = melbTimeFormat.format(now);
    if (melbMin >= 25 && melbMin <= 35) melbTimeStr = `half past ${melbHour > 12 ? melbHour - 12 : melbHour}`;

    let melbGreeting = "night time 🌑";
    if (melbHour >= 6 && melbHour < 12) melbGreeting = "morning 🌅";
    else if (melbHour >= 12 && melbHour < 17) melbGreeting = "afternoon ☀️";
    else if (melbHour >= 17 && melbHour < 19) melbGreeting = "getting dark 🌇";

    const melbTimeZoneName = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', timeZoneName: 'short' }).format(now).split(' ').pop();
    const isDST = melbTimeZoneName === 'AEDT';

    const melbMain = `it's ${melbTimeStr} ${melbGreeting} when it's melbourne`;
    const melbSubtitle = `${melbDateFormat.format(now)} 🕐 ${new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)} ${melbTimeZoneName} 🗺️ Melbourne, Victoria. ${isDST ? 'Currently observing Daylight Saving Time.' : 'Not in Daylight Saving Time.'}`;

    // 4. One-liner Summary
    const myShortDate = new Intl.DateTimeFormat('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    const myShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const saudiShortDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { timeZone: 'Asia/Riyadh', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const saudiShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const melbShortDate = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const melbShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const oneLiner = `${myShortDate} 🇲🇾 ${myShortTime} (${zoneDetails.name.split(' ')[0]}: ${nextPrayer.name} ${prayerTimeFormatted}) | ${saudiShortDate} 🇸🇦 ${saudiShortTime} | ${melbShortDate} 🇦🇺 ${melbShortTime} ${melbTimeZoneName} ☀️`;

    return [
        { main: myMain, sub: mySubtitle },
        { main: saudiMain, sub: saudiSubtitle },
        { main: melbMain, sub: melbSubtitle },
        { main: oneLiner, sub: null }
    ];
}

// ============================================================================
// 2. XOR Flag & Link Generator Logic
// ============================================================================

function calculateXorFlag() {
    const now = new Date();
    const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();
    const has31Days = daysInMonth === 31;

    const melbourneOffset = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Melbourne",
        timeZoneName: "short"
    })
        .formatToParts(now)
        .find(p => p.type === "timeZoneName")?.value || "";

    const melbShortOffset = new Intl.DateTimeFormat("en-US", {
        timeZone: "Australia/Melbourne",
        timeZoneName: "shortOffset"
    })
        .formatToParts(now)
        .find(p => p.type === "timeZoneName")?.value || "";

    const dstActive = melbourneOffset.includes("AEDT") || melbShortOffset.includes("+11");

    return has31Days !== dstActive; // XOR
}

function generateLink(timeHHMM, xorFlag) {
    const now = new Date();
    const systemHour = now.getHours();

    const saudiTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).format(now);

    const selectedTime =
        systemHour > 12 && systemHour < 24
            ? saudiTime
            : timeHHMM;

    if (selectedTime && typeof xorFlag === "boolean") {
        return "file/d/1rwvqr1fF44gXUbg4wqJ9xg6s1PGVqewr/view?usp=drivesdk";
    }
    return "";
}

function isTimeWithinTolerance(inputHHMM, targetHHMM, toleranceMinutes = 1) {
    if (!/^\d{2}:\d{2}$/.test(inputHHMM)) return false;
    const [inH, inM] = inputHHMM.split(":").map(Number);
    const [tgH, tgM] = targetHHMM.split(":").map(Number);
    if (inH < 0 || inH > 23 || inM < 0 || inM > 59) return false;

    const inTotal = inH * 60 + inM;
    const tgTotal = tgH * 60 + tgM;
    const diff = Math.abs(inTotal - tgTotal);
    return diff <= toleranceMinutes || 1440 - diff <= toleranceMinutes;
}

// ============================================================================
// 3. UI Injection & Enterprise Portal Setup
// ============================================================================

function injectEnterpriseStyles() {
    if (document.getElementById("tp-enterprise-styles")) return;
    const style = document.createElement("style");
    style.id = "tp-enterprise-styles";
    style.textContent = `
        #navbar-first-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #tp-unlock-gate {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 12px;
            font-family: 'Lato', sans-serif;
        }
        #tp-zone-select,
        #tp-time-input,
        #tp-xor-toggle {
            font-family: 'Lato', sans-serif;
            font-size: 11px;
            border: 1px solid rgba(255, 255, 255, 0.35);
            border-radius: 3px;
            background: rgba(0, 0, 0, 0.2);
            color: inherit;
            outline: none;
        }
        #tp-zone-select {
            padding: 2px 4px;
            max-width: 130px;
        }
        #tp-zone-select option {
            background: #0b2545;
            color: #ffffff;
        }
        #tp-time-input {
            width: 50px;
            padding: 2px 4px;
            text-align: center;
        }
        #tp-xor-toggle {
            padding: 2px 6px;
            font-weight: 700;
            cursor: pointer;
        }
        #tp-unlock-btn {
            padding: 2px 8px;
            font-size: 11px;
            font-weight: 700;
            border: none;
            border-radius: 3px;
            background: #009bdf;
            color: #fff;
            cursor: pointer;
        }
        #tp-unlock-btn:hover {
            background: #007bb5;
        }
        #tp-hidden-menu {
            display: none;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 20px;
            background: #0b2545;
            color: #ffffff;
            font-family: 'Lato', sans-serif;
            font-size: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        #tp-hidden-menu.revealed {
            display: flex;
        }
        .tp-menu-section {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
        }
        .tp-section-label {
            font-weight: 700;
            color: #7bdff2;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            margin-right: 2px;
        }
        .tp-portal-link,
        .tp-copy-btn {
            color: #ffffff;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 11px;
            font-family: 'Lato', sans-serif;
            cursor: pointer;
            transition: background 0.15s ease;
        }
        .tp-portal-link:hover,
        .tp-copy-btn:hover {
            background: #009bdf;
            border-color: #009bdf;
        }
        .tp-copy-btn {
            background: rgba(0, 155, 223, 0.22);
            border-color: rgba(0, 155, 223, 0.55);
        }
        #tp-pass-assembler {
            width: 72px;
            padding: 3px 6px;
            font-size: 11px;
            border: 1px solid rgba(123, 223, 242, 0.55);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            outline: none;
        }
        #tp-toast {
            position: fixed;
            bottom: 18px;
            right: 18px;
            background: #0b2545;
            color: #ffffff;
            padding: 8px 14px;
            border-left: 4px solid #009bdf;
            border-radius: 4px;
            font-family: 'Lato', sans-serif;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            opacity: 0;
            pointer-events: none;
            transform: translateY(8px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            z-index: 99999;
        }
        #tp-toast.show {
            opacity: 1;
            transform: translateY(0);
        }
        #tp-toast.error {
            border-left-color: #ef476f;
        }
    `;
    document.head.appendChild(style);
}

let toastTimer = null;
function showPortalToast(text, isError = false) {
    let toast = document.getElementById("tp-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "tp-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.className = isError ? "show error" : "show";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.className = "";
    }, 2500);
}

async function copyTextToClipboard(value, label) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
        } else {
            const temp = document.createElement("textarea");
            temp.value = value;
            temp.style.position = "fixed";
            temp.style.opacity = "0";
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            document.execCommand("copy");
            document.body.removeChild(temp);
        }
        showPortalToast(`Copied: ${label}`);
    } catch (e) {
        showPortalToast("Clipboard copy failed", true);
    }
}

function setupEnterprisePortal() {
    injectEnterpriseStyles();

    // 1. Add Google Drive anchor to Footer
    const socmedPlatforms = document.getElementById("socmed-platforms");
    if (socmedPlatforms && !document.getElementById("footer-gdrive-link")) {
        const driveAnchor = document.createElement("a");
        driveAnchor.id = "footer-gdrive-link";
        driveAnchor.href = "https://drive.google.com/";
        driveAnchor.target = "_blank";
        driveAnchor.rel = "noopener noreferrer";
        driveAnchor.className = "socmed-platform";
        driveAnchor.title = "Google Drive";
        driveAnchor.innerHTML = `<img src="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_24dp.png" alt="link to google drive" style="width:24px;height:24px;vertical-align:middle;" />`;
        socmedPlatforms.appendChild(driveAnchor);
    }

    // 2. Mount Gate + Location Selector into #navbar-first-row
    const navbarFirstRow = document.getElementById("navbar-first-row");
    const fixedNavbar = document.getElementById("fixed-navbar");
    if (!navbarFirstRow || !fixedNavbar) return;

    const currentZone = getSelectedZone();
    let zoneOptionsHtml = "";
    for (const [code, info] of Object.entries(JAKIM_ZONES)) {
        const selected = code === currentZone ? "selected" : "";
        zoneOptionsHtml += `<option value="${code}" ${selected}>${info.name}</option>`;
    }

    const gateContainer = document.createElement("div");
    gateContainer.id = "tp-unlock-gate";
    gateContainer.innerHTML = `
        <select id="tp-zone-select" title="Select Malaysia Location / Zone">${zoneOptionsHtml}</select>
        <input type="text" id="tp-time-input" placeholder="hh:mm" maxlength="5" autocomplete="off" title="Input 1: Time (hh:mm)" />
        <button type="button" id="tp-xor-toggle" data-bool="" title="Input 2: Click to toggle XOR Flag (TRUE / FALSE)">XOR: ?</button>
        <button type="button" id="tp-unlock-btn">Verify</button>
    `;
    navbarFirstRow.appendChild(gateContainer);

    // 3. Mount Hidden Navigation Menu
    const hiddenMenu = document.createElement("div");
    hiddenMenu.id = "tp-hidden-menu";
    hiddenMenu.innerHTML = `
        <div class="tp-menu-section">
            <span class="tp-section-label">Sites:</span>
            <a class="tp-portal-link" href="https://mytp.ontp.app/" target="_blank" rel="noopener noreferrer">TPPlatform</a>
            <a class="tp-portal-link" href="https://www.seadc.ccms.teleperformance.com/" target="_blank" rel="noopener noreferrer" title="Where we do most of our acknowledgement">BMS (Seadc)</a>
            <a class="tp-portal-link" href="https://teleperformance-mytp.sabacloud.com/" target="_blank" rel="noopener noreferrer" title="Log in via BMS / TPPlatform first for SSO">Learning At TP</a>
            <a class="tp-portal-link" href="https://tp.onice.io/webmail/" target="_blank" rel="noopener noreferrer">IceWarp Webmail</a>
        </div>
        <div class="tp-menu-section">
            <span class="tp-section-label">Copy:</span>
            <button type="button" class="tp-copy-btn" id="tp-copy-drive-btn">Drive Partial Link</button>
            <button type="button" class="tp-copy-btn" data-copy="shamsolnizam.5@apac.teleperformance.com">@apac Email</button>
            <button type="button" class="tp-copy-btn" data-copy="amirfaaiz.shamsolnizam@fb.teleperformance-my.com">@fb Email</button>
            <button type="button" class="tp-copy-btn" data-copy="faaiz@outlook.my">Meta Email</button>
        </div>
        <div class="tp-menu-section">
            <span class="tp-section-label">ZScaler Key:</span>
            <input type="password" id="tp-pass-assembler" placeholder="Input token" autocomplete="off" />
        </div>
    `;
    fixedNavbar.appendChild(hiddenMenu);

    // 4. Wire up Events
    const zoneSelect = document.getElementById("tp-zone-select");
    const timeInput = document.getElementById("tp-time-input");
    const xorToggle = document.getElementById("tp-xor-toggle");
    const unlockBtn = document.getElementById("tp-unlock-btn");
    let generatedDrivePartial = "";

    zoneSelect.addEventListener("change", (e) => {
        setSelectedZone(e.target.value);
        cachedPrayers = null; // force refresh
        showPortalToast(`Location updated to ${JAKIM_ZONES[e.target.value].name}`);
    });

    timeInput.addEventListener("input", (e) => {
        const clean = e.target.value.replace(/[^\d:]/g, "");
        if (/^\d{3,4}$/.test(clean)) {
            e.target.value = `${clean.slice(0, 2)}:${clean.slice(2, 4)}`;
        }
    });

    xorToggle.addEventListener("click", () => {
        const current = xorToggle.getAttribute("data-bool");
        const next = current === "false" ? "true" : "false";
        xorToggle.setAttribute("data-bool", next);
        xorToggle.textContent = `XOR: ${next.toUpperCase()}`;
    });

    function verifyTwoInputs() {
        const rawTime = timeInput.value.trim();
        const rawBoolStr = xorToggle.getAttribute("data-bool");

        if (!rawTime || (rawBoolStr !== "true" && rawBoolStr !== "false")) {
            showPortalToast("Enter hh:mm and toggle XOR (TRUE/FALSE)", true);
            return;
        }

        const userXorBool = rawBoolStr === "true";
        const expectedXorBool = calculateXorFlag();

        const now = new Date();
        const systemHour = now.getHours();

        const saudiHHMM = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).format(now);

        const systemHHMM = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).format(now);

        const useSaudiTime = systemHour > 12 && systemHour < 24;
        const timeValid = useSaudiTime
            ? isTimeWithinTolerance(rawTime, saudiHHMM)
            : systemHour === 12
            ? isTimeWithinTolerance(rawTime, saudiHHMM) || isTimeWithinTolerance(rawTime, systemHHMM)
            : isTimeWithinTolerance(rawTime, systemHHMM);

        if (userXorBool === expectedXorBool && timeValid) {
            generatedDrivePartial = generateLink(rawTime, userXorBool);
            hiddenMenu.classList.add("revealed");
            showPortalToast("Enterprise Menu Unlocked");
        } else {
            showPortalToast("Incorrect time or XOR flag", true);
        }
    }

    unlockBtn.addEventListener("click", verifyTwoInputs);
    timeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") verifyTwoInputs();
    });

    document.getElementById("tp-copy-drive-btn").addEventListener("click", () => {
        const linkPart =
            generatedDrivePartial ||
            generateLink("08:45", calculateXorFlag());
        copyTextToClipboard(linkPart, linkPart);
    });

    hiddenMenu.querySelectorAll(".tp-copy-btn[data-copy]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const email = btn.getAttribute("data-copy");
            copyTextToClipboard(email, email);
        });
    });

    const passAssembler = document.getElementById("tp-pass-assembler");
    passAssembler.addEventListener("input", (e) => {
        if (e.target.value) {
            const finalPassword = `LyKb${e.target.value.slice(0, 4)}RRjc`;
            copyTextToClipboard(finalPassword, "skibidi");
            e.target.value = "";
            e.target.blur();
        }
    });
}

// ============================================================================
// 4. Async Hero Banner Loop
// ============================================================================

async function runTimeLoop() {
    const displayDuration = 15000;
    let typeItInstance = null;

    while (true) {
        const messages = await getFormattedDateInfo();

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            if (typeItInstance) {
                typeItInstance.destroy();
                typeItInstance = null;
            }

            const msgEl = document.querySelector("#message");
            if (msgEl) {
                msgEl.innerHTML = "";

                let htmlString = `<span>${msg.main}</span>`;
                if (msg.sub) {
                    htmlString += `<br><span style="font-size: 0.6em; opacity: 0.8;">${msg.sub}</span>`;
                }

                typeItInstance = new TypeIt("#message", {
                    speed: 30,
                    waitUntilVisible: false,
                })
                .type(htmlString)
                .go();
            }

            await new Promise(resolve => setTimeout(resolve, displayDuration));
        }
    }
}

setupEnterprisePortal();
runTimeLoop();
