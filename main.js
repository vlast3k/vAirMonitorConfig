
document.getElementById('brgPlus').addEventListener('click', onBrgPlus);
document.getElementById('brgMin') .addEventListener('click', onBrgMinus);
document.getElementById('co2Plus').addEventListener('click', onCo2Plus);
document.getElementById('co2Min') .addEventListener('click', onCo2Minus);
document.getElementById('setWifi').addEventListener('click', onSetWifi);
document.getElementById('tsBtn').addEventListener('click', onBtnCustom);
$("#ubiSaveBtn").click(onBtnCustom);
$("#dzSaveBtn").click(onBtnCustom);
$("#pimaSaveBtn").click(onBtnCustom);
$("#jeeSaveBtn").click(onBtnCustom);
$("#beeSaveBtn").click(onSetMQTT);
$("#ohSaveBtn").click(onSetMQTT);
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
$("#rfEnable").change(onRFEnableChange);
$("#setRF").click(onSetRF);

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

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
   if (chrome.storage)
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
  sendSerial("nop", "ready >", function() {
    sendSerial("info", "ready >", loadPropertiesFromESP)
  });
  startNOPTimer();
  //loadPropertiesFromESP();
}

var onReceiveCallback = function(info) {
  var str = ab2str(info.data);
  clearTimeout(serialTimeout);
  serialTimeout = setTimeout(onSerialString, 100);
  serialString += str;
};

function onSerialString() {
  collectedSerialData += serialString;
  log ("[" + serialString.trim() + "]"); // + "\n waiting for : " + onOKString);
  if (serialString.indexOf(onOKString) > -1) {
    var ss = onOK;
    onOK = null;
    console.log("ss is: " + ss);
    ss && ss(collectedSerialData);
  }
  serialString = "";
  if (collectedSerialData.length > 10000) collectedSerialData = "";
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
       endNOPTimer();
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
       endNOPTimer();
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

 var collectedSerialData = "";

 function sendSerial(str, _onOKString, _onOK) {
   //log("sending: " + str);
   collectedSerialData = "";
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

 function createFunctionLinkedList(arr, onOKStr, lastFunc) {
   for (var i=arr.length-1; i >= 0; i--) {
     lastFunc = (function(cmd, nextFunc) {
       return function() {sendSerial(cmd, onOKStr, nextFunc)};
     })(arr[i], lastFunc);
   }
   return lastFunc;
 }

 function urlsAppendThingSpeak() {
   var tsKey = $("#tsKey").val();
   if (!tsKey) return [];
   var tsFields = $("#ts_fields option").filter(":selected").map(function() {return $(this).text()});
   var url = "#http://api.thingspeak.com/update?key=" + tsKey;
   for (var i=1; i<=tsFields.length; i++) {
     if (!tsFields[i-1]) continue;
     url += "&field" + i + "=%" + tsFields[i-1] + "%";
   }

   console.log("ts url: " + url);
   return url;
 }

 function readUBIPayload() {
   var vars = {};
   $("#ubi_fields :input").filter(".lbi").each(function() {if($(this).val()) vars[$(this).val()] = '%' + $(this).attr("data-label") + '%'});
   return JSON.stringify(vars).replace(/"%/g,'%').replace(/%"/g,'%');
 }

 function processUbidotsURLConfig() {
   var ubiToken = $("#ubiToken").val();
   var ubiDSLabel = $("#ubiDSLabel").val();
   if (!ubiToken || !ubiDSLabel) return[];
   //var pay = readUBIPayload();
   var res={};
   res.method = "POST";
   res.url = "http://things.ubidots.com/api/v1.6/devices/" + ubiDSLabel + "?token=" + ubiToken;
   res.ct  = "application/json";
   res.pay = readUBIPayload();
   return ["#" + JSON.stringify(res)];
 }

 function processDomoticzURLConfig() {
   var dzHost =  $("#dzHost").val();
   if (!dzHost) return[];
   var dzPort =  $("#dzHttpPort").val();

   var urls = [];
   ///json.htm?type=command&param=udevice&idx=IDX&nvalue=PPM
   if ( $("#dzCO2").val())    urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzCO2").val()));
   if ( $("#dzTH").val())     urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=0&svalue=%TEMP%;%HUM%;0".format(dzHost, dzPort, $("#dzTH").val()));
   if ( $("#dzTHB").val())    urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=0&svalue=%TEMP%;%HUM%;0;%PRES%;0".format(dzHost, dzPort, $("#dzTHB").val()));
   if ( $("#dzDust25").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzDust25").val()));
   if ( $("#dzDust10").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzDust10").val()));
   return urls;
 }

 function processJeedomURLConfig() {
   var host = $("#jeeHost").val();
   if (!host) return [];
   var port = $("#jeePort").val() || "80";
   var key  = $("#jeeKey").val();
   var path = $("#jeePath").val();

   if (path && path.charAt(0) == '/') path.substring(1);
   if (path && path.charAt(path.length-1) != '/') path += '/';
   var msgs = [];
   $("#jee_fields :input").filter(".lbi").each(function() {
     if (!$(this).val()) return;
     msgs = msgs.concat("#http://{0}:{1}/{2}core/api/jeeApi.php?apikey={3}&type=virtual&id={4}&value=%{5}%"
            .format(host, port, path, key, $(this).val(), $(this).attr("data-label")));
          });
   return msgs;
 }

 function processPimaURLConfig() {
   var host = $("#pimaHost").val();
   if (!host) return [];
   var port = $("#pimaPort").val() || "80";
   var pass  = $("#pimaPass").val();
   var user = $("#pimaUser").val();

  //  curl \
  //    -X PATCH \
  //    --header "Content-Type:application/json" \
  //    --data '{"type": "value", "valueOrExpression": 1337}' \
  //    --user "user:password" \
  //    http://your-pimatic/api/variables/the-answer
  //
   var msgs = [];
   $("#pima_fields :input").filter(".lbi").each(function() {
     if (!$(this).val()) return;
     var entry = {};
     entry.method = "PATCH";
     res.url = "http://{0}:{1}@{2}:{3}/api/variables/{4}".format(user, pass, host, port, $(this).val());
     res.ct  = "application/json";
     res.pay = '{"type": "value", "valueOrExpression": %' + $(this).attr("data-label") + '%}' ;

     msgs = msgs.concat("#" + JSON.stringify(res));
    });
   return msgs;
 }

 function processUbidotsStoreConfig() {
   var store = {};
   store.ubiToken = $("#ubiToken").val();
   store.ubiDSLabel = $("#ubiDSLabel").val();
   store.values ={};
   $("#ubi_fields :input").filter(".lbi").each(function() {store.values[$(this).attr("data-label")] = $(this).val()});
   return "prop_jset \"ubi.cfg\"" + JSON.stringify(store);
 }


 function processDomoticzStoreConfig() {
   var store = {};
   store.dzHost = $("#dzHost").val();
   store.dzHttpPort = $("#dzHttpPort").val();
   store.values ={};
   $("#dz_fields input").each(function() {store.values[$(this).attr("id")] = $(this).val()});
   return "prop_jset \"dz.cfg\"" + JSON.stringify(store);
 }

  // function processJeedomConfig() {
  //   var store = {};
  //   $("#repJeedom input[id]").each(function() {store[$(this).attr("id")] = $(this).val()});
  //   return "prop_jset \"jee.cfg\"" + JSON.stringify(store);
  // }
  function processGenericIDConfig(rootTag, cfgName) {
     var store = {};
     $("#" + rootTag + " input[id]").each(function() {store[$(this).attr("id")] = $(this).val()});
     return "prop_jset \"" + cfgName + "\"" + JSON.stringify(store);
   }

 function processTSStoreConfig() {
   return ['prop_set "tsKey" "' + $("#tsKey").val() + '"'];
 }

 function onBtnCustom() {
   var ss = $("#customURL").val();
   var res = ss.split("\n").filter(function(val) {return (val && val.charAt(0) != '#') ? true:false});
   res = res.concat(processUbidotsURLConfig());
   res = res.concat(processDomoticzURLConfig());
   res = res.concat(urlsAppendThingSpeak());
   res = res.concat(processJeedomURLConfig());
   res = res.concat(processPimaticURLConfig());
   $("#customURL").val(res.join("\n"));
   var cb = function(path, idx) {
     if (path.indexOf('\"') > -1) {
       return 'custom_url_jadd "' + idx + '"' + path;
     } else {
       return 'custom_url_add "' + idx + '","' + path + '"'
     }

   };
   res = res.map(cb);
   res = ['custom_url_clean'].concat(res);
   res = res.concat(processTSStoreConfig());
   res = res.concat(processUbidotsStoreConfig());
   res = res.concat(processDomoticzStoreConfig());
   res = res.concat(processGenericIDConfig("repJeedom", "jee.cfg"));
   res = res.concat(processGenericIDConfig("pimaJeedom", "pima.cfg"));
   var flist = createFunctionLinkedList(res, "ready >", function() {});
   //var f1 = function() {sendSerial('custom_url_clean', "ready >", flist)};
  // var storeTSCfg = makeStoreTSCfg(f1);
   flist();
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

 function processBeebotteConfig() {
   var channel = $("#beeChannel").val();
   if (!channel) return;
   $("#mqttHost").val("mqtt.beebotte.com");
   $("#mqttPort").val("1883");
   $("#mqttUser").val("token:" + $("#beeToken").val());
   var msgs = "";
   $("#bee_fields :input").filter(".lbi").each(function() {
     if (!$(this).val()) return;
     msgs += "{0}/{1}:{\"data\":%{2}%,\"write\":true,\"ispublic\":true}\n"
            .format(channel, $(this).val(), $(this).attr("data-label"));
          });
   $("#mqttValue").val(msgs);
 }

 function processOpenHABConfig() {
   var host = $("#ohHost").val();
   if (!host) return;
   $("#mqttHost").val(host);
   $("#mqttPort").val($("#ohPort").val());
   $("#mqttUser").val("");
   $("#mqttPass").val("");
   var msgs = "";
   $("#oh_fields :input").filter(".lbi").each(function() {
     if (!$(this).val()) return;
     msgs += "{0}:%{1}%\n".format($(this).val(), $(this).attr("data-label"));});
   $("#mqttValue").val(msgs);
 }

 function processBeebotteStoreConfig() {
   var store = {};
   store.beeChannel = $("#beeChannel").val();
   store.beeToken = $("#beeToken").val();
   store.values ={};
   $("#bee_fields :input").filter(".lbi").each(function() {store.values[$(this).attr("data-label")] = $(this).val()});
   return "prop_jset \"bee.cfg\"" + JSON.stringify(store);
 }

 function processOpenHABStoreConfig() {
   var store = {};
   store.ohHost = $("#ohHost").val();
   store.ohPort = $("#ohPort").val();
   store.values ={};
   $("#oh_fields :input").filter(".lbi").each(function() {store.values[$(this).attr("data-label")] = $(this).val()});
   return "prop_jset \"oh.cfg\"" + JSON.stringify(store);
 }


 function onSetMQTT() {
   processBeebotteConfig();
   processOpenHABConfig();
   log("set mqtt, value= " + $("#mqttValue").val());
   var callMqttSetup = 'mqtt_setup "' + $("#mqttHost").val()     + '","' + $("#mqttPort").val() + '","'
                               + $("#mqttClientId").val() + '","' + $("#mqttUser").val() + '","'
                               + $("#mqttPass").val()     + '"';
   var cb = function(path, idx) { return 'mqtt_msg_add "' + idx + '"' + path};
   var res = $("#mqttValue").val().split("\n").filter(function(val) {return val});
   res = res.map(cb);
   res = [callMqttSetup, 'mqtt_msg_clean'].concat(res);
   res = res.concat(processBeebotteStoreConfig());
   res = res.concat(processOpenHABStoreConfig());
   var flist = createFunctionLinkedList(res, "ready >", function() {});
   flist();
//   var sap   =  function() { sendSerial("sap 1", proxy, null); }
//   var proxy =  function() { sendSerial("proxy", "GOT IP", setMqttCore); }

// // ((deviceType == VAIR) ? sap : setMqttCore)();
//     // }
//     if (deviceType == VAIR) {
//       sap()
//     } else {
//       setMqttCore()
//     }
 }

 function onBtnTestCfg() {
   sendSerial("sendNow");
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
  //chrome.serial.send(connectionId, str2ab("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":"") + "\n"), onSend);
  sendSerial("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":""), "GOT IP", onSetWifiConnected);
}

function onSetWifiConnected() {
  sendSerial("fupd");
}

function onResetESP() {
  chrome.serial.setControlSignals(connectionId, {rts: true, dtr:true}, function(res) {log("set rts : " + res)});
  setTimeout(function() {chrome.serial.setControlSignals(connectionId, {rts: false, dtr:false}, function(res) {log("set rts : " + res)})}, 1000)

}

function loadPropertiesFromESP() {
  sendSerial("prop_list", "---vESPrinoCFG_end---", onPropListDone);
}

function onPropListDone(data) {
  if (data.indexOf("---vESPrinoCFG_start---") > -1 &&  data.indexOf("---vESPrinoCFG_end---") > -1 );
  data = data.substring(data.indexOf("---vESPrinoCFG_start---"), data.indexOf("---vESPrinoCFG_end---"));
  processConfigurationFromESP(data);
}

function onSend(data) {
}

var testCfgData = 'wifi.ssid=vladiHome\n' +
                  'wifi.p1=0888414447\n'  +
                  'fake=\n'  +
                  'fake2\n'  +
                  'custom_url_arr0=url1\n'  +
                  'custom_url_arr1=url1\n'  +
                  'custom_url_arr2=url1\n';

var espMapping = {
  "wifi.ssid":"#ssid",
  "wifi.p1" : "#pass",
  "custom_url_arr" : "#customURL",
  "mqtt_msg_arr" : "#mqttValue",
  "mqtt.server" : "#mqttHost",
  "mqtt.port"   :"#mqttPort",
  "mqtt.client" :"#mqttClientId",
  "mqtt.user"   :"#mqttUser",
  "mqtt.pass"   :"#mqttPass",
  "mqtt.topic"  :"#mqttTopic",
  "send.interval": "#upd_int"
}

function combineLines(obj, prefix) {
  var whole = "";
  for (var i=0; i < 10; i++) {
    if (!obj[prefix + i]) break;
    whole += obj[prefix + i] + "\n";
    delete obj[prefix + i];
  }

  whole && (obj[prefix] = whole);
}

function processConfigurationFromESP(data) {
  var lines = data.split("\n");
  var obj = {};
  for (var i=0; i < lines.length; i++) {
    var t = lines[i].indexOf("=");
    if (t == -1) continue;
    var key = lines[i].substring(0, t);
    var value = lines[i].substring(t+1);
    if (value.length == 0) continue;
    obj[key] = value;
  }
  combineLines(obj, "custom_url_arr");
  combineLines(obj, "mqtt_msg_arr");

  cleanAllInputs();
  Object.keys(obj).forEach(function(key) {
     var el = $("[id='" + key + "']");
     if (el.length) el.val(obj[key]);
     else $(espMapping[key]).val(obj[key]);
  });

  if (!obj["rf.enabled"] || obj["rf.enabled"].startsWith("false")) $("#rfEnable").prop("checked", false);
  else $("#rfEnable").prop("checked", true);
  onRFEnableChange();
  applyUbiDotsConfig(obj);
  applyBeebotteConfig(obj);
  applyDomoticzConfig(obj);
  applyOpenHABConfig(obj);
  applyJeedomConfig(obj);
  applyGenericJSONConfig(obj["jee.cfg"]);
  applyGenericJSONConfig(obj["pima.cfg"]);
  //lines.forEach(handleCfgLine);
}

function applyUbiDotsConfig(obj) {
  //u//bi.cfg={"ubiToken":"QE6KXlZsqWAffjPwM8lVqGzMfJMPri","ubiDSLabel":"test123","values":{"CO2":"var1","TEMP":"var2","HUM":"asd","PRES":"","PM25":"","PM10":"","undefined":""}}
  if (!obj["ubi.cfg"]) return;
  var par = JSON.parse(obj["ubi.cfg"]);
  if (par) {
    $("#ubiToken")  .val(par.ubiToken);
    $("#ubiDSLabel").val(par.ubiDSLabel);
    Object.keys(par.values).forEach(function(key) {$("#ubi" + key ).val(par.values[key])});
  }
}

function applyGenericJSONConfig(json) {
  var p = JSON.parse(json || "{}");
  p && Object.keys(p).forEach(function(key) {$("#" + key ).val(p[key])});
}

function applyBeebotteConfig(obj) {
  //u//bi.cfg={"ubiToken":"QE6KXlZsqWAffjPwM8lVqGzMfJMPri","ubiDSLabel":"test123","values":{"CO2":"var1","TEMP":"var2","HUM":"asd","PRES":"","PM25":"","PM10":"","undefined":""}}
  if (!obj["bee.cfg"]) return;
  var par = JSON.parse(obj["bee.cfg"]);
  if (par) {
    $("#beeToken")  .val(par.beeToken);
    $("#beeChannel").val(par.beeChannel);
    Object.keys(par.values).forEach(function(key) {$("#bee" + key ).val(par.values[key])});
  }
}

function applyOpenHABConfig(obj) {
  //u//bi.cfg={"ubiToken":"QE6KXlZsqWAffjPwM8lVqGzMfJMPri","ubiDSLabel":"test123","values":{"CO2":"var1","TEMP":"var2","HUM":"asd","PRES":"","PM25":"","PM10":"","undefined":""}}
  if (!obj["oh.cfg"]) return;
  var par = JSON.parse(obj["oh.cfg"]);
  if (par) {
    $("#ohHost").val(par.ohHost);
    $("#ohPort").val(par.ohPort);
    Object.keys(par.values).forEach(function(key) {$("#oh" + key ).val(par.values[key])});
  }
}

function applyDomoticzConfig(obj) {
  //u//bi.cfg={"ubiToken":"QE6KXlZsqWAffjPwM8lVqGzMfJMPri","ubiDSLabel":"test123","values":{"CO2":"var1","TEMP":"var2","HUM":"asd","PRES":"","PM25":"","PM10":"","undefined":""}}
  if (!obj["dz.cfg"]) return;
  var par = JSON.parse(obj["dz.cfg"]);
  if (par) {
    $("#dzHost")  .val(par.dzHost);
    $("#dzHttpPort").val(par.dzHttpPort);
    Object.keys(par.values).forEach(function(key) {$(key).val(par.values[key])});
  }
}


function mapInUI(key, value) {

}

function cleanAllInputs() {
  $(":input[type='text'][id!='serial']").val("");
  $("textarea[id!='buffer']").val("");
}

function espCfgTest() {
  processConfigurationFromESP(testCfgData);
}

function handleCfgLine(line) {
  var spl = line.split("=");
  var key = spl[0];
  var value = spl[1];
}

var nopInterval;

function startNOPTimer() {
  endNOPTimer();
  nopInterval = setInterval(onNOPInterval, 60000);
}

function onNOPInterval() {
  chrome.serial.send(connectionId, str2ab("nop\n"), onSend);
}

function endNOPTimer() {
  clearInterval(nopInterval);
}
//onSetMQTT();
if (chrome.serial) onbtnAutoConnect();

$(".select_dataid").each(ttt);
function ttt() {
  var sel = $(this).attr("default");
  $(this).html(function() {return "<div class='form-group'><label>" + $(this).attr("label") + "</label>\
                    <select class='form-control'>\
                      <option></option><option>CO2</option><option>TEMP</option><option>HUM</option><option>PRES</option>\
                      <option>ALT</option><option>PM25</option><option>PM10</option><option>ALIGHT</option>\
                    </select></div>" });


  $(this).find("select").val(sel);
  }
//$(".vladi1 select option:selected").text()
//$("#ts_fields option").filter(":selected").map(function() {return $(this).text()})

function onRFEnableChange() {
  if ($("#rfEnable").is(':checked')) {
    $("#rf_fields :input").removeAttr("disabled");
  } else {
    $('#rf_fields :input').attr("disabled","true");
  }

}

$(".select_rfid").each(makeRfid);
function makeRfid() {
  var sel = $(this).attr("label");
  $(this).html(function() {return '<div class="form-group"><label>' + sel + '&nbsp;</label><input type="text" id="rf.' + sel + '"/></div>'; });
}

$(".labelAndInput2").each(function() {
  var base = '<div class="col-xs-3 form-inline">\
    <label for="lbi{0}">%{0}%</label>\
    <input type="text" class="lbi form-control" data-label="{0}" id="{2}{0}" placeholder="{1}">\
  </div>';
  $(this).html(base.format($(this).attr("label"), $(this).attr("placeholder"), $(this).attr("prefix")));
})


function onSetRF() {
  var cmdList = $(".select_rfid :input").map(function() {return 'prop_set "' + $(this).attr("id") + '","' + ($(this).val() || -1) + '"'});
  cmdList = cmdList.get();
  var xx = ["a"];
  xx = xx.concat(cmdList);
  cmdList = ['prop_set "rf.enabled","' + $("#rfEnable").is(":checked") + '"'].concat(cmdList);
  var flist = createFunctionLinkedList(cmdList, "ready >", function() {});
  flist();

}
