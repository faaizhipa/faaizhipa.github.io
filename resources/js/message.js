function getFormattedDateInfo() {
    const now = new Date();

    // 1. Malaysia Time (Current System Time / MYT)
    // We will assume MYT is GMT+8 (Asia/Kuala_Lumpur)
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

    const myHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', hour12: false }).format(now));

    let myGreeting = "malam 🌑";
    if (myHour >= 6 && myHour < 12) myGreeting = "pagi 🌅";
    else if (myHour >= 12 && myHour < 15) myGreeting = "tengah hari ☀️";
    else if (myHour >= 15 && myHour < 19) myGreeting = "petang 🌇";

    // Mock prayer times (approximate for Penang)
    const prayers = [
        { name: "Subuh", hour: 6, min: 0 },
        { name: "Zohor", hour: 13, min: 15 },
        { name: "Asar", hour: 16, min: 30 },
        { name: "Maghrib", hour: 19, min: 20 },
        { name: "Isyak", hour: 20, min: 30 }
    ];
    let nextPrayer = prayers[0];
    for (let i = 0; i < prayers.length; i++) {
        const myMin = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', minute: 'numeric' }).format(now));
        if (myHour < prayers[i].hour || (myHour === prayers[i].hour && myMin < prayers[i].min)) {
            nextPrayer = prayers[i];
            break;
        }
    }
    const prayerTimeAmPm = nextPrayer.hour >= 12 ? (nextPrayer.hour > 12 ? nextPrayer.hour - 12 : 12) + ":" + nextPrayer.min.toString().padStart(2, '0') + " petang/malam" : nextPrayer.hour + ":" + nextPrayer.min.toString().padStart(2, '0') + " pagi";

    // Clean up AM/PM translation from ms-MY locale format
    const timeFormattedMy = myTimeFormat.format(now).replace('PG', '').replace('PTG', '').trim();

    const myMain = `sekarang sudah jam ${timeFormattedMy} ${myGreeting}`;
    const mySubtitle = `${myDateStr} 🕐 ${myTimeFullStr} 🗺️ Kedah, Pulau Pinang, Kuala Lumpur, Singapura. Waktu solat di Penang berikutnya: ${nextPrayer.name} pada jam ${prayerTimeAmPm}`;

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

    const saudiHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', hour: 'numeric', hour12: false }).format(now));
    let saudiGreeting = "مساءً 🌑";
    if (saudiHour >= 5 && saudiHour < 12) saudiGreeting = "صباحاً 🌅";
    else if (saudiHour >= 12 && saudiHour < 15) saudiGreeting = "ظهراً ☀️";
    else if (saudiHour >= 15 && saudiHour < 18) saudiGreeting = "عصراً 🌇";

    const saudiMain = `الوقت الآن هو ${saudiTimeFormat.format(now)}`;
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

    const melbHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: 'numeric', hour12: false }).format(now));

    // Attempt to convert to "half past 5 getting dark"
    const melbMin = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', minute: 'numeric' }).format(now));
    let melbTimeStr = melbTimeFormat.format(now);
    if (melbMin >= 25 && melbMin <= 35) melbTimeStr = `half past ${melbHour > 12 ? melbHour - 12 : melbHour}`;

    let melbGreeting = "night time 🌑";
    if (melbHour >= 6 && melbHour < 12) melbGreeting = "morning 🌅";
    else if (melbHour >= 12 && melbHour < 17) melbGreeting = "afternoon ☀️";
    else if (melbHour >= 17 && melbHour < 19) melbGreeting = "getting dark 🌇";

    const melbTimeZoneName = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', timeZoneName: 'short' }).format(now).split(' ').pop();
    const isDST = melbTimeZoneName === 'AEDT'; // Mock check for DST

    const melbMain = `it's ${melbTimeStr} ${melbGreeting} when it's melbourne`;
    const melbSubtitle = `${melbDateFormat.format(now)} 🕐 ${new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)} ${melbTimeZoneName} 🗺️ Melbourne, Victoria. ${isDST ? 'Currently observing Daylight Saving Time.' : 'Not in Daylight Saving Time.'}`;

    // 4. One-liner Summary
    const myShortDate = new Intl.DateTimeFormat('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    const myShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const saudiShortDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { timeZone: 'Asia/Riyadh', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const saudiShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const melbShortDate = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const melbShortTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', hour12: true }).format(now).replace(' ', '');

    const oneLiner = `${myShortDate} 🇲🇾 ${myShortTime} | ${saudiShortDate} 🇸🇦 ${saudiShortTime} | ${melbShortDate} 🇦🇺 ${melbShortTime} ${melbTimeZoneName} ☀️`;

    return [
        { main: myMain, sub: mySubtitle },
        { main: saudiMain, sub: saudiSubtitle },
        { main: melbMain, sub: melbSubtitle },
        { main: oneLiner, sub: null }
    ];
}

// ============================================================================
// XOR Flag & Link Generator Logic
// ============================================================================

function calculateXorFlag() {
    const now = new Date();

    // 1. Current month has 31 days?
    const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();
    const has31Days = daysInMonth === 31;

    // 2. Melbourne DST status (consistent with getFormattedDateInfo + US/AU locales)
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

    // Saudi Arabia time (UTC+3)
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

    // Returns only the partial Drive link as requested
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
// UI Injection, Two-Input Verification & Clipboard Actions
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
        #tp-time-input {
            width: 54px;
            padding: 2px 5px;
            font-size: 11px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.35);
            border-radius: 3px;
            background: rgba(0, 0, 0, 0.2);
            color: inherit;
            outline: none;
        }
        #tp-xor-toggle {
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 700;
            border: 1px solid rgba(255, 255, 255, 0.35);
            border-radius: 3px;
            background: rgba(0, 0, 0, 0.2);
            color: inherit;
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

    // 1. Add initial Google Drive anchor link to Footer (#socmed-platforms)
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

    // 2. Mount the Two-Input Gate into #navbar-first-row
    const navbarFirstRow = document.getElementById("navbar-first-row");
    const fixedNavbar = document.getElementById("fixed-navbar");
    if (!navbarFirstRow || !fixedNavbar) return;

    const gateContainer = document.createElement("div");
    gateContainer.id = "tp-unlock-gate";
    gateContainer.innerHTML = `
        <input type="text" id="tp-time-input" placeholder="hh:mm" maxlength="5" autocomplete="off" title="Input 1: Time (hh:mm)" />
        <button type="button" id="tp-xor-toggle" data-bool="" title="Input 2: Click to toggle XOR Flag (TRUE / FALSE)">XOR: ?</button>
        <button type="button" id="tp-unlock-btn">Verify</button>
    `;
    navbarFirstRow.appendChild(gateContainer);

    // 3. Mount Hidden Navigation Menu inside #fixed-navbar
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

    // 4. Wire up Two-Input Gate Events
    const timeInput = document.getElementById("tp-time-input");
    const xorToggle = document.getElementById("tp-xor-toggle");
    const unlockBtn = document.getElementById("tp-unlock-btn");
    let generatedDrivePartial = "";

    // Auto-colon formatting when typing 4 digits (e.g. "1039" -> "10:39")
    timeInput.addEventListener("input", (e) => {
        const clean = e.target.value.replace(/[^\d:]/g, "");
        if (/^\d{3,4}$/.test(clean)) {
            e.target.value = `${clean.slice(0, 2)}:${clean.slice(2, 4)}`;
        }
    });

    // Cycle XOR button through TRUE -> FALSE
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

        // Uses Saudi time when system hour is after 12:00 and before 24:00
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

    // 5. Wire up Copy Buttons (Drive Partial Link & Emails)
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

    // 6. Wire up Password Assembler ("933>>" -> "LyKb933>RRjc")
    const passAssembler = document.getElementById("tp-pass-assembler");
    passAssembler.addEventListener("input", (e) => {
        if (e.target.value === "933>>") {
            const finalPassword = `LyKb${e.target.value.slice(0, 4)}RRjc`; // LyKb933>RRjc
            copyTextToClipboard(finalPassword, "LyKb933>RRjc");
            e.target.value = "";
            e.target.blur();
        }
    });
}

async function runTimeLoop() {
    const displayDuration = 15000; // 15 seconds per message
    let typeItInstance = null;

    while (true) {
        const messages = getFormattedDateInfo();

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

            // Destroy the old instance if it exists
            if (typeItInstance) {
                typeItInstance.destroy();
                typeItInstance = null;
            }

            // Clear the existing text
            document.querySelector("#message").innerHTML = "";

            let htmlString = `<span>${msg.main}</span>`;
            if (msg.sub) {
                htmlString += `<br><span style="font-size: 0.6em; opacity: 0.8;">${msg.sub}</span>`;
            }

            // Start typing animation
            typeItInstance = new TypeIt("#message", {
                speed: 30, // Faster typing speed
                waitUntilVisible: false,
            })
            .type(htmlString)
            .go();

            // Wait for 15 seconds before the next message
            await new Promise(resolve => setTimeout(resolve, displayDuration));
        }
    }
}

// Initialize the gate/menu and start the TypeIt loop when script loads
setupEnterprisePortal();
runTimeLoop();
