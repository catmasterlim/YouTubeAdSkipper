class YoutubeAdSkipper {
    constructor() {
      this.enabled = true;

      this.skipIntervalMin = 100;
      this.skipIntervalDefault = 500;
      this.skipInterval = this.skipIntervalDefault;
      this.skipIntervalMainAd = 3000; // Default to 3000 ms if not set
      this.skipIntervalId = null;
      this.skipIntervalMainAdId = null;
      this.enabledSkipSponsorVideo = true;
      this.enabledSkipOverlay = true; // Add enabledSkipOverlay property
      this.enabledSkipSponsorLink = true; // Add enabledSkipSponsorLink property

      this.initialize();
    }
  
    async initialize() {
      // 초기 상태 로드
      const result = await chrome.storage.local.get(
        ['enabled', 'skipInterval', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink'], 
        (result) => {
          this.enabled = result.enabled !== false;
          this.skipInterval = result.skipInterval || 500; // 기본값 500ms 설정
          this.enabledSkipSponsorVideo = result.enabledSkipSponsorVideo !== false; // 기본값 true 설정
          this.enabledSkipOverlay = result.enabledSkipOverlay !== false; // Load enabledSkipOverlay state
          this.enabledSkipSponsorLink = result.enabledSkipSponsorLink !== false; // Default to true if not set
  
          // storage 변경 감지
          chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
              if (changes.enabled) {
                this.enabled = changes.enabled.newValue;
                console.log('YoutubeAdSkipper status changed:', this.enabled);
              }
              if (changes.skipInterval) {
                if(changes.skipInterval.newValue < this.skipIntervalMin){
                  console.log('YoutubeAdSkipper interval :', this.skipInterval);  
                  return;
                }
                this.skipInterval = changes.skipInterval.newValue; // skipInterval 업데이트
                console.log('YoutubeAdSkipper skip interval changed:', this.skipInterval);
              }
              if (changes.enabledSkipSponsorVideo) {
                this.enabledSkipSponsorVideo = changes.enabledSkipSponsorVideo.newValue; // enabledSkipSponsorVideo 업데이트
                console.log('YoutubeAdSkipper skip sponsor video status changed:', this.enabledSkipSponsorVideo);
              }
              if (changes.enabledSkipOverlay) {
                this.enabledSkipOverlay = changes.enabledSkipOverlay.newValue; // Update enabledSkipOverlay state
                console.log('YoutubeAdSkipper skip overlay status changed:', this.enabledSkipOverlay);
              }
              if (changes.enabledSkipSponsorLink){
                this.enabledSkipSponsorLink = changes.enabledSkipSponsorLink.newValue; // Update enabledSkipSponsorLink state
                console.log('YoutubeAdSkipper skip sponsor link status changed:', this.enabledSkipSponsorLink);
              }          
            }
          });

          chrome.storage.sync.get('skipIntervalMainAd', ({ skipIntervalMainAd }) => {
            this.skipIntervalMainAd = skipIntervalMainAd || 3000; // Default to 3000 ms if not set
          });
  
          this.startDetection();
          this.listenForStateChanges();
        }
      );
    }

    removeOverlayAds() {
      const overlaySelectors = [
        '.ytp-ad-overlay-container',
        '.ytp-ad-overlay-slot',
        '.ytp-ad-overlay-close-button',
        '.ytp-suggested-action-badge'
      ];
  
      overlaySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          elements.forEach(element => {
            element.remove();
          });
        }
      });
    }

    removeSponsorAds() {
      const spNodes = document.querySelectorAll('ytd-rich-item-renderer:has(.ytd-in-feed-ad-layout-renderer)');
      if (spNodes && spNodes.length > 0) {
        spNodes.forEach(n => n.remove());
      }
  
      const spNodeTop = document.querySelectorAll('ytd-ad-slot-renderer');
      if (spNodeTop && spNodeTop.length > 0) {
        spNodeTop.forEach(n => n.remove());
      }
  
      const companion = document.querySelector('ytd-companion-slot-renderer');
      if (companion) {
        companion.remove();
      }
    }

    removeSponsorLinkAds() {
      let selectors = [
        '[target-id="engagement-panel-ads"]',        
      ];
  
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          elements.forEach(element => {
            element.remove();
          });
        }
      });
    }

    handleSkipButtons() {
      const skipButton = document.querySelector('.ytp-skip-ad-button');
      if (skipButton) {
        try {
          skipButton.click();
          skipButton.click();
        } catch (e) {
          console.log('skipButton click error:', e);
        }
      }
  
      const skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');
      if (skipButtonModern) {
        try {
          skipButtonModern.click();
          skipButtonModern.click();
        } catch (e) {
          console.log('skipButtonModern click error:', e);
        }
      }
  
      const skipAdText = document.querySelector('.ytp-ad-text');
      if (skipAdText) {
        try {
          skipAdText.click();
          skipAdText.click();
        } catch (e) {
          console.log('skipAdText click error:', e);
        }
      }
    }
  
    handleVideoAds() {
      const video = document.querySelector('video');
      const adElement = document.querySelector('.ad-showing');
      if (video && adElement) {
        video.muted = true;
        video.currentTime = video.duration;
      }
    }
  
    startDetection() {
      this.skipIntervalId = setInterval(() => {
        try {
          const dismissAdSkipApp = document.querySelector('ytd-enforcement-message-view-model #dismiss-button');
          if (dismissAdSkipApp) {
            try {
              dismissAdSkipApp.click();
            } catch (e) {
              console.log('dismissAdSkipApp click error:', e);
            }
          }
  
          if (this.enabledSkipOverlay) {
            try{
            this.removeOverlayAds();
            } catch (error) {
              console.debug('Ad skip overlay failed:', error);
            }
          }
  
          if (this.enabledSkipSponsorVideo) {
            try {
            this.removeSponsorAds();
            this.removeSponsorLinkAds();
            }catch (error) {
              console.debug('Ad skip sponsor video failed:', error);
            }
          }
        } catch (error) {
          console.debug('Ad skip attempt failed:', error);
        }
      }, this.skipInterval);

      this.skipIntervalMainAdId = setInterval(() => {
        try {
  
          if (this.enabled) {
            try {
            this.handleSkipButtons();
            this.handleVideoAds();
            } catch (error) {
              console.debug('Ad skip attempt failed:', error);
            }
          }

         
        } catch (error) {
          console.debug('Ad skip attempt failed:', error);
        }
      }, this.skipIntervalMainAd);
    }
  
    listenForStateChanges() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleYoutubeAdSkipper') {
          this.enabled = request.enabled;
          // storage에 상태 저장
          chrome.storage.local.set({ enabled: this.enabled });
          sendResponse({status: 'success'});
        }
        if (request.action === 'toggleSkipOverlay') {
          this.enabledSkipOverlay = request.enabledSkipOverlay;
          chrome.storage.local.set({ enabledSkipOverlay: this.enabledSkipOverlay });
          sendResponse({ status: 'success' });
        }
        if (request.action === 'toggleSkipOverlay') {
          this.enabledSkipOverlay = request.enabledSkipOverlay;
          chrome.storage.local.set({ enabledSkipOverlay: this.enabledSkipOverlay });
          sendResponse({ status: 'success' });
        }
        if (request.action === 'toggleSkipSponsorLink') {
          this.enabledSkipSponsorLink = request.enabledSkipSponsorLink;
          chrome.storage.local.set({ enabledSkipSponsorLink: this.enabledSkipSponsorLink });
          sendResponse({ status: 'success' });
        }
      });
    }
  }
  
  // 초기화
  new YoutubeAdSkipper();

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('adSkipToggle');
    const skipIntervalInput = document.getElementById('skipIntervalInput'); // Input for skipInterval
    const enabledSkipSponsorVideoToggle = document.getElementById('enabledSkipSponsorVideoToggle'); // Toggle for enabledSkipSponsorVideo
    const enabledSkipOverlayToggle = document.getElementById('enabledSkipOverlayToggle'); // Toggle for enabledSkipOverlay
    const enabledSkipSponsorLinkToggle = document.getElementById('enabledSkipSponsorLinkToggle'); // Toggle for enabledSkipSponsorLink
    
    // Load saved state
    chrome.storage.local.get(['enabled', 'skipInterval', 'enabledSkipSponsorVideo', 'enabledSkipSponsorLink', 'enabledSkipSponsorLink'], (result) => {
      toggle.checked = result.enabled !== false;
      skipIntervalInput.value = result.skipInterval || 500; // Default to 500 if not set
      enabledSkipSponsorVideoToggle.checked = result.enabledSkipSponsorVideo !== false; // Default to true if not set
      enabledSkipOverlayToggle.checked = result.enabledSkipOverlay !== false; // Default to true if not set
      enabledSkipSponsorLinkToggle.checked = result.enabledSkipSponsorLink !== false; // Default to true if not set
    });

    // storage 변경 감지
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.enabled) {
          toggle.checked = changes.enabled.newValue;
        }
        if (changes.skipInterval) {
          skipIntervalInput.value = changes.skipInterval.newValue || 500; // Update input value
        }
        if (changes.enabledSkipSponsorVideo) {
          enabledSkipSponsorVideoToggle.checked = changes.enabledSkipSponsorVideo.newValue !== false; // Update toggle state
        }
        if (changes.enabledSkipOverlay) {
          enabledSkipOverlayToggle.checked = changes.enabledSkipOverlay.newValue !== false; // Update toggle state
        }
        if (changes.enabledSkipSponsorLink) {
          enabledSkipSponsorLinkToggle.checked = changes.enabledSkipSponsorLink.newValue !== false; // Update toggle state
        }
      }
    });

    // Handle toggle changes
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ enabled });
      
      // U
      const skipInterval = parseInt(skipIntervalInput.value, 10) || 500; // Default to 500 if invalid
      chrome.storage.local.set({ skipInterval });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleSkipInterval',
            skipInterval
          }).catch(console.error);
        }
      });
    });
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ enabled });
      
      // 
      const enabledSkipSponsorVideo = enabledSkipSponsorVideoToggle.checked;

      chrome.storage.local.set({ enabledSkipSponsorVideo });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleSkipSponsorVideo',
            enabledSkipSponsorVideo
          }).catch(console.error);
        }
      });
    });
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ enabled });
      
      //  
      const enabledSkipOverlay = enabledSkipOverlay.checked;

      chrome.storage.local.set({ enabledSkipOverlay });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleSkipOverlay',
            enabledSkipOverlay
          }).catch(console.error);
        }
      });
    });
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ enabled });
      
      // Update 
      const enabledSkipSponsorLink = enabledSkipSponsorLinkToggle.checked;

      chrome.storage.local.set({ enabledSkipSponsorLink });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleSkipSponsorLink',
            enabled
          }).catch(console.error);
        }
      });
    });
  });