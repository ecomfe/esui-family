/**
 * @file Carousel控件类
 * @author yaofeifei(yaofeifei@baidu.com)
 */

define(function (require) {
    var u = require('underscore');
    var esui = require('esui');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');
    var eoo = require('eoo');
    var $ = require('jquery');

    var MAIN_TPL = [
        '<div class="${typeSelector}-main" id="${contentId}">',
            '<div class="${typeSelector}-content">',
                '<span class="${typeSelector}-pointer ${typeSelector}-pointer-active-l ${iconLeftArrow}"',
                ' id="${leftId}"></span>',
                '<div class="ui-carouse-list-wrap">',
                    '<ul class="${typeSelector}-list" id="${listId}"></ul>',
                '</div>',
                '<span class="${typeSelector}-pointer ${typeSelector}-pointer-active-r ${iconRightArrow}"',
                ' id="${rightId}"></span>',
            '</div>',
            '<div class="${typeSelector}-toolbar">',
                '<ul id="${toolbarId}"></ul>',
            '</div>',
        '</div>'
    ].join('');

    var ITEM_TPL = [
        '<li class="${typeSelector}-item ${itemSelector}" index="${index}" ',
            'style="width:${width}px;height:${height}px;margin-right:${spacing}px;">',
            '<img class="${typeSelector}-item-img" src="${imgSrc}"/>',
            '<span class="${typeSelector}-check ${iconCheck}"></span>',
        '</li>'
    ].join('');

    var PAGE_TPL = '<li index="${index}" class="${typeSelector}-page"></li>';

    var Carousel = eoo.create(
        Control,
        {
            /**
             * 控件类型
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'Carousel',

            /**
             * 初始化参数
             *
             * @param {Object} [options] 构造函数传入的参数
             * @param {number} option.pageSize 每页显示的个数
             * @param {number} option.spacing 每个图片的间隔
             * @param {number} option.itemWidth 每项的宽度
             * @param {number} option.itemHeight 每项的高度
             * @param {Array} option.datasource 所有项的数据数组
             * @param {number} option.value 选中的项的id值
             * @param {boolean} option.disabled 是否禁用
             * @param {boolean} option.emphasizeSelectedItem 是否高亮被选择的
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    pageSize: 8,
                    spacing: 15,
                    itemWidth: 80,
                    itemHeight: 50,
                    datasource: [],
                    value: null,
                    disabled: false,
                    emphasizeSelectedItem: true
                };
                u.extend(properties, options);
                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             */
            initStructure: function () {
                this.main.innerHTML = getMainHtml.call(this);
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                // 左右的把手事件绑定
                this.helper.addDOMEvent('left-handler', 'click', u.bind(pointerClick, this, -1));
                this.helper.addDOMEvent('right-handler', 'click', u.bind(pointerClick, this, 1));
                // 列表项切换
                this.helper.addDOMEvent('list', 'click', 'li', itemChangeHandler);
                // 最下面翻页
                this.helper.addDOMEvent('toolbar', 'click', 'li', toolbarHandler);
            },

            /**
             * 重新渲染视图
             * 仅当生命周期处于RENDER时，该方法才重新渲染
             *
             * @param {Array=} 变更过的属性的集合
             * @override
             */
            repaint: paint.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['datasource', 'itemWidth', 'itemHeight'],
                    paint: function (carousel, datasource, itemWidth, itemHeight) {
                        var list = carousel.helper.getPart('list');
                        var toolbar = carousel.helper.getPart('toolbar');
                        var pageSize = carousel.pageSize;
                        var spacing = carousel.spacing;
                        list.innerHTML = getItemHtml.call(
                            carousel,
                            datasource,
                            itemWidth,
                            itemHeight,
                            spacing,
                            pageSize
                        );
                        toolbar.innerHTML = getToolbarHtml.call(carousel, datasource);

                        var wrapWidth = itemWidth * carousel.pageSize + (pageSize - 1) * spacing;
                        var wrapHeight = itemHeight;
                        carousel.wrapWidth = wrapWidth;
                        var wrap = list.parentNode;
                        wrap.style.width = wrapWidth + 'px';
                        wrap.style.height = wrapHeight + 'px';
                    }
                },
                {
                    name: 'value',
                    paint: function (carousel, value) {
                        carousel.setValue(value);
                    }
                }
            ),

            /**
             * 设置选中项
             * @param {number} value 选中项的值
             * @public
             */
            setValue: function (value) {
                if (u.isNull(value) || u.isUndefined(value)) {
                    this.setPage();
                    return;
                }
                this.value = value;
                this.selectedIndex = -1;
                u.each(this.datasource, function (item, index) {
                    if (item.id === this.value) {
                        this.selectedIndex = index;
                        return false;
                    }
                }, this);
                this.selectedItem = this.getSelectedItem();

                if (this.selectedIndex !== -1 && this.emphasizeSelectedItem) {
                    var selector = this.helper.getPart('list');
                    var $lis = $(selector).children('li');
                    var selectedClass = this.helper.getPrimaryClassName('selected-item');
                    $lis.find('.' + selectedClass).removeClass(selectedClass);
                    var $li = $lis.eq(this.selectedIndex);
                    $li.addClass(selectedClass);
                }
                var page = getPageByIndex.call(this);
                this.setPage(page);
            },

            /**
             * 设置page
             * @param {number} page 获取page的序号
             * @public
             */
            setPage: function (page) {
                page = page || 0;
                page = parseInt(page, 10);
                var currentPageClass = this.helper.getPrimaryClassName('current-page');
                if (this.currentPage === null) {
                    this.currentPage = 0;
                }
                if (this.currentPage !== page) {
                    this.currentPage = page;
                }
                var $allDom = $(this.helper.getPart('toolbar')).children();
                u.each($allDom, function (dom, i) {
                    var $dom = $(dom);
                    $dom.removeClass(currentPageClass);
                    var index = +$dom.attr('index');
                    if (this.currentPage === index) {
                        $dom.addClass(currentPageClass);
                    }
                }, this);
                setPointerStyle.call(this);
                setCarouseListPosition.call(this);
            },

            /**
             * 获取选择项的完整数据
             * @return {Object}
             * @public
             */
            getSelectedItem: function () {
                return this.datasource[this.selectedIndex];
            }
        }
    );

    /**
     * 拼接main的dom结构
     * @return {string} html片段
     * @inner
     */
    function getMainHtml() {
        var controlHelper = this.helper;
        return lib.format(
            MAIN_TPL,
            {
                typeSelector: controlHelper.getPrimaryClassName(),
                contentId: controlHelper.getId('main'),
                leftId: controlHelper.getId('left-handler'),
                listId: controlHelper.getId('list'),
                rightId: controlHelper.getId('right-handler'),
                toolbarId: controlHelper.getId('toolbar'),
                iconLeftArrow: controlHelper.getIconClass(),
                iconRightArrow: controlHelper.getIconClass()
            }
        );
    }

    /**
     * 拼接内容项的dom结构
     * @param {Array} data 渲染数据
     * @param {number} itemWidth 单项的宽
     * @param {number} itemHeight 单项的高
     * @param {number} spacing 图片间距
     * @param {number} pageSize 图片间距
     * @return {string} html片段
     * @inner
     */
    function getItemHtml(data, itemWidth, itemHeight, spacing, pageSize) {
        var html = [];
        u.each(data, function (item, index) {
            var index1 = index + 1;
            var str = '';
            if (this.onRenderItem) {
                str = this.onRenderItem(item);
            }
            else {
                str = lib.format(
                    ITEM_TPL,
                    {
                        imgSrc: item.url,
                        width: itemWidth,
                        height: itemHeight,
                        index: index,
                        typeSelector: this.helper.getPrimaryClassName(),
                        itemSelector: this.isDisabled() ? this.helper.getPartClassName('disabled') : '',
                        iconCheck: this.helper.getIconClass(),
                        spacing: (index1 > 0 && index1 % pageSize === 0) ? 0 : spacing
                    }
                );
            }
            html.push(str);
        }, this);
        return html.join('');
    }

    /**
     * 拼接底部分页条的dom结构
     * @param {Array} data 渲染所需的数据
     * @return {string} html片段
     * @inner
     */
    function getToolbarHtml(data) {
        var html = [];
        var len = data.length;
        var divided = Math.ceil(len / this.pageSize);
        this.pageLength = divided;
        for (var i = 0; i < divided; i++) {
            var str = lib.format(
                PAGE_TPL,
                {
                    index: i,
                    typeSelector: this.helper.getPrimaryClassName()
                }
            );
            html.push(str);
        }
        return html.join('');
    }

    /**
     * 获取page的序号根据选中项的index
     * @return {number} page的序号
     * @inner
     */
    function getPageByIndex() {
        if (this.selectedIndex === -1) {
            return 0;
        }
        return Math.floor(this.selectedIndex / this.pageSize);
    }

    /**
     * 设置左右箭头的样式
     * @inner
     */
    function setPointerStyle() {
        var controlHelper = this.helper;
        var disableClass = controlHelper.getPartClassName('pointer-disable');
        var $left = $(controlHelper.getPart('left-handler'));
        var $right = $(controlHelper.getPart('right-handler'));
        var currentPage = this.currentPage;

        $left.removeClass(disableClass);
        $right.removeClass(disableClass);
        if (currentPage === 0) {
            $left.addClass(disableClass);
        }
        if (currentPage === this.pageLength - 1) {
            $right.addClass(disableClass);
        }
    }

    /**
     * 设置翻页的滚动位置
     * @inner
     */
    function setCarouseListPosition() {
        var pageOffset = -this.wrapWidth;
        var left = (pageOffset * this.currentPage) + 'px';
        this.helper.getPart('list').style.left = left;
    }

    /**
     * 左右箭头点击后的处理函数
     * @param {number} n 区别方向  -1=left 1=right
     * @inner
     */
    function pointerClick(n) {
        var nextPage = this.currentPage + n;
        if (nextPage >= this.pageLength || nextPage <  0) {
        }
        else {
            this.setPage(nextPage);
        }
    }

    /**
     * 单个选项处理handler
     * @param {number} index 选项的序号
     * @param {HTMLElement} $el dom对象
     * @inner
     */
    function itemClick(index, $el) {
        if (this.selectedIndex === index) {
            return;
        }
        if (this.emphasizeSelectedItem) {
            var $selector = $(this.helper.getPart('list'));
            var selectedClass = this.helper.getPrimaryClassName('selected-item');
            $selector.children('.' + selectedClass).removeClass(selectedClass);
            $el.addClass(selectedClass);
        }
        this.selectedIndex = index;
        this.selectedItem = this.getSelectedItem();
        this.value = this.selectedItem.id;
        /**
         * @event change
         *
         * 值发生变化时触发
         *
         * `Carousel`控件的值变化是以{@link Carousel#selectedIndex}属性为基准
         */
        this.fire('change');
    }

    /**
     * 翻页按钮点击处理函数
     * @param {number} nextPage 目标页的序号
     * @inner
     */
    function pageClick(nextPage) {
        if (this.currentPage !== nextPage) {
            this.setPage(nextPage);
        }
    }

    /**
     * 选择项切换处理函数，采用事件委托的方式
     * @param {Event} e 事件对象
     * @inner
     */
    function itemChangeHandler(e) {
        var $target = $(e.currentTarget);

        itemClick.call(this, +$target.attr('index'), $target);
    }

    /**
     * 底部工具条处理函数，采用事件委托的方式
     * @param {Event} e 事件对象
     * @inner
     */
    function toolbarHandler(e) {
        var $target = $(e.currentTarget);

        pageClick.call(this, +$target.attr('index'));
    }

    esui.register(Carousel);
    return Carousel;
});
