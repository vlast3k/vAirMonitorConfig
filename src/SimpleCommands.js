var SimpleCommands = (function() {
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
    SerialHelper.addCommand("brg " + brg);
  }

  function setCo2(val) {
    SerialHelper.addCommand("ppm " + co2);
  }


  function onUpdIntButton(e) {
    //e.preventDefault();
    SerialHelper.addCommand("wsi " + $("#upd_int").val());
  }

  function onUpdThrButton() {
    SerialHelper.addCommand("wst " + $("#upd_thr").val());
  }

  function onResetFact() {
    SerialHelper.addCommand("factory");
  }

  function onResetCal() {
    SerialHelper.addCommand("rco");
  }

  function onSetPPMBtn() {
    SerialHelper.addCommand("ppx " + $("#setPPM").val());
  }

  function onSetColorsBtn() {
    SerialHelper.addCommand("lt " + $("#setColors").val());
  }

  function onSetBRFBtn() {
    SerialHelper.addCommand("brf " + ($("#setBRF").val() * 10));
  }

  function onDebug() {
    SerialHelper.addCommand("debug");
  }

  function onBtnTestCfg() {
    SerialHelper.addCommand("sendNow");
  }

  function onPM2005Setup() {
    if ($("#pm2005_qstart").val()) {
      SerialHelper.addCommand("pm2005quiet " + $("#pm2005_qstart").val() + "," + $("#pm2005_qend").val() + "," + $("#tz_offset").val());
    }

    if ($("#pm2005_int_active").val()) {
      if (!$("#pm2005_int_quiet").val()) $("#pm2005_int_quiet").val($("#pm2005_int_active").val());
      SerialHelper.addCommand("pm2005int " + $("#pm2005_int_active").val() + "," + $("#pm2005_int_quiet").val());
    }
  }

  function init() {
    $("#brgPlus").click(onBrgPlus);
    $("#brgMin").click(onBrgMinus);
    $("#co2Min").click(onCo2Minus);
    $("#co2Plus").click(onCo2Plus);

    $("#updThrButton").click(onUpdThrButton);
    $("#resetCal").click(onResetCal);
    $("#resetAll").click(onResetFact);
    $("#setPPMBtn").click(onSetPPMBtn);
    $("#setColorsBtn").click(onSetColorsBtn);
    $("#setBRFBtn").click(onSetBRFBtn);
    $("button.testCfgBtn").click(onBtnTestCfg);
    $("#updPM2005btn").click(onPM2005Setup);


  }
  return {
    init:init,
    onUpdIntButton, onUpdIntButton
  }
})();
