const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const port = process.env.PORT || 3000;

// GANTI DENGAN USERNAME TIKTOK-MU (TANPA @)
const tiktokUsername = "rivaldosidiqbalebale"; 

let eventQueue = [];
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
    console.info(`✅ Berhasil terhubung ke Live: ${tiktokUsername} (Room ID: ${state.roomId})`);
}).catch(err => {
    console.error('❌ Gagal terhubung (Pastikan akun sedang Live)', err);
});

tiktokLiveConnection.on('chat', data => {
    console.log(`💬 Chat dari ${data.uniqueId}: ${data.comment}`);
    eventQueue.push({ type: 'comment', username: data.uniqueId, text: data.comment });
});

tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return; 
    console.log(`🎁 Gift dari ${data.uniqueId}: ${data.giftName}`);
    eventQueue.push({ type: 'gift', username: data.uniqueId, giftName: data.giftName });
});

tiktokLiveConnection.on('like', data => {
    console.log(`❤️ Like dari ${data.uniqueId} (${data.likeCount} likes)`);
    eventQueue.push({ type: 'like', username: data.uniqueId });
});

// Endpoint yang akan dibaca oleh Roblox
app.get('/get_events', (req, res) => {
    res.json({ events: eventQueue });
    eventQueue = []; 
});

app.listen(port, () => {
    console.log(`🚀 Server jembatan TikTok berjalan di port ${port}`);
});
