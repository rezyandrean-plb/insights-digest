const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID?.trim(); // e.g. @channel or -100123456789

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Sends a text message to the configured Telegram channel.
 * The bot must be added as an admin to the channel.
 * Returns true on success, false if config missing or request fails.
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) return false;

    const url = `${TELEGRAM_API}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = {
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        disable_web_page_preview: true,
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = (await res.json()) as { ok?: boolean };
        return data?.ok === true;
    } catch (err) {
        console.error("Telegram send error:", err);
        return false;
    }
}
