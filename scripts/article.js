(function () {
    const progressBar = document.getElementById('progressBar');
    const revealSections = Array.from(document.querySelectorAll('.reveal'));
    const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
    const sectionNodes = Array.from(document.querySelectorAll('[data-section]'));
    const diagramCards = Array.from(document.querySelectorAll('[data-diagram]'));
    const expandableNodes = Array.from(document.querySelectorAll('.expandable'));

    function updateProgressBar() {
        if (!progressBar) return;
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(100, Math.max(0, progress)).toFixed(2) + '%';
    }

    function updateActiveNav() {
        const marker = window.scrollY + 140;
        let activeSectionId = '';

        sectionNodes.forEach((section) => {
            if (section.offsetTop <= marker) {
                activeSectionId = section.id;
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + activeSectionId);
        });
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });

    revealSections.forEach((section) => revealObserver.observe(section));

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const targetSection = targetId ? document.querySelector(targetId) : null;
            if (!targetSection) return;
            event.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', targetId);
        });
    });

    diagramCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('is-hovered');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-hovered');
        });
        card.addEventListener('focusin', () => {
            card.classList.add('is-hovered');
        });
        card.addEventListener('focusout', () => {
            card.classList.remove('is-hovered');
        });
    });

    expandableNodes.forEach((item) => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;
            expandableNodes.forEach((other) => {
                if (other !== item) {
                    other.open = false;
                }
            });
        });
    });

    updateProgressBar();
    updateActiveNav();

    window.addEventListener('scroll', () => {
        updateProgressBar();
        updateActiveNav();
    }, { passive: true });
})();
