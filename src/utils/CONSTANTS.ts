const CONSTANTS = {
	ipv4Regex: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
	INTERVAL_BETWEEN_XP: 60_000,
	XP_GAINED: () => (Math.random() * 7) + 8,
};

export default CONSTANTS;