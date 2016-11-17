var SerialHelper = (function () {
  var IDLE = "IDLE";
  var SENDING = "SENDING"
  var cmdQueue = [];
  var state = IDLE;
  var serialDataFromCurrentExecution = "";
  var collectedSerialData = "";
  var currentSequence;
  var sequenceTerminateTimer;

  function startSequence() {
    currentSequence = Date.now();
  }

  function addCommand(cmd) {
    var cmdJ = cmd;
    if (typeof cmd === 'string' || cmd instaceof String) {
      cmdJ = {cmd:cmd};
    }
    cmdJ.sequence = currentSequence > -1 ? currentSequence : Date.now();
    cmdJ.timeout  = cmdJ.timeout || 1000;
    cmdJ.endOKstr = cmdJ.endOKstr || "ready >";
    cmdQueue = cmdQueue.concat(cmdJ);
  }

  function sendSequence() {
    currentSequence = -1;
    doSend();
  }

  function doSend() {
    if (state === SENDING) return;
    if (!cmdQueue.length) return;
    serialDataFromCurrentExecution = "";
    iterationSerialData = "";
    chrome.serial.send(connectionId, str2ab(cmdQueue[0].cmd + "\n"), function() {});
    sequenceTerminateTimer = setTimeout(onTerminateCurrentSequence, cmdQueue[0].timeout);

  }

  function onTerminateCurrentSequence() {
    while (cmdQueue[0].currentSequence == currentSequence) cmdQueue.shift();
    doPost();
  }

  function onReceiveCallback(info) {
    clearTimeout(serialTimeout);
    serialTimeout = setTimeout(processCurrentData, 100);
    iterationSerialData += ab2str(info.data);
  }

  function processCurrentData() {
    serialDataFromCurrentExecution += iterationSerialData;
    log ("[" + iterationSerialData.trim() + "]"); // + "\n waiting for : " + onOKString);
    if (serialDataFromCurrentExecution.indexOf(cmdQueue[0].endOKstr) > -1) {
      clearTimeout(sequenceTerminateTimer);
      cmdQueue[0].onOK && cmdQueue[0].onOK(serialDataFromCurrentExecution);
      cmdQueue.shift();
      state = IDLE;
      doSend();
    }
    iterationSerialData = "";
    if (serialDataFromCurrentExecution.length > 50000) serialDataFromCurrentExecution = "";
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
    ab2str : ab2str,
    str2ab : str2ab
  }
})();
