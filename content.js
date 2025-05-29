class YoutubeAdSkipper {
    constructor() {      
      this.initialize();
    }
  
    async initialize() {
      
      console.log('[YoutubeAdSkipper] initialize');

      // 초기 상태 로드
      const result = await chrome.storage.local.get([
        'enabledMainAd', 'skipIntervalMainAd', 'enabledSkipSponsorVideo', 'enabledSkipOverlay', 'enabledSkipSponsorLink', 'skipInterval'
      ]);
      this.enabledMainAd = result.enabledMainAd !== false;
      this.skipIntervalMainAd = result.skipIntervalMainAd || 5000; // Default to 5000 ms if not set

      this.enabledSkipSponsorVideo = result.enabledSkipSponsorVideo !== false;
      this.enabledSkipOverlay = result.enabledSkipOverlay !== false;
      this.enabledSkipSponsorLink = result.enabledSkipSponsorLink !== false;      
      this.skipInterval = result.skipInterval || 1000;

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
      
      if (this.skipIntervalMainAdId) {
        clearInterval(this.skipIntervalMainAdId);
      }            
      this.skipIntervalMainAdId = setInterval(() => {        
        try {          
          if (this.enabledMainAd) { 
            console.log('[YoutubeAdSkipper] startDetection - running maiin ad skip, interval:', this.skipIntervalMainAd);
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

      if (this.skipIntervalId) {
        clearInterval(this.skipIntervalId);
      }
      this.skipIntervalId = setInterval(() => {
        console.log('[YoutubeAdSkipper] startDetection - running ad skip, interval:', this.skipInterval);
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
    }
  
    listenForStateChanges() {

      console.log('[YoutubeAdSkipper] listenForStateChanges');

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