(function () {
    const API_URL = 'https://ptb.discord.com/api/guilds/727299096955846756/widget.json';

    const formatNumber = (value) => value.toLocaleString();

    const parseExistingValue = (element) => {
        if (!element || !element.textContent) {
            return 0;
        }
        const numeric = element.textContent.replace(/[^0-9.]/g, '');
        return Number(numeric) || 0;
    };

    const animateCounter = (element, target, prefix = '', suffix = '+') => {
        if (!element || !Number.isFinite(target)) {
            return;
        }

        const duration = 1600;
        const startValue = parseExistingValue(element);
        const startTime = performance.now();

        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (target - startValue) * eased);

            element.textContent = `${prefix}${formatNumber(currentValue)}`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = `${prefix}${formatNumber(target)}${suffix}`;
            }
        };

        requestAnimationFrame(step);
    };

    const applyFallback = () => {
        const totalEl = document.querySelector('counter[data-counter="total"]');
        const fallbackTotal = Number(totalEl?.dataset.fallback);
        if (totalEl && Number.isFinite(fallbackTotal)) {
            animateCounter(
                totalEl,
                fallbackTotal,
                totalEl.dataset.prefix || '',
                totalEl.dataset.suffix || '+'
            );
        }

        const onlineEl = document.querySelector('counter[data-counter="online"]');
        const fallbackOnline = Number(onlineEl?.dataset.fallback);
        if (onlineEl && Number.isFinite(fallbackOnline)) {
            animateCounter(
                onlineEl,
                fallbackOnline,
                onlineEl.dataset.prefix || '',
                onlineEl.dataset.suffix || '+'
            );
        }
    };

    const updateCounters = (data) => {
        const totalEl = document.querySelector('counter[data-counter="total"]');
        const onlineEl = document.querySelector('counter[data-counter="online"]');

        if (!totalEl && !onlineEl) {
            return;
        }

        if (!data) {
            applyFallback();
            return;
        }

        if (onlineEl) {
            const fallback = Number(onlineEl.dataset.fallback);
            const prefix = onlineEl.dataset.prefix || '';
            const suffix = onlineEl.dataset.suffix || '+';
            const value = Number.isFinite(data.presence_count)
                ? Math.max(Number(data.presence_count), Number.isFinite(fallback) ? fallback : 0)
                : fallback;

            if (Number.isFinite(value)) {
                animateCounter(onlineEl, value, prefix, suffix);
            }
        }

        if (totalEl) {
            const fallback = Number(totalEl.dataset.fallback);
            const prefix = totalEl.dataset.prefix || '';
            const suffix = totalEl.dataset.suffix || '+';

            let value = Number.isFinite(fallback) ? fallback : 0;
            if (Number.isFinite(data.approximate_member_count)) {
                value = Math.max(value, Number(data.approximate_member_count));
            }

            if (Array.isArray(data.members) && data.members.length > 0) {
                value = Math.max(value, data.members.length);
            }

            if (Number.isFinite(value) && value > 0) {
                animateCounter(totalEl, value, prefix, suffix);
            }
        }
    };

    const fetchDiscordWidget = async () => {
        try {
            const response = await fetch(API_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Discord widget request failed: ${response.status}`);
            }

            const data = await response.json();
            updateCounters(data);
        } catch (error) {
            console.warn('Unable to update Discord community stats.', error);
            applyFallback();
        }
    };

    const initialise = () => {
        applyFallback();
        fetchDiscordWidget();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialise);
    } else {
        initialise();
    }
})();
