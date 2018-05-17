/*global jQuery, google, window*/

(function () {
    'use strict';

    var $ = jQuery;

    function ScreenOverlay(size, map) {
        var $container = null;

        this.draw = function () {
            if (!this.getProjection()) { return; }
            if (!map.getCenter()) { return; }

            var center = this.getProjection().fromLatLngToDivPixel(map.getCenter());

            $container.css({
                top: (center.y - size.height / 2).toString() + "px",
                left: (center.x - size.width / 2).toString() + "px"
            });
        };
        this.onAdd = function () {
            $container = $("<div />")
                .attr("class", "screen_overlay")
                .css({
                    width: size.width,
                    height: size.height,
                    border: "1px solid #fff",
                    position: "absolute"
                })
                .appendTo($(this.getPanes().overlayShadow));
        };
        this.onRemove = function () {
            if ($container) { $container.remove(); }
        };

        this.setMap(map);
    }
    ScreenOverlay.prototype = new google.maps.OverlayView();

    function ZMap() {
        var GRAYOUT_THRESHOLD = 3,
            mapCells = [],
            canvasSize = null,
            initialCenter = new google.maps.LatLng(35.6854257, 139.7531054),
            i,
            $canvas;

        function updateAutoWidthHeight() {
            var width = window.document.body.clientWidth,
                autoWidth = Math.floor((width - 3) / 3),
                autoHeight = Math.round(autoWidth * 0.75);

            canvasSize = new google.maps.Size(autoWidth, autoHeight);
        }

        function autoInitLayout() {
            var $dummy = $("<div />").css({
                width: 200,
                height: 4000
            }).appendTo("#container");

            updateAutoWidthHeight();

            $dummy.remove();

            for (i = 0; i <= 20; i++) {
                $canvas = $("<div />").attr({
                    id: "map_canvas_" + i.toString(),
                    "class": "map_canvas"
                }).css({
                    width: canvasSize.width,
                    height: canvasSize.height
                }).appendTo("#container");

                if (i > 2 && i % 3 === 0) {
                    $canvas.css("clear", "both");
                }

                mapCells[i] = {};
                mapCells[i].canvas = $canvas;
            }
        }

        function getWindowOverlay(map) {
            var width = Math.round(canvasSize.width / 2),
                height = Math.round(canvasSize.height / 2);

            return new ScreenOverlay(
                new google.maps.Size(width, height),
                map
            );
        }

        function updateLayout() {
            updateAutoWidthHeight();

            $.each(mapCells, function () {
                this.canvas.css({
                    width: canvasSize.width,
                    height: canvasSize.height
                });
            });

            $.each(mapCells, function () {
                if (this.overlay) {
                    this.overlay.setMap(null);
                    this.overlay = null;
                }
            });

            var center = mapCells[0].map.getCenter();

            $.each(mapCells, function (i) {
                google.maps.event.trigger(this.map, "resize");
                this.map.setCenter(center);

                if (i < mapCells.length - 1) {
                    this.overlay = getWindowOverlay(this.map);
                }
            });
        }

        function setInitialSettings() {
            $.each(mapCells, function (zoomLv) {
                var cell = this,
                    map = cell.map;

                map.setOptions({
                    center: initialCenter,
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false,
                    zoom: zoomLv
                });

                cell.grayout = $("<div />").attr("class", "grayout").hide()
                    .appendTo($(map.getDiv()));

                if (zoomLv < mapCells.length - 1) {
                    this.overlay = getWindowOverlay(map);
                }

                google.maps.event.addListener(map, "click", function (overlay, latlng) {
                    $.each(mapCells, function () {
                        this.map.setCenter(latlng);
                    });
                });

                google.maps.event.addListener(map, "dragstart", function () {
                    $.each(mapCells, function (j) {
                        if (Math.abs(zoomLv - j) > GRAYOUT_THRESHOLD) {
                            this.grayout.show();
                        }
                    });
                });

                google.maps.event.addListener(map, "dragend", function () {
                    var newCenter = this.getCenter();

                    $.each(mapCells, function () {
                        this.grayout.hide();

                        if (this.overlay) {
                            this.overlay.draw();
                        }

                        if (this.map !== map) {
                            this.map.setCenter(newCenter);
                        }
                    });
                });

                google.maps.event.addListener(map, "drag", function () {
                    var newCenter = this.getCenter(), i,
                        curr;

                    for (i = 0; mapCells[i]; i++) {
                        curr = mapCells[i].map;

                        if (curr !== map) {
                            if (Math.abs(zoomLv - i) <= GRAYOUT_THRESHOLD) {
                                curr.setCenter(newCenter);
                            }
                        }
                    }
                });

                google.maps.event.addListener(map, "center_changed", function () {
                    if (cell.overlay) {
                        cell.overlay.draw();
                    }
                });

                if (zoomLv % 3 === 2) {
                    map.setOptions({
                        mapTypeControl: true
                    });

                    google.maps.event.addListener(map, "maptypeid_changed", function () {
                        var mapType = map.getMapTypeId();

                        $.each(mapCells, function (i) {
                            if (this.map === map) { return; }

                            if (zoomLv - 2 <= i && i <= zoomLv) {
                                this.map.setMapTypeId(mapType);
                            }
                        });
                    });
                }
            });
        }

        (function () {
            var l = google.loader.ClientLocation;

            if (l) {
                // console.log('ClientLocation', l);
                initialCenter = new google.maps.LatLng(l.latitude, l.longitude);
            }
        }());

        (function () {

            autoInitLayout();

            $.each(mapCells, function (i) {
                mapCells[i].map = new google.maps.Map(this.canvas.get(0));
            });

            setInitialSettings();

            $(window).resize(updateLayout);
        }());
    }

    window.ZMap = ZMap;
}());

var zmap = new ZMap();
