/* ==========================================================================
   Richmond Rivera — Portfolio script
   --------------------------------------------------------------------------
   This file is loaded in <head> and runs in two parts:

   PART 1 runs immediately, before the page is drawn:
     • marks the page as "JavaScript is on" (adds class="js" to <html>)
     • applies the saved theme, so dark mode never flashes white
     • picks which page (view) to show from the address bar

   PART 2 runs once the HTML has loaded:
     theme switch, page switching, automatic counts, job durations,
     project milestones, certification filters, "Recent changes" card,
     new-tab labels, back-to-top, visitor counter.

   Note: no template literals (backticks) are used on purpose, so copying
   and pasting this file can't break it.
   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       Settings you may want to change
       ------------------------------------------------------------------ */

    // Pages that exist in index.html (<section class="view" data-view="...">).
    // ✏️ If you add a page, add its name here AND in the "6. Views" part of the CSS.
    var VIEWS = ['overview', 'experience', 'certifications'];
    var DEFAULT_VIEW = 'overview';

    // Browser tab title for each page
    var VIEW_TITLES = {
        overview: 'Richmond Rivera — Cloud DevOps Engineer',
        experience: 'Experience — Richmond Rivera',
        certifications: 'Certifications — Richmond Rivera'
    };

    // Your API Gateway + Lambda visitor counter (must return JSON like {"views": 123})
    var VISITOR_API = 'https://krjhjjpql3.execute-api.us-east-1.amazonaws.com/count';
    var VISITOR_TIMEOUT_MS = 6000;
    // true  = count each visitor once per browser session (reloads and returning
    //         to the tab show the saved number instead of adding another visit)
    // false = every page load adds one, like your original counter
    var COUNT_ONCE_PER_SESSION = true;

    // Spoken labels for project milestones (screen readers)
    var STEP_LABELS = { done: 'Done', running: 'In progress', pending: 'Planned' };

    // Names used in the browser's localStorage
    var THEME_KEY = 'theme';
    var CHANGELOG_KEY = 'changelog-hidden';
    var VISITS_SESSION_KEY = 'visit-count';   // sessionStorage: cleared when the tab closes


    /* ------------------------------------------------------------------
       Small helpers
       ------------------------------------------------------------------ */

    var root = document.documentElement;
    var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    // querySelectorAll as a normal array
    function $$(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    // localStorage can be blocked (some private/incognito modes), so never let it crash the page
    function storageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function storageSet(key, value) {
        try {
            if (value === null) { localStorage.removeItem(key); } else { localStorage.setItem(key, value); }
        } catch (e) { /* the choice still works until the tab is closed */ }
    }

    function prefersReducedMotion() {
        return !!(motionQuery && motionQuery.matches);
    }

    // Jump to the top without the smooth-scroll animation
    function jumpToTop() {
        var previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previous;
    }

    function smoothToTop() {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    // Run a function at most once per screen refresh (for scroll listeners)
    function rafThrottle(fn) {
        var waiting = false;
        return function () {
            if (waiting) { return; }
            waiting = true;
            window.requestAnimationFrame(function () {
                waiting = false;
                fn();
            });
        };
    }

    function currentHashId() {
        try { return decodeURIComponent(window.location.hash.slice(1)); } catch (e) { return ''; }
    }


    /* ==================================================================
       PART 1 — runs immediately, before the page is drawn
       ================================================================== */

    root.classList.add('js');
    applyTheme(getSavedTheme());
    root.setAttribute('data-view', VIEWS.indexOf(currentHashId()) !== -1 ? currentHashId() : DEFAULT_VIEW);


    /* ==================================================================
       PART 2 — runs after the HTML has loaded
       ================================================================== */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initThemeSwitch();
        initRouter();
        initCounts();
        initDurations();
        initPipelines();
        initCertFilters();
        initChangelog();
        initExternalLinks();
        initBackToTop();
        loadVisitorCount();
        setYear();
    }


    /* ------------------------------------------------------------------
       Theme: Auto (follows the device) / Light / Dark
       ------------------------------------------------------------------ */

    function getSavedTheme() {
        var saved = storageGet(THEME_KEY);
        return saved === 'light' || saved === 'dark' ? saved : 'system';
    }

    function resolveTheme(choice) {
        if (choice === 'light' || choice === 'dark') { return choice; }
        return darkQuery && darkQuery.matches ? 'dark' : 'light';
    }

    function applyTheme(choice) {
        root.setAttribute('data-theme', resolveTheme(choice));   // what the CSS reads
        root.setAttribute('data-theme-choice', choice);          // which button is pressed
        syncThemeButtons(choice);
        updateBrowserBarColor();
    }

    function syncThemeButtons(choice) {
        $$('.theme-btn').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-option') === choice));
        });
    }

    // Tints the phone's browser bar (Android Chrome, Safari) to match the page
    function updateBrowserBarColor() {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) { return; }
        var color = getComputedStyle(root).getPropertyValue('--bg').trim();
        if (color) { meta.setAttribute('content', color); }
    }

    function initThemeSwitch() {
        syncThemeButtons(root.getAttribute('data-theme-choice') || 'system');

        $$('.theme-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var choice = btn.getAttribute('data-theme-option');
                storageSet(THEME_KEY, choice === 'system' ? null : choice);
                applyTheme(choice);
            });
        });

        // While on Auto, follow the device live (e.g. a phone that turns dark at sunset)
        if (darkQuery) {
            var onDeviceChange = function () {
                if (root.getAttribute('data-theme-choice') === 'system') { applyTheme('system'); }
            };
            if (darkQuery.addEventListener) {
                darkQuery.addEventListener('change', onDeviceChange);
            } else if (darkQuery.addListener) {
                darkQuery.addListener(onDeviceChange);   // older Safari
            }
        }
    }


    /* ------------------------------------------------------------------
       Page switching (router)
       The part after # in the address decides what is shown:
         #experience      → Experience page
         #certifications  → Certifications page
         #stack           → Overview page, scrolled to the Stack section
         #contact, #main  → stays on the current page and scrolls there
       Because it uses the address bar, the Back button works and
       recruiters can share a direct link (e.g. yoursite.com/#certifications).
       ------------------------------------------------------------------ */

    function initRouter() {
        route(true);
        window.addEventListener('hashchange', function () { route(false); });

        // Clicking the link for the page you're already on scrolls back to the top
        document.addEventListener('click', function (event) {
            var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
            if (!link) { return; }
            var id = link.getAttribute('href').slice(1);
            var hash = currentHashId();
            var alreadyThere = VIEWS.indexOf(id) !== -1 &&
                root.getAttribute('data-view') === id &&
                (hash === id || (hash === '' && id === DEFAULT_VIEW));
            if (alreadyThere) {
                event.preventDefault();
                smoothToTop();
            }
        });
    }

    function route(isFirstLoad) {
        var id = currentHashId();
        var previousView = root.getAttribute('data-view');
        var view = DEFAULT_VIEW;
        var target = null;

        if (VIEWS.indexOf(id) !== -1) {
            view = id;
        } else if (id) {
            target = document.getElementById(id);
            var owner = target && target.closest ? target.closest('[data-view]') : null;
            if (owner) {
                view = owner.getAttribute('data-view');            // a section inside a page
            } else if (target) {
                view = previousView || DEFAULT_VIEW;               // e.g. #contact: shared by every page
            }
        }

        var changed = view !== previousView;
        showView(view);

        if (isFirstLoad) {
            // The browser jumps to #section by itself, but web fonts finishing a moment
            // later can push the section down. Line it up again once fonts are ready.
            if (target && document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function () {
                    target.scrollIntoView({ block: 'start', behavior: 'auto' });
                });
            }
            return;
        }

        if (target) {
            // The browser can't scroll to a section that was hidden, so do it now that it's visible
            if (changed) {
                target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            }
            return;
        }

        if (changed) {
            jumpToTop();
        } else {
            smoothToTop();
        }

        // Move keyboard / screen-reader focus to the new page's heading
        var heading = document.querySelector('#view-' + view + ' h1');
        if (heading) {
            try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
        }
    }

    function showView(view) {
        root.setAttribute('data-view', view);
        document.title = VIEW_TITLES[view] || VIEW_TITLES[DEFAULT_VIEW];

        $$('.nav-link[data-nav]').forEach(function (link) {
            if (link.getAttribute('data-nav') === view) {
                link.setAttribute('aria-current', 'page');
                keepTabVisible(link);
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // On phones the tabs scroll sideways; make sure the active one is on screen
    function keepTabVisible(link) {
        var nav = link.parentElement;
        if (!nav || nav.scrollWidth <= nav.clientWidth) { return; }
        var offset = link.getBoundingClientRect().left - nav.getBoundingClientRect().left;
        nav.scrollLeft += offset - (nav.clientWidth - link.offsetWidth) / 2;
    }


    /* ------------------------------------------------------------------
       Automatic counts
       Every element with data-count="certifications" or "experience"
       shows the real number, so adding a certificate updates the menu,
       the Overview text and the filter buttons by itself.
       ------------------------------------------------------------------ */

    function initCounts() {
        var counts = {
            certifications: $$('.cert').length,
            experience: $$('.role-item').length
        };

        $$('[data-count]').forEach(function (el) {
            var key = el.getAttribute('data-count');
            if (Object.prototype.hasOwnProperty.call(counts, key)) {
                el.textContent = counts[key];
            }
        });
    }


    /* ------------------------------------------------------------------
       Job durations ("2 yrs 7 mos"), counted like LinkedIn does:
       both the first and the last month are included.
       Uses data-start="YYYY-MM" and optional data-end="YYYY-MM".
       No data-end means "until today".
       ------------------------------------------------------------------ */

    function initDurations() {
        var now = new Date();
        var today = { y: now.getFullYear(), m: now.getMonth() + 1 };

        $$('.role-duration').forEach(function (el) {
            var start = parseMonth(el.getAttribute('data-start'));
            var end = parseMonth(el.getAttribute('data-end')) || today;
            if (!start) { return; }

            var months = (end.y - start.y) * 12 + (end.m - start.m) + 1;
            if (months > 0) { el.textContent = formatMonths(months); }
        });
    }

    function parseMonth(value) {
        var match = /^(\d{4})-(\d{2})$/.exec(value || '');
        return match ? { y: Number(match[1]), m: Number(match[2]) } : null;
    }

    function formatMonths(total) {
        var years = Math.floor(total / 12);
        var months = total % 12;
        var parts = [];
        if (years) { parts.push(years + (years === 1 ? ' yr' : ' yrs')); }
        if (months) { parts.push(months + (months === 1 ? ' mo' : ' mos')); }
        return parts.join(' ');
    }


    /* ------------------------------------------------------------------
       Project milestones
       Writes "2 of 4 done" next to each project and adds a hidden
       "Done:", "In progress:" or "Planned:" for screen readers.
       ------------------------------------------------------------------ */

    function initPipelines() {
        $$('.project').forEach(function (project) {
            var steps = $$('.pipeline li', project);
            var done = 0;

            steps.forEach(function (step) {
                var state = step.getAttribute('data-state');
                if (state === 'done') { done += 1; }

                if (STEP_LABELS[state]) {
                    var label = document.createElement('span');
                    label.className = 'sr-only';
                    label.textContent = STEP_LABELS[state] + ': ';
                    step.insertBefore(label, step.firstChild);
                }
            });

            var progress = project.querySelector('.project-progress');
            if (progress && steps.length) {
                progress.textContent = done + ' of ' + steps.length + ' done';
            }
        });
    }


    /* ------------------------------------------------------------------
       Certification filters (All / Microsoft / AWS / Oracle / ISC2)
       A button's data-filter must match a certificate's data-issuer.
       ------------------------------------------------------------------ */

    function initCertFilters() {
        var chips = $$('.chip[data-filter]');
        var certs = $$('.cert');
        var status = document.getElementById('certStatus');
        if (!chips.length || !certs.length) { return; }

        function countFor(filter) {
            if (filter === 'all') { return certs.length; }
            return certs.filter(function (cert) {
                return cert.getAttribute('data-issuer') === filter;
            }).length;
        }

        function applyFilter(filter) {
            var shown = 0;

            certs.forEach(function (cert) {
                var match = filter === 'all' || cert.getAttribute('data-issuer') === filter;
                cert.hidden = !match;
                if (match) { shown += 1; }
            });

            chips.forEach(function (chip) {
                chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === filter));
            });

            if (status) {
                status.textContent = filter === 'all'
                    ? 'Showing all ' + certs.length + ' certifications'
                    : 'Showing ' + shown + ' of ' + certs.length + ' certifications';
            }
        }

        chips.forEach(function (chip) {
            var filter = chip.getAttribute('data-filter');
            var count = countFor(filter);
            var countEl = chip.querySelector('.chip-count');

            if (countEl) { countEl.textContent = count; }
            if (count === 0 && filter !== 'all') { chip.hidden = true; }   // hide empty issuers

            chip.addEventListener('click', function () { applyFilter(filter); });
        });

        applyFilter('all');
    }


    /* ------------------------------------------------------------------
       "Recent changes" card
       Remembers that a visitor hid it. When you post something new and
       change data-version in the HTML, it shows again for everyone.
       ------------------------------------------------------------------ */

    function initChangelog() {
        var card = document.getElementById('changelog');
        if (!card) { return; }

        var version = card.getAttribute('data-version') || '1';
        if (storageGet(CHANGELOG_KEY) === version) {
            card.hidden = true;
            return;
        }

        var hideButton = document.getElementById('changelogHide');
        if (!hideButton) { return; }

        hideButton.addEventListener('click', function () {
            storageSet(CHANGELOG_KEY, version);
            card.hidden = true;

            // The button just disappeared, so move focus somewhere sensible
            var next = document.getElementById('now-title');
            if (next) {
                next.setAttribute('tabindex', '-1');
                try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); }
            }
        });
    }


    /* ------------------------------------------------------------------
       Links that open a new tab: tell screen-reader users
       (the little arrow icon is drawn by the CSS)
       ------------------------------------------------------------------ */

    function initExternalLinks() {
        $$('a[target="_blank"]').forEach(function (link) {
            var label = link.getAttribute('aria-label');

            if (label) {
                link.setAttribute('aria-label', label + ' (opens in a new tab)');
            } else {
                var note = document.createElement('span');
                note.className = 'sr-only';
                note.textContent = ' (opens in a new tab)';
                link.appendChild(note);
            }
        });
    }


    /* ------------------------------------------------------------------
       Back-to-top button: appears after scrolling down
       ------------------------------------------------------------------ */

    function initBackToTop() {
        var button = document.getElementById('toTop');
        if (!button) { return; }

        var SHOW_AFTER_PX = 600;

        var update = function () {
            button.classList.toggle('is-visible', window.pageYOffset > SHOW_AFTER_PX);
        };

        update();
        window.addEventListener('scroll', rafThrottle(update), { passive: true });
        button.addEventListener('click', smoothToTop);
    }


    /* ------------------------------------------------------------------
       Visitor counter (API Gateway + Lambda), shown in the footer
       • Waits until the browser is idle, so it never slows the page down
       • Counts each visitor once per session (see COUNT_ONCE_PER_SESSION)
       • Fades in when the number arrives; stays hidden if the API fails
       ------------------------------------------------------------------ */

    function loadVisitorCount() {
        var wrapper = document.getElementById('visits');
        if (!wrapper) { return; }

        // Already counted in this session: show the saved number, skip the API
        if (COUNT_ONCE_PER_SESSION) {
            var saved = Number(sessionGet(VISITS_SESSION_KEY));
            if (isFinite(saved) && saved >= 1) {
                showVisitCount(saved);
                return;
            }
        }

        if (!window.fetch) { return; }

        // Run when the browser has finished its important work (fallback: shortly after load)
        var whenIdle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 300); };
        whenIdle(fetchVisitCount, { timeout: 2000 });
    }

    function fetchVisitCount() {
        var controller = window.AbortController ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, VISITOR_TIMEOUT_MS) : null;

        fetch(VISITOR_API, controller ? { signal: controller.signal } : {})
            .then(function (response) {
                if (!response.ok) { throw new Error('HTTP ' + response.status); }
                return response.json();
            })
            .then(function (data) {
                clearTimeout(timer);
                var views = Number(data && data.views);
                if (!isFinite(views) || views < 1) { throw new Error('Unexpected response'); }

                if (COUNT_ONCE_PER_SESSION) { sessionSet(VISITS_SESSION_KEY, String(views)); }
                showVisitCount(views);
            })
            .catch(function (error) {
                clearTimeout(timer);
                if (window.console) { console.warn('Visitor counter unavailable:', error.message || error); }
            });
    }

    function showVisitCount(views) {
        var wrapper = document.getElementById('visits');
        var number = document.getElementById('visitCount');
        var label = document.getElementById('visitLabel');
        if (!wrapper || !number) { return; }

        number.textContent = views.toLocaleString();        // 1234 → "1,234"
        if (label) { label.textContent = views === 1 ? 'visit' : 'visits'; }
        wrapper.hidden = false;
    }

    // sessionStorage can be blocked too (private modes), so guard it like localStorage
    function sessionGet(key) {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    }

    function sessionSet(key, value) {
        try { sessionStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }


    /* ------------------------------------------------------------------
       Footer year
       ------------------------------------------------------------------ */

    function setYear() {
        var year = document.getElementById('year');
        if (year) { year.textContent = new Date().getFullYear(); }
    }
})();