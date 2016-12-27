var AutoConnect = (function() {
  var connectionId;
  function onConnect2(conn) {
    if (chrome.serial) {
      connectionId = conn.connectionId;
      chrome.serial.onReceive.addListener(SerialHelper.onReceiveCallback);
    }
    SerialHelper.init();
    commandsAfterStart();
  }

  function onGotInfo(info) {
    console.log(info);
    var buildIdx = -1;
    if ((buildIdx = info.indexOf("build")) > -1) {
      var buildNum = parseInt(info.substring(buildIdx + 5));
      if (buildNum < 20161202) {
        console.log("Disable CRC Sending: build is : " + buildNum);
        SerialHelper.sendCRC(false);
      } else {
        SerialHelper.sendCRC(true);
      }
    }
    ConfigurationFromESP.load();
  }

  function commandsAfterStart() {
    SerialHelper.startSequence();
    SerialHelper.addCommand({cmd:"nop 0", endOKstr: "ready >", timeout:40000, skipCrc:true});
    SerialHelper.addCommand({cmd:"info", endOKstr: "ready >", onOK: onGotInfo, skipCrc:true});
    SerialHelper.sendSequence();
  }

  function onVAirFound(comPort) {
    if (!comPort) {
      document.getElementById('btnAutoConnect').className="btn btn-danger";
      document.getElementById('btnAutoConnect').value ="Not Found";
    } else {
      log ("\n" + deviceType  + " found on : " + comPort);
      chrome.serial && chrome.serial.connect(comPort, {bitrate: 9600}, onConnect2);
      wsclient && onConnect2();
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
        connectionId = null;
        chrome.serial.onReceive.removeListener(SerialHelper.onReceiveCallback);
        document.getElementById('btnAutoConnect').className="btn btn-info";
        document.getElementById('btnAutoConnect').value ="Auto Connect";
        onbtnAutoConnect();
      })
    }
  }
  function onDisconnect() {
    if (wsclient) {
      wsclient.close();
      wsclient = null;
    } else {
      connectionId = null;
      chrome.serial.onReceive.removeListener(SerialHelper.onReceiveCallback);
    }
    document.getElementById('btnAutoConnect').className="btn btn-info";
    document.getElementById('btnAutoConnect').value ="Auto Connect";
  }
  function onbtnAutoConnect() {
    if (connectionId || wsclient) {
      chrome.serial && chrome.serial.disconnect(connectionId, onDisconnect);
      wsclient && onDisconnect();
    } else {
      document.getElementById('btnAutoConnect').className="btn btn-warning";
      document.getElementById('btnAutoConnect').value ="Searching...";
      if (chrome.serial) {
        DeviceFinder(onVAirFound, "Searching for v.Air ", 9600);
      } else {
        searchServer(onVAirFound);
      }
    }
  }

  function getConnectionId() {
    return connectionId;
  }

  return {
    onbtnAutoConnect : onbtnAutoConnect,
    reconnect : reconnect,
    commandsAfterStart : commandsAfterStart,
    getConnectionId : getConnectionId

  }
})();
