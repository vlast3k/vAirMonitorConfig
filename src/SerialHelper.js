var SerialHelper = (function () {
  var IDLE = "IDLE";
  var SENDING = "SENDING"
  var cmdQueue = [];
  var state = IDLE;
  var serialDataFromCurrentExecution = "";
  var collectedSerialData = "";
  var currentSequence;
  var sequenceTerminateTimer;
  var serialTimeout;
  var iterationSerialData="";


  function init() {
     state = IDLE;
     serialDataFromCurrentExecution = "";
     collectedSerialData = "";
     currentSequence;
     sequenceTerminateTimer;
     serialTimeout;
     iterationSerialData="";
  }
  function startSequence() {
    currentSequence = Date.now();
  }

  function addCommand(cmd) {
    if (!cmd) return;
    console.log("cmd=" + cmd + ", type=" + (typeof cmd) + ", arr: " + Array.isArray(cmd) );
    if (Array.isArray(cmd)) {
      cmd.forEach(function(el) {addCommand(el)});
      return;
    }
    //console.log("cmd=" + cmd + ", type=" + (typeof cmd) + ", arr: " + Array.isArray(cmd) );
    var cmdJ = cmd;
    if (typeof cmd === 'string') {
      cmdJ = {cmd:cmd};
    }
    cmdJ.sequence = currentSequence > -1 ? currentSequence : Date.now();
    cmdJ.timeout  = cmdJ.timeout || 2000;
    cmdJ.endOKstr = cmdJ.endOKstr || "ready >";
    console.log(JSON.stringify(cmdJ));
    cmdQueue = cmdQueue.concat(cmdJ);
    if (currentSequence == -1)    setTimeout(doSend, 0);
  }

  function sendSequence() {
    currentSequence = -1;
    setTimeout(doSend, 0);

  }

  function doSend() {
    if (state === SENDING) return;
    if (!cmdQueue.length) return;
    serialDataFromCurrentExecution = "";
    iterationSerialData = "";
    console.log("sending command: " + JSON.stringify(cmdQueue[0]));
    chrome.serial && chrome.serial.send(AutoConnect.getConnectionId(), str2ab(cmdQueue[0].cmd + "\n"), function() {});
    sequenceTerminateTimer = setTimeout(onTerminateCurrentSequence, cmdQueue[0].timeout);
    state = SENDING;

  }

  function onTerminateCurrentSequence() {
    var cs = cmdQueue[0].currentSequence;
    while (cmdQueue.length && cmdQueue[0].currentSequence == cs) {
      console.log("terminating: " + JSON.stringify(cmdQueue[0]));
      cmdQueue.shift();
      state = IDLE;
    }
    setTimeout(doSend, 0);

  }

  function onReceiveCallback(info) {
    clearTimeout(serialTimeout);
    serialTimeout = setTimeout(processCurrentData, 50);
    iterationSerialData += ab2str(info.data);
  }

  function processCurrentData() {
    serialDataFromCurrentExecution += iterationSerialData;
    log ("[" + iterationSerialData.trim() + "]"); // + "\n waiting for : " + onOKString);
    if (cmdQueue.length && serialDataFromCurrentExecution.indexOf(cmdQueue[0].endOKstr) > -1) {
      console.log("found:" +cmdQueue[0].endOKstr + ", in: " + serialDataFromCurrentExecution);
      clearTimeout(sequenceTerminateTimer);
      cmdQueue[0].onOK && cmdQueue[0].onOK(serialDataFromCurrentExecution);
      var idx = serialDataFromCurrentExecution.indexOf(cmdQueue[0].endOKstr);
      idx += cmdQueue[0].endOKstr.length;
      serialDataFromCurrentExecution = serialDataFromCurrentExecution.substring(idx);
      cmdQueue.shift();
      state = IDLE;
      setTimeout(doSend, 0);
    }
    iterationSerialData = "";
    if (serialDataFromCurrentExecution.length > 50000) serialDataFromCurrentExecution = serialDataFromCurrentExecution.substring(40000);
  }

  /* Interprets an ArrayBuffer as UTF-8 encoded string data. */
  var ab2str = function(buf) {
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return encodedString;
  };

  /* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
  var str2ab = function(str) {
    var encodedString = str;
    var bytes = new Uint8Array(encodedString.length);
    for (var i = 0; i < encodedString.length; ++i) {
      bytes[i] = encodedString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  return {
    addCommand : addCommand,
    onReceiveCallback: onReceiveCallback,
    sendSequence: sendSequence,
    startSequence: startSequence,
    ab2str : ab2str,
    str2ab : str2ab,
    init : init
  }
})();
