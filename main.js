document.getElementById('brgPlus').addEventListener('click', onBrgPlus);
document.getElementById('brgMin').addEventListener('click', onBrgMinus);
document.getElementById('co2Plus').addEventListener('click', onCo2Plus);
document.getElementById('co2Min').addEventListener('click', onCo2Minus);
document.getElementById('setWifi').addEventListener('click', onSetWifi);
document.getElementById('tsBtn').addEventListener('click', onBtnCustom);
$("#ubiSaveBtn").click(onBtnCustom);
$("#dzSaveBtn").click(onBtnCustom);
$("#pimaSaveBtn").click(onBtnCustom);
$("#jeeSaveBtn").click(onBtnCustom);
$("#emonSaveBtn").click(onBtnCustom);
$("#dgaSaveBtn").click(onBtnCustom);
$("#dwSaveBtn").click(onBtnCustom);
$("#hsSaveBtn").click(onBtnCustom);


$("#beeSaveBtn").click(onSetMQTT);
$("#ohSaveBtn").click(onSetMQTT);
$("#btnAutoConnect").click(AutoConnect.onbtnAutoConnect);
$("#btnSerialSend").click(onSerialSend);
$("#ssid").change(onSSIDChange);
$("#sapBtn").click(onBtnSAP);
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

// function createFunctionLinkedList(arr, onOKStr, lastFunc) {
//   for (var i=arr.length-1; i >= 0; i--) {
//     lastFunc = (function(cmd, nextFunc) {
//       return function() {sendSerial(cmd, onOKStr, nextFunc)};
//     })(arr[i], lastFunc);
//   }
//   return lastFunc;
// }

function processThingSpeakURLConfig() {
  var tsKey = $("#tsKey").val();
  if (!tsKey) return [];
  var tsFields = $("#ts_fields option").filter(":selected").map(function() {
    return $(this).text()
  });
  var url = "#http://api.thingspeak.com/update?key=" + tsKey;
  for (var i = 1; i <= tsFields.length; i++) {
    if (!tsFields[i - 1]) continue;
    url += "&field" + i + "=%" + tsFields[i - 1] + "%";
  }

  console.log("ThingSpeak URL: " + url);
  return url;
}

function readUBIPayload() {
  var vars = {};
  $("#ubi_fields :input").filter(".lbi").each(function() {
    if ($(this).val()) vars[$(this).val()] = '%' + $(this).attr("data-label") + '%'
  });
  return JSON.stringify(vars).replace(/"%/g, '%').replace(/%"/g, '%');
}

function processUbidotsURLConfig() {
  var ubiToken = $("#ubiToken").val();
  var ubiDSLabel = $("#ubiDSLabel").val();
  if (!ubiToken || !ubiDSLabel) return [];
  var res = {};
  res.method = "POST";
  res.url = "http://things.ubidots.com/api/v1.6/devices/" + ubiDSLabel + "?token=" + ubiToken;
  res.ct = "application/json";
  res.pay = readUBIPayload();
  return ["#" + JSON.stringify(res)];
}

function processDomoticzURLConfig() {
  var dzHost = $("#dzHost").val();
  if (!dzHost) return [];
  var dzPort = $("#dzHttpPort").val();

  var urls = [];
  ///json.htm?type=command&param=udevice&idx=IDX&nvalue=PPM
  if ($("#dzCO2").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzCO2").val()));
  if ($("#dzTH").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=0&svalue=%TEMP%;%HUM%;0".format(dzHost, dzPort, $("#dzTH").val()));
  if ($("#dzTHB").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=0&svalue=%TEMP%;%HUM%;0;%PRES%;0".format(dzHost, dzPort, $("#dzTHB").val()));
  if ($("#dzDust25").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzDust25").val()));
  if ($("#dzDust10").val()) urls = urls.concat("#http://{0}:{1}/json.htm?type=command&param=udevice&idx={2}&nvalue=%CO2%".format(dzHost, dzPort, $("#dzDust10").val()));
  return urls;
}

function processJeedomURLConfig() {
  var host = $("#jeeHost").val();
  if (!host) return [];
  var port = $("#jeePort").val() || "80";
  var key = $("#jeeKey").val();
  var path = $("#jeePath").val();

  if (path && path.charAt(0) == '/') path.substring(1);
  if (path && path.charAt(path.length - 1) != '/') path += '/';
  var msgs = [];
  $("#jee_fields :input").filter(".lbi").each(function() {
    if (!$(this).val()) return;
    msgs = msgs.concat("#http://{0}:{1}/{2}core/api/jeeApi.php?apikey={3}&type=virtual&id={4}&value=%{5}%"
      .format(host, port, path, key, $(this).val(), $(this).attr("data-label")));
  });
  return msgs;
}

function processPimaticURLConfig() {
  var host = $("#pimaHost").val();
  if (!host) return [];
  var port = $("#pimaPort").val() || "80";
  var pass = $("#pimaPass").val();
  var user = $("#pimaUser").val();

  var msgs = [];
  $("#pima_fields :input").filter(".lbi").each(function() {
    if (!$(this).val()) return;
    var entry = {};
    entry.method = "PATCH";
    entry.url = "http://{0}:{1}@{2}:{3}/api/variables/{4}".format(user, pass, host, port, $(this).val());
    entry.ct = "application/json";
    entry.pay = '{"type": "value", "valueOrExpression": %' + $(this).attr("data-label") + '%}';

    msgs = msgs.concat("#" + JSON.stringify(entry));
  });
  return msgs;
}


function processEmonCMSURLConfig() {
  var key = $("#emonKey").val();
  if (!key) return [];
  var pay = "";
  $("#emon_fields :input").filter(".lbi").each(function() {
    if (!$(this).val()) return;
    pay += "{0}:%{1}%".format($(this).val(), $(this).attr("data-label"));
  });
  if (!pay) return [];
  return "#http://emoncms.org/input/post.json?json={" + pay + "}&apikey=" + key;
}

//http://192.168.1.xxx/JSON?request=controldevicebyvalue&ref=1234&value=%s

function processDomotiGaURLConfig() {
  var host = $("#dgaHost").val();
  if (!host) return [];
  var port = $("#dgaPort").val() || "80";
  var msgs = [];

  $("#dga_fields :input").filter(".lbi").each(function() {
    if (!$(this).val()) return;
    msgs = msgs.concat("#http://{0}:{1}/json?method=value.set&device_id={2}&value=%{3}%"
      .format(host, port, $(this).val(), $(this).attr("data-label")));
  });
  return msgs;
}

function processDweetURLConfig() {
  var key = $("#dwThing").val();
  if (!key) return [];
  var pay = "";
  $("#dw_fields :input").filter(".lbi").each(function() {
    if (!$(this).val()) return;
    pay += "{0}=%{1}%&".format($(this).val(), $(this).attr("data-label"));
  });
  if (!pay) return [];
  return "#http://dweet.io/dweet/for/" + key + "?" + pay;
}

function processHomeseerURLConfig() {
  var host = $("#hsHost").val();
  if (!host) return [];
  var port = $("#hsPort").val() || "80";
  var msgs = [];
  http: //192.168.1.xxx/JSON?request=controldevicebyvalue&ref=1234&value=%s

    $("#hs_fields :input").filter(".lbi").each(function() {
      if (!$(this).val()) return;
      msgs = msgs.concat("#http://{0}:{1}/JSON?request=controldevicebyvalue&ref={2}&value=%{3}%"
        .format(host, port, $(this).val(), $(this).attr("data-label")));
    });
  return msgs;
}


function containsChanges(rootTag) {
  if (!$("#" + rootTag).length) return [];
  return Object.keys(changedFields).filter(function(key) {
    return $("#" + key) && $.contains($("#" + rootTag).get(0), $("#" + key).get(0))
  });
}

function cleanChanges(rootTag) {
  containsChanges(rootTag).forEach(function(key) {
    delete changedFields[key]
  });
}

function processGenericIDConfig(rootTag, cfgName) {
  if (!containsChanges(rootTag).length) return [];
  var store = {};
  $("#" + rootTag + " input[id]").each(function() {
    store[$(this).attr("id")] = $(this).val()
  });
  cleanChanges(rootTag);
  return "prop_jset \"" + cfgName + "\"" + JSON.stringify(store);
}

function processTSStoreConfig() {
  return ['prop_set "tsKey" "' + $("#tsKey").val() + '"'];
}

function createCommandsForCustomHTTP() {
  var ss = $("#customURL").val();
  var res = ss.split("\n").filter(function(val) {
    return (val && val.charAt(0) != '#') ? true : false
  });
  res = res.concat(processThingSpeakURLConfig());
  res = res.concat(processUbidotsURLConfig());
  res = res.concat(processDomoticzURLConfig());
  res = res.concat(processJeedomURLConfig());
  res = res.concat(processPimaticURLConfig());
  res = res.concat(processEmonCMSURLConfig());
  res = res.concat(processDomotiGaURLConfig());
  res = res.concat(processDweetURLConfig());
  res = res.concat(processHomeseerURLConfig());
  $("#customURL").val(res.join("\n"));
  var cb = function(path, idx) {
    if (path.indexOf('\"') > -1) {
      return 'custom_url_jadd "' + idx + '"' + path;
    } else {
      return 'custom_url_add "' + idx + '","' + path + '"'
    }
  };
  res = res.map(cb);
  return res;
}

function onBtnCustom() {
  SerialHelper.startSequence();
  SerialHelper.addCommand('custom_url_clean');
  createCommandsForCustomHTTP().forEach(function(el) {
    SerialHelper.addCommand(el);
  });
  SerialHelper.addCommand(processTSStoreConfig());
  SerialHelper.addCommand(processGenericIDConfig("repUbidots", "ubi.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repDomoticz", "dz.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repJeedom", "jee.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repPimatic", "pima.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repEmon", "emon.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repDomotiGa", "dga.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repDweet", "dw.cfg"));
  SerialHelper.addCommand(processGenericIDConfig("repHomeseer", "hs.cfg"));
  SerialHelper.sendSequence();
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
    msgs += "{0}:%{1}%\n".format($(this).val(), $(this).attr("data-label"));
  });
  $("#mqttValue").val(msgs);
}

function createCommandsForCustomMQTT() {
  processBeebotteConfig();
  processOpenHABConfig();
  var callMqttSetup = 'mqtt_setup "' + $("#mqttHost").val() + '","' + $("#mqttPort").val() + '","' +
    $("#mqttClientId").val() + '","' + $("#mqttUser").val() + '","' +
    $("#mqttPass").val() + '"';
  var cb = function(path, idx) {
    return 'mqtt_msg_add "' + idx + '"' + path
  };
  var res = $("#mqttValue").val().split("\n").filter(function(val) {
    return val
  });
  res = res.map(cb);
}

function onSetMQTT() {

  log("set mqtt, value= " + $("#mqttValue").val());

  SerialHelper.startSequence();
  SerialHelper.addCommand();

  res = [callMqttSetup, 'mqtt_msg_clean'].concat(res);
  res = res.concat(processGenericIDConfig("repBeebotte", "bee.cfg"));
  res = res.concat(processGenericIDConfig("repOpenHab", "oh.cfg"));
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
  else setBrg(brg += 10);
}

function onBrgMinus() {
  if (brg <= 10) setBrg(brg = 1);
  else setBrg(brg -= 10);
}

var co2 = 400;

function onCo2Plus() {
  if (co2 > 2400) return;
  else setCo2(co2 += 100);
}

function onCo2Minus() {
  if (co2 <= 400) setCo2(400);
  else setCo2(co2 -= 100);
}

function setBrg(val) {
  chrome.serial.send(connectionId, str2ab("brg " + brg + "\n"), onSend);
}

function setCo2(val) {
  chrome.serial.send(connectionId, str2ab("ppm " + co2 + "\n"), onSend);
}

function onUpdIntButton() {
  chrome.serial.send(connectionId, str2ab("wsi " + $("#upd_int").val() + "\n"), onSend);
}

function onUpdThrButton() {
  chrome.serial.send(connectionId, str2ab("wst " + $("#upd_thr").val() + "\n"), onSend);
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
  chrome.serial.send(connectionId, str2ab("ppx " + $("#setPPM").val() + "\n"), onSend);
}

function onSetColorsBtn() {
  chrome.serial.send(connectionId, str2ab("lt " + $("#setColors").val() + " \n"), onSend);
}

function onSetBRFBtn() {
  chrome.serial.send(connectionId, str2ab("brf " + ($("#setBRF").val() * 10) + " \n"), onSend);
}

function onDebug() {
  chrome.serial.send(connectionId, str2ab("debug\n"), onSend);
}

function onSetWifi() {
  var ssid = document.getElementById('ssid').value;
  var pass = document.getElementById('pass').value;
  var sapPass = document.getElementById('sapPass').value;
  //chrome.serial.send(connectionId, str2ab("wifi \"" + ssid + "\",\""+ pass + "\"" + (sapPass?",\"" + sapPass + "\"":"") + "\n"), onSend);
  sendSerial("wifi \"" + ssid + "\",\"" + pass + "\"" + (sapPass ? ",\"" + sapPass + "\"" : ""), "GOT IP", onSetWifiConnected);
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

function loadPropertiesFromESP() {
  sendSerial("prop_list", "---vESPrinoCFG_end---", onPropListDone);
}

function onPropListDone(data) {
  if (data.indexOf("---vESPrinoCFG_start---") > -1 && data.indexOf("---vESPrinoCFG_end---") > -1);
  data = data.substring(data.indexOf("---vESPrinoCFG_start---"), data.indexOf("---vESPrinoCFG_end---"));
  processConfigurationFromESP(data);
}

function onSend(data) {}

var testCfgData = 'wifi.ssid=vladiHome\n' +
  'wifi.p1=0888414447\n' +
  'fake=\n' +
  'fake2\n' +
  'custom_url_arr0=url1\n' +
  'custom_url_arr1=url1\n' +
  'custom_url_arr2=url1\n';

var espMapping = {
  "wifi.ssid": "#ssid",
  "wifi.p1": "#pass",
  "custom_url_arr": "#customURL",
  "mqtt_msg_arr": "#mqttValue",
  "mqtt.server": "#mqttHost",
  "mqtt.port": "#mqttPort",
  "mqtt.client": "#mqttClientId",
  "mqtt.user": "#mqttUser",
  "mqtt.pass": "#mqttPass",
  "mqtt.topic": "#mqttTopic",
  "send.interval": "#upd_int"
}

function combineLines(obj, prefix) {
  var whole = "";
  for (var i = 0; i < 10; i++) {
    if (!obj[prefix + i]) break;
    whole += obj[prefix + i] + "\n";
    delete obj[prefix + i];
  }

  whole && (obj[prefix] = whole);
}

function processConfigurationFromESP(data) {
  var lines = data.split("\n");
  var obj = {};
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].indexOf("=");
    if (t == -1) continue;
    var key = lines[i].substring(0, t);
    var value = lines[i].substring(t + 1);
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
  applyGenericJSONConfig(obj["ubi.cfg"]);
  applyGenericJSONConfig(obj["bee.cfg"]);
  applyGenericJSONConfig(obj["dz.cfg"]);
  applyGenericJSONConfig(obj["oh.cfg"]);
  applyGenericJSONConfig(obj["jee.cfg"]);
  applyGenericJSONConfig(obj["pima.cfg"]);
  applyGenericJSONConfig(obj["emon.cfg"]);
  applyGenericJSONConfig(obj["dga.cfg"]);
  applyGenericJSONConfig(obj["dw.cfg"]);
  applyGenericJSONConfig(obj["hs.cfg"]);
  //lines.forEach(handleCfgLine);
}


function applyGenericJSONConfig(json) {
  var p = JSON.parse(json || "{}");
  p && Object.keys(p).forEach(function(key) {
    $("#" + key).val(p[key])
  });
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

$(".select_dataid").each(ttt);

function ttt() {
  var sel = $(this).attr("default");
  $(this).html(function() {
    return "<div class='form-group'><label>{0}</label>\
    <select class='form-control' id='tsf{0}'>\
    <option></option><option>CO2</option><option>TEMP</option><option>HUM</option><option>PRES</option>\
    <option>ALT</option><option>PM25</option><option>PM10</option><option>ALIGHT</option>\
    </select></div>".format($(this).attr("label"))
  });


  $(this).find("select").val(sel);
}
//$(".vladi1 select option:selected").text()
//$("#ts_fields option").filter(":selected").map(function() {return $(this).text()})

function onRFEnableChange() {
  if ($("#rfEnable").is(':checked')) {
    $("#rf_fields :input").removeAttr("disabled");
  } else {
    $('#rf_fields :input').attr("disabled", "true");
  }

}

$(".select_rfid").each(makeRfid);

function makeRfid() {
  var sel = $(this).attr("label");
  $(this).html(function() {
    return '<div class="form-group"><label>' + sel + '&nbsp;</label><input type="text" id="rf.' + sel + '"/></div>';
  });
}

$(".labelAndInput2").each(function() {
  var base = '<div class="col-xs-3 form-inline">\
    <label for="lbi{0}">%{0}%</label>\
    <input type="text" class="lbi form-control" data-label="{0}" id="{2}{0}" placeholder="{1}">\
    </div>';
  $(this).html(base.format($(this).attr("label"), $(this).attr("placeholder"), $(this).attr("prefix")));
})


function onSetRF() {
  var cmdList = $(".select_rfid :input").map(function() {
    return 'prop_set "' + $(this).attr("id") + '","' + ($(this).val() || -1) + '"'
  });
  cmdList = cmdList.get();
  var xx = ["a"];
  xx = xx.concat(cmdList);
  cmdList = ['prop_set "rf.enabled","' + $("#rfEnable").is(":checked") + '"'].concat(cmdList);
  var flist = createFunctionLinkedList(cmdList, "ready >", function() {});
  flist();

}

var changedFields = {};
$(":input").click(function() {
  changedFields[$(this).attr("id")] = true
});


function getTree() {
  var onlineServices = [{
    text: "BeeBotte",
    href: "#repBeebotte"
  }, {
    text: "dweet.io",
    href: "#repDweet"
  }, {
    text: "ThingSpeak",
    href: "#repThingSpeak"
  }, {
    text: "UbiDots",
    href: "#repUbidots"
  }, ];
  var privateServices = [{
    text: "DomoticGa",
    href: "#repDomotiGa"
  }, {
    text: "DomoticZ",
    href: "#repDomoticz"
  }, {
    text: "EmonCMS",
    href: "#repEmon"
  }, {
    text: "FHEM",
    href: "#repOpenHab"
  }, {
    text: "Homeseer",
    href: "#repHomeseer"
  }, {
    text: "HomeAssistant",
    href: "#repOpenHab"
  }, {
    text: "JeeDom",
    href: "#repJeedom"
  }, {
    text: "OpenHAB",
    href: "#repOpenHab"
  }, {
    text: "Pimatic",
    href: "#repPimatic"
  }];
  var genericConfiguration = [{
    text: "HTTP",
    href: "#repCustomHTTP"
  }, {
    text: "MQTT",
    href: "#repCustomMQTT"
  }, {
    text: "RF 433/315",
    href: "#repRF"
  }];

  var tree = [{
    text: "Connection",
    state: {
      selected: true
    },
    href: "#setupWifi"
  }, {
    text: "Public Services",
    state: {
      expanded: false
    },
    selectable: false,
    nodes: onlineServices
  }, {
    text: "Private Services",
    state: {
      expanded: false
    },
    selectable: false,
    nodes: privateServices
  }, {
    text: "Generic Services",
    state: {
      expanded: false
    },
    selectable: false,
    nodes: genericConfiguration
  }, {
    text: "Settings",
    href: "#settings"
  }, {
    text: "About",
    href: "#repAbout"
  }];
  return tree;
}

$('#tree').treeview({
  data: getTree()
});
$('#mainTabs a[href="#setupWifi"]').tab("show")
$('#tree').on('nodeSelected', function(event, data) {
  $('#mainTabs a[href="' + data.href + '"]').tab("show")
});

initChromeStorageSync();
setTimeout(onSSIDChange, 500);
if (chrome.serial) AutoConnect.onbtnAutoConnect();
