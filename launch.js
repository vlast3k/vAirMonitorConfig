chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
	  id: "vAirMonitor2",
    innerBounds: {
      width: 900,
      height: 800
    },
    resizable:false
  });
});
