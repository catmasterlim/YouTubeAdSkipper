class YoutubeAdSkipper {
    constructor() {
      this.enabled = true;

      this.skipIntervalMin = 100;
      this.skipIntervalDefault = 500;
      this.skipInterval = this.skipIntervalDefault;
      this.enabledSkipSponsorVideo = true;
      this.initialize();
    }
  
    async initialize() {
      // 초기 상태 로드
      const result = await chrome.storage.local.get(['enabled', 'skipInterval', 'enabledSkipSponsorVideo']);
      this.enabled = result.enabled !== false;
      this.skipInterval = result.skipInterval || 500; // 기본값 500ms 설정
      this.enabledSkipSponsorVideo = result.enabledSkipSponsorVideo !== false; // 기본값 true 설정
  
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
        }
      });
  
      this.startDetection();
      this.listenForStateChanges();
    }
  
    startDetection() {
      this.skipIntervalId = setInterval(() => {
  
        try {

          const dismissAdSkipApp = document.querySelector('ytd-enforcement-message-view-model #dismiss-button');
          if(dismissAdSkipApp){
            try{
              dismissAdSkipApp.click();
            }catch(e){
              console.log('dismissAdSkipApp click error:', e);
            }
          }

          if(this.enabled){
            // 스킵 버튼 처리
            const skipButton = document.querySelector('.ytp-skip-ad-button');
            if (skipButton) {
              try{
                skipButton.click();
                skipButton.click();
              }catch(e){
                console.log('skipButton click error:', e);
              }
            }

            const skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');
            if (skipButtonModern) {
              try{
                skipButtonModern.click();
                skipButtonModern.click();
              }catch(e){
                console.log('skipButtonModern click error:', e);
              }
            }

            const skipAdText = document.querySelector('.ytp-ad-text');
            if(skipAdText){
              try{
                skipAdText.click();
                skipAdText.click();
              }catch(e){
                console.log('skipAdText click error:', e);
              }
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
              if(elements != undefined && elements.length > 0){
                elements.forEach(element => {
                  element.remove();
               });
            }
            });
        }

          // 스폰서 영상 제거
          if(this.enabledSkipSponsorVideo){
            const spNodes = document.querySelectorAll('ytd-rich-item-renderer:has(.ytd-in-feed-ad-layout-renderer)');
            if(spNodes != undefined && spNodes.length > 0){
              spNodes.forEach(n => n.remove());
            }

            const spNodeTop = document.querySelectorAll('ytd-ad-slot-renderer');
            if(spNodeTop != undefined && spNodeTop.length > 0){
              spNodeTop.forEach(n => n.remove());
            }
            
            const compaion = document.querySelector('ytd-companion-slot-renderer');
            if(compaion != undefined){
              compaion.remove();
            }
          }    
          
          // attached message 제거
          // if(this.enabledSkipSponsorVideo){
          //   const attachedNodes = document.querySelectorAll('.attached-message');
          //   if(attachedNodes != undefined && attachedNodes.length > 0){
          //     attachedNodes.forEach(n => n.remove());
          //   }
          // } 
  
        } catch (error) {
          console.debug('Ad skip attempt failed:', error);
        }
      }, this.skipInterval);
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
      }
    });

    // Handle toggle changes
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ enabled });
      
      // Update skipInterval and enabledSkipSponsorVideo settings
      const skipInterval = parseInt(skipIntervalInput.value, 10) || 500; // Default to 500 if invalid
      const enabledSkipSponsorVideo = enabledSkipSponsorVideoToggle.checked;

      chrome.storage.local.set({ skipInterval, enabledSkipSponsorVideo });

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleYoutubeAdSkipper',
            enabled
          }).catch(console.error);
        }
      });
    });
  });