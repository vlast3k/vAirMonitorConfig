var RFHandler = (function() {
  function onSetRF() {
    var cmdList = $(".select_rfid :input").map(function() {
      return 'prop_set "' + $(this).attr("id") + '","' + ($(this).val() || -1) + '"'
    });
    cmdList = cmdList.get();
    var xx = ["a"];
    xx = xx.concat(cmdList);
    cmdList = ['prop_set "rf.enabled","' + $("#rfEnable").is(":checked") + '"'].concat(cmdList);
    SerialHelper.startSequence();
    cmdList.forEach(function(el) {
      SerialHelper.addCommand(el);
    });
    SerialHelper.sendSequence();
  }

  function onRFEnableChange() {
    if ($("#rfEnable").is(':checked')) {
      $("#rf_fields :input").removeAttr("disabled");
    } else {
      $('#rf_fields :input').attr("disabled", "true");
    }
  }

  function htmlMakeRFFields() {
    $(".select_rfid").each(makeRfid);

    function makeRfid() {
      var sel = $(this).attr("label");
      $(this).html(function() {
        return '<div class="form-group"><label>' + sel + '&nbsp;</label><input type="text" id="rf.' + sel + '"/></div>';
      });
    }
  }
  function init() {
    htmlMakeRFFields();
    $("#rfEnable").change(onRFEnableChange);
    $("#setRF").click(onSetRF);
  }

  return {
    init: init,
    onRFEnableChange: onRFEnableChange
  }
})();
