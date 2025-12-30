(function () {
    const formatNumber = (value) => value.toLocaleString();

    const animateCounter = (element, target) => {
        const duration = 2000;
        const start = performance.now();
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '+';

        const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);

            if (progress === 1) {
                element.textContent = `${prefix}${formatNumber(target)}${suffix}`;
            } else {
                element.textContent = `${prefix}${formatNumber(current)}`;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const initialiseCounters = () => {
        document.querySelectorAll('counter').forEach((counterEl) => {
            const target = Number(counterEl.getAttribute('target'));
            if (Number.isFinite(target) && target > 0) {
                animateCounter(counterEl, target);
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiseCounters);
    } else {
        initialiseCounters();
    }
})();
