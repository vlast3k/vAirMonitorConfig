var ProcessMQTTandHTTP = (function () {
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
    var dzUser = $("#dzUser").val();
    var dzPass = $("#dzPass").val();
    if (dzUser) dzHost = dzUser + ":" + dzPass + "@" + dzHost;

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
    var host = $("#emonHost").val() || "http://emoncms.org/";
    if (host[host.length -1] != '/') host += '/';

    var pay = "", host;
    $("#emon_fields :input").filter(".lbi").each(function() {
      if (!$(this).val()) return;
      pay += "{0}:%{1}%,".format($(this).val(), $(this).attr("data-label"));
    });
    if (!pay) return [];
    pay = pay.substring(0, pay.length - 1);

    return "#" + host + "input/post.json?json={" + pay + "}&apikey=" + key;
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
    if (!$("[id='" + rootTag + "']").length) return [];
    return Object.keys(changedFields).filter(function(key) {
      return $("[id='" + key   + "']") &&
        (rootTag === key || $.contains($("[id='" + rootTag + "']").get(0), $("[id='" + key + "']").get(0)))
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

  function createCommandsForGenericPropertyFields() {
    var res = [];
    $(".prop_set").each(function() {
      var id = $(this).attr("id");
      if (containsChanges(id).length) {
        res.push("prop_jset \"" + id + "\"" + $(this).val());
        cleanChanges(id);
      }
    });
    return res;

  }

  function onBtnCustom() {
    SerialHelper.startSequence();
    SerialHelper.addCommand("nop");
    SerialHelper.addCommand('custom_url_clean');
    createCommandsForGenericPropertyFields().forEach(function(el) {
      SerialHelper.addCommand(el);
    });
    createCommandsForCustomHTTP().forEach(function(el) {
      SerialHelper.addCommand(el);
    });
    //SerialHelper.addCommand(processTSStoreConfig());
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

  function mqttGetValuesAsArray() {
    var cb = function(path, idx) {
      return 'mqtt_msg_add "' + idx + '"' + path
    };
    var res = $("#mqttValue").val().split("\n").filter(function(val) {
      return val
    });
    return res.map(cb);
  }

  function createCommandsForCustomMQTT() {
    processBeebotteConfig();
    processOpenHABConfig();
    var callMqttSetup = 'mqtt_setup "' + $("#mqttHost").val() + '","' + $("#mqttPort").val() + '","' +
      $("#mqttClientId").val() + '","' + $("#mqttUser").val() + '","' +
      $("#mqttPass").val() + '"';
    return ['mqtt_msg_clean', callMqttSetup].concat(mqttGetValuesAsArray());
  }

  function onSetMQTT() {
    SerialHelper.startSequence();
    SerialHelper.addCommand("nop");
    createCommandsForCustomMQTT().forEach(function(el) {
      SerialHelper.addCommand(el);
    });

    SerialHelper.addCommand(processGenericIDConfig("repBeebotte", "bee.cfg"));
    SerialHelper.addCommand(processGenericIDConfig("repOpenHab", "oh.cfg"));
    SerialHelper.sendSequence();
  }

  var changedFields = {};
  function registerChangedFields() {
    $(":input").mousedown(function() {
      if ($(this).hasClass("btn")) return;
      console.log("Changed: " + $(this).attr("id"));
      changedFields[$(this).attr("id")] = true
    });
  }

  function init() {
    $("#tsBtn").click(onBtnCustom);
    $("#ubiSaveBtn").click(onBtnCustom);
    $("#dzSaveBtn").click(onBtnCustom);
    $("#pimaSaveBtn").click(onBtnCustom);
    $("#jeeSaveBtn").click(onBtnCustom);
    $("#emonSaveBtn").click(onBtnCustom);
    $("#dgaSaveBtn").click(onBtnCustom);
    $("#dwSaveBtn").click(onBtnCustom);
    $("#hsSaveBtn").click(onBtnCustom);
    $(".saveBtn").click(onBtnCustom);


    $("#customBtn").click(onBtnCustom);
    $("#setMQTT").click(onSetMQTT);
    $("#beeSaveBtn").click(onSetMQTT);
    $("#ohSaveBtn").click(onSetMQTT);
  }
  return {
    init : init,
    registerChangedFields: registerChangedFields
  }
})();
