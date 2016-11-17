var ConfigurationFromESP = (function() {
  function loadPropertiesFromESP() {
    SerialHelper.addCommand({cmd:"prop_list", endOKstr:"---vESPrinoCFG_end---", timeout:4000, onOK:onPropListDone});
  }

  function onPropListDone(data) {
    if (data.indexOf("---vESPrinoCFG_start---") > -1 && data.indexOf("---vESPrinoCFG_end---") > -1);
    data = data.substring(data.indexOf("---vESPrinoCFG_start---"), data.indexOf("---vESPrinoCFG_end---"));
    processConfigurationFromESP(data);
  }



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


  function cleanAllInputs() {
    $(":input[type='text'][id!='serial']").val("");
    $("textarea[id!='buffer']").val("");
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
    RFHandler.onRFEnableChange();
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

  function espCfgTest() {
    var testCfgData = 'wifi.ssid=vladiHome\n' +
      'wifi.p1=0888414447\n' +
      'fake=\n' +
      'fake2\n' +
      'custom_url_arr0=url1\n' +
      'custom_url_arr1=url1\n' +
      'custom_url_arr2=url1\n';
    processConfigurationFromESP(testCfgData);
  }
  return {
    load : loadPropertiesFromESP
  }

})();
