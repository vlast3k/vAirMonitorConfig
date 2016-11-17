




  // function findDevice(onDeviceFound, text, baud) {
  //   var devices = {};
  //   var findInterval = setInterval(function() { log(" . ", true);  }, 500);
  //
  //   function onIntDeviceFound(comPort, connId) {
  //     clearInterval(findInterval);
  //     clearTimeout(foundTimeout);
  //     Object.keys(devices).forEach(function(_connId) {
  //      chrome.serial.disconnect(+_connId, function() {});
  //     });
  //     chrome.serial.onReceive.removeListener(onRecvFindDev);
  //     setTimeout(function() {onDeviceFound(comPort)}, 1000);
  //   }
  //
  //   var foundTimeout = setTimeout(function() {
  //     onIntDeviceFound(null);
  //   }, 10000);
  //
  //   function onRecvFindDev(conn) {
  //     var str = ab2str(conn.data);
  //     log ("[" + ab2str(conn.data).trim() + "]");
  //     devices[conn.connectionId].str += str;
  //     var s = devices[conn.connectionId].str;
  //     if (s.indexOf(VAIR) > -1)         deviceType = VAIR;
  //     else if (s.indexOf(VTHING) > -1)  deviceType = VTHING;
  //   //  else if (s.indexOf(VTHING_STARTER) > -1)  deviceType = VTHING_STARTER;
  //     else if (s.indexOf(VTHING_H801) > -1)  deviceType = VTHING_H801;
  //     else if (s.indexOf(VESPRINO_V1) > -1)  deviceType = VESPRINO_V1;
  //     else return;
  //     onIntDeviceFound(devices[conn.connectionId].path, conn.connectionId);
  //   }
  //
  //
  //   function onGetDevices(ports) {
  //     chrome.serial.onReceive.addListener(onRecvFindDev);
  //     ports.forEach(function(ppp) {
  //       log("Trying : " + ppp.path + "\n");
  //       chrome.serial.connect(ppp.path, {bitrate: baud}, function(data) {
  //         function onRTSTimeout() {chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:false}, function() {}); }
  //         function onCtrlSigSet() {setTimeout(onRTSTimeout, 1000);  }
  //         if (!chrome.runtime.lastError && data) {
  //           devices[data.connectionId] = {path:ppp.path, str:""};
  //           chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:true}, onCtrlSigSet);
  //         }
  //       });
  //     });
  //   }
  //   log (text, true);
  //   chrome.serial.getDevices(onGetDevices);
  //
  // }


  // function onBttnSetAction() {
  //   var selTabId = $('#veButtonTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "bttnDweetio") {
  //     sendSerial('vespBttnA "dw","' + $("#bttnDwFor").val() + '","' + ($("#bttnDwParams").val()) + '"', "OK >")
  //   } else if (selTabId == "bttnIfttt") {
  //     sendSerial('vespBttnA "if","' + $("#bttnIfEvent").val() + '","' + $("#bttnIfKey").val() + '"', "OK >")
  //   } else if (selTabId == "bttnCustomhttp") {
  //     sendSerial('vespBttn ' + $("#bttnCustomUrl").val(), "OK >")
  //   }
  // }
  //
  // function onRFIDSetAction() {
  //   var selTabId = $('#veRFIDTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "rfidDweetio") {
  //     sendSerial('vespRFIDA "dw","' + $("#rfidDwFor").val() + '","' + ($("#rfidDwParams").val()) + '"', "OK >")
  //   } else if (selTabId == "bttnIfttt") {
  //     sendSerial('vespRFIDA "if","' + $("#rfidIfEvent").val() + '","' + $("#rfidIfKey").val() + '"', "OK >")
  //   } else if (selTabId == "rfidCustomhttp") {
  //     sendSerial('vespRFID ' + $("#rfidCustomUrl").val(), "OK >")
  //   }
  // }
  //
  // function onCMDSetAction() {
  //   var selTabId = $('#veCMDTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "cmdDweetio") {
  //     sendSerial('vespDWCmd ' + $("#cmdDwFor").val(), "OK >")
  //   }
  // }

  // //on change hide all divs linked to select and show only linked to selected option
  // $('.mystaff_hide').addClass('collapse');
  // $('#sel1').change(function(){
  //     var selector = '#sel1_' + $(this).val();
  //
  //     //hide all elements
  //     $('.mystaff_hide').collapse('hide');
  //
  //     //show only element connected to selected option
  //     $(selector).collapse('show');
  // });

  // var VAIR = "vAir";
  // var VTHING = "vThing - CO2";
  // var VESPRINO_V1 = "vESPrino"
  // var VTHING_H801    = "vThing - H8"
  // var VTHING_STARTER = "sadsa"
  //var VESPRINO_V1    = "vESPrino v1"

  // function onSetTs() {
  //   chrome.serial.send(connectionId, str2ab("tskey " + document.getElementById('tsKey').value + "\n"), onSend);
  // }
  //
  // var collectedSerialData = "";
  //
  // function sendSerial(str, _onOKString, _onOK) {
  //   //log("sending: " + str);
  //   collectedSerialData = "";
  //   if (_onOK) {
  //     onOKString = _onOKString || ">";
  //     onOK = _onOK;
  //   } else {
  //     onOKString = ">";
  //     onOK = _onOKString;
  //   }
  //   chrome.serial.send(connectionId, str2ab(str + "\n"), onSend);
  // }

  // function onBtnUbi() {
  //   log ("ubi:" +   $("#ubik").val() + "," +   $("#ubiv").val())
  //   sendSerial("ubik " + $("#ubik").val(),
  //   function() {sendSerial("ubiv " + $("#ubiv").val()) } );
  // }


  function alertConfigStored() {
    log("\nConfiguration Stored\n");
  }

  function onBtnSAP() {

    var cfgiot2 = function() { sendSerial("cfgiot2 \"" + $("#sapToken").val() + "\",\"" + $("#sapBtnMessageId").val()  + "\"",
    ">", (deviceType == VTHING_STARTER)? alertConfigStored :  AutoConnect.onbtnAutoConnect)};
    var cfgiot1 = function() { sendSerial("cfgiot1 \"" + $("#sapHost").val()     + "\",\""+ $("#sapDeviceId").val() + "\",\""
    //                                 + $("#sapMessageId").val() + "\",\""+ $("#sapVarName").val()  + "\"",
    + $("#sapMessageId").val() + "\",\"temp\"",
    ">", cfgiot2) };
    var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot1) }
    var sap   =  function() { sendSerial("sap 1", proxy); }
    //log("sadsadsadsa: " + deviceType + "   "  + (deviceType == VAIR));
    if (deviceType == VAIR) {
      sap()
    } else {
      cfgiot1()
    }
  }
