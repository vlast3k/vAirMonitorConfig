var AutoConnect = (function() {
  var connectionId;
  function onConnect2(conn) {
    connectionId = conn.connectionId;
    chrome.serial.onReceive.addListener(SerialHelper.onReceiveCallback);
    SerialHelper.startSequence();
    SerialHelper.addCommand({cmd:"nop", endOKstr: "ready >", timeout:40000});
    SerialHelper.addCommand({cmd:"info", endOKstr: "ready >", onOK: ConfigurationFromESP.load});
    SerialHelper.sendSequence();
    KeepESPAwake.start();
  }

  function onVAirFound(comPort) {
    if (!comPort) {
      document.getElementById('btnAutoConnect').className="btn btn-danger";
      document.getElementById('btnAutoConnect').value ="Not Found";
    } else {
      log ("\n" + deviceType  + " found on : " + comPort);
      chrome.serial.connect(comPort, {bitrate: 9600}, onConnect2);
      document.getElementById('btnAutoConnect').className="btn btn-success";
      document.getElementById('btnAutoConnect').value ="Connected";
      if (deviceType == Constants.VTHING) {
        $("#otherSettingsVthing").removeClass("hidden");
        $("#panelTS").removeClass("hidden");
        $("#panelUBI").removeClass("hidden");
        $("#panelSAP").removeClass("hidden");
        $("#panelCustom").removeClass("hidden");
        $("#panelMQTT").removeClass("hidden");
      } else if (deviceType == Constants.VAIR) {
        $("#otherSettingsVair").removeClass("hidden");
        $("#panelTS").removeClass("hidden");
        $("#panelUBI").removeClass("hidden");
        $("#panelSAP").removeClass("hidden");
        $("#panelCustom").removeClass("hidden");
        $("#panelMQTT").removeClass("hidden");
      } else if (deviceType == Constants.VTHING_STARTER) {
        $("#panelSAP").removeClass("hidden");
      } else if (deviceType == Constants.VTHING_H801) {
        $("#panelCustom").removeClass("hidden");
        $("#panelMQTT").removeClass("hidden");
      } else if (deviceType == Constants.VESPRINO_V1) {
        $("#vESPrino_tab").removeClass("hidden");
      }
    }
  }

  function reconnect() {
    if (connectionId) {
      chrome.serial.disconnect(connectionId, function() {
        KeepESPAwake.end();
        connectionId = null;
        chrome.serial.onReceive.removeListener(onReceiveCallback);
        document.getElementById('btnAutoConnect').className="btn btn-info";
        document.getElementById('btnAutoConnect').value ="Auto Connect";
        onbtnAutoConnect();
      })
    }
  }

  function onbtnAutoConnect() {
    if (connectionId) {
      chrome.serial.disconnect(connectionId, function() {
        KeepESPAwake.end();
        connectionId = null;
        chrome.serial.onReceive.removeListener(onReceiveCallback);
        document.getElementById('btnAutoConnect').className="btn btn-info";
        document.getElementById('btnAutoConnect').value ="Auto Connect";
      })
    } else {
      document.getElementById('btnAutoConnect').className="btn btn-warning";
      document.getElementById('btnAutoConnect').value ="Searching...";
      DeviceFinder(onVAirFound, "Searching for v.Air ", 9600);
    }
  }

  function getConnectionId() {
    return connectionId;
  }
  
  return {
    onbtnAutoConnect : onbtnAutoConnect,
    reconnect : reconnect,
    getConnectionId : getConnectionId
  }
})();
