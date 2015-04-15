/**
 * SSP for WEB
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 颜色计算
 * @author zhanglili(otakustay@gmail.com)
 */
define(
    function (require) {
        function toHex(number) {
            var hex = (+number).toString(16);
            if (hex.length === 1) {
                hex = '0' + hex;
            }
            return hex;
        }

        var exports = {
            hsbToRGB: function (hue, saturation, bright) {
                if (typeof hue === 'object') {
                    bright = hue.bright || hue.b;
                    saturation = hue.saturation || hue.s;
                    hue = hue.hue || hue.h;
                }

                // Saturation值可能是按小数算，也可能给百分比值
                if (saturation > 1) {
                    saturation = saturation / 100;
                }

                // Bright值可能是按小数算，也可能给百分比值
                if (bright > 1) {
                    bright = bright / 100;
                }

                var br = Math.round(bright * 255);

                var rgb = {};
                var rgbArray = [];
                if (saturation === 0) {
                    rgbArray = [br, br, br];
                }
                else {
                    hue %= 360;
                    var f = hue % 60;
                    var p = Math.round((bright * (1 - saturation)) * 255);
                    var q = Math.round((bright * (60 - saturation * f)) / 60 * 255);
                    var t = Math.round((bright * (60 - saturation * (60 - f))) / 60 * 255);
                    switch (Math.floor(hue / 60)) {
                        case 0: rgbArray = [br, t, p]; break;
                        case 1: rgbArray = [q, br, p]; break;
                        case 2: rgbArray = [p, br, t]; break;
                        case 3: rgbArray = [p, q, br]; break;
                        case 4: rgbArray = [t, p, br]; break;
                        case 5: rgbArray = [br, p, q]; break;
                    }

                }

                rgb.red = Math.round(rgbArray[0]);
                rgb.green = Math.round(rgbArray[1]);
                rgb.blue = Math.round(rgbArray[2]);

                rgb.r = rgb.red;
                rgb.g = rgb.green;
                rgb.b = rgb.blue;

                return rgb;
            },

            rgbToHex: function (red, green, blue) {
                if (typeof red === 'object') {
                    blue = red.blue || red.b;
                    green = red.green || red.g;
                    red = red.red || red.r;
                }

                var hex = [toHex(red), toHex(green), toHex(blue)];
                return hex.join('');
            },

            hsbToHex: function (hue, saturation, bright) {
                var rgb = exports.hsbToRGB(hue, saturation, bright);
                var hex = exports.rgbToHex(rgb);
                return hex;
            },

            rgbToHSB: function (red, green, blue) {
                if (typeof red === 'object') {
                    blue = red.blue || red.b;
                    green = red.green || red.g;
                    red = red.red || red.r;
                }

                red /= 255;
                green /= 255;
                blue /= 255;
                var max = Math.max(red, green, blue);
                var min = Math.min(red, green, blue);
                var diff = max - min;
                var hue = 0;
                var saturation = 0;
                var bright = max;

                if (max !== 0) {
                    saturation = diff / max;
                }

                if (saturation !== 0) {
                    if (red === max) {
                        hue = (green - blue) / diff;
                    }
                    else if (green === max) {
                        hue = 2 + (blue - red) / diff;
                    }
                    else {
                        hue = 4 + (red - green) / diff;
                    }
                }
                else {
                    hue = -1;
                }

                hue *= 60;

                if (hue < 0) {
                    hue += 360;
                }

                var hsb = {
                    hue: hue,
                    saturation: saturation,
                    bright: bright
                };

                hsb.h = hsb.hue;
                hsb.s = hsb.saturation;
                hsb.b = hsb.bright;

                return hsb;
            },

            hexToRGB: function (hex) {
                if (hex.indexOf('#') === 0) {
                    hex = hex.substring(1);
                }

                // 采用跟PS同样的算法，前方补零
                hex = new Array(6 - hex.length + 1).join('0') + hex;

                var rgb = {
                    red: parseInt(hex.charAt(0) + hex.charAt(1), 16) || 0,
                    green: parseInt(hex.charAt(2) + hex.charAt(3), 16) || 0,
                    blue: parseInt(hex.charAt(4) + hex.charAt(5), 16) || 0
                };

                rgb.r = rgb.red;
                rgb.g = rgb.green;
                rgb.b = rgb.blue;

                return rgb;
            },

            hexToHSB: function (hex) {
                var rgb = exports.hexToRGB(hex);
                var hsb = exports.rgbToHSB(rgb);
                return hsb;
            },

            isValidRGB: function (input) {
                return (/^#?[0-9a-fA-Z]{3}$/).test(input)
                    || (/^#?[0-9a-fA-Z]{6}$/).test(input);
            }
        };

        return exports;
    }
);
