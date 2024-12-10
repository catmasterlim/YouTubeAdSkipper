document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('adSkipToggle');
  const skipIntervalInput = document.getElementById('skipIntervalInput'); // Input for skipInterval
  const enabledSkipSponsorVideoToggle = document.getElementById('enabledSkipSponsorVideoToggle'); // Toggle for enabledSkipSponsorVideo
  
  // Load saved state
  chrome.storage.local.get(['enabled', 'skipInterval', 'enabledSkipSponsorVideo'], (result) => {
    toggle.checked = result.enabled !== false;
    skipIntervalInput.value = result.skipInterval || 500; // Default to 500 if not set
    enabledSkipSponsorVideoToggle.checked = result.enabledSkipSponsorVideo !== false; // Default to true if not set
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled }, () => {
      console.log('Enabled state saved:', enabled);
    });
    
    // Update skipInterval and enabledSkipSponsorVideo settings
    const skipInterval = parseInt(skipIntervalInput.value, 10) || 500; // Default to 500 if invalid
    const enabledSkipSponsorVideo = enabledSkipSponsorVideoToggle.checked;

    chrome.storage.local.set({ skipInterval, enabledSkipSponsorVideo }, () => {
      console.log('Settings saved:', { skipInterval, enabledSkipSponsorVideo });
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
}); 