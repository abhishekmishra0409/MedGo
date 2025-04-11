export const showDemoNotification = () => {
    if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("Hello from DawaiLink!", {
                    body: "This is a test notification.",
                    icon: "/android-icon-192x192.png",
                });
            } else {
                console.log("Notification permission denied.");
            }
        });
    } else {
        console.log("Notifications are not supported in this browser.");
    }
};
