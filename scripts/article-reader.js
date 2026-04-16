(function () {
    const progressBar = document.getElementById('reader-progress-bar');
    const sectionLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const sections = Array.from(document.querySelectorAll('section[data-section]'));
    const readingTimeEl = document.getElementById('reading-time');
    const articleBody = document.getElementById('article-body');

    function updateProgress() {
        const top = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(100, Math.max(0, (top / max) * 100)) : 0;
        progressBar.style.width = progress.toFixed(2) + '%';
    }

    function updateActiveSection() {
        const marker = window.scrollY + 120;
        let current = sections[0] ? sections[0].id : '';

        sections.forEach((section) => {
            if (section.offsetTop <= marker) {
                current = section.id;
            }
        });

        sectionLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    function updateReadingTime() {
        if (!articleBody || !readingTimeEl) return;
        const words = articleBody.innerText.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.round(words / 220));
        readingTimeEl.textContent = `~${minutes} min read`;
    }

    function wireQuoteCopy() {
        const quoteButtons = Array.from(document.querySelectorAll('.copy-quote'));

        quoteButtons.forEach((button) => {
            button.addEventListener('click', async function () {
                const quote = this.closest('.quote-highlight');
                if (!quote) return;

                const text = quote.querySelector('p') ? quote.querySelector('p').innerText.trim() : quote.innerText.trim();

                try {
                    await navigator.clipboard.writeText(text);
                    this.textContent = 'Copied';
                    setTimeout(() => {
                        this.textContent = 'Copy quote';
                    }, 1500);
                } catch (error) {
                    this.textContent = 'Copy unavailable';
                }
            });
        });
    }

    sectionLinks.forEach((link) => {
        link.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            const targetEl = targetId ? document.querySelector(targetId) : null;
            if (!targetEl) return;

            event.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', targetId);
        });
    });

    updateReadingTime();
    wireQuoteCopy();
    updateProgress();
    updateActiveSection();

    window.addEventListener('scroll', function () {
        updateProgress();
        updateActiveSection();
    }, { passive: true });
})();
