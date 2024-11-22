class AdSkipper {
  constructor() {
    this.enabled = true;
    this.skipInterval = null;
    this.initialize();
  }

  initialize() {
    this.startDetection();
    this.listenForStateChanges();
  }

  startDetection() {
    this.skipInterval = setInterval(() => {
      if (!this.enabled) return;
      
      // Skip video ads
      const skipButton = document.querySelector('.ytp-ad-skip-button');
      if (skipButton) {
        skipButton.click();
      }

      // Remove overlay ads
      const overlayAd = document.querySelector('.ytp-ad-overlay-container');
      if (overlayAd) {
        overlayAd.style.display = 'none';
      }

      // Skip to end of unskippable ads
      const video = document.querySelector('video');
      const adElement = document.querySelector('.video-ads');
      if (video && adElement && this.isAdPlaying()) {
        video.currentTime = video.duration;
      }
    }, 1000);
  }

  isAdPlaying() {
    return document.querySelector('.ad-showing') !== null;
  }

  listenForStateChanges() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleAdSkipper') {
        this.enabled = request.enabled;
        sendResponse({status: 'success'});
      }
    });
  }
}

// Initialize the ad skipper
const adSkipper = new AdSkipper(); 