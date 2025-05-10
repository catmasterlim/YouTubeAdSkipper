document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('adSkipToggle');
  const skipIntervalInput = document.getElementById('skipIntervalInput'); // Input for skipInterval
  const enabledSkipSponsorVideoToggle = document.getElementById('enabledSkipSponsorVideoToggle'); // Toggle for enabledSkipSponsorVideo
  const enabledSkipOverlayToggle = document.getElementById('enabledSkipOverlayToggle'); // Toggle for enabledSkipOverlay
  const enabledSkipSponsorLinkToggle = document.getElementById('enabledSkipSponsorLinkToggle'); // Toggle for enabledSkipSponsorLink
  const skipIntervalMainAdInput = document.getElementById('skipIntervalMainAdInput'); // Input for skipIntervalMainAd

  // Load saved state
  chrome.storage.local.get(['enabled', 'skipInterval', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink'], (result) => {
    toggle.checked = result.enabled !== false;
    skipIntervalInput.value = result.skipInterval || 500; // Default to 500 if not set
    enabledSkipSponsorVideoToggle.checked = result.enabledSkipSponsorVideo !== false; // Default to true if not set
    enabledSkipOverlayToggle.checked = result.enabledSkipOverlay !== false; // Default to true if not set
    enabledSkipSponsorLinkToggle.checked = result.enabledSkipSponsorLink !== false; // Default to true if not set
  });

  chrome.storage.sync.get('skipIntervalMainAd', ({ skipIntervalMainAd }) => {
    skipIntervalMainAdInput.value = skipIntervalMainAd !== undefined ? skipIntervalMainAd : 3000;
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    const skipInterval = parseInt(skipIntervalInput.value, 10) || 500; // Default to 500 if invalid
    const enabledSkipSponsorVideo = enabledSkipSponsorVideoToggle.checked;
    const enabledSkipOverlay = enabledSkipOverlayToggle.checked;
    const enabledSkipSponsorLink = enabledSkipSponsorLinkToggle.checked;

    chrome.storage.local.set({ enabled, skipInterval, enabledSkipSponsorVideo, enabledSkipOverlay, enabledSkipSponsorLink }, () => {
      console.log('Settings saved:', { enabled, skipInterval, enabledSkipSponsorVideo, enabledSkipOverlay, enabledSkipSponsorLink });
    });

    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleYoutubeAdSkipper',
          enabled
        }).catch(console.error);
      }
    });
  });

  // Handle skipInterval input change
  skipIntervalInput.addEventListener('change', () => {
    const skipInterval = parseInt(skipIntervalInput.value, 10) || 500; // Default to 500 if invalid
    chrome.storage.local.set({ skipInterval }, () => {
      console.log('Skip interval saved:', skipInterval);
    });
  });

  // Handle enabledSkipSponsorVideo toggle change
  enabledSkipSponsorVideoToggle.addEventListener('change', () => {
    const enabledSkipSponsorVideo = enabledSkipSponsorVideoToggle.checked;
    chrome.storage.local.set({ enabledSkipSponsorVideo }, () => {
      console.log('Enabled skip sponsor video saved:', enabledSkipSponsorVideo);
    });
  });

  // Handle enabledSkipOverlay toggle change
  enabledSkipOverlayToggle.addEventListener('change', () => {
    const enabledSkipOverlay = enabledSkipOverlayToggle.checked;
    chrome.storage.local.set({ enabledSkipOverlay }, () => {
      console.log('Enabled skip overlay saved:', enabledSkipOverlay);
    });

    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleSkipOverlay',
          enabledSkipOverlay
        }).catch(console.error);
      }
    });
  });

  // Handle enabledSkipSponsorLink toggle change
  enabledSkipSponsorLinkToggle.addEventListener('change', () => {
    const enabledSkipSponsorLink = enabledSkipSponsorLinkToggle.checked;
    chrome.storage.local.set({ enabledSkipSponsorLink }, () => {
      console.log('Enabled skip sponsor link saved:', enabledSkipSponsorLink);
    });

    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleSkipSponsorLink',
          enabledSkipSponsorLink
        }).catch(console.error);
      }
    });
  });

  // Handle skipIntervalMainAd input change
  skipIntervalMainAdInput.addEventListener('change', () => {
    const skipIntervalMainAd = parseInt(skipIntervalMainAdInput.value, 10);
    chrome.storage.sync.set({ skipIntervalMainAd });
  });
});