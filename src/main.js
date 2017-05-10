$("button").click(function (e) {e.preventDefault()});

$("#btnAutoConnect").click(AutoConnect.onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#ota").click(onBtnOTA);
$("#resetESP").click(onResetESP);
$("#updIntButton").click(SimpleCommands.onUpdIntButton);
$("#setWifi").click(onSetWifi);
$(".directSerialSend").click(onSerialDataButton);
$(".directSerialSendBoolProp").click(onDirectSerialSendBoolProp);
$("#tmpAdjBttn").click(onTempAdjBttn);
$("#serial").on('keyup', function (e) { e.keyCode == 13 && onSerialSend();});


$("#blynkTemplate").appendTo($("#repBlynk"))
$("#settingsTemplate").appendTo($("#settings"))
$("#rgbLedTemplate").appendTo($("#repRGBLed"))

// $("#bttnSetAction").click(onBttnSetAction);
// $("#rfidSetAction").click(onRFIDSetAction);
// $("#cmdSetAction").click(onCMDSetAction);
var deviceType = null;


String.prototype.format = function() {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function(m, n) {
    return args[n];
  });
};

function checkForLatestVersion(currentBuild) {
  var latestBuild = 20170226;
  console.log("Device build is: " + currentBuild);
  if (latestBuild > currentBuild) {
    $("#firmwareUpdateNotification").removeClass("hidden");
    $("#firmwareUpdateNotification").html(
      "<small>Latest build is <a href='http://forum.vair-monitor.com/showthread.php?tid=10' target='_new'>\
        {0}</a>, yours is {1} ({2} days older). <br/>You can update from 'Settings'</small>"
        .format(latestBuild, currentBuild, latestBuild - currentBuild));
  } else {
    $("#firmwareUpdateNotification").addClass("hidden");

  }

  console.log(latestBuild > currentBuild);
}


var sockets = [];
var backendIp;

function tryWSS(i, onFound, onerror) {
  console.log("trying: " + i);
  var ws = new WebSocket("ws://" + i +  ":8266");
  sockets.push(ws);
  ws.onopen = function(evt) {
    console.log("Found WebSocketServer on:" + i);
    log ("Found WebSocketServer on:" + i);
    backendIp = i;
    initWebSocketClient(ws, onFound);
  };
  ws.onerror = onerror;

  // ws.onclose = function(evt) { };
  // ws.onmessage = function(evt) { };
  // ws.onerror = function(evt) { console.log("onerror: " + i);};
}

function scanFrom(base, onFound, idx) {
  var ttt;
  console.log("scan from:" + idx);
  for (var i=idx; i < 255; i++) {
    console.log("test:" + i);
    ttt = setTimeout(function() {scanFrom(base, onFound, i)}, 5000);
    tryWSS(base + i, onFound);
    clearTimeout(ttt);
    console.log("end:" + i);
  }

}

function browseOneNet(ip, onFound) {
  var base = ip.substring(0, ip.lastIndexOf('.') + 1);
  console.log("will search base: " + base);
  scanFrom(base, onFound, 1);
  // for (var i=1; i < 255; i++) {
  //   console.log("test:" + i);
  //   tryWSS(base + i, onFound);
  //   console.log("end:" + i);
  // }
  // setTimeout(function() {
  //   for (var i=150; i < 255; i++) {
  //     tryWSS(base + i, onFound);
  //   }}, 25000);


}

function browseNetworks(ips, onFound) {
  ips.forEach(function(ip) {
    browseOneNet(ip, onFound);
  });
}

function searchServer(onFound) {
  if ($("#wss_address").val()) {
    var wssAddr = $("#wss_address").val()
    if (wssAddr.charAt(wssAddr.length - 1) == ".") browseNetworks([wssAddr], onFound);
    tryWSS(wssAddr, onFound);
  } else {
    console.log("Getting IPs");
    getIPs(function(ips) {
      console.log("received ips: " + ips);
      browseNetworks(ips, onFound);
    });
  }
}
var wsclient;
var checkWSInt;
function initWebSocketClient(ws, onFound) {
  wsclient = ws;
  if (checkWSInt) clearInterval(checkWSInt);
  sockets.forEach(function(s) {if (s !== ws) s.close()});
  sockets = [];
  log("WS Connected");
  SerialHelper.init();
  doSend("info");
  wsclient.onopen = function(evt) { onOpen(evt) };
  wsclient.onclose = function(evt) { onClose(evt) };
  wsclient.onmessage = SerialHelper.onReceiveCallback;
  wsclient.onerror = function(evt) { onError(evt) };
  checkWSInt = setInterval(function() {
    if (wsclient === null) {
      clearInterval(checkWSInt);
      return;
    }
    //console.log(wsclient.readyState);
    if (wsclient.readyState != 1) {
      clearInterval(checkWSInt);
      //console.log("will retry in 5 sec: " + backendIp);
      function f() {
        console.log("trying");
        tryWSS(backendIp, onFound, f);
      }
      f();
      //setTimeout(f, 5000);
    }
  }, 2000);
  deviceType = Constants.VESPRINO_V1;
  window.localStorage["wssHost"] = backendIp;
  $("#wss_address").val(backendIp);
  onFound("WebSocket", "", "");
}

// function onOpen(evt) {
// }

function onClose(evt) {
  log("DISCONNECTED");
}

function onMessage(evt) {
  log ("inbound: " + evt.data);
  //writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
  //wsclient.close();
}

function onError(evt) {
  log ("error:" + evt.data);
  //writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
  //writeToScreen("SENT: " + message);
  wsclient.send(message);
}


function onSerialDataButton(event) {
  event.preventDefault();
  var onok;
  if ($(this).data("onok")) {
    onok = window[$(this).data("onok")][$(this).data("onokfunc")];
    console.log("serialDataButton: onok = " + onok);
  }
  SerialHelper.addCommand({cmd:$(this).data("send"), endOKstr: $(this).data("endokstr"), onOK: onok, timeout:$(this).data("timeout")})
}

function onDirectSerialSendBoolProp(event) {
  //event.preventDefault();
  //if ($(this).is(":checked")) {
    SerialHelper.addCommand({cmd:"prop_set \"{0}\",\"{1}\"".format($(this).attr("id"), $(this).is(":checked")), timeout:$(this).data("timeout")})
    if ($(this).data("after")) SerialHelper.addCommand($(this).data("after"));

//  }
}

function log(msg, skipNL) {
  console.log(msg);
  msg = msg.replace(/wifi.ssid=.*/, "wifi.ssid=[hidden]").replace(/wifi.p1=.*/, "wifi.p1=[hidden]");
  var buffer = document.querySelector('#buffer');
  buffer.value += msg + (skipNL ? "" : "\n");
  if (buffer.value.length > 10000) buffer.value = buffer.value.substring(buffer.value.length - 10000);
  if ($("#cbPauseSerialUpdate").is(':checked') == false) buffer.scrollTop = buffer.scrollHeight;
}

function initChromeStorageSync() {
  var inputSelector = ":input[type='text'][id!='serial'][id!='pass'][id!='sapPass']";
  $(inputSelector).change(function(event) {
    var obj = {};
    obj[event.target.id] = event.target.value;
    if (chrome && chrome.storage) {
      chrome.storage.sync.set(obj);
    }
  });

  $(inputSelector).each(function() {
    var id = this.id;
    if (chrome && chrome.storage) {
      chrome.storage.sync.get(this.id, function(value) {
        $("[id='" + id + "']").val(value[id])
      })
    }
  })
}

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
  if ($("#serial").val().startsWith("COM") || $("#serial").val().startsWith("/dev/")) {
    deviceType = VTHING;
    onVAirFound($("#serial").val());
  } else {
    SerialHelper.addCommand($("#serial").val());
  }
}

function onBtnOTA() {
  var otacmd = function() {
    SerialHelper.addCommand({cmd:"otah", endOKstr:"GOT IP", onOK:AutoConnect.reconnect})
  };
  if (deviceType == VAIR) {
    SerialHelper.addCommand({cmd:"proxy", endOKstr:"GOT IP", onOK:otacmd})
  } else {
    otacmd();
  }
}

function onSetWifi() {
  var ssid =    $('#ssid').val();
  var pass =    $('#pass').val();
  var sapPass = $('#sapPass').val();
  var static_ip=$("#wifi_staticip").val();
  var gw      = $("#wifi_gateway").val();
  var netmask = $("#wifi_subnet").val();
  var dns1    = $("#wifi_dns1").val();
  var dns2    = $("#wifi_dns2").val();
  netmask = netmask || "255.255.255.0";
  if (static_ip && gw && netmask) {
    dns1 = dns1 || gw;
    dns2 = dns2 || dns1;
    SerialHelper.addCommand("static_ip {0},{1},{2},{3},{4},".format(static_ip, gw, netmask, dns1, dns2));
  } else {
    SerialHelper.addCommand("static_ip ,,,,,");
  }
  SerialHelper.addCommand({cmd:"wifi \"" + ssid + "\",\"" + pass + "\"" + (sapPass ? ",\"" + sapPass + "\"" : ""), endOKstr:"GOT IP", timeout: 5000, onOK:onSetWifiConnected});

}

function onSetWifiConnected() {
  //SerialHelper.addCommand("fupd");
}

function onResetESP() {
  chrome.serial.setControlSignals(connectionId, {
    rts: true,
    dtr: true
  }, function(res) {
    log("set rts : " + res)
  });
  setTimeout(function() {
    chrome.serial.setControlSignals(connectionId, {
      rts: false,
      dtr: false
    }, function(res) {
      log("set rts : " + res)
    })
  }, 1000)
}

function onTempAdjBttn() {
  SerialHelper.addCommand("prop_set \"temp.adjustment\",\"" + $('#temp_adjustment').val() + "\"");
}

function init() {
  initChromeStorageSync();
  ProcessMQTTandHTTP.init();
  HTMLFieldsEnhancer.init();
  RFHandler.init();
  Blynk.init();
  TreeNavigation.init("#tree");
  SimpleCommands.init();
  RGBSelect.init();

  setTimeout(onSSIDChange, 500);
  if (chrome && chrome.serial) {
    AutoConnect.onbtnAutoConnect();
  } else {
    $("#wss_address").removeClass("hidden");
  }

  $('#mainTabs a[href="#setupWifi"]').tab("show");
  ProcessMQTTandHTTP.registerChangedFields();
  //$(function () {
    $('[data-toggle="tooltip"]').tooltip();
  //})


  if (window.localStorage["wssHost"]) {
      $("#wss_address").val(window.localStorage["wssHost"]);
  } else {
    getIPs(function(ips) {
      if (ips.length == 1) {
        var base = ips[0].substring(0, ips[0].lastIndexOf('.') + 1);
        $("#wss_address").val(base);
      }
    });
  }
}

function getIPs(onSuccess) {
  var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  if (!RTCPeerConnection) return;
  var rtc = new RTCPeerConnection({iceServers:[]});
  if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
      rtc.createDataChannel('', {reliable:false});
  };

  rtc.onicecandidate = function (evt) {
      // convert the candidate to SDP so we can run it through our general parser
      // see https://twitter.com/lancestout/status/525796175425720320 for details
      if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
  };
  rtc.createOffer(function (offerDesc) {
      grepSDP(offerDesc.sdp);
      rtc.setLocalDescription(offerDesc);
  }, function (e) { console.warn("offer failed", e); });


  var addrs = Object.create(null);
  addrs["0.0.0.0"] = false;
  function updateDisplay(newAddr) {
      if (newAddr in addrs) return;
      else addrs[newAddr] = true;
      var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
      onSuccess(displayAddrs);
      //document.getElementById('list').textContent = displayAddrs.join(" or perhaps ") || "n/a";
  }

  function grepSDP(sdp) {
      var hosts = [];
      sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
          if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
              var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                  addr = parts[4],
                  type = parts[7];
              if (type === 'host') updateDisplay(addr);
          } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
              var parts = line.split(' '),
                  addr = parts[2];
              updateDisplay(addr);
          }
      });
  }
}

var RGBSelect = (function () {
  function init() {
    $("#rgbLEDSelect").change(onRGBLedSelectChange);
    ConfigurationFromESP.registerPropertyHandler("rgbled.cfg", onRGBLedCfgProp);
  }

  function onRGBLedCfgProp(key, value) {
    var arr = value.split(",");
    if (arr.length != 3) $("#rgbLEDSelect").val("none");
    else $("#rgbLEDSelect").val(arr[0]);
  }

  function onRGBLedSelectChange() {
    //console.log($("#rgbLEDSelect option").filter(":selected").text());
    var value = $("#rgbLEDSelect option").filter(":selected").text();
    var propValue = "";
    if (value === "CO2") propValue ="CO2,400,3500";
    else if (value === "PM25") propValue = "PM25,0,250";
    SerialHelper.addCommand("prop_set \"rgbled.cfg\",\"" + propValue + "\"");
  }

  return {
    init: init
  }
})();



init();
