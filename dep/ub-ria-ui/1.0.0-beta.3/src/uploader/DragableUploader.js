/**
 * DSP
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 上传拖拽扩展
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var $ = require('jquery');

        var File = require('./File');

        var exports = {};

        exports.type = 'DragableUploader';

        exports.activate = function () {
            this.$super(arguments);

            var uploader = this.target;
            var dragZoneTarget = $('#' + this.dragZone);

            // 阻止浏览器默认行
            $(document).on({
                // 拖离
                dragleave: function (e) {
                    e.preventDefault();
                },
                // 拖后放
                drop: function (e) {
                    e.preventDefault();
                },
                // 拖进
                dragenter: function (e) {
                    e.preventDefault();
                },
                // 拖来拖去
                dragover: function (e) {
                    e.preventDefault();
                }
            });

            dragZoneTarget[0].addEventListener(
                'drop',
                function (e) {
                    // 取消默认浏览器拖拽效果
                    e.preventDefault();
                    dragZoneTarget.removeClass('dragging');

                    // 获取文件对象
                    var fileList = e.dataTransfer.files;

                    // 检测是否是拖拽文件到页面的操作
                    if (!fileList.length) {
                        return false;
                    }

                    fileList = u.map(
                        fileList,
                        function (file) {
                            return new File(file);
                        }
                    );
                    uploader.receiveFile(fileList);
                },
                false
            );

            dragZoneTarget[0].addEventListener(
                'dragenter',
                function (e) {
                    // 取消默认浏览器拖拽效果
                    e.preventDefault();
                    dragZoneTarget.addClass('dragging');
                },
                false
            );

            dragZoneTarget[0].addEventListener(
                'dragover',
                function (e) {
                    e.preventDefault();
                    dragZoneTarget.addClass('dragging');
                },
                false
            );

            dragZoneTarget[0].addEventListener(
                'dragleave',
                function (e) {
                    e.preventDefault();
                    dragZoneTarget.removeClass('dragging');
                },
                false
            );
        };

        var DragableUploader = require('eoo').create(require('esui/Extension'), exports);
        require('esui').registerExtension(DragableUploader);
        return DragableUploader;
    }
);
