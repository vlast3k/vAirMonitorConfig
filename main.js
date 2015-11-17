const DEVICE_PATH = '/dev/ttyACM0';
const serial = chrome.serial;

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





//chrome.serial.connect("COM16", {bitrate: 9600}, onConnect2);
function onConnect2(conn) {
  log ("Connected to: " + JSON.stringify(conn));
  log("connected!");
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
  //log (str);
  clearTimeout(serialTimeout);
  serialTimeout = setTimeout(onSerialString, 100);
  serialString += str;
};

function onSerialString() {
  log (serialString);
  if (serialString.indexOf("OK") > -1) onOK && onOK();
  serialString = "";
  
}

 document.getElementById('brgPlus').addEventListener('click', onBrgPlus);
 document.getElementById('brgMin') .addEventListener('click', onBrgMinus);
 document.getElementById('co2Plus').addEventListener('click', onCo2Plus);
 document.getElementById('co2Min') .addEventListener('click', onCo2Minus);
 document.getElementById('setWifi').addEventListener('click', onSetWifi);
 document.getElementById('tsBtn').addEventListener('click', onSetTs);
 document.getElementById('btnAutoConnect').addEventListener('click', onbtnAutoConnect);

 function onbtnAutoConnect() {
   function onVAirFound(comPort) {
     log ("sadsadsa");
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
   chrome.serial.send(connectionId, str2ab("t " + document.getElementById('tsKey').value + "\r"), onSend); 
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
  chrome.serial.send(connectionId, str2ab("b " + brg + "\r"), onSend); 
}

function setCo2(val) {
  chrome.serial.send(connectionId, str2ab("o " +  co2+ "\r"), onSend); 
}

function onDebug() {
  chrome.serial.send(connectionId, str2ab("d  dasd\r"), onSend); 
}

function onSetWifi() {
  log("setting wifi")
  onOK = function() {
    log ("setting pass")
    onOK = function() {
      log ("connecting")
      onOK = null;
      chrome.serial.send(connectionId, str2ab("c sdf\r"), onSend);
    }
    chrome.serial.send(connectionId, str2ab("p " + document.getElementById('pass').value + "\r"), onSend); 
    
  }
  log (connectionId);
  chrome.serial.send(connectionId, str2ab("s " + document.getElementById('ssid').value +"\r\n"), onSend);
}

function onSend(data) {
  //log(JSON.stringify(data))
}

 function log(msg) {
   var buffer = document.querySelector('#buffer');
   buffer.value += msg +"\n";
   buffer.scrollTop = buffer.scrollHeight;
 }


