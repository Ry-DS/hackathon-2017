;(function ($, window, undefined) {
	$(function() {
		$("select").selectBoxIt({
			downArrowIcon: "icon-up-down"
		});

		$("a").on("click", function(e) { e.preventDefault(); });

		$("#bars li .bar").each( function( key, bar ) {
			var percentage = $(this).data('percentage');
	
			$(this).css('height', percentage + '%');
		});

		function updateItemState() {
			var $this = $(this),
				isChecked = $this.is(":checked");

			$this.parent("li").toggleClass("active", isChecked);
		}

		function dateDiff( str1, str2 ) {
			var diff = Date.parse( str2 ) - Date.parse( str1 ); 
			return isNaN( diff ) ? NaN : {
				diff : diff,
				ms : Math.floor( diff            % 1000 ),
				s  : Math.floor( diff /     1000 %   60 ),
				m  : Math.floor( diff /    60000 %   60 ),
				h  : Math.floor( diff /  3600000 %   24 ),
				d  : Math.floor( diff / 86400000        )
			};
		}
		function updateReviewDate($el) {
			var today = new Date(),
				//month/day/year
				todayStr = (today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear(),
				selectedDate = $el.attr("data-selected-date"),
				diff =  dateDiff(todayStr, selectedDate);

			var str = diff.d > 1 && diff.d < 7 ? "days" :
					  diff.d === 1 ? "day" : 
					  diff.d >= 7 && diff.d < 14 ? "week" : "weeks";

			$el.parent("span").removeClass("alert");
			if (diff.d < 3) {
				$el.parent("span").addClass("alert");
			} else if (diff.d >= 7) {
				var weeks = Math.floor(diff.d / 7);
				diff.d = weeks;
			}
			
			$el.val("Due in " +diff.d+ " " + str);
		}

		var datepickerOpts = {
			constrainInput: true,
			showOn: 'button',
			buttonText: '',
			minDate: "+1d",
			onSelect: function(dateText, inst) {
				if ($("#temp").size()) {
					$("#temp").focus();
				}
				$(this).attr("data-selected-date", dateText);
				updateReviewDate($(this));
			}
		}
		$(".reviewDate").datepicker(datepickerOpts);

		$("#leftNav ul li").on("click", function() {
			var $this = $(this),
				$links = $("#leftNav ul li");

			$links.removeClass("selected");
			$this.addClass("selected");
		});

		$(".toDo ul li input[type=checkbox]").on("click", updateItemState);

		var isEditing;
		$(".toDo .addReview").on("click", function() {
			var $this = $(this),
				$list = $(".reviews").find("ul"),
				lastID = $list.find("li:first input").attr("id").split("_").pop();


			if (isEditing) { $("#temp").focus(); return false; }

			$this.addClass("selected");
			$list.prepend("<li><input type='checkbox' id='review_"+(parseInt(lastID) + 1)+"'><label for='review_"+(parseInt(lastID) + 1)+"'><input type='text' id='temp' placeholder='Enter to create review. Esc to discard.' /></label><span><input class='reviewDate' id='reviewDate_"+(parseInt(lastID) + 1)+"' type='text' readonly></span>");
			$(".reviewDate").datepicker(datepickerOpts);

			$list.find("li:first").addClass("active");
			$("#temp").focus();
			isEditing = true;
		});

		var KEYCODE_ENTER = 13;
		var KEYCODE_ESC = 27;
		$(document).on("keyup", function(e) {
			var $temp = $("#temp");

			//user hit enter, temp input exist and is not empty
			if (e.keyCode == KEYCODE_ENTER && $temp[0] && $temp.val().trim() !== "") {
				isEditing = false;
				var tempVal = $("#temp").val();
				var $currentLabel = $temp.parent("label"),
					labelNum = $currentLabel.attr("for").split("_").pop(),
					$reviewChk = $currentLabel.siblings("input[type=checkbox]"),
					$reviewDate = $currentLabel.parent("li").find(".reviewDate");

				if ($reviewDate.val().trim() === "") {
					$reviewDate.siblings("button").click();
					isEditing = true;
					return false;
				}
				$currentLabel.html(tempVal);
				$currentLabel.parent("li").toggleClass("active", $reviewChk.is(":checked"));
				
				//make sure the new input created gets binded
				$reviewChk.on("click", updateItemState);


				$temp.remove();
				$(".toDo .addReview").removeClass("selected");
			}
			if (e.keyCode == KEYCODE_ESC) {
				isEditing = false;
				$temp.closest("li").remove();
				$(".toDo .addReview").removeClass("selected");
			}
		});

		/*Progress Bar functionality*/
		var $progressBar = $(".progressBar");
		$progressBar.each(function() {
			var $progress = $(this).find(".progress"),
				$progressValue = $progress.attr("data-progressValue"),
				$percent = $(this).siblings(".percent");

			if ($progressValue <= 50) {
				$progress.addClass("warning");
				$percent.addClass("warning");
			}
			$progress.css("width", $progressValue+"%");
		});
			

	});	
})(jQuery, this);

$(function(){
  $(".doughnutChart").drawDoughnutChart([
    { title: "Positive", value : 25,  color: "#61c6cf" },
    { title: "Neutral",  value:  25,  color: "#49b8f2" },
    { title: "Negative", value:  80,  color: "#de808f" },
    { title: "Self",     value : 35,  color: "#a08bcd" }
  ]);
});
/*!
 * jquery.drawDoughnutChart.js
 * Version: 0.4.1(Beta)
 * Inspired by Chart.js(http://www.chartjs.org/)
 *
 * Copyright 2014 hiro
 * https://github.com/githiro/drawDoughnutChart
 * Released under the MIT license.
 * 
 */
;(function($, undefined) {
  $.fn.drawDoughnutChart = function(data, options) {
    var $this = this,
      W = $this.width(),
      H = $this.height(),
      centerX = W/2,
      centerY = H/2,
      cos = Math.cos,
      sin = Math.sin,
      PI = Math.PI,
      settings = $.extend({
        segmentShowStroke : true,
        segmentStrokeColor : "#fff",
        segmentStrokeWidth : 4,
        baseColor: "#fff",
        baseOffset: 0,
        edgeOffset : 10,//offset from edge of $this
        percentageInnerCutout : 75,
        animation : true,
        animationSteps : 35,
        animationEasing : "linear",
        animateRotate : true,
        tipOffsetX: -8,
        tipOffsetY: -45,
        tipClass: "doughnutTip",
        summaryClass: "doughnutSummary",
        summaryTitle: "SCORE:",
        summaryTitleClass: "doughnutSummaryTitle",
        summaryNumberClass: "doughnutSummaryNumber",
        beforeDraw: function() {  },
        afterDrawed : function() {  },
        onPathEnter : function(e,data) {  },
        onPathLeave : function(e,data) {  }
      }, options),
      animationOptions = {
        linear : function (t) {
          return t;
        },
        easeInOutExpo: function (t) {
          var v = t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
          return (v>1) ? 1 : v;
        }
      },
      requestAnimFrame = function() {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
          };
      }();

    settings.beforeDraw.call($this);

    var $svg = $('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>').appendTo($this),
        $paths = [],
        easingFunction = animationOptions[settings.animationEasing],
        doughnutRadius = Min([H / 2,W / 2]) - settings.edgeOffset,
        cutoutRadius = doughnutRadius * (settings.percentageInnerCutout / 100),
        segmentTotal = 0;

    //Draw base doughnut
    var baseDoughnutRadius = doughnutRadius + settings.baseOffset,
        baseCutoutRadius = cutoutRadius - settings.baseOffset;
    $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
      .attr({
        "d": getHollowCirclePath(baseDoughnutRadius, baseCutoutRadius),
        "fill": settings.baseColor
      })
      .appendTo($svg);

    //Set up pie segments wrapper
    var $pathGroup = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    $pathGroup.attr({opacity: 0}).appendTo($svg);

    //Set up tooltip
    var $tip = $('<div class="' + settings.tipClass + '" />').appendTo('body').hide(),
        tipW = $tip.width(),
        tipH = $tip.height();

    //Set up center text area
    var summarySize = (cutoutRadius - (doughnutRadius - cutoutRadius)) * 2,
        $summary = $('<div class="' + settings.summaryClass + '" />')
                   .appendTo($this)
                   .css({ 
                     width: summarySize + "px",
                     height: summarySize + "px",
                     "margin-left": -(summarySize / 2) + "px",
                     "margin-top": -(summarySize / 2) + "px"
                   });
    var $summaryTitle = $('<p class="' + settings.summaryTitleClass + '">' + settings.summaryTitle + '</p>').appendTo($summary);
    var $summaryNumber = $('<p class="' + settings.summaryNumberClass + '"></p>').appendTo($summary).css({opacity: 0});

    for (var i = 0, len = data.length; i < len; i++) {
      segmentTotal += data[i].value;
      $paths[i] = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
        .attr({
          "stroke-width": settings.segmentStrokeWidth,
          "stroke": settings.segmentStrokeColor,
          "fill": data[i].color,
          "data-order": i
        })
        .appendTo($pathGroup)
        .on("mouseenter", pathMouseEnter)
        .on("mouseleave", pathMouseLeave)
        .on("mousemove", pathMouseMove);

        $(".chart-legend li:eq("+i+") span").css("border", "3px solid "+data[i].color);
    }

    //Animation start
    animationLoop(drawPieSegments);

    //Functions
    function getHollowCirclePath(doughnutRadius, cutoutRadius) {
        //Calculate values for the path.
        //We needn't calculate startRadius, segmentAngle and endRadius, because base doughnut doesn't animate.
        var startRadius = -1.570,// -Math.PI/2
            segmentAngle = 6.2831,// 1 * ((99.9999/100) * (PI*2)),
            endRadius = 4.7131,// startRadius + segmentAngle
            startX = centerX + cos(startRadius) * doughnutRadius,
            startY = centerY + sin(startRadius) * doughnutRadius,
            endX2 = centerX + cos(startRadius) * cutoutRadius,
            endY2 = centerY + sin(startRadius) * cutoutRadius,
            endX = centerX + cos(endRadius) * doughnutRadius,
            endY = centerY + sin(endRadius) * doughnutRadius,
            startX2 = centerX + cos(endRadius) * cutoutRadius,
            startY2 = centerY + sin(endRadius) * cutoutRadius;
        var cmd = [
          'M', startX, startY,
          'A', doughnutRadius, doughnutRadius, 0, 1, 1, endX, endY,//Draw outer circle
          'Z',//Close path
          'M', startX2, startY2,//Move pointer
          'A', cutoutRadius, cutoutRadius, 0, 1, 0, endX2, endY2,//Draw inner circle
          'Z'
        ];
        cmd = cmd.join(' ');
        return cmd;
    };
    function pathMouseEnter(e) {
      var order = $(this).data().order;
      $tip.text(data[order].title + ": " + data[order].value)
          .css("background", data[order].color)
          .fadeIn(200);

      $('#additionalStyles').remove();
      $('head').append('<style id="additionalStyles">.doughnutTip:after{border-top-color: '+data[order].color+';}</style>');        

      settings.onPathEnter.apply($(this),[e,data]);
    }
    function pathMouseLeave(e) {
      $tip.hide();
      settings.onPathLeave.apply($(this),[e,data]);
    }
    function pathMouseMove(e) {
      $tip.css({
        top: e.pageY + settings.tipOffsetY,
        left: e.pageX - $tip.width() / 2 + settings.tipOffsetX
      });
    }
    function drawPieSegments (animationDecimal) {
      var startRadius = -PI / 2,//-90 degree
          rotateAnimation = 1;
      if (settings.animation && settings.animateRotate) rotateAnimation = animationDecimal;//count up between0~1

      drawDoughnutText(animationDecimal, segmentTotal);

      $pathGroup.attr("opacity", animationDecimal);

      //If data have only one value, we draw hollow circle(#1).
      if (data.length === 1 && (4.7122 < (rotateAnimation * ((data[0].value / segmentTotal) * (PI * 2)) + startRadius))) {
        $paths[0].attr("d", getHollowCirclePath(doughnutRadius, cutoutRadius));
        return;
      }
      for (var i = 0, len = data.length; i < len; i++) {
        var segmentAngle = rotateAnimation * ((data[i].value / segmentTotal) * (PI * 2)),
            endRadius = startRadius + segmentAngle,
            largeArc = ((endRadius - startRadius) % (PI * 2)) > PI ? 1 : 0,
            startX = centerX + cos(startRadius) * doughnutRadius,
            startY = centerY + sin(startRadius) * doughnutRadius,
            endX2 = centerX + cos(startRadius) * cutoutRadius,
            endY2 = centerY + sin(startRadius) * cutoutRadius,
            endX = centerX + cos(endRadius) * doughnutRadius,
            endY = centerY + sin(endRadius) * doughnutRadius,
            startX2 = centerX + cos(endRadius) * cutoutRadius,
            startY2 = centerY + sin(endRadius) * cutoutRadius;
        var cmd = [
          'M', startX, startY,//Move pointer
          'A', doughnutRadius, doughnutRadius, 0, largeArc, 1, endX, endY,//Draw outer arc path
          'L', startX2, startY2,//Draw line path(this line connects outer and innner arc paths)
          'A', cutoutRadius, cutoutRadius, 0, largeArc, 0, endX2, endY2,//Draw inner arc path
          'Z'//Cloth path
        ];
        $paths[i].attr("d", cmd.join(' '));
        startRadius += segmentAngle;
      }
    }
    function drawDoughnutText(animationDecimal, segmentTotal) {
      $summaryNumber
        .css({opacity: animationDecimal})
        .text("25");
    }
    function animateFrame(cnt, drawData) {
      var easeAdjustedAnimationPercent =(settings.animation)? CapValue(easingFunction(cnt), null, 0) : 1;
      drawData(easeAdjustedAnimationPercent);
    }
    function animationLoop(drawData) {
      var animFrameAmount = (settings.animation)? 1 / CapValue(settings.animationSteps, Number.MAX_VALUE, 1) : 1,
          cnt =(settings.animation)? 0 : 1;
      requestAnimFrame(function() {
          cnt += animFrameAmount;
          animateFrame(cnt, drawData);
          if (cnt <= 1) {
            requestAnimFrame(arguments.callee);
          } else {
            settings.afterDrawed.call($this);
          }
      });
    }
    function Max(arr) {
      return Math.max.apply(null, arr);
    }
    function Min(arr) {
      return Math.min.apply(null, arr);
    }
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function CapValue(valueToCap, maxValue, minValue) {
      if (isNumber(maxValue) && valueToCap > maxValue) return maxValue;
      if (isNumber(minValue) && valueToCap < minValue) return minValue;
      return valueToCap;
    }
    return $this;
  };
})(jQuery);