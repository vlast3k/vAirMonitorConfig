

$("#btnAutoConnect").click(AutoConnect.onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#ota").click(onBtnOTA);
$("#resetESP").click(onResetESP);

$("#setWifi").click(onSetWifi);
$(".directSerialSend").click(onSerialDataButton);
$(".directSerialSendBoolProp").click(onDirectSerialSendBoolProp);
$("#tmpAdjBttn").click(onTempAdjBttn);
$("#serial").on('keyup', function (e) { e.keyCode == 13 && onSerialSend();});


$("#blynkTemplate").appendTo($("#repBlynk"))
$("#settingsTemplate").appendTo($("#settings"))

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

var sockets = [];

function tryWSS(i, onFound) {
  var ws = new WebSocket("ws://192.168.1." + i + ":81");
  sockets.push(ws);
  ws.onopen = function(evt) {
    log ("Found WebSocketServer on:" + i);
    initWebSocketClient(ws, onFound);
  };
  // ws.onclose = function(evt) { };
  // ws.onmessage = function(evt) { };
  // ws.onerror = function(evt) { console.log("onerror: " + i);};
}
function searchServer(onFound) {
  for (var i=1; i < 255; i++) {
    tryWSS(i, onFound);
  }
}
var wsclient;
function initWebSocketClient(ws, onFound) {
  wsclient = ws;
  log("WS Connected");
  SerialHelper.init();
  doSend("info");
  wsclient.onopen = function(evt) { onOpen(evt) };
  wsclient.onclose = function(evt) { onClose(evt) };
  wsclient.onmessage = SerialHelper.onReceiveCallback;
  wsclient.onerror = function(evt) { onError(evt) };
  deviceType = Constants.VESPRINO_V1;
  onFound("WebSocket");
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
  var buffer = document.querySelector('#buffer');
  buffer.value += msg + (skipNL ? "" : "\n");
  if ($("#cbPauseSerialUpdate").is(':checked') == false) buffer.scrollTop = buffer.scrollHeight;
}

function initChromeStorageSync() {
  var inputSelector = ":input[type='text'][id!='serial'][id!='pass'][id!='sapPass']";
  $(inputSelector).change(function(event) {
    var obj = {};
    obj[event.target.id] = event.target.value;
    chrome.storage.sync.set(obj);
  });

  $(inputSelector).each(function() {
    var id = this.id;
    if (chrome.storage) {
      chrome.storage.sync.get(this.id, function(value) {
        $("#" + id).val(value[id])
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
    SerialHelper.addCommand("static_ip {0},{1},{2},{3},{4}".format(static_ip, gw, netmask, dns1, dns2));
  }
  SerialHelper.addCommand({cmd:"wifi \"" + ssid + "\",\"" + pass + "\"" + (sapPass ? ",\"" + sapPass + "\"" : ""), endOKstr:"GOT IP", timeout: 5000, onOK:onSetWifiConnected});

}

function onSetWifiConnected() {
  SerialHelper.addCommand("fupd");
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

  setTimeout(onSSIDChange, 500);
  if (chrome.serial) AutoConnect.onbtnAutoConnect();

  $('#mainTabs a[href="#setupWifi"]').tab("show");
}


init();
