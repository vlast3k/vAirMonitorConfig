

$("#btnAutoConnect").click(AutoConnect.onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#ota").click(onBtnOTA);
$("#resetESP").click(onResetESP);

$("#setWifi").click(onSetWifi);
$(".directSerialSend").click(onSerialDataButton);
$(".directSerialSendBoolProp").click(onDirectSerialSendBoolProp);
$("#serial").on('keyup', function (e) { e.keyCode == 13 && onSerialSend();});
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
  var ssid = document.getElementById('ssid').value;
  var pass = document.getElementById('pass').value;
  var sapPass = document.getElementById('sapPass').value;
  var static_ip = $("static_ip").val();
  var gw      = $("gateway").val();
  var netmask = $("netmask").val();
  var dns1    = $("dns1").val();
  var dns2    = $("dns2").val();

  if (static_ip && gw && netmask) {
    dns1 = dns1 || gw;
    dns2 = dns2 || dns1;
    SerialHelper.addCommand("static_ip {0},{1},{2},{3},{4}".format(static_ip, gw, netmask, dns1, dns2));
  }
  SerialHelper.addCommand({cmd:"!wifi \"" + ssid + "\",\"" + pass + "\"" + (sapPass ? ",\"" + sapPass + "\"" : ""), endOKstr:"GOT IP", onOK:onSetWifiConnected});

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

function init() {
  initChromeStorageSync();
  ProcessMQTTandHTTP.init();
  HTMLFieldsEnhancer.init();
  RFHandler.init();
  TreeNavigation.init("#tree");
  SimpleCommands.init();

  setTimeout(onSSIDChange, 500);
  if (chrome.serial) AutoConnect.onbtnAutoConnect();

  $('#mainTabs a[href="#setupWifi"]').tab("show");
}


init();
