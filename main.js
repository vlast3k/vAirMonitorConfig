
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

var inputSelector = ":input[type='text'][id!='serial'][id!='pass'][id!='sapPass']";
$(inputSelector).change(function(event) {
  var obj = {};
  obj[event.target.id] = event.target.value;
  chrome.storage.sync.set(obj);
});

function loadAllSettings() {
  $(inputSelector).each(function() {
    var id = this.id;
    log(id);
    chrome.storage.sync.get(this.id, function(value) {
      $("#" + id).val(value[id])
    })
  })
}


loadAllSettings();


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
  sendSerial($("#serial").val());
  //chrome.serial.send(connectionId, str2ab($("#serial").val() +"\n"), onSend); 
}


function findDevice(idStr, onDeviceFound) {
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
    ab2str(conn.data).startsWith(idStr) && onIntDeviceFound(devices[conn.connectionId], conn.connectionId);
  }

  function onGetDevices(ports) {
    chrome.serial.onReceive.addListener(onRecvFindDev);
    ports.forEach(function(ppp) {
      chrome.serial.connect(ppp.path, {bitrate: 9600}, function(data) {
        if (!chrome.runtime.lastError && data) devices[data.connectionId] = ppp.path;
      });
    });
  }
  log ("Searching v.Air ", true);
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
    log ("Matched: onok= " + onOK)
    var ss = onOK;
    onOK = null;
    ss && ss();
  }
  serialString = "";
}


function onbtnAutoConnect() {
   function onVAirFound(comPort) {
     if (!comPort) {
       document.getElementById('btnAutoConnect').className="btn btn-danger";
       document.getElementById('btnAutoConnect').value ="Not Found";
       
     } else {
       log ("\nvAir found on : " + comPort); 
       chrome.serial.connect(comPort, {bitrate: 9600}, onConnect2);
       document.getElementById('btnAutoConnect').className="btn btn-success";
       document.getElementById('btnAutoConnect').value ="Connected";
     }
     
   }
   
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
     findDevice("vAir", onVAirFound);
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
   var cfgiot = function() { sendSerial("cfgiot \"" + $("#sapHost").val()     + "\",\""+ $("#sapDeviceId").val() + "\",\""
                                   + $("#sapMessageId").val() + "\",\""+ $("#sapVarName").val()  + "\",\"" + $("#sapToken").val()  + "\"") };
   var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot) } 
   
   sendSerial("sap 1", proxy);
 }
 
 function onBtnCustom() {
   var ss = $("#customURL").val();
   var cfgiot = function() { 
     sendSerial("cfggen" + (ss ? (" " + ss) : "")) };
   var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot) } 
   
   sendSerial("sap " + (ss?"1":"0"), proxy);
   
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

//onbtnAutoConnect();
