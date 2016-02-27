
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
$("#testCfgBtn").click(onBtnTestCfg);
$("#updIntButton").click(onUpdIntButton);
$("#resetCal").click(onResetCal);
$("#resetAll").click(onResetFact);
$("#setPPMBtn").click(onSetPPMBtn);
$("#setColorsBtn").click(onSetColorsBtn);
$("#setMQTT").click(onSetMQTT);
$("#setBRFBtn").click(onSetBRFBtn);
$("#ota").click(onBtnOTA);



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
var VTHING = "vThing";
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
    log ("rcv: " + ab2str(conn.data));
    var s = ab2str(conn.data);
    if (s.indexOf(VAIR) > -1) {
      deviceType = VAIR;
    } else if (s.indexOf(VTHING) > -1) {
      deviceType = VTHING;
    } else { return; }
    onIntDeviceFound(devices[conn.connectionId], conn.connectionId);
  }

  function onGetDevices(ports) {
    chrome.serial.onReceive.addListener(onRecvFindDev);
    ports.forEach(function(ppp) {
      log("Trying : " + ppp.path + "\n");
      chrome.serial.connect(ppp.path, {bitrate: baud}, function(data) {
        if (!chrome.runtime.lastError && data) {
          devices[data.connectionId] = ppp.path;
          chrome.serial.send(data.connectionId, str2ab("info\n"), onSend); 
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
  log (serialString);
  if (serialString.indexOf(onOKString) > -1) {
    //log ("Matched: onok= " + onOK)
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
         $("#otherSettingsVair").addClass("hidden");
       }
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
   log("sending serial: " + str);
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
 
 function onBtnSAP() {
   
   var cfgiot2 = function() { sendSerial("cfgiot2 \"" + $("#sapToken").val() + "\",\"" + $("#sapBtnMessageId").val()  + "\"",
                                   ">", onbtnAutoConnect) };   
   var cfgiot1 = function() { sendSerial("cfgiot1 \"" + $("#sapHost").val()     + "\",\""+ $("#sapDeviceId").val() + "\",\""
                                   + $("#sapMessageId").val() + "\",\""+ $("#sapVarName").val()  + "\"",
                                   ">", cfgiot2) };
   var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot1) } 
   var sap   =  function() { sendSerial("sap 1", proxy); }
   log("sadsadsadsa: " + deviceType + "   "  + (deviceType == VAIR));
   (deviceType == VAIR) ? sap() : cfgiot1();
 }
 
 function onBtnOTA() {
   var otacmd = function() { sendSerial("otah", "GOT IP", onbtnAutoConnect) };
   sendSerial("proxy", "GOT IP", otacmd)
   
 }

 function onBtnCustom() {
   var ss = $("#customURL").val();
   var cfgiot = function() { sendSerial("cfggen" + (ss ? (" " + ss) : ""), "DONE", onbtnAutoConnect) };
   var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot) } 
   var sap   =  function() { sendSerial("sap " + (ss?"1":"0"), proxy); }
   
   (deviceType == VAIR) ? sap() : cfgiot();
   
 }

 function onSetMQTT() {
   var setMqttValue= function() {sendSerial("cfg_mqval " + $("#mqttValue").val(), "DONE", function() {}); }
   var setMqttCore = function() {sendSerial("cfg_mqtt \"" + $("#mqttHost").val() + "\",\"" + $("#mqttPort").val() + "\",\"" + $("#mqttClientId").val() + "\",\"" 
                                                      + $("#mqttUser").val() + "\",\"" + $("#mqttPass").val() + "\",\"" + $("#mqttTopic")   .val()+ "\"",
                                        "DONE", setMqttValue); }
   var proxy =  function() { sendSerial("proxy", "GOT IP", setMqttCore) } 
   var sap   =  function() { sendSerial("sap 1", proxy); }
   (deviceType == VAIR) ? sap() : setMqttCore();
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

function onResetFact() {
  chrome.serial.send(connectionId, str2ab("reset\n"), onSend); 
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

function onSend(data) {
}

 function log(msg, skipNL) {
   var buffer = document.querySelector('#buffer');
   buffer.value += msg + (skipNL?"":"\n");
   buffer.scrollTop = buffer.scrollHeight;
 }

onbtnAutoConnect();
