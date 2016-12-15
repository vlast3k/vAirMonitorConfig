var Blynk = (function() {
  // function onSetRF() {
  //   var cmdList = $(".select_rfid :input").map(function() {
  //     return 'prop_set "' + $(this).attr("id") + '","' + ($(this).val() || -1) + '"'
  //   });
  //   cmdList = cmdList.get();
  //   var xx = ["a"];
  //   xx = xx.concat(cmdList);
  //   cmdList = ['prop_set "rf.enabled","' + $("#rfEnable").is(":checked") + '"'].concat(cmdList);
  //   SerialHelper.startSequence();
  //   cmdList.forEach(function(el) {
  //     SerialHelper.addCommand(el);
  //   });
  //   SerialHelper.sendSequence();
  // }
  //
  // function onRFEnableChange() {
  //   if ($("#rfEnable").is(':checked')) {
  //     $("#rf_fields :input").removeAttr("disabled");
  //   } else {
  //     $('#rf_fields :input').attr("disabled", "true");
  //   }
  // }
  //
  // function htmlMakeRFFields() {
  //   $(".select_rfid").each(makeRfid);
  //
  //   function makeRfid() {
  //     var sel = $(this).attr("label");
  //     $(this).html(function() {
  //       return '<div class="form-group"><label>' + sel + '&nbsp;</label><input type="text" id="rf.' + sel + '"/></div>';
  //     });
  //   }
  // }

  function onSave() {
    var cfg = "";
    var bAuth = $("#blynkAuth").val();
    $("#blynk_fields option").filter(":selected").each(function() {
      cfg += $(this).parents(".select_dataid").attr("label") + "," + $(this).text() + ","
    });
    if (cfg) cfg = cfg.substring(0, cfg.length -1);
    SerialHelper.addCommand("prop_jset \"blynk.enabled\"" + (bAuth != undefined));
    SerialHelper.addCommand("prop_jset \"blynk.auth\"" + bAuth);
    SerialHelper.addCommand("prop_jset \"blynk.cfg\"" + cfg);
  }

  function init() {
    $("#blynkBtn").click(onSave);
    // $("#rfEnable").change(onRFEnableChange);
    // $("#setRF").click(onSetRF);
  }

  return {
    init: init,
  }
})();
