/**
 * 弹层预览
 * @file LightBox.js
 * @author liwei
 */

define(function (require) {
    var esui = require('esui');
    var lib = require('esui/lib');
    var u = require('underscore');
    var eoo = require('eoo');
    var Control = require('esui/Control');
    var painters = require('esui/painters');
    var $ = require('jquery');
    var previewHelper = require('./helper/previewHelper');
    require('./FlashObject');

    require('esui/Dialog');

    var LightBox = eoo.create(
        Control,
        {

            /**
             * 资源预览弹出框控件
             *
             * @extends Control
             * @constructor
             */
            constructor: function () {
                this.$super(arguments);
                this.dialog = null;
            },

            type: 'LightBox',

            /**
             * 初始化配置
             *
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    currentIndex: 0,
                    width: 'auto',
                    height: 'auto',
                    dialogVariants: 'lightbox',
                    loadingStyle: this.helper.getPartClassName('media-loading'),
                    loadFailedStyle: this.helper.getPartClassName('media-load-failed'),
                    group: null,
                    groupContainerId: null
                };
                u.extend(properties, LightBox.defaultProperties, options);
                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                var properties = {
                    content: '',
                    closeButton: true,
                    mask: true,
                    alwaysTop: true,
                    closeOnHide: false,
                    width: 'auto'
                };

                u.extend(
                    properties,
                    {
                        title: this.title || '',
                        foot: this.foot || '',
                        draggable: this.draggable || false,
                        needfoot: this.needfoot || false,
                        variants: this.dialogVariants
                    }
                );
                var dialog = esui.create('Dialog', properties);
                dialog.appendTo(document.body);
                this.dialog = dialog;
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                this.initCarousel();
                var leftLink = lib.g(this.dialog.helper.getId('link-left'));
                var rightLink = lib.g(this.dialog.helper.getId('link-right'));

                var me = this;

                this.dialog.helper.addDOMEvent(
                    leftLink,
                    'click',
                    function (e) {
                        me.showPreviousMedia();
                    }
                );
                this.dialog.helper.addDOMEvent(
                    rightLink,
                    'click',
                    function (e) {
                        me.showNextMedia();
                    }
                );
                this.dialog.on('close', function () {
                    $(this.mediaContainer()).html('');
                }, this);


                if (this.group) {
                    var container = this.groupContainerId ? lib.g(this.groupContainerId) : document.body;

                    me.helper.addDOMEvent(
                        container,
                        'click',
                        '[data-lightbox-group]',
                        function (e) {
                            var target = e.currentTarget;
                            e.preventDefault();

                            var $groupElements = $(container).find('[data-lightbox-group="' + me.group + '"]');
                            var i = $groupElements.index(target);
                            var datasource = [];
                            $groupElements.each(function (i, element) {
                                var $el = $(element);
                                var item = {
                                    url: $el.attr('href')
                                };

                                var dataType = $el.attr('data-lightbox-type');
                                item.width = $el.attr('data-lightbox-width');
                                item.height = $el.attr('data-lightbox-height');
                                dataType && (item.type = dataType);

                                datasource.push(item);
                            });
                            me.datasource = datasource;
                            me.show({
                                currentIndex: i
                            });
                        }
                    );
                }
            },

            /**
             * 初始化图片/视频轮播
             *
             * @protected
             */
            initCarousel: function () {
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
                    lib.format(
                        tpl,
                        {
                            mediaId: dialogHelper.getId('media'),
                            mediaStyle: dialogHelper.getPartClassName('lightbox-content-media'),
                            linkId: dialogHelper.getId('link'),
                            linkStyle: dialogHelper.getPartClassName('lightbox-content-link'),
                            leftLinkId: dialogHelper.getId('link-left'),
                            leftLinkStyle: leftIcon,
                            rightLinkId: dialogHelper.getId('link-right'),
                            rightLinkStyle: rightIcon
                        }
                    )
                );
            },

            mediaContainer: function () {
                return lib.g(this.dialog.helper.getId('media'));
            },

            /**
             * 显示图片/视频对话框容器
             *
             * @param {Object} args 显示对话框时传入的参数
             * @protected
             */
            show: function (args) {
                args && this.setProperties(args);
                var link = lib.g(this.dialog.helper.getId('link'));
                link.style.display = this.datasource.length <= 1 ? 'none' : '';
                this.showMedia();
            },

            /**
             * 隐藏图片/视频对话框容器
             *
             * @protected
             */
            hide: function () {
                this.dialog.hide();
            },

            /**
             * 填充内容
             *
             * @param {Array} list 图片或视频数据列表
             * @protected
             */
            setContent: function (list) {
                this.setProperties(
                    {
                        datasource: list
                    }
                );
            },

            /**
             * 显示图片/视频
             *
             * @protected
             */
            showMedia: function () {
                var data = this.datasource[this.currentIndex];
                this.showLoading();

                if (!data.type) {
                    if (/\.(?:jpg|png|gif|jpeg|bmp)$/i.test(data.url)) {
                        data.type = 'image';
                    }
                    else if (/\.swf/i.test(data.url)) {
                        data.type = 'flash';
                    }
                    else if (/\.(?:mp4|flv|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid)/i.test(data.url)) {
                        data.type = 'video';
                    }
                }
                this.preview(data);
            },

            /**
             * 显示加载状态
             *
             * @protected
             */
            showLoading: function () {
                $(this.dialog.main).addClass(this.helper.getPartClassName('loading'));
            },

            /**
             * 取消加载状态
             *
             * @protected
             */
            hideLoading: function () {
                $(this.dialog.main).removeClass(this.helper.getPartClassName('loading'));
            },

            /**
             * 预览图片/视频/flash
             *
             * @protected
             * @param {Object} options 预览参数
             */
            preview: function (options) {
                if (options) {
                    if (options.type === 'flv') {
                        options.type = 'video';
                    }
                    var type = options.type;
                    options.id = options.id || 'preiew-' + Math.random();
                    options.width = options.width || this.width;
                    options.height = options.height || this.height;

                    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
                    (this['preview' + type] || this.previewNotSupported).call(this, options);
                    // 预览图片需要在onload之后调整尺寸，故作特殊处理
                    if (type !== 'Image') {
                        this.dialog.resize();
                    }
                }
            },

            /**
             * 预览图片
             *
             * @param {Object} options 图片数据
             * @protected
             */
            previewImage: function (options) {
                var me = this;
                options.width += 'px';
                options.height += 'px';
                var img = previewHelper.preview(options);
                img.onload = function () {
                    me.hideLoading();
                    me.mediaContainer().innerHTML = '';
                    me.mediaContainer().appendChild(img);
                    me.dialog.show();
                    me.dialog.resize();
                    img.onload = img.onerror = null;
                };

                img.onerror = function () {
                    me.hideLoading();
                    me.mediaContainer().innerHTML = lib.format(this.LOAD_FAILED_TPL, me);
                    img.onload = img.onerror = null;
                    me.dialog.show();
                };
            },

            /**
             * 预览Flash
             *
             * @param {Object} options flash数据
             * @protected
             */
            previewFlash: function (options) {
                var flashObj = previewHelper.preview(options);
                if (!flashObj) {
                    this.previewNotSupported();
                    return;
                }
                this.hideLoading();
                this.mediaContainer().innerHTML = '';
                this.addChild(flashObj, 'FlashObject');
                flashObj.appendTo(this.mediaContainer());
                this.dialog.show();
            },

            /**
             * 预览视频
             *
             * @param {Object} options 视频数据
             * @protected
             */
            previewVideo: function (options) {
                var url = options.url;
                var html = '';
                if (/\.flv/.test(url)) {
                    options.type = 'flv';
                }
                else if (/\.mp4|\.mov/.test(url)) {
                    options.type = 'video';
                }
                options.swfPath = this.swfPath;
                html = previewHelper.preview(options);
                if (!html) {
                    this.previewNotSupported();
                    return;
                }
                var $container = $(this.mediaContainer());
                this.hideLoading();
                $container.html('');
                if (typeof html === 'string') {
                    $container.append($(html));
                }
                else if (html.getCategory) {
                    this.addChild(html, 'VideoObject');
                    html.appendTo($container[0]);
                }
                this.dialog.show();
            },

            previewNotSupported: function () {
                this.hideLoading();
                this.mediaContainer().innerHTML = this.NOT_SUPPORT_MESSAGE;
                this.dialog.show();
            },

            /**
             * 显示下一个图片/视频
             *
             * @protected
             */
            showNextMedia: function () {
                this.currentIndex = ++this.currentIndex % this.datasource.length;
                this.showMedia();
            },

            /**
             * 显示上一个图片/视频
             *
             * @protected
             */
            showPreviousMedia: function () {
                this.currentIndex = (--this.currentIndex + this.datasource.length) % this.datasource.length;
                this.showMedia();
            },

            /**
             * 重渲染
             *
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['title'],
                    paint: function (control, title) {
                        control.dialog.setTitle(title || '');
                    }
                }
            )
        }
    );

    LightBox.defaultProperties = {
        NOT_SUPPORT_MESSAGE: '暂不支持该格式预览',
        LOAD_FAILED_TPL: '<div class="${loadFailedStyle}">加载图片失败</div>'
    };

    esui.register(LightBox);
    return LightBox;
});
