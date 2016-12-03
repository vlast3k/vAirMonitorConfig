<div role="tabpanel" class="tab-pane" id="vESPrino_tab">
  <div class="panel panel-default ">
    <div class="panel-body">
      <ul class="nav nav-pills" role="tablist">
        <li role="presentation" class="active"><a href="#veButton" aria-controls="veButton" role="tab" data-toggle="tab">Button</a></li>
        <li role="presentation"> <a href="#veRFID" aria-controls="veRFID" role="tab" data-toggle="tab">RFID</a></li>
        <li role="presentation"> <a href="#veCMD" aria-controls="veCMD" role="tab" data-toggle="tab">Inbound Commands</a></li>
        <li role="presentation"> <a href="#veLightSensor" aria-controls="veLightSensor" role="tab" data-toggle="tab">Light Sensor</a></li>
      </ul>
      <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" id="veButton">
          <div class="panel panel-default ">
            <div class="panel-body">

              <ul class="nav nav-pills" role="tablist">
                <li role="presentation" class="active"><a href="#bttnDweetio" aria-controls="bttnDweetio" role="tab" data-toggle="tab">dweet.io</a></li>
                <li role="presentation"> <a href="#bttnIfttt" aria-controls="bttnIfttt" role="tab" data-toggle="tab">IFTTT</a></li>
                <li role="presentation"> <a href="#bttnCustomhttp" aria-controls="bttnCustomhttp" role="tab" data-toggle="tab">Custom HTTP</a></li>
              </ul>

              <div class="tab-content" id="veButtonTabContent">
                <div role="tabpanel" class="tab-pane active" id="bttnDweetio">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <form class="form-inline">
                        <div class="form-group">
                          <label>Dweet For</label>
                          <input type="text" class="form-control" id="bttnDwFor"> &nbsp;&nbsp;&nbsp;&nbsp;
                          <label>Dweet Params</label>
                          <input type="text" class="form-control" id="bttnDwParams">

                        </div>
                      </form>

                    </div>
                  </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="bttnIfttt">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <form class="form-inline">
                        <div class="form-group">
                          <label>IFTTT Key</label>
                          <input type="text" class="form-control" id="bttnIfKey"> &nbsp;&nbsp;&nbsp;&nbsp;
                          <label>IFTTT Event</label>
                          <input type="text" class="form-control" id="bttnIfEvent">

                        </div>
                      </form>
                      <p></p>
                      <a href="https://ifttt.com/maker" target="_new">Open IFTTT Maker channel to get your key</a>

                    </div>
                  </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="bttnCustomhttp">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <label>Custom HTTP URL</label>
                      <input type="text" class="form-control" id="bttnCustomUrl">
                    </div>
                  </div>
                </div>
              </div>
              <button id="bttnSetAction" type="submit" class="btn btn-default ">
                Set Button Action
              </button>
            </div>
          </div>
        </div>
        <div role="tabpanel" class="tab-pane" id="veCMD">
          <div class="panel panel-default ">
            <div class="panel-body">
              <ul class="nav nav-pills" role="tablist">
                <li role="presentation" class="active"><a href="#cmdDweetio" aria-controls="rfidDweetio" role="tab" data-toggle="tab">dweet.io</a></li>
              </ul>

              <div class="tab-content" id="veCMDTabContent">
                <div role="tabpanel" class="tab-pane active" id="cmdDweetio">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <form class="form-inline">
                        <div class="form-group">
                          <label>Dweet For</label>
                          <input type="text" class="form-control" id="cmdDwFor">
                        </div>
                      </form>

                    </div>
                  </div>
                </div>
              </div>
              <p></p>
              Supported commands:<br> led next (cycles through colors)<br> led {color} (where {color} is: red, pink, lila, violet, blue, mblue, cyan, green, yellow, orange<br> led {colorHex} (where {colorHex} is color in hex, e.g. 23AE5F<br> oled
              {text} (display {text} on the OLED screen if attached<br>

              <p></p>
              <button id="cmdSetAction" type="submit" class="btn btn-default ">
                Set Inbound Command Endpoint
              </button>

            </div>
          </div>
        </div>
        <div role="tabpanel" class="tab-pane" id="veRFID">
          <div class="panel panel-default ">
            <div class="panel-body">
              <ul class="nav nav-pills" role="tablist">
                <li role="presentation" class="active"><a href="#rfidDweetio" aria-controls="rfidDweetio" role="tab" data-toggle="tab">dweet.io</a></li>
                <li role="presentation"> <a href="#rfidIfttt" aria-controls="rfidIfttt" role="tab" data-toggle="tab">IFTTT</a></li>
                <li role="presentation"> <a href="#rfidCustomhttp" aria-controls="rfidCustomhttp" role="tab" data-toggle="tab">Custom HTTP</a></li>
              </ul>

              <div class="tab-content" id="veRFIDTabContent">
                <div role="tabpanel" class="tab-pane active" id="rfidDweetio">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <form class="form-inline">
                        <div class="form-group">
                          <label>Dweet For</label>
                          <input type="text" class="form-control" id="rfidDwFor"> &nbsp;&nbsp;&nbsp;&nbsp;
                          <label>Dweet Params</label>
                          <input type="text" class="form-control" id="rfidDwParams">

                        </div>
                      </form>

                    </div>
                  </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="rfidIfttt">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <form class="form-inline">
                        <div class="form-group">
                          <label>IFTTT Key</label>
                          <input type="text" class="form-control" id="rfidIfKey"> &nbsp;&nbsp;&nbsp;&nbsp;
                          <label>IFTTT Event</label>
                          <input type="text" class="form-control" id="rfidIfEvent">

                        </div>
                      </form>

                    </div>
                  </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="rfidCustomhttp">
                  <div class="panel panel-default ">
                    <div class="panel-body">
                      <label>Custom HTTP URL</label>
                      <input type="text" class="form-control" id="rfidCustomUrl">
                    </div>
                  </div>
                </div>
              </div>
              <p></p>
              Use %s as placeholder for RFID card UID
              <p></p>
              <button id="rfidSetAction" type="submit" class="btn btn-default ">
                Set RFID Action
              </button>


            </div>
          </div>
        </div>
        <div role="tabpanel" class="tab-pane" id="veOLED">
          <div class="panel panel-default ">
            <div class="panel-body">
            </div>
          </div>
        </div>
        <div role="tabpanel" class="tab-pane" id="veLightSensor">
          <div class="panel panel-default ">
            <div class="panel-body">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>





  // function findDevice(onDeviceFound, text, baud) {
  //   var devices = {};
  //   var findInterval = setInterval(function() { log(" . ", true);  }, 500);
  //
  //   function onIntDeviceFound(comPort, connId) {
  //     clearInterval(findInterval);
  //     clearTimeout(foundTimeout);
  //     Object.keys(devices).forEach(function(_connId) {
  //      chrome.serial.disconnect(+_connId, function() {});
  //     });
  //     chrome.serial.onReceive.removeListener(onRecvFindDev);
  //     setTimeout(function() {onDeviceFound(comPort)}, 1000);
  //   }
  //
  //   var foundTimeout = setTimeout(function() {
  //     onIntDeviceFound(null);
  //   }, 10000);
  //
  //   function onRecvFindDev(conn) {
  //     var str = ab2str(conn.data);
  //     log ("[" + ab2str(conn.data).trim() + "]");
  //     devices[conn.connectionId].str += str;
  //     var s = devices[conn.connectionId].str;
  //     if (s.indexOf(VAIR) > -1)         deviceType = VAIR;
  //     else if (s.indexOf(VTHING) > -1)  deviceType = VTHING;
  //   //  else if (s.indexOf(VTHING_STARTER) > -1)  deviceType = VTHING_STARTER;
  //     else if (s.indexOf(VTHING_H801) > -1)  deviceType = VTHING_H801;
  //     else if (s.indexOf(VESPRINO_V1) > -1)  deviceType = VESPRINO_V1;
  //     else return;
  //     onIntDeviceFound(devices[conn.connectionId].path, conn.connectionId);
  //   }
  //
  //
  //   function onGetDevices(ports) {
  //     chrome.serial.onReceive.addListener(onRecvFindDev);
  //     ports.forEach(function(ppp) {
  //       log("Trying : " + ppp.path + "\n");
  //       chrome.serial.connect(ppp.path, {bitrate: baud}, function(data) {
  //         function onRTSTimeout() {chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:false}, function() {}); }
  //         function onCtrlSigSet() {setTimeout(onRTSTimeout, 1000);  }
  //         if (!chrome.runtime.lastError && data) {
  //           devices[data.connectionId] = {path:ppp.path, str:""};
  //           chrome.serial.setControlSignals(data.connectionId, {dtr:false, rts:true}, onCtrlSigSet);
  //         }
  //       });
  //     });
  //   }
  //   log (text, true);
  //   chrome.serial.getDevices(onGetDevices);
  //
  // }


  // function onBttnSetAction() {
  //   var selTabId = $('#veButtonTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "bttnDweetio") {
  //     sendSerial('vespBttnA "dw","' + $("#bttnDwFor").val() + '","' + ($("#bttnDwParams").val()) + '"', "OK >")
  //   } else if (selTabId == "bttnIfttt") {
  //     sendSerial('vespBttnA "if","' + $("#bttnIfEvent").val() + '","' + $("#bttnIfKey").val() + '"', "OK >")
  //   } else if (selTabId == "bttnCustomhttp") {
  //     sendSerial('vespBttn ' + $("#bttnCustomUrl").val(), "OK >")
  //   }
  // }
  //
  // function onRFIDSetAction() {
  //   var selTabId = $('#veRFIDTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "rfidDweetio") {
  //     sendSerial('vespRFIDA "dw","' + $("#rfidDwFor").val() + '","' + ($("#rfidDwParams").val()) + '"', "OK >")
  //   } else if (selTabId == "bttnIfttt") {
  //     sendSerial('vespRFIDA "if","' + $("#rfidIfEvent").val() + '","' + $("#rfidIfKey").val() + '"', "OK >")
  //   } else if (selTabId == "rfidCustomhttp") {
  //     sendSerial('vespRFID ' + $("#rfidCustomUrl").val(), "OK >")
  //   }
  // }
  //
  // function onCMDSetAction() {
  //   var selTabId = $('#veCMDTabContent').find('.tab-pane.active').attr("id");
  //   if (selTabId == "cmdDweetio") {
  //     sendSerial('vespDWCmd ' + $("#cmdDwFor").val(), "OK >")
  //   }
  // }

  // //on change hide all divs linked to select and show only linked to selected option
  // $('.mystaff_hide').addClass('collapse');
  // $('#sel1').change(function(){
  //     var selector = '#sel1_' + $(this).val();
  //
  //     //hide all elements
  //     $('.mystaff_hide').collapse('hide');
  //
  //     //show only element connected to selected option
  //     $(selector).collapse('show');
  // });

  // var VAIR = "vAir";
  // var VTHING = "vThing - CO2";
  // var VESPRINO_V1 = "vESPrino"
  // var VTHING_H801    = "vThing - H8"
  // var VTHING_STARTER = "sadsa"
  //var VESPRINO_V1    = "vESPrino v1"

  // function onSetTs() {
  //   chrome.serial.send(connectionId, str2ab("tskey " + document.getElementById('tsKey').value + "\n"), onSend);
  // }
  //
  // var collectedSerialData = "";
  //
  // function sendSerial(str, _onOKString, _onOK) {
  //   //log("sending: " + str);
  //   collectedSerialData = "";
  //   if (_onOK) {
  //     onOKString = _onOKString || ">";
  //     onOK = _onOK;
  //   } else {
  //     onOKString = ">";
  //     onOK = _onOKString;
  //   }
  //   chrome.serial.send(connectionId, str2ab(str + "\n"), onSend);
  // }

  // function onBtnUbi() {
  //   log ("ubi:" +   $("#ubik").val() + "," +   $("#ubiv").val())
  //   sendSerial("ubik " + $("#ubik").val(),
  //   function() {sendSerial("ubiv " + $("#ubiv").val()) } );
  // }


  function alertConfigStored() {
    log("\nConfiguration Stored\n");
  }

  function onBtnSAP() {

    var cfgiot2 = function() { sendSerial("cfgiot2 \"" + $("#sapToken").val() + "\",\"" + $("#sapBtnMessageId").val()  + "\"",
    ">", (deviceType == VTHING_STARTER)? alertConfigStored :  AutoConnect.onbtnAutoConnect)};
    var cfgiot1 = function() { sendSerial("cfgiot1 \"" + $("#sapHost").val()     + "\",\""+ $("#sapDeviceId").val() + "\",\""
    //                                 + $("#sapMessageId").val() + "\",\""+ $("#sapVarName").val()  + "\"",
    + $("#sapMessageId").val() + "\",\"temp\"",
    ">", cfgiot2) };
    var proxy =  function() { sendSerial("proxy", "GOT IP", cfgiot1) }
    var sap   =  function() { sendSerial("sap 1", proxy); }
    //log("sadsadsadsa: " + deviceType + "   "  + (deviceType == VAIR));
    if (deviceType == VAIR) {
      sap()
    } else {
      cfgiot1()
    }
  }
