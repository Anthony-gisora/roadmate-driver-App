const socket = io("http://10.200.107.105:5000");
//const socket = io("https://roadmateassist.onrender.com:5000");

const mechanics = [
    { mechanicId: "692b151001f456b979128aed", lat: -1.28, lng: 36.8, available: true },
    { mechanicId: "692b151001f456b979128aee", lat: -1.28, lng: 36.81, available: false },
    { mechanicId: "692b151001f456b979128aef", lat: -1.29, lng: 36.82, available: true },
    { mechanicId: "692b151001f456b979128af0", lat: -1.27, lng: 36.83, available: false },
    { mechanicId: "692b151001f456b979128af1", lat: -1.285, lng: 36.815, available: true },
    { mechanicId: "692b151001f456b979128af2", lat: -1.282, lng: 36.818, available: true },
    { mechanicId: "692b151001f456b979128af3", lat: -1.282, lng: 36.818, available: true },
    { mechanicId: "692b151001f456b979128af4", lat: -1.282, lng: 36.818, available: true },
    { mechanicId: "692b151001f456b979128af5", lat: -1.282, lng: 36.818, available: true },
    { mechanicId: "692b151001f456b979128af6", lat: -1.282, lng: 36.818, available: true },
];

const logBox = document.getElementById("log");

function log(msg) {
    logBox.innerHTML += msg + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
}

// Register all mechanics with full data
mechanics.forEach(m => {
    socket.emit("registerMechanic", m);
    log(`Registered ${m.mechanicId}`);
});

// Emit live location updates every 3 seconds
setInterval(() => {
    mechanics.forEach(m => {
        // Randomize slightly
        m.lat += (Math.random() - 0.5) * 0.001;
        m.lng += (Math.random() - 0.5) * 0.001;

        socket.emit("sendLocation", {
            mechanicId: m.mechanicId,
            lat: m.lat,
            lng: m.lng,
            available: m.available
        });

        log(`Sent location for ${m.mechanicId}: ${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}`);
    });
}, 3000);