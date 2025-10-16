export const formatLastSeen = (lastSeen: string | Date | number, isOnline: boolean = false) => {
    if (isOnline) return "в сети";
    if (!lastSeen) return "";
    console.log(lastSeen, Date.now())
    let timestamp: number;
    if (typeof lastSeen === "number") {
        timestamp = lastSeen;
    } else {
        const date = new Date(lastSeen);
        if (isNaN(date.getTime())) return "";
        timestamp = date.getTime();
    }
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 0) return "только что";

    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);


    if (diffSeconds < 60) {
        return `был ${diffSeconds} сек назад`;
    } else if (diffMinutes < 60) {
        return `был ${diffMinutes} мин назад`;
    } else if (diffHours < 24) {
        return `был ${diffHours} ч назад`;
    } else if (diffDays < 7) {
        return `был ${diffDays} дн назад`;
    } else {
        const date = new Date(timestamp);
        const day = date.getUTCDate();
        const month = date.toLocaleString("ru-RU", { month: "short", timeZone: "UTC" });
        return `был ${day} ${month}`;
    }
};
