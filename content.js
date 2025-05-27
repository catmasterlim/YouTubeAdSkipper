class YoutubeAdSkipper {
    constructor() {      
      this.initialize();
    }
  
    async initialize() {
      
      console.log('[YoutubeAdSkipper] initialize');

      // 초기 상태 로드
      const result = await chrome.storage.local.get([
        'enabled', 'skipInterval','skipIntervalMainAd', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink'
      ]);
      this.enabled = result.enabled !== false;
      this.skipInterval = result.skipInterval || 1000;
      this.enabledSkipSponsorVideo = result.enabledSkipSponsorVideo !== false;
      this.enabledSkipOverlay = result.enabledSkipOverlay !== false;
      this.enabledSkipSponsorLink = result.enabledSkipSponsorLink !== false;
      this.skipIntervalMainAd = result.skipIntervalMainAd || 5000; // Default to 5000 ms if not set

      this.startDetection();
      this.listenForStateChanges();
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
        spNodes.forEach(n => {
          if (n.offsetParent !== null) {
            n.remove();
          }
        });
      }

      const spNodeTop = document.querySelectorAll('ytd-ad-slot-renderer');
      if (spNodeTop && spNodeTop.length > 0) {
        spNodeTop.forEach(n => {
          if (n.offsetParent !== null) {
            n.remove();
          }
        });
      }

      const companion = document.querySelector('ytd-companion-slot-renderer');
      if (companion && companion.offsetParent !== null) {
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
            if (element.offsetParent !== null) {
              element.remove();
            }
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
      console.log('[YoutubeAdSkipper] startDetection');
      
      if (this.skipIntervalId) {
        clearInterval(this.skipIntervalId);
      }
      if (this.skipIntervalMainAdId) {
        clearInterval(this.skipIntervalMainAdId);
      }      

      this.skipIntervalId = setInterval(() => {
        try {
          const dismissAdSkipApp = document.querySelector('ytd-enforcement-message-view-model #dismiss-button');
          if (dismissAdSkipApp) {
            try {
              dismissAdSkipApp.click();
              console.log('[YoutubeAdSkipper] enforcement-message dismiss 클릭');
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

      console.log('[YoutubeAdSkipper] listenForStateChanges');

      // 메시지 리스너 등록
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
        if (request.action === 'toggleSkipSponsorLink') {
          this.enabledSkipSponsorLink = request.enabledSkipSponsorLink;
          chrome.storage.local.set({ enabledSkipSponsorLink: this.enabledSkipSponsorLink });
          sendResponse({ status: 'success' });
        }
        if (request.action === 'toggleSkipSponsorVideo') {
          this.enabledSkipSponsorVideo = request.enabledSkipSponsorVideo;
          chrome.storage.local.set({ enabledSkipSponsorVideo: this.enabledSkipSponsorVideo });
          sendResponse({ status: 'success' });
        }
        if (request.action === 'toggleSkipInterval') {
          this.skipInterval = request.skipInterval;
          chrome.storage.local.set({ skipInterval: this.skipInterval });
          sendResponse({ status: 'success' });
        }
        if (request.action === 'toggleSkipIntervalMainAd') {
          this.skipIntervalMainAd = request.skipIntervalMainAd;
          chrome.storage.local.set({ skipIntervalMainAd: this.skipIntervalMainAd });
          sendResponse({ status: 'success' });
        }
      });
    }
  }
  
  // 초기화
  new YoutubeAdSkipper();

  document.addEventListener('DOMContentLoaded', () => {    

    this.initialize();

    // storage 변경 감지
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.initialize();
    });

  });