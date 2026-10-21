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

// Start the loop when script is loaded
runTimeLoop();
