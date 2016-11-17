

$("#btnAutoConnect").click(AutoConnect.onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#ota").click(onBtnOTA);
$("#resetESP").click(onResetESP);

$("#setWifi").click();

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
  if ($("#serial").val().startsWith("COM")) {
    deviceType = VTHING;
    onVAirFound($("#serial").val());
  } else {
    SerialHelper.addCommand($("#serial").val());
  }
}

function onBtnOTA() {
  var otacmd = function() {
    sendSerial("otah", "GOT IP", AutoConnect.reconnect)
  };
  if (deviceType == VAIR) {
    sendSerial("proxy", "GOT IP", otacmd)
  } else {
    otacmd();
  }
}

function onSetWifi() {
  var ssid = document.getElementById('ssid').value;
  var pass = document.getElementById('pass').value;
  var sapPass = document.getElementById('sapPass').value;
  //chrome.serial.send(connectionId, str2ab("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":"") + "\n"), onSend);
  SerialHelper.addCommand({cmd:"wifi \"" + ssid + "\",\"" + pass + "\"" + (sapPass ? ",\"" + sapPass + "\"" : ""), endOKstr:"GOT IP", onOK:onSetWifiConnected});
}

function onSetWifiConnected() {
  sendSerial("fupd");
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

var KeepESPAwake = (function() {
  var nopInterval;

  function startNOPTimer() {
    endNOPTimer();
    nopInterval = setInterval(function() {SerialHelper.addCommand("nop")}, 60000);
  }

  function endNOPTimer() {
    clearInterval(nopInterval);
  }

  return {
    start : startNOPTimer,
    end   : endNOPTimer
  }
})()


init();
