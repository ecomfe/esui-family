/**
 * 弹层预览
 * @file LightBox.js
 * @author liwei
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var eoo = require('eoo');
    var Dialog = require('esui/Dialog');
    var Control = require('esui/Control');
    var helper = require('esui/controlHelper');
    var swf = require('./helper/swfHelper');

    var NOT_SUPPORT_MESSAGE = '暂不支持该格式预览';
    var VIDEO_TPL = [
        '<video id="${id}" title="${title}" width="${width}" height="${height}" src="${src}" autoplay="autoplay">',
        '该浏览器暂不支持此格式视频预览',
        '</video>'
    ].join('');

    var LOADED_FAILTURE_TPL = '<div class="${loadedFailtureStyle}">加载图片失败</div>';

    var exports = {};

    /**
     * @extends Control
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
        this.dialog = null;
    };

    exports.type = 'LightBox';

    /**
     * 初始化配置
     *
     * @protected
     * @override
     */
    exports.initOptions = function (options) {
        var properties = {
            currentIndex: 0,
            width: 'auto',
            height: 'auto',
            dialogVariants: 'lightbox',
            loadingStyle: this.helper.getPartClassName('media-loading'),
            loadedFailtureStyle: this.helper.getPartClassName('media-loaded-failture')
        };
        u.extend(properties, options);
        this.setProperties(properties);
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    exports.initStructure = function () {
        var properties = {
            id: helper.getGUID('dialog-lightbox-foot'),
            type: 'warning',
            content: '',
            closeButton: true,
            mask: true,
            alwaysTop: true,
            closeOnHide: false,
            width: 'auto'
        };

        u.extend(properties, {
            title: this.title || '',
            foot: this.foot || '',
            draggable: this.draggable || false,
            needFoot: this.needFoot || false,
            variants: this.dialogVariants
        });
        var dialog = require('esui').create('Dialog', properties);
        dialog.appendTo(document.body);
        this.dialog = dialog;
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    exports.initEvents = function () {
        this.initCarousel();
        var leftLink = lib.g(helper.getId(this.dialog, 'link-left'));
        var rightLink = lib.g(helper.getId(this.dialog, 'link-right'));

        var me = this;

        helper.addDOMEvent(this.dialog, leftLink, 'click', function (e) {
            me.showPreviousMedia();
        });
        helper.addDOMEvent(this.dialog, rightLink, 'click', function (e) {
            me.showNextMedia();
        });

        if (this.group) {
            var container = this.groupContainerId ? lib.g(this.groupContainerId) : document.body;

            me.helper.addDOMEvent(container, 'click', function (e) {
                var target = e.target;
                while (target !== document.body && !lib.hasAttribute(target, 'data-lightbox-group')) {
                    target = target.parentNode;
                }
                if (!lib.hasAttribute(target, 'data-lightbox-group')) {
                    return;
                }
                e.preventDefault();

                var groupElements = document.querySelectorAll('[data-lightbox-group="' + me.group + '"]');
                for (var i = 0; i < groupElements.length; i++) {
                    if (groupElements[i] === target) {
                        break;
                    }
                }
                var datasource = [];
                u.each(groupElements, function (element, i) {
                    var item = {
                        url: lib.getAttribute(element, 'href')
                    };

                    var dataType = lib.getAttribute(element, 'data-lightbox-type');
                    dataType && (item.type = dataType);

                    datasource.push(item);
                });

                me.datasource = datasource;

                me.show({
                    currentIndex: i
                });
            });
        }
    };

    /**
     * 初始化图片/视频轮播
     *
     * @protected
     */
    exports.initCarousel = function () {
        var tpl = [
            '<div id="${mediaId}" class="${mediaStyle}"></div>',
            '<div id="${linkId}" class="${linkStyle}">',
            '<a href="javascript:;" id="${leftLinkId}" class="${leftLinkStyle}"></a>',
            '<a href="javascript:;" id="${rightLinkId}" class="${rightLinkStyle}"></a>',
            '</div>'
        ].join('');
        var body = this.dialog.getBody();
        var dialogHelper = this.dialog.helper;
        var leftIcon = dialogHelper.getPartClassName('lightbox-content-link-left')
            + ' '
            + dialogHelper.getIconClass();
        var rightIcon = dialogHelper.getPartClassName('lightbox-content-link-right')
            + ' '
            + dialogHelper.getIconClass();
        body.setContent(
            lib.format(tpl, {
                mediaId: dialogHelper.getId('media'),
                mediaStyle: dialogHelper.getPartClassName('lightbox-content-media'),
                linkId: dialogHelper.getId('link'),
                linkStyle: dialogHelper.getPartClassName('lightbox-content-link'),
                leftLinkId: dialogHelper.getId('link-left'),
                leftLinkStyle: leftIcon,
                rightLinkId: dialogHelper.getId('link-right'),
                rightLinkStyle: rightIcon
            })
        );
    };

    exports.mediaContainer = function () {
        return lib.g(helper.getId(this.dialog, 'media'));
    };

    /**
     * 显示图片/视频对话框容器
     * @param {Object} args 显示对话框时传入的参数
     * @protected
     */
    exports.show = function (args) {
        args && this.setProperties(args);
        var link = lib.g(helper.getId(this.dialog, 'link'));
        link.style.display = this.datasource.length <= 1 ? 'none' : '';
        this.showMedia();
    };

    /**
     * 隐藏图片/视频对话框容器
     *
     * @protected
     */
    exports.hide = function () {
        this.dialog.hide();
    };

    /**
     * 填充内容
     * @param {Array} list 图片或视频数据列表
     * @protected
     */
    exports.setContent = function (list) {
        this.setProperties({
            datasource: list
        });
    };

    /**
     * 显示图片/视频
     *
     * @protected
     */
    exports.showMedia = function () {
        var data = this.datasource[this.currentIndex];
        this.showLoading();

        // 这个是否要保留呢 ?
        if (!data.type) {
            if (/\.(?:jpg|png|gif|jpeg|bmp)$/i.test(data.url)) {
                data.type = 'image';
            }
            else if (/\.swf$/i.test(data.url)) {
                data.type = 'flash';
            }
            else if (/\.(?:mp4|flv|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid)$/i.test(data.url)) {
                data.type = 'video';
            }
        }
        this.preview(data);
    };

    /**
     * 显示加载状态
     *
     * @protected
     */
    exports.showLoading = function () {
        lib.addClass(this.dialog.main, this.helper.getPartClassName('loading'));
    };

    /**
     * 取消加载状态
     *
     * @protected
     */
    exports.hideLoading = function () {
        lib.removeClass(this.dialog.main, this.helper.getPartClassName('loading'));
    };

    /**
     * 预览图片/视频/flash
     * @param {Object} options 预览参数
     * @protected
     * @return {Object} 播控方法
     */
    exports.preview = function (options) {
        var html = NOT_SUPPORT_MESSAGE;
        if (options) {
            var type = options.type;
            options.id = options.id || 'preiew-' + Math.random();
            options.width = options.width || this.width;
            options.height = options.height || this.height;
            
            var s = type.charAt(0).toUpperCase() + type.substring(1).toLowerCase();
            (this['preview' + s] || this.previewNotSupported).call(this, options);
        }
    };

    /**
     * 预览图片
     * @param {Object} options 图片数据
     * @protected
     */
    exports.previewImage = function (options) {
        var me = this;
        var img = new Image();
        img.onload = function () {
            me.hideLoading();
            me.mediaContainer().innerHTML = '';
            me.mediaContainer().appendChild(img);
            me.dialog.show();
            img.onload = img.onerror = null;
        };

        img.onerror = function () {
            me.hideLoading();
            me.mediaContainer().innerHTML = lib.format(LOADED_FAILTURE_TPL, me);
            img.onload = img.onerror = null;
            me.dialog.show();
        };
        img.src = options.url;
        /\d+/.test(options.width) && (img.style.width = options.width + 'px');
        /\d+/.test(options.height) && (img.style.height = options.height + 'px');
    };

    /**
     * 预览Flash
     * @param {Object} options flash数据
     * @protected
     */
    exports.previewFlash = function (options) {
        var html = getFlashHtml(options);
        this.hideLoading();
        this.mediaContainer.innerHTML = html;
        this.dialog.show();
    };

    /**
     * 预览视频
     * @param {Object} options 视频数据
     * @protected
     */
    exports.previewVideo = function (options) {
        var url = options.url;
        if (/\.flv$/.test(url)) {
            html = getFlvHtml(options, this.swfPath);
        }
        else if (/\.mp4|\.mov/.test(url)) {
            html = getVideoHtml(options);
        }
        this.hideLoading();
        this.mediaContainer().innerHTML = html;
        this.dialog.show();
    };

    exports.previewNotSupported = function () {
        this.hideLoading();
        this.mediaContainer().innerHTML = NOT_SUPPORT_MESSAGE;
        this.dialog.show();
    };

    /**
     * 显示下一个图片/视频
     *
     * @protected
     */
    exports.showNextMedia = function () {
        this.currentIndex = ++this.currentIndex % this.datasource.length;
        this.showMedia();
    };

    /**
     * 显示上一个图片/视频
     *
     * @protected
     */
    exports.showPreviousMedia = function () {
        this.currentIndex = (--this.currentIndex + this.datasource.length) % this.datasource.length;
        this.showMedia();
    };

    /**
     * 重渲染
     *
     * @method
     * @protected
     * @override
     */
    exports.repaint = require('esui/painters').createRepaint(
        Control.prototype.repaint,
        {
            name: ['title'],
            paint: function (control, title) {
                control.dialog.setTitle(title || '');
            }
        }
    );

    /**
     * 获取预览Flash
     * @param {Object} options flash数据
     * @private
     * @return {string}
     */
    function getFlashHtml(options) {
        return swf.createHTML({
            'id': options.id || 'preview-fla',
            'url': options.url,
            'width': options.width,
            'height': options.height,
            'wmode': 'transparent'
        });
    }

    /**
     * 获取预览视频
     * @param {Object} options flv数据
     * @private
     * @return {string}
     */
    function getFlvHtml(options, swfPath) {
        return swf.createHTML({
            'id': options.id || 'preview-flv',
            'url': swfPath,
            'width': options.width,
            'height': options.height,
            'wmode': 'transparent',
            'vars': 'play_url=' + options.url
        });
    }

    /**
     * 获取预览视频 - html5
     * @param {Object} options 视频数据
     * @private
     * @return {string}
     */
    function getVideoHtml(options) {
        return lib.format(VIDEO_TPL, {
            id: options.id || 'preview-video',
            title: options.title,
            src: options.url,
            width: options.width,
            height: options.height
        });
    }

    var LightBox = eoo.create(Control, exports);
    require('esui/main').register(LightBox);
    return LightBox;
});
