
document.getElementById('brgPlus').addEventListener('click', onBrgPlus);
document.getElementById('brgMin') .addEventListener('click', onBrgMinus);
document.getElementById('co2Plus').addEventListener('click', onCo2Plus);
document.getElementById('co2Min') .addEventListener('click', onCo2Minus);
document.getElementById('setWifi').addEventListener('click', onSetWifi);
document.getElementById('tsBtn').addEventListener('click', onSetTs);
$("#btnAutoConnect").click(onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#sapBtn").click(onBtnSAP);
$("#ubiBtn").click(onBtnUbi);
$("#customBtn").click(onBtnCustom);
$("button.testCfgBtn").click(onBtnTestCfg);
$("#updIntButton").click(onUpdIntButton);
$("#updThrButton").click(onUpdThrButton);
$("#resetCal").click(onResetCal);
$("#resetAll").click(onResetFact);
$("#setPPMBtn").click(onSetPPMBtn);
$("#setColorsBtn").click(onSetColorsBtn);
$("#setMQTT").click(onSetMQTT);
$("#setBRFBtn").click(onSetBRFBtn);
$("#ota").click(onBtnOTA);
$("#resetESP").click(onResetESP);
$("#bttnSetAction").click(onBttnSetAction);
$("#rfidSetAction").click(onRFIDSetAction);
$("#cmdSetAction").click(onCMDSetAction);



function onBttnSetAction() {
  var selTabId = $('#veButtonTabContent').find('.tab-pane.active').attr("id");
  if (selTabId == "bttnDweetio") {
    sendSerial('vespBttnA "dw","' + $("#bttnDwFor").val() + '","' + ($("#bttnDwParams").val()) + '"', "OK >")
  } else if (selTabId == "bttnIfttt") {
    sendSerial('vespBttnA "if","' + $("#bttnIfEvent").val() + '","' + $("#bttnIfKey").val() + '"', "OK >")
  } else if (selTabId == "bttnCustomhttp") {
    sendSerial('vespBttn ' + $("#bttnCustomUrl").val(), "OK >")
  }
}

function onRFIDSetAction() {
  var selTabId = $('#veRFIDTabContent').find('.tab-pane.active').attr("id");
  if (selTabId == "rfidDweetio") {
    sendSerial('vespRFIDA "dw","' + $("#rfidDwFor").val() + '","' + ($("#rfidDwParams").val()) + '"', "OK >")
  } else if (selTabId == "bttnIfttt") {
    sendSerial('vespRFIDA "if","' + $("#rfidIfEvent").val() + '","' + $("#rfidIfKey").val() + '"', "OK >")
  } else if (selTabId == "rfidCustomhttp") {
    sendSerial('vespRFID ' + $("#rfidCustomUrl").val(), "OK >")
  }
}

function onCMDSetAction() {
  var selTabId = $('#veCMDTabContent').find('.tab-pane.active').attr("id");
  if (selTabId == "cmdDweetio") {
    sendSerial('vespDWCmd ' + $("#cmdDwFor").val(), "OK >")
  }
}

//on change hide all divs linked to select and show only linked to selected option
$('.mystaff_hide').addClass('collapse');
$('#sel1').change(function(){
    var selector = '#sel1_' + $(this).val();

    //hide all elements
    $('.mystaff_hide').collapse('hide');

    //show only element connected to selected option
    $(selector).collapse('show');
});

 function log(msg, skipNL) {
   var buffer = document.querySelector('#buffer');
   buffer.value += msg + (skipNL?"":"\n");
   buffer.scrollTop = buffer.scrollHeight;
 }

var inputSelector = ":input[type='text'][id!='serial'][id!='pass'][id!='sapPass']";
$(inputSelector).change(function(event) {
  var obj = {};
  obj[event.target.id] = event.target.value;
  chrome.storage.sync.set(obj);
});

function loadAllSettings() {
  $(inputSelector).each(function() {
    var id = this.id;
   // log(id);
    chrome.storage.sync.get(this.id, function(value) {
      $("#" + id).val(value[id])
    })
  })
}


loadAllSettings();
setTimeout(onSSIDChange, 500);

var stringReceived = '';
var connectionId;
var onOK;
var serialString = "";
var serialTimeout;
var onOKString;


function onSSIDChange() {
  if ($("#ssid").val() == "SAP-Guest") {
    $("label[for=pass]").text("Username");
    $("#sap").removeClass("hidden");
  } else {
    $("label[for=pass]").text("Pass");
    $("#sap").addClass("hidden");
    $("#sapPass").val("");
  }
}


function onSerialSend() {
  if ($("#serial").val().startsWith("COM")) {
     deviceType = VTHING;
     onVAirFound($("#serial").val());
  } else {
     sendSerial($("#serial").val());
  }
  //chrome.serial.send(connectionId, str2ab($("#serial").val() +"\n"), onSend);
}

var VAIR = "vAir";
var VTHING = "vThing - CO2";
var VESPRINO_V1 = "vESPrino"
var VTHING_H801    = "vThing - H8"
var VTHING_STARTER = "sadsa"
//var VESPRINO_V1    = "vESPrino v1"

var deviceType = null;

function findDevice(onDeviceFound, text, baud) {
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
    var str = ab2str(conn.data);
    log ("[" + ab2str(conn.data).trim() + "]");
    devices[conn.connectionId].str += str;
    var s = devices[conn.connectionId].str;
    if (s.indexOf(VAIR) > -1)         deviceType = VAIR;
    else if (s.indexOf(VTHING) > -1)  deviceType = VTHING;
  //  else if (s.indexOf(VTHING_STARTER) > -1)  deviceType = VTHING_STARTER;
    else if (s.indexOf(VTHING_H801) > -1)  deviceType = VTHING_H801;
    else if (s.indexOf(VESPRINO_V1) > -1)  deviceType = VESPRINO_V1;
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

function onConnect2(conn) {
  //log ("Connected to: " + JSON.stringify(conn));
  connectionId = conn.connectionId;
  chrome.serial.onReceive.addListener(onReceiveCallback);
}

var onReceiveCallback = function(info) {
  var str = ab2str(info.data);
  clearTimeout(serialTimeout);
  serialTimeout = setTimeout(onSerialString, 100);
  serialString += str;
};

function onSerialString() {
  log ("[" + serialString.trim() + "]"); // + "\n waiting for : " + onOKString);
  if (serialString.indexOf(onOKString) > -1) {
    var ss = onOK;
    onOK = null;
    ss && ss();
  }
  serialString = "";
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
       if (deviceType == VTHING) {
         $("#otherSettingsVthing").removeClass("hidden");
         $("#panelTS").removeClass("hidden");
         $("#panelUBI").removeClass("hidden");
         $("#panelSAP").removeClass("hidden");
         $("#panelCustom").removeClass("hidden");
         $("#panelMQTT").removeClass("hidden");
       } else if (deviceType == VAIR) {
         $("#otherSettingsVair").removeClass("hidden");
         $("#panelTS").removeClass("hidden");
         $("#panelUBI").removeClass("hidden");
         $("#panelSAP").removeClass("hidden");
         $("#panelCustom").removeClass("hidden");
         $("#panelMQTT").removeClass("hidden");
       } else if (deviceType == VTHING_STARTER) {
         $("#panelSAP").removeClass("hidden");
       } else if (deviceType == VTHING_H801) {
         $("#panelCustom").removeClass("hidden");
         $("#panelMQTT").removeClass("hidden");
       } else if (deviceType == VESPRINO_V1) {
         $("#vESPrino_tab").removeClass("hidden");
       }
     }

   }


function reconnect() {
   if (connectionId) {
     chrome.serial.disconnect(connectionId, function() {
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
       connectionId = null;
       chrome.serial.onReceive.removeListener(onReceiveCallback);
       document.getElementById('btnAutoConnect').className="btn btn-info";
       document.getElementById('btnAutoConnect').value ="Auto Connect";
     })
   } else {
     document.getElementById('btnAutoConnect').className="btn btn-warning";
     document.getElementById('btnAutoConnect').value ="Searching...";
     findDevice(onVAirFound, "Searching for v.Air ", 9600);
   }
}

 function onSetTs() {
   chrome.serial.send(connectionId, str2ab("tskey " + document.getElementById('tsKey').value + "\n"), onSend);
 }

 function sendSerial(str, _onOKString, _onOK) {
   log("sending: " + str);
   if (_onOK) {
     onOKString = _onOKString || ">";
     onOK = _onOK;
   } else {
     onOKString = ">";
     onOK = _onOKString;
   }
   chrome.serial.send(connectionId, str2ab(str + "\n"), onSend);
 }

 function onBtnUbi() {
   log ("ubi:" +   $("#ubik").val() + "," +   $("#ubiv").val())
   sendSerial("ubik " + $("#ubik").val(),
     function() {sendSerial("ubiv " + $("#ubiv").val()) } );
 }

 function alertConfigStored() {
   log("\nConfiguration Stored\n");
 }

 function onBtnSAP() {

   var cfgiot2 = function() { sendSerial("cfgiot2 \"" + $("#sapToken").val() + "\",\"" + $("#sapBtnMessageId").val()  + "\"",
                                   ">", (deviceType == VTHING_STARTER)? alertConfigStored :  onbtnAutoConnect)};
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

 function onBtnOTA() {
   var otacmd = function() { sendSerial("otah", "GOT IP", reconnect) };

    if (deviceType == VAIR) {
      sendSerial("proxy", "GOT IP", otacmd)
    } else {
      otacmd();
    }

 }

 function createFunctionLinkedList(arr, createCommandCallback, onOKStr, lastFunc) {
   for (var i=arr.length-1; i >= 0; i--) {
     lastFunc = (function(idx, nextFunc) {
       return function() {sendSerial(createCommandCallback(idx, res[idx]), onOKStr, nextFunc)};
     })(i, lastFunc);
   }
   return lastFunc;
 }

 function urlsAppendThingSpeak(res) {
   if
 }
 function onBtnCustom() {
   var ss = $("#customURL").val();
   var res = ss.split("\n");
   res = urlsAppendThingSpeak(res);
   function cb = function(idx, path) { return 'custom_url_add "' + idx + "','" + path + "'"};
   function flist = createFunctionLinkedList(res, cb);
   var f1 = function() {sendSerial('custom_url_clean', "ready >", flist)};
   f1();
  //  var lastFunc;
  //  for (var i=res.length - 1; i >= 0; i--) {
  //    lastFunc = (function(idx, fff) {
  //      return function() {sendSerial('custom_url_add "' + idx + "','" + res[idx] + "'", "ready >", fff )};
   //
  //    })(i, lastFunc);
   //
  //  }
  //  var f1 = function() {sendSerial('custom_url_clean', "ready >", flist)};
   //
  //  f1();
   /*
   var cfgiot = function() { sendSerial("cfggen" + (ss ? (" " + ss) : ""), "DONE", reconnect) };
   var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot) }
   var sap   =  function() { sendSerial("sap " + (ss?"1":"0"), proxy); }

    if (deviceType == VAIR) {
      sap()
    } else {
      cfgiot()
    }
    */
 }

 function onSetMQTT() {
   log("set mqtt, value= " + $("#mqttValue").val());
   var setMqttValue= function() {sendSerial("cfg_mqval " + $("#mqttValue").val(), "DONE", reconnect); }
   var setMqttCore = function() {
     sendSerial("cfg_mqtt \"" + $("#mqttHost").val() + "\",\"" + $("#mqttPort").val() + "\",\"" + $("#mqttClientId").val() + "\",\""
                                                      + $("#mqttUser").val() + "\",\"" + $("#mqttPass").val() + "\",\"" + $("#mqttTopic")   .val()+ "\"",
                                        "DONE", setMqttValue); }
   var sap   =  function() { sendSerial("sap 1", proxy, null); }
   var proxy =  function() { sendSerial("proxy", "GOT IP", setMqttCore); }

 // ((deviceType == VAIR) ? sap : setMqttCore)();
    // }
    if (deviceType == VAIR) {
      sap()
    } else {
      setMqttCore()
    }
 }

 function onBtnTestCfg() {
   sendSerial("test");
 }

 var brg = 50;
 function onBrgPlus() {
   if (brg > 150) return;
   else setBrg (brg+=10);
 }

 function onBrgMinus() {
   if (brg <= 10) setBrg(brg = 1);
   else setBrg (brg-=10);
 }

 var co2 = 400;
 function onCo2Plus() {
   if (co2 > 2400) return;
   else setCo2(co2+=100);
 }

 function onCo2Minus() {
   if (co2 <= 400) setCo2(400);
   else setCo2(co2-=100);
 }

function setBrg(val) {
  chrome.serial.send(connectionId, str2ab("brg " + brg + "\n"), onSend);
}

function setCo2(val) {
  chrome.serial.send(connectionId, str2ab("ppm " +  co2+ "\n"), onSend);
}

function onUpdIntButton() {
  chrome.serial.send(connectionId, str2ab("wsi " +  $("#upd_int").val() + "\n"), onSend);
}

function onUpdThrButton() {
  chrome.serial.send(connectionId, str2ab("wst " +  $("#upd_thr").val() + "\n"), onSend);
}

function onResetFact() {
  chrome.serial.send(connectionId, str2ab("factory\n"), onSend);
}

function onResetCal() {
  chrome.serial.send(connectionId, str2ab("rco\n"), onSend);
}

$("#setPPMBtn").click(onSetPPMBtn);
$("#setColorsBtn").click(onSetColorsBtn);
function onSetPPMBtn() {
  chrome.serial.send(connectionId, str2ab("ppx " +  $("#setPPM").val() + "\n"), onSend);
}

function onSetColorsBtn() {
 chrome.serial.send(connectionId, str2ab("lt " +  $("#setColors").val() + " \n"), onSend);
}

function onSetBRFBtn() {
 chrome.serial.send(connectionId, str2ab("brf " +  ($("#setBRF").val()*10) + " \n"), onSend);
}

function onDebug() {
  chrome.serial.send(connectionId, str2ab("debug\n"), onSend);
}

function onSetWifi() {
  var ssid = document.getElementById('ssid').value;
  var pass = document.getElementById('pass').value;
  var sapPass = document.getElementById('sapPass').value;
  chrome.serial.send(connectionId, str2ab("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":"") + "\n"), onSend);
}

function onResetESP() {
  chrome.serial.setControlSignals(connectionId, {rts: true, dtr:true}, function(res) {log("set rts : " + res)});
  setTimeout(function() {chrome.serial.setControlSignals(connectionId, {rts: false, dtr:false}, function(res) {log("set rts : " + res)})}, 1000)

}

function onSend(data) {
}

//onSetMQTT();
onbtnAutoConnect();
