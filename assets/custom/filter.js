jQuery(document).ready(function () {
    filtercontroller.init();
     $('.website-heading h2').html(localStorage.getItem('venueName'));
    //advance multiselect start
    $('#my_multi_select3').multiSelect({
        selectableHeader: "<input type='text' class='form-control search-input' autocomplete='off' placeholder='search...'>",
        selectionHeader: "<input type='text' class='form-control search-input' autocomplete='off' placeholder='search...'>",
        afterInit: function (ms) {
            var that = this,
                            $selectableSearch = that.$selectableUl.prev(),
                            $selectionSearch = that.$selectionUl.prev(),
                            selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                            selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';

            that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                            .on('keydown', function (e) {
                                if (e.which === 40) {
                                    that.$selectableUl.focus();
                                    return false;
                                }
                            });

            that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                            .on('keydown', function (e) {
                                if (e.which == 40) {
                                    that.$selectionUl.focus();
                                    return false;
                                }
                            });
        },
        afterSelect: function () {
            this.qs1.cache();
            this.qs2.cache();
        },
        afterDeselect: function () {
            this.qs1.cache();
            this.qs2.cache();
        }
    });

    // Select2
    $(".select2").select2();

    $(".select2-limiting").select2({
        maximumSelectionLength: 2
    });

    filter.startDate = moment().subtract(29, 'days').startOf('day');
    filter.endDate = moment().endOf('day');
    filter.showResultPanel(false);
    $(document).ajaxStart(function () {
        //filter.showloader();
        //showloader();
        showLoaderBallAtomLoader();
    });
    $(document).ajaxComplete(function () {
        //filter.hideLoader();
        //hideloader();
        hideLoaderBallAtomLoader();
    });

});

            //Bootstrap-TouchSpin
$(".vertical-spin").TouchSpin({
                verticalbuttons: true,
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary",
                verticalupclass: 'ti-plus',
                verticaldownclass: 'ti-minus'
            });
            var vspinTrue = $(".vertical-spin").TouchSpin({
                verticalbuttons: true
            });
            if (vspinTrue) {
                $('.vertical-spin').prev('.bootstrap-touchspin-prefix').remove();
            }

            $("input[name='demo1']").TouchSpin({
                min: 0,
                max: 100,
                step: 0.1,
                decimals: 2,
                boostat: 5,
                maxboostedstep: 10,
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary",
                postfix: '%'
            });
            $("input[name='demo2']").TouchSpin({
                min: -1000000000,
                max: 1000000000,
                stepinterval: 50,
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary",
                maxboostedstep: 10000000,
                prefix: '$'
            });
            $("input[name='demo3']").TouchSpin({
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary"
            });
            $("input[name='demo3_21']").TouchSpin({
                initval: 40,
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary"
            });
            $("input[name='demo3_22']").TouchSpin({
                initval: 40,
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary"
            });

            $("input[name='demo5']").TouchSpin({
                prefix: "pre",
                postfix: "post",
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary"
            });
            $("input[name='demo0']").TouchSpin({
                buttondown_class: "btn btn-primary",
                buttonup_class: "btn btn-primary"
            });

            // Time Picker
            jQuery('#timepicker').timepicker({
                defaultTIme : false
            });
            jQuery('#timepicker2').timepicker({
                showMeridian : false
            });
            jQuery('#timepicker3').timepicker({
                minuteStep : 15
            });

            //colorpicker start

            $('.colorpicker-default').colorpicker({
                format: 'hex'
            });
            $('.colorpicker-rgba').colorpicker();

            // Date Picker
            jQuery('#datepicker').datepicker();
            jQuery('#datepicker-autoclose').datepicker({
                autoclose: true,
                todayHighlight: true
            });
            jQuery('#datepicker-inline').datepicker();
            jQuery('#datepicker-multiple-date').datepicker({
                format: "mm/dd/yyyy",
                clearBtn: true,
                multidate: true,
                multidateSeparator: ","
            });
            jQuery('#date-range').datepicker({
                toggleActive: true
            });

            //Date range picker
            $('.input-daterange-datepicker').daterangepicker({
                buttonClasses: ['btn', 'btn-sm'],
                applyClass: 'btn-default',
                cancelClass: 'btn-primary'
            });
            $('.input-daterange-timepicker').daterangepicker({
                timePicker: true,
                format: 'MM/DD/YYYY h:mm A',
                timePickerIncrement: 30,
                timePicker12Hour: true,
                timePickerSeconds: false,
                buttonClasses: ['btn', 'btn-sm'],
                applyClass: 'btn-default',
                cancelClass: 'btn-primary'
            });
            $('.input-limit-datepicker').daterangepicker({
                format: 'MM/DD/YYYY',
                minDate: '06/01/2016',
                maxDate: '06/30/2016',
                buttonClasses: ['btn', 'btn-sm'],
                applyClass: 'btn-default',
                cancelClass: 'btn-primary',
                dateLimit: {
                    days: 6
                }
            });

            $('#reportrange span').html(moment().subtract(29, 'days').format('MMM D, YYYY') + ' - ' + moment().format('MMM D, YYYY'));

            
            $('#reportrange').daterangepicker({
                format: 'MM/DD/YYYY',
                autoApply: true,
                // startDate: moment().subtract(29, 'days'),
                // endDate: moment(),
                // minDate: '01/01/2016',
                // maxDate: '12/31/2016',
                dateLimit: {
                    days: 60
                },
                opens: 'right',
                // showDropdowns: true,
                // showWeekNumbers: true,
                // timePicker: false,
                // timePickerIncrement: 1,
                // timePicker12Hour: true,
                // ranges: {
                //     'Today': [moment(), moment()],
                //     'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                //     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                //     'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                //     'This Month': [moment().startOf('month'), moment().endOf('month')],
                //     'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                // },
                // opens: 'right',
                // drops: 'down',
                // buttonClasses: ['btn', 'btn-sm'],
                // applyClass: 'btn-success',
                // cancelClass: 'btn-default',
                // separator: ' to ',
                // locale: {
                //     applyLabel: 'Submit',
                //     cancelLabel: 'Cancel',
                //     fromLabel: 'From',
                //     toLabel: 'To',
                //     customRangeLabel: 'Custom',
                //     daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                //     monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                //     firstDay: 1
                // }
            }, function (start, end, label) {
                filter.startDate=start;
                filter.endDate=end;
                console.log(start.toISOString(), end.toISOString(), label);
                $('#reportrange span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
            });

            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                filter.startDate=picker.startDate;
                filter.endDate=picker.endDate;
                $('#reportrange span').html(picker.startDate.format('MMM D, YYYY') + ' - ' + picker.endDate.format('MMM D, YYYY'));
            });


            //Bootstrap-MaxLength
            $('input#defaultconfig').maxlength()

            $('input#thresholdconfig').maxlength({
                threshold: 20
            });

            $('input#moreoptions').maxlength({
                alwaysShow: true,
                warningClass: "label label-success",
                limitReachedClass: "label label-danger"
            });

            $('input#alloptions').maxlength({
                alwaysShow: true,
                warningClass: "label label-success",
                limitReachedClass: "label label-danger",
                separator: ' out of ',
                preText: 'You typed ',
                postText: ' chars available.',
                validate: true
            });

            $('textarea#textarea').maxlength({
                alwaysShow: true
            });

            $('input#placement').maxlength({
                alwaysShow: true,
                placement: 'top-left'
            });

            var filter = {
                startDate: null,
                endDate: null,
                loader: null,
                searchResultList: null,
                sucessparse: function (result) {
                
                    filter.searchResultList = result;
                    var counter = 0;
                    var rowhtml = "";
                    var mainhtml = "";
                    result.forEach(function (obj) {
                        console.log("sum " + obj.AccuracySlab1 + " + " + obj.AccuracySlab2 + " + " + obj.AccuracySlab3 + " = " + obj.actualReading);
                        rowhtml = rowhtml + "<div class='col-lg-4' onclick='return filter.showDetail(event,\"" + obj.session + "\");' tag='" + obj.session + "'>";
                        if (obj.os == "iOS") {
                            rowhtml = rowhtml + "<div class='panel panel-custom panel-border'>";
                        }
                        else {
                            rowhtml = rowhtml + "<div class='panel panel-border panel-purple'>";
                        }
                        var label_color = "label-success";
                        var label_title = "Good";
                        if (obj.sessiontag == "good") {
                            label_color = "label-success";
                            label_title = "Good";
                        }
                        else if (obj.sessiontag == "poor") {
                            label_color = "label-warning";
                            label_title = "OK";
                        }
                        else if (obj.sessiontag == "bad") {
                            label_color = "label-danger";
                            label_title = "Bad";
                        }
                        // var zone = moment.tz.zone('UTC +2');

                        //var date = new Date();
                        //var d = 0;// date.getTimezoneOffset() * 60;
                        var startDate = moment(obj.startat * 1000).utcOffset('+0200').format('DD MMM YYYY');
                        var startTime = moment(obj.startat * 1000).utcOffset('+0200').format('HH:mm:ss'); // moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm'); // moment(obj.startat).tz('Europe/Paris').format("DD MMM YYYY hh:mm a");
                        var endTime = moment(obj.endat * 1000).utcOffset('+0200').format('HH:mm:ss');
                        rowhtml = rowhtml + "<div class='panel-heading'>"
                        rowhtml = rowhtml + "<span  class='pull-right circleBase circle" + obj.apptype + "'></span>"
                            + "<h3 class='panel-title'>" + obj.deviceModel + "</h3>"
                            + "<p >" + obj.deviceName + "</p>"
                            + "</div>"
                            + "<div class='panel-body clearfix'>"
                            + "<p class='resultcard'>"
                            + "" + obj.building + "<br/>"
                            + "" + startDate + "<br/>"
                            + "<b>Start</b>: " + startTime + " Hrs<br/>"
                            + "<b>End&nbsp;&nbsp;</b>: " + endTime + " Hrs<br/>"
                            + "<b>Duration</b>: " + obj.sessionTime + " seconds<br/><br/>"

                            + "Accuracy (in Meters):"
                            + "<table class='table table-striped m-0'>"
+ "<thead>"
+ "<tr>"
+ "<th style='text-align: center;'>< " + obj.AccuracySlabRange1 + " m</th>"
+ "<th style='text-align: center;'>< " + obj.AccuracySlabRange2 + " m</th>"
+ "<th style='text-align: center;'>> " + obj.AccuracySlabRange3 + " m</th>"
+ "</tr>"
+ "</thead>"
+ "<tbody>"
+ "<tr>"
+ "<td style='text-align: center;'>" + ((obj.AccuracySlab1 / obj.actualReading) * 100).toFixed(0) + "%</td>"
+ "<td style='text-align: center;'>" + ((obj.AccuracySlab2 / obj.actualReading) * 100).toFixed(0) + "%</td>"
+ "<td style='text-align: center;'>" + ((obj.AccuracySlab3 / obj.actualReading) * 100).toFixed(0) + "%</td>"
+ "</tr>"
+ "</tbody>"
+ "</table>"
                            + "<div class='row'> <div class='col-lg-12'><span class='label " + label_color + " pull-right m-t-15'>" + label_title + "</span></div></div>"
                            + "</p>"
                            + "</div>"
                        + "</div>"
                        + "</div>"

                        /*
                        + "<div class='row borderthin'>"
                        + "<div class='col-lg-4'>"
                        + "<div class='row borderthin' style='text-align: center;'><5 meters</div>"
                        + "<div class='row borderthin' style='text-align: center;'>" + ((obj.AccuracySlab1 / obj.sessionTime) * 100).toFixed(0) + "%</div>"
                        + "</div>"
                        + "<div class='col-lg-4'>"
                        + "<div class='row borderthin' style='text-align: center;'><10 meters</div>"
                        + "<div class='row borderthin' style='text-align: center;'>" + ((obj.AccuracySlab2 / obj.sessionTime) * 100).toFixed(0) + "%</div>"
                        + "</div>"
                        + "<div class='col-lg-4'>"
                        + "<div class='row borderthin' style='text-align: center;'>>10 meters</div>"
                        + "<div class='row borderthin' style='text-align: center;'>" + ((obj.AccuracySlab3 / obj.sessionTime) * 100).toFixed(0) + "%</div>"
                        + "</div>"
                        + "</div>"

                        + "Number of readings:" + obj.numberOfreadings + "<br/>"
                        + "Started on:" + obj.devicetime + "<br/>"
                        + "By:" + obj.deviceid + "<br/>"
                        + "session:" + obj.session + "<br/>"*/

                        counter = counter + 1;
                        if (counter == 3) {
                            counter = 0;
                            mainhtml = mainhtml + "" + rowhtml;
                            rowhtml = "";
                        }
                    });
                    if (rowhtml != "") {
                        mainhtml = mainhtml + "" + rowhtml;
                        rowhtml = "";
                    }
                    $("#parseResult").html(mainhtml);
                    $("#spancount").html(result.length);
                    //hideloader();
                    hideLoaderBallAtomLoader();
                    if (result.length > 0) {
                        var findit = $("#searchOptions").find(".zmdi");
                        findit.removeClass("zmdi-check-square");
                        findit.addClass("zmdi-square-o");

                        findit.first().removeClass("zmdi-square-o");
                        findit.first().addClass("zmdi-check-square");
                       
                        filter.showResultPanel(true);
                    }
                    else{
                       //hideloader();
                       hideLoaderBallAtomLoader();
                        $("#spancount").html("No");
                        filter.showResultPanel(false);
                        $('.parseHeading').show();
                    }


                },
                error: function (result) {
                    console.log("error");
                    hideLoaderBallAtomLoader();
                    //hideloader();
                },

                showloader: function () {
                    if (!filter.loader) {
                        filter.loader = $('<div><img src="assets/images/preloader.gif" /></div>').appendTo(document.body);
                        var $g = $("#bodyPage");
                        filter.loader.css("position", "fixed")
                        .css("top", "47%")
                        .css("left", "47%")
                         .css("width", "100%")
                        .css("height", "100%")
                        .css("background-position", "center")
                    .css("z-index", 10000000);
                    }
                    filter.loader.show();
                },
                hideloader: function () {
                    if (filter.loader != null) {
                        filter.loader.hide();
                    }
                },
                showResultPanel: function (show) {
                    if (!show) {
                        $("#parseResult").html("");
                        $("#parseResult").hide();
                        //$(".parseHeading").hide();
                        $("#panelCriteria").show();
                    }
                    else {
                        $("#parseResult").show();
                        $(".parseHeading").show();
                        $("#panelCriteria").show();
                    }
                },
                searchResult: function () {
                    //console.log(filter.startDate.toISOString(), filter.endDate.toISOString());
                    $(".parseHeading").hide();
                    filter.showResultPanel(false);
                    var selectedDevice = $('#deviceList').val();
                    if (selectedDevice == "-1") {
                        filtercontroller.specificDevice = null;
                    }
                    else {
                        filtercontroller.specificDevice = selectedDevice;
                    }
                    filtercontroller.minDuration = $("#txtMin").val();
                    var s = filter.startDate.unix();
                    var e = filter.endDate.unix();
                    filtercontroller.addDateRange(s, e)
                    filtercontroller.getParseLog(filter.sucessparse, filter.error);
                    //filter.showloader();
                    //showloader();
                    showLoaderBallAtomLoader();
                    return false;
                },
                getDeviceid: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    alert($('#deviceList').val());
                    filtercontroller.specificDevice = $('#deviceList').val();
                },

                changeDevice: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if ($(src).is(':checked')) {
                        filtercontroller.addDevices(tagname);
                    }
                    else {
                        filtercontroller.removeDevices(tagname);
                    }

                    var selected = [];
                    $('#divDevice input:checked').each(function () {
                        selected.push($(this).attr('name'));
                    });
                    if (selected.length == 0) {
                        $("#deviceList").prop('disabled', false);
                    }
                    else {
                        $("#deviceList").prop('disabled', 'disabled');
                        $('#deviceList').val('-1');
                        filtercontroller.specificDevice = null;

                    }

                },
                changeAccuracy: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if ($(src).is(':checked')) {
                        filtercontroller.addAccuracyFilter(tagname);
                    }
                    else {
                        filtercontroller.removeAccuracyFilter(tagname);
                    }

                    var selected = [];
                    $('#divAccuracy input:checked').each(function () {
                        selected.push($(this).attr('name'));
                    });
                   
                },
                changeFloor: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if ($(src).is(':checked')) {
                        filtercontroller.addFloor(tagname);
                    }
                    else {
                        filtercontroller.removeFloor(tagname);
                    }
                },
                showDetail: function (e, tag) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if (typeof tagname == 'undefined') {
                        tagname = tag;
                    }
                    //localStorage.setItem("currentsession",tagname);
                    window.location.href = 'sessionviewer.html?session='+tagname; 
                    //window.location.assign("mapview.html?session=" + tagname);
                    //var win = window.open("mapview.html?session=" + tagname, '_blank');
                    //win.focus();
                    return false;
                },
                showSortedResult: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if (tagname == "time") {
                        filter.searchResultList.sort(function (a, b) { return b.ontime - a.ontime });
                    }
                    else if (tagname == "device") {
                        filter.searchResultList.sort(function (a, b) {
                            if (b.deviceModel < a.deviceModel) {
                                return 1;
                            }
                            else if (b.deviceModel > a.deviceModel) {
                                return -1;
                            }
                            else {
                                return b.ontime - a.ontime;
                            }
                        });
                    }
                    else if (tagname == "building") {
                        filter.searchResultList.sort(function (a, b) {
                            if (b.buildingName < a.buildingName) {
                                return 1;
                            }
                            else if (b.buildingName > a.buildingName) {
                                return -1;
                            }
                            else {
                                if (b.FloorName < a.FloorName) {
                                    return 1;
                                }
                                else if (b.FloorName > a.FloorName) {
                                    return -1;
                                }
                                else {
                                    return b.ontime - a.ontime;
                                }
                            }


                        });
                    }
                    filter.sucessparse(filter.searchResultList);
                    var findit = $("#searchOptions").find(".zmdi");
                    findit.removeClass("zmdi-check-square");
                    findit.addClass("zmdi-square-o");
                    if ($(src).is("span")) {
                        $(src).parent().find(".zmdi").removeClass("zmdi-square-o");
                        $(src).parent().find(".zmdi").addClass("zmdi-check-square");
                    }
                    else {
                        $(src).find(".zmdi").removeClass("zmdi-square-o");
                        $(src).find(".zmdi").addClass("zmdi-check-square");
                    }
                    
                    return false;
                },
                togglefloor: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    if ($(src).hasClass("btn-default")) {
                        $(src).removeClass("btn-default");
                        $(src).addClass("btn-primary");
                        filtercontroller.addFloor(tagname);
                    }
                    else {
                        $(src).removeClass("btn-primary");
                        $(src).addClass("btn-default");
                        filtercontroller.removeFloor(tagname);
                    }

                },
                selectAll: function (e) {
                    e = e || window.event;
                    var src = e.target || e.srcElement;
                    var tagname = $(src).attr("tag");
                    var control;
                    if (tagname == "Pegase") {
                        control = $("#optionPegase")
                    }
                    else {
                        control = $("#optionSiege")
                    }
                    if ($(src).is(':checked')) {
                        $('input:checkbox', control).prop('checked', true);

                        var allCheckbox = $('input:checkbox', control);
                        allCheckbox.each(function (index) {
                            if (index > 0) {
                                var tag = $(this).attr("tag");
                                filtercontroller.addFloor(tag);
                            }
                        });
                    }
                    else {
                        $('input:checkbox', control).prop('checked', false);
                        allCheckbox.each(function (index) {
                            if (index > 0) {
                                var tag = $(this).attr("tag");
                                filtercontroller.removeFloor(tag);
                            }
                        });
                    }
                }

            };
            