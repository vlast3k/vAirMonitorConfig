var DeviceFinder = function (onDeviceFound, text, baud) {
  var devices = {};
  var findInterval = setInterval(function() { log(" . ", true);  }, 500);

  function onIntDeviceFound(comPort, connId) {
    clearInterval(findInterval);
    clearTimeout(foundTimeout);
    Object.keys(devices).forEach(function(_connId) {
     chrome.serial.disconnect(+_connId, function() {});
    });
    chrome.serial.onReceive.removeListener(onRecvFindDev);
    setTimeout(function() {onDeviceFound(comPort)}, 1000);
  }

  var foundTimeout = setTimeout(function() {
    onIntDeviceFound(null);
  }, 10000);

  function onRecvFindDev(conn) {
    var str = SerialHelper.ab2str(conn.data);
    log ("[" + SerialHelper.ab2str(conn.data).trim() + "]");
    devices[conn.connectionId].str += str;
    var s = devices[conn.connectionId].str;
    if (s.indexOf(Constants.VAIR) > -1)         deviceType = Constants.VAIR;
    else if (s.indexOf(Constants.VTHING) > -1)  deviceType = Constants.VTHING;
  //  else if (s.indexOf(VTHING_STARTER) > -1)  deviceType = VTHING_STARTER;
    else if (s.indexOf(Constants.VTHING_H801) > -1)  deviceType = Constants.VTHING_H801;
    else if (s.indexOf(Constants.VESPRINO_V1) > -1)  deviceType = Constants.VESPRINO_V1;
    else return;
    onIntDeviceFound(devices[conn.connectionId].path, conn.connectionId);
  }


  function onGetDevices(ports) {
    chrome.serial.onReceive.addListener(onRecvFindDev);
    ports.forEach(function(ppp) {
      log("Trying : " + ppp.path + "\n");
      chrome.serial.connect(ppp.path, {bitrate: baud}, function(data) {
        function onRTSTimeout() {chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:false}, function() {}); }
        function onCtrlSigSet() {setTimeout(onRTSTimeout, 1000);  }
        if (!chrome.runtime.lastError && data) {
          devices[data.connectionId] = {path:ppp.path, str:""};
          chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:true}, onCtrlSigSet);
        }
      });
    });
  }
  log (text, true);
  chrome.serial.getDevices(onGetDevices);

}
