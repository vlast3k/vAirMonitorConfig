var TreeNavigation = (function () {
  function getTree() {
    var onlineServices = [{
      text: "BeeBotte",
      href: "#repBeebotte"
    }, {
      text: "Blynk.cc",
      href: "#repBlynk"
    }, {
      text: "dweet.io",
      href: "#repDweet"
    }, {
      text: "EmonCMS",
      href: "#repEmon"
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
      text: "vESPrino",
      href: "#vESPrino"
    }, {
      text: "Settings",
      href: "#settings"
    }, {
      text: "About",
      href: "#repAbout"
    }];
    return tree;
  }

  function init(container) {
    $(container).treeview({
      data: getTree()
    });
    $(container).on('nodeSelected', function(event, data) {
      $('#mainTabs a[href="' + data.href + '"]').tab("show")
    });

  }

  return {
    init:init
  }
})()
