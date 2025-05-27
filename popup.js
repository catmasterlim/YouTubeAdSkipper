document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('adSkipToggle');
  const skipIntervalInput = document.getElementById('skipIntervalInput'); // Input for skipInterval
  const enabledSkipSponsorVideoToggle = document.getElementById('enabledSkipSponsorVideoToggle'); // Toggle for enabledSkipSponsorVideo
  const enabledSkipOverlayToggle = document.getElementById('enabledSkipOverlayToggle'); // Toggle for enabledSkipOverlay
  const enabledSkipSponsorLinkToggle = document.getElementById('enabledSkipSponsorLinkToggle'); // Toggle for enabledSkipSponsorLink
  const skipIntervalMainAdInput = document.getElementById('skipIntervalMainAdInput'); // Input for skipIntervalMainAd

  // Load saved state
  chrome.storage.local.get(['enabled', 'skipInterval', 'skipIntervalMainAd', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink'], (result) => {
    toggle.checked = result.enabled !== false;
    skipIntervalInput.value = result.skipInterval || 2000; // Default to 1000 if not set
    enabledSkipSponsorVideoToggle.checked = result.enabledSkipSponsorVideo !== false; // Default to true if not set
    enabledSkipOverlayToggle.checked = result.enabledSkipOverlay !== false; // Default to true if not set
    enabledSkipSponsorLinkToggle.checked = result.enabledSkipSponsorLink !== false; // Default to true if not set
    skipIntervalMainAdInput.value = result.skipIntervalMainAd || 6000; // Default to 5000 if not set
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;

    chrome.storage.local.set({ enabled}, () => {
      console.log('Settings saved:', { enabled });
    });

    // Notify content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleYoutubeAdSkipper',
          enabled
        }).catch(() => {}); // 에러 무시
      }
    });
  });

  // Handle skipInterval input change
  skipIntervalInput.addEventListener('change', function() {
    const skipInterval = parseInt(this.value, 10) || 1000;
    chrome.storage.local.set({ skipInterval }, () => {
      console.log('Skip interval saved:', skipInterval, 'input value:', this.value);
    });
  });

  // Handle enabledSkipSponsorVideo toggle change
  enabledSkipSponsorVideoToggle.addEventListener('change', function() {
    const enabledSkipSponsorVideo = this.checked;
    chrome.storage.local.set({ enabledSkipSponsorVideo }, () => {
      console.log('Enabled skip sponsor video saved:', enabledSkipSponsorVideo, 'input value:', this.checked);
    });
  });

  // Handle enabledSkipOverlay toggle change
  enabledSkipOverlayToggle.addEventListener('change', function() {
    const enabledSkipOverlay = this.checked;
    chrome.storage.local.set({ enabledSkipOverlay }, () => {
      console.log('Enabled skip overlay saved:', enabledSkipOverlay, 'input value:', this.checked);
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
  enabledSkipSponsorLinkToggle.addEventListener('change', function() {
    const enabledSkipSponsorLink = this.checked;
    chrome.storage.local.set({ enabledSkipSponsorLink }, () => {
      console.log('Enabled skip sponsor link saved:', enabledSkipSponsorLink, 'input value:', this.checked);
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
  skipIntervalMainAdInput.addEventListener('change', function() {
    const skipIntervalMainAd = parseInt(this.value, 10) || 5000;
    chrome.storage.local.set({ skipIntervalMainAd }, () => {
      console.log('Skip skipIntervalMainAd saved:', skipIntervalMainAd, 'input value:', this.value);
    });
  });
});