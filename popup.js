document.addEventListener('DOMContentLoaded', () => {
  const toggleMainAd = document.getElementById('mainAdSkipToggle');
  const skipIntervalMainAdInput = document.getElementById('skipIntervalMainAdInput'); // Input for skipIntervalMainAd

  const enabledSkipSponsorVideoToggle = document.getElementById('enabledSkipSponsorVideoToggle'); // Toggle for enabledSkipSponsorVideo
  const enabledSkipOverlayToggle = document.getElementById('enabledSkipOverlayToggle'); // Toggle for enabledSkipOverlay
  const enabledSkipSponsorLinkToggle = document.getElementById('enabledSkipSponsorLinkToggle'); // Toggle for enabledSkipSponsorLink
  const skipIntervalInput = document.getElementById('skipIntervalInput'); // Input for skipInterval

  // Load saved state
  chrome.storage.local.get(['enabledMainAd', 'skipIntervalMainAd', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink', 'skipInterval'], (result) => {
    toggleMainAd.checked = result.enabledMainAd !== false;
    skipIntervalMainAdInput.value = result.skipIntervalMainAd || 6000;

    enabledSkipSponsorVideoToggle.checked = result.enabledSkipSponsorVideo !== false;
    enabledSkipOverlayToggle.checked = result.enabledSkipOverlay !== false;
    enabledSkipSponsorLinkToggle.checked = result.enabledSkipSponsorLink !== false;
    skipIntervalInput.value = result.skipInterval || 2000;
  });

  const changeValue = () => {
    chrome.storage.local.set({
      'enabledMainAd': toggleMainAd.checked,
      'skipIntervalMainAd': parseInt(skipIntervalMainAdInput.value, 10) || 6000,
      'enabledSkipSponsorVideo': enabledSkipSponsorVideoToggle.checked,
      'enabledSkipOverlay': enabledSkipOverlayToggle.checked,
      'enabledSkipSponsorLink': enabledSkipSponsorLinkToggle.checked,
      'skipInterval': parseInt(skipIntervalInput.value, 10) || 2000
    }, () => {
      console.log('Settings saved');
    });
  };

  // Handle toggle changes
  toggleMainAd.addEventListener('change', () => {    
    changeValue();
  });

  // Handle skipIntervalMainAd input change
  skipIntervalMainAdInput.addEventListener('change', function() {
    changeValue();
  });

  // Handle enabledSkipSponsorVideo toggle change
  enabledSkipSponsorVideoToggle.addEventListener('change', function() {
    changeValue();
  });

  // Handle enabledSkipOverlay toggle change
  enabledSkipOverlayToggle.addEventListener('change', function() {
    changeValue();
  });

  // Handle enabledSkipSponsorLink toggle change
  enabledSkipSponsorLinkToggle.addEventListener('change', function() {
    changeValue();
  });

  // Handle skipInterval input change
  skipIntervalInput.addEventListener('change', function() {
    changeValue();
  });
});
