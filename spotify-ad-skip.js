// ==UserScript==
// @name         Spotify Ad Skipper
// @version      1.1
// @namespace    http://tampermonkey.net/
// @description  Automatically detects and skips ads on Spotify's web player.
// @match        https://*.spotify.com/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://gist.githubusercontent.com/Simonwep/24f8cdcd6d32d86e929004013bd660ae/raw
// @updateURL    https://gist.githubusercontent.com/Simonwep/24f8cdcd6d32d86e929004013bd660ae/raw
// ==/UserScript==

(async function() {

    /**
     * Queries the DOM for an element and resolves it once available.
     * @param {string} selector - CSS selector to query for.
     * @returns {Promise<Element>} - The found DOM element.
     */
    async function queryElement(selector) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 250);
        });
    }

    /**
     * Inject a middleware function into an object's method.
     * @param {Object} options.ctx - The object containing the method to modify.
     * @param {string} options.fn - The method name to inject middleware into.
     * @param {Function} [options.middleware] - Optional middleware to execute before the original function.
     * @param {Function} [options.transform] - Optional transform to modify the method's result.
     */
    function inject({ ctx, fn, middleware, transform }) {
        const original = ctx[fn];
        ctx[fn] = function (...args) {
            if (!middleware || middleware.apply(this, args) !== false) {
                const result = original.apply(this, args);
                return transform ? transform.apply(this, [result, ...args]) : result;
            }
        };
    }

    // Find the now playing bar and play/pause button in Spotify's DOM
    const nowPlayingBar = await queryElement('.now-playing-bar');
    const playPauseButton = await queryElement('button[title=Play], button[title=Pause]');

    let audioElement;

    // Hook into document.createElement to capture the audio element.
    inject({
        ctx: document,
        fn: 'createElement',
        transform(result, type) {
            if (type === 'audio') {
                audioElement = result;
            }
            return result;
        }
    });

    let skipAdInterval;

    // Observe changes in the now-playing bar to detect ads and handle them.
    new MutationObserver(() => {
        const trackLink = document.querySelector('.now-playing > a');

        if (trackLink) {
            if (!audioElement) {
                console.error('Audio element not found!');
                return;
            }

            if (!playPauseButton) {
                console.error('Play/Pause button not found!');
                return;
            }

            // Mute the audio (by clearing src) and simulate clicking the play/pause button to skip ads.
            audioElement.src = '';
            playPauseButton.click();

            // Ensure that we keep trying to skip until the ad is fully gone.
            if (!skipAdInterval) {
                skipAdInterval = setInterval(() => {
                    const isAdOver = !document.querySelector('.now-playing > a') && playPauseButton.title === 'Pause';
                    if (isAdOver) {
                        clearInterval(skipAdInterval);
                        skipAdInterval = null;
                    } else {
                        playPauseButton.click();
                    }
                }, 500);
            }
        }
    }).observe(nowPlayingBar, {
        characterData: true,
        childList: true,
        attributes: true,
        subtree: true
    });

    // Hide upgrade buttons and any premium subscription prompts from the UI.
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        [aria-label="Upgrade to Premium"],
        body > div:not(#main) {
            display: none !important;
        }
    `;
    document.body.appendChild(styleElement);

})();
