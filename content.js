class YoutubeAdSkipper {
    constructor() {
      this.enabled = true;
      this.skipInterval = null;
      this.initialize();
    }
  
    async initialize() {
      // 초기 상태 로드
      const result = await chrome.storage.local.get(['enabled']);
      this.enabled = result.enabled !== false;
  
      // storage 변경 감지
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.enabled) {
          this.enabled = changes.enabled.newValue;
          console.log('YoutubeAdSkipper status changed:', this.enabled);
        }
      });
  
      this.startDetection();
      this.listenForStateChanges();
    }
  
    startDetection() {
      this.skipInterval = setInterval(() => {
        if (!this.enabled) return;
  
        try {
          // 스킵 버튼 처리
          const skipButton = document.querySelector('.ytp-ad-skip-button');
          if (skipButton) {
            skipButton.click();
          }
  
          // 동영상 광고 처리
          const video = document.querySelector('video');
          const adElement = document.querySelector('.ad-showing');
          if (video && adElement) {
            video.muted = true;
            video.currentTime = video.duration;
          }
  
          // 오버레이 광고 제거
          const overlaySelectors = [
            '.ytp-ad-overlay-container',
            '.ytp-ad-overlay-slot',
            '.ytp-ad-overlay-close-button',
            '.ytp-suggested-action-badge'
          ];
  
          overlaySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              element.remove();
            });
          });
  
        } catch (error) {
          console.debug('Ad skip attempt failed:', error);
        }
      }, 500);
    }
  
    listenForStateChanges() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleYoutubeAdSkipper') {
          this.enabled = request.enabled;
          // storage에 상태 저장
          chrome.storage.local.set({ enabled: this.enabled });
          sendResponse({status: 'success'});
        }
      });
    }
  }
  
  // 초기화
  new YoutubeAdSkipper();