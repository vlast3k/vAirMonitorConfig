var RFHandler = (function() {
  function onSetRF() {
    var cmdList = $(".select_rfid :input").map(function() {
      return 'prop_set "' + $(this).attr("id") + '","' + ($(this).val() || -1) + '"'
    });
    cmdList = cmdList.get();
    //var xx = ["a"];
    //xx = xx.concat(cmdList);
    //cmdList = ['prop_set "rf.enabled","' + $("#rfEnable").is(":checked") + '"'].concat(cmdList);
    SerialHelper.startSequence();
    cmdList.forEach(function(el) {
      SerialHelper.addCommand(el);
    });
    SerialHelper.sendSequence();
  }

  function onRFEnableChange() {
    if ($("[id='rf.enabled']").is(':checked')) {
      $("#rf_fields :input").removeAttr("disabled");
    } else {
      $('#rf_fields :input').attr("disabled", "true");
    }
  }

  function htmlMakeRFFields() {
    $(".select_rfid").each(ttt);

    function rfPropHandler(key, value) {
      $("[id='" + key + "']").val(value);
      //console.log(key  + " " + value);
    }

    function ttt() {

      var sel = "";// $(this).attr("default");
      var prefix = "<div class='form-group'><label>{0}</label>\
      <select class='form-control' id='rf.{0}'>\
      <option></option>".format($(this).attr("label"));
      var suffix = "</select></div>";
      for (var i=130; i < 150; i++) {
        var b = (~i & 0xF0) + (i & 0xF);
        var num = (i << 8) + b;
        var hex = num.toString(16);
        var text = i + " / " + num + " / 0x" + hex;
        prefix += "<option value='" + i + "'>" + text + "</option>"
      }
      prefix += suffix;
      $(this).html(function() {
        return prefix;
      });
      $(this).find("select").val(sel);
      ConfigurationFromESP.registerPropertyHandler("rf." + $(this).attr("label"), rfPropHandler);
    }

  }

  function init() {
    htmlMakeRFFields();
    $("[id='rf.enabled']").change(onRFEnableChange);
    $("#setRF").click(onSetRF);
  }

  return {
    init: init,
    onRFEnableChange: onRFEnableChange
  }
})();
