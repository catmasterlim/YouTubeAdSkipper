document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('adSkipToggle');
  
  // Load saved state
  chrome.storage.local.get(['enabled'], (result) => {
    toggle.checked = result.enabled !== false;
  });

  // storage 변경 감지
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
      toggle.checked = changes.enabled.newValue;
    }
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled });
    
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