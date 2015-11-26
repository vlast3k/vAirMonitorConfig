
document.getElementById('brgPlus').addEventListener('click', onBrgPlus);
document.getElementById('brgMin') .addEventListener('click', onBrgMinus);
document.getElementById('co2Plus').addEventListener('click', onCo2Plus);
document.getElementById('co2Min') .addEventListener('click', onCo2Minus);
document.getElementById('setWifi').addEventListener('click', onSetWifi);
document.getElementById('tsBtn').addEventListener('click', onSetTs);
document.getElementById('btnAutoConnect').addEventListener('click', onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange)

function onSSIDChange() {
  if ($("#ssid").val() == "SAP-Guest") {
    $("label[for=pass]").text("Username");
    $("#sap").removeClass("hidden");
  } else {
    $("label[for=pass]").text("Pass");
    $("#sap").addClass("hidden");
  }
}


function onSerialSend() {
  log ($("#serial").val());
  chrome.serial.send(connectionId, str2ab($("#serial").val() +"\n"), onSend); 
}


function findDevice(idStr, onDeviceFound) {
  var devices = {};
  var findInterval = setInterval(function() { log("#");  }, 1000);
  
  function onIntDeviceFound(comPort, connId) {
    clearInterval(findInterval);
    clearTimeout(foundTimeout);
    Object.keys(devices).forEach(function(_connId) {
      log("disconnecting: " + _connId)
     chrome.serial.disconnect(+_connId, function() {});
    });
    chrome.serial.onReceive.removeListener(onRecvFindDev);
    setTimeout(function() {onDeviceFound(comPort)}, 1000);
  }
  
  var foundTimeout = setTimeout(function() {
    onIntDeviceFound(null);
  }, 4000);
  
  function onRecvFindDev(conn) {
    ab2str(conn.data).startsWith(idStr) && onIntDeviceFound(devices[conn.connectionId], conn.connectionId);
  }

  function onGetDevices(ports) {
    chrome.serial.onReceive.addListener(onRecvFindDev);
    ports.forEach(function(ppp) {
      chrome.serial.connect(ppp.path, {bitrate: 9600}, function(data) {
        if (chrome.runtime.lastError) log (chrome.runtime.lastError.message)
        else if (data) devices[data.connectionId] = ppp.path;
      });
      log ("le: " + chrome.runtime.lastError);
    });
  }
  chrome.serial.getDevices(onGetDevices); 

}





function onConnect2(conn) {
  log ("Connected to: " + JSON.stringify(conn));
  chrome.serial.onReceive.addListener(onReceiveCallback);
  connectionId = conn.connectionId;
}

var stringReceived = '';
var connectionId;

var onOK;

var serialString = "";
var serialTimeout;
var onReceiveCallback = function(info) {
  var str = ab2str(info.data);
  clearTimeout(serialTimeout);
  serialTimeout = setTimeout(onSerialString, 100);
  serialString += str;
};

function onSerialString() {
  log (serialString);
  if (serialString.indexOf("OK") > -1) onOK && onOK();
  serialString = "";
  
}


 function onbtnAutoConnect() {
   function onVAirFound(comPort) {
     if (!comPort) {
       document.getElementById('btnAutoConnect').className="btn btn-danger";
       document.getElementById('btnAutoConnect').value ="Not Found";
       
     } else {
       log ("vAir found on : " + comPort); 
       chrome.serial.connect(comPort, {bitrate: 9600}, onConnect2);
       document.getElementById('btnAutoConnect').className="btn btn-success";
       document.getElementById('btnAutoConnect').value ="Connected";
     }
     
   }
   document.getElementById('btnAutoConnect').className="btn btn-warning";
   document.getElementById('btnAutoConnect').value ="Searching...";
   findDevice("vAir", onVAirFound);
 } 

 function onSetTs() {
   log ("td:" +   document.getElementById('tsKey').value)
   chrome.serial.send(connectionId, str2ab("tskey " + document.getElementById('tsKey').value + "\n"), onSend); 
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
  chrome.serial.send(connectionId, str2ab("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":":") + "\n"), onSend);
}

function onSend(data) {
}

 function log(msg) {
   var buffer = document.querySelector('#buffer');
   buffer.value += msg +"\n";
   buffer.scrollTop = buffer.scrollHeight;
 }


