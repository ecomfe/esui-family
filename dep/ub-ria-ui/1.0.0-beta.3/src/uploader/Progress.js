/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 上传组合控件 TODO
 * @exports UploadProgress
 * @author weifeng(weifeng@baidu.com)
 */
define(
    function (require) {
        var $ = require('jquery');
        var lib = require('esui/lib');

        var esui = require('esui');
        var Control = require('esui/Control');
        var painters = require('esui/painters');

        /**
         * Progress
         *
         * @class Progress
         */
        var exports = {};

        exports.type = 'Progress';


        // 模板
        var template = [
            '<div class="${fileClass}">',
            '  <span class="${nameClass}">${fileName}</span>',
            '  <span class="${sizeClass}">${fileSize}</span>',
            '</div>',
            '<div class="${statusClass}">',
            '  <div class="${statusInfoClass}">',
            '    <div class="${barContainerClass}">',
            '      <div class="${barClass}" id="${barId}">0%</div>',
            '    </div>',
            '    <div class="${resultClass}" id="${resultId}"></div>',
            '  </div>',
            '  <div class="${operationClass}">',
            '    <esui-button class="${cancelButtonClass} ui-button-link" data-ui-child-name="cancel">',
            '        取消上传',
            '    </esui-button>',
            '    <esui-button class="${restartButtonClass} ui-button-info" data-ui-child-name="restart">',
            '        重新上传',
            '    </esui-button>',
            '  </div>',
            '</div>'
        ].join('');

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.main.innerHTML = this.getProgressHtml();
            this.helper.initChildren();
            // 是否展示进度详情
            this.addState(this.progressMode);

            var progress = this;
            this.getChild('cancel').on(
                'click',
                function (e) {
                    progress.fire('cancel');
                }
            );

            this.getChild('restart').on(
                'click',
                function (e) {
                    progress.fire('restart');
                }
            );

            if (this.file.message) {
                this.updateStatus(this.file.status, this.file.message);
            }
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        exports.repaint = painters.createRepaint(
            Control.prototype.repaint,
            {
                name: ['total', 'loaded'],
                paint: function (progress, total, loaded) {
                    progress.setProgressing(loaded, total);
                }
            }
        );

        /**
         * @override
         */
        exports.dispose = function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }
            // 移除dom
            var domId = this.main.id;
            lib.removeNode(domId);
            this.$super(arguments);
        };

        /**
         * 设置当前进度
         *
         * @param {number} loaded 已加载量
         * @param {number} total 总量
         * @public
         */
        exports.setProgressing = function (loaded, total) {
            if (this.status === 'server-error' || this.status === 'client-error') {
                return;
            }
            if (this.progressMode === 'detail' && total !== 0) {
                this.updateStatus('progressing', '');
                var percent = loaded / total * 100 + '%';
                $('#' + this.helper.getId('bar')).css('width', percent).html(percent);
            }
            else {
                this.updateStatus('progressing', '正在上传中...');
            }
        };

        /**
         * 获取进度条html
         *
         * @return {string}
         * @public
         */
        exports.getProgressHtml = function () {
            var file = this.file;
            if (!file) {
                return '';
            }
            var template = this.template || template;

            return lib.format(
                this.template,
                {
                    fileName: file.name,
                    fileSize: file.size,
                    fileClass: this.helper.getPartClassName('file-info'),
                    nameClass: this.helper.getPartClassName('file-name'),
                    sizeClass: this.helper.getPartClassName('file-size'),
                    statusClass: this.helper.getPartClassName('status'),
                    statusInfoClass: this.helper.getPartClassName('status-info'),
                    operationClass: this.helper.getPartClassName('status-operation'),
                    cancelButtonClass: this.helper.getPartClassName('cancel'),
                    restartButtonClass: this.helper.getPartClassName('restart'),
                    barContainerClass: this.helper.getPartClassName('bar-container'),
                    barClass: this.helper.getPartClassName('bar'),
                    barId: this.helper.getId('bar'),
                    resultClass: this.helper.getPartClassName('result'),
                    resultId: this.helper.getId('result')
                }
            );
        };

        /**
         * 更新进度条状态
         *
         * @param {string} status 状态
         * @param {string} message 可能的信息
         * @public
         */
        exports.updateStatus = function (status, message) {
            this.changeStatus(status);
            $('#' + this.helper.getId('result')).html(message);
        };

        /**
         * 修改进度条状态样式
         *
         * @param {string} status 状态
         * @public
         */
        exports.changeStatus = function (status) {
            if (this.status) {
                this.removeState(this.status);
            }
            this.status = status;
            this.addState(this.status);
        };

        /**
         * 渐变消失
         *
         * @param {number} delayTime 渐变时间
         * @param {Function} callback 消失后回调
         * @public
         */
        exports.fadeOut = function (delayTime, callback) {
            var me = this;
            $(this.main).fadeOut(
                delayTime,
                function () {
                    callback();
                    me.dispose();
                }
            );
        };

        var Progress = require('eoo').create(Control, exports);

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Progress.defaultProperties = {
            template: template,
            total: 0,
            loaded: 0,
            progressMode: 'detail'
        };

        esui.register(Progress);

        return Progress;
    }
);
