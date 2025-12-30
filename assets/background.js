(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    const STAR_COUNT = 90;
    const MAX_DISTANCE = 165;
    const stars = [];
    const mouse = { x: null, y: null };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const randomVelocity = () => (Math.random() - 0.5) * 0.55;

    const createStar = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.1 + 0.4,
        vx: randomVelocity(),
        vy: randomVelocity()
    });

    const initStars = () => {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i += 1) {
            stars.push(createStar());
        }
    };

    const distance = (a, b) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    };

    const updateStars = () => {
        for (const star of stars) {
            star.x += star.vx;
            star.y += star.vy;

            if (star.x <= 0 || star.x >= canvas.width) {
                star.vx *= -1;
            }

            if (star.y <= 0 || star.y >= canvas.height) {
                star.vy *= -1;
            }
        }
    };

    const drawStars = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        // Draw star points
        for (const star of stars) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw connecting lines
        ctx.beginPath();
        for (let i = 0; i < STAR_COUNT; i += 1) {
            for (let j = i + 1; j < STAR_COUNT; j += 1) {
                const starA = stars[i];
                const starB = stars[j];
                const dist = distance(starA, starB);

                if (dist <= MAX_DISTANCE) {
                    const opacity = 1 - dist / MAX_DISTANCE;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.35})`;
                    ctx.moveTo(starA.x, starA.y);
                    ctx.lineTo(starB.x, starB.y);
                }
            }

            if (mouse.x !== null && mouse.y !== null) {
                const star = stars[i];
                const distMouse = distance(star, mouse);
                if (distMouse <= MAX_DISTANCE * 1.1) {
                    const opacity = 1 - distMouse / (MAX_DISTANCE * 1.1);
                    ctx.strokeStyle = `rgba(172, 89, 198, ${opacity * 0.4})`;
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(mouse.x, mouse.y);
                }
            }
        }
        ctx.lineWidth = 0.6;
        ctx.stroke();
    };

    const animationLoop = () => {
        drawStars();
        updateStars();
        requestAnimationFrame(animationLoop);
    };

    resizeCanvas();
    initStars();
    animationLoop();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });

    canvas.addEventListener('mousemove', (event) => {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        mouse.x = event.clientX;
        mouse.y = event.clientY - headerHeight;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
})();
