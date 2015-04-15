/**
 * @file Carousel控件类
 * @author yaofeifei(yaofeifei@baidu.com)
 */

define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');
    var eoo = require('eoo');

    var MAIN_TPL = [
        '<div class="${typeSelector}-main" id="${contentId}">',
            '<div class="${typeSelector}-content">',
                '<span class="${typeSelector}-pointer ${typeSelector}-pointer-active-l ${iconLeftArrow}" id="${leftId}"></span>',
                '<div class="ui-carouse-list-wrap">',
                    '<ul class="${typeSelector}-list" id="${listId}"></ul>',
                '</div>',
                '<span class="${typeSelector}-pointer ${typeSelector}-pointer-active-r ${iconRightArrow}" id="${rightId}"></span>',
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

    /**
     * 拼接main的dom结构
     * @return {string} html片段
     * @inner
     */
    function getMainHtml() {
        return lib.format(
            MAIN_TPL,
            {
                'typeSelector': this.helper.getPrimaryClassName(),
                'contentId': this.helper.getId('main'),
                'leftId': this.helper.getId('left-handler'),
                'listId': this.helper.getId('list'),
                'rightId': this.helper.getId('right-handler'),
                'toolbarId': this.helper.getId('toolbar'),
                'iconLeftArrow': this.helper.getIconClass('chevron-left'),
                'iconRightArrow': this.helper.getIconClass('chevron-right')
            }
        );
    };

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
        var len = data ? data.length : 0;
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
                        'imgSrc': item.url,
                        'width': itemWidth,
                        'height': itemHeight,
                        'index': index,
                        'typeSelector': this.helper.getPrimaryClassName(),
                        'itemSelector': this.isDisabled() ? this.helper.getPartClassName('disabled') : '',
                        'iconCheck': this.helper.getIconClass('check'),
                        'spacing': (index1 > 0 && index1 % pageSize === 0) ? 0 : spacing
                    }
                );
            }
            html.push(str);
        }, this);
        return html.join('');
    };

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
                    'index': i,
                    'typeSelector': this.helper.getPrimaryClassName()
                }
            );
            html.push(str);
        }
        return html.join('');
    };

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
    };

    /**
     * 设置左右箭头的样式
     * @inner
     */
    function setPointerStyle() {
        var disableClass = this.helper.getPartClasses('pointer-disable')[0];
        if (this.pageLength === 1) {
            lib.addClass(this.helper.getId('left-handler'), disableClass);
            lib.addClass(this.helper.getId('right-handler'), disableClass);
        }
        else {
            if (this.currentPage === 0) {
                lib.addClass(this.helper.getId('left-handler'), disableClass);
                lib.removeClass(this.helper.getId('right-handler'), disableClass);
            }
            else if (this.currentPage === this.pageLength - 1) {
                lib.removeClass(this.helper.getId('left-handler'), disableClass);
                lib.addClass(this.helper.getId('right-handler'), disableClass);
            }
            else {
                lib.removeClass(this.helper.getId('left-handler'), disableClass);
                lib.removeClass(this.helper.getId('right-handler'), disableClass);
            }
        }
    };

    /**
     * 设置翻页的滚动位置
     * @inner
     */
    function setCarouseListPosition() {
        var pageOffset = -this.wrapWidth;
        var left = (pageOffset * this.currentPage) + 'px';
        this.helper.getPart('list').style.left = left;
    };

    /**
     * 左右箭头点击后的处理函数
     * @param {number} n 区别方向  -1=left 1=right
     * @inner
     */
    function pointerClick(n) {
        var nextPage = this.currentPage + n;
        if (nextPage >= this.pageLength ||
            nextPage <  0) {
            return;
        }
        else {
            this.setPage(nextPage);
        }
    };

    /**
     * 单个选项处理handler
     * @param {number} index 选项的序号
     * @param {HTMLElement} el dom对象
     * @inner
     */
    function itemClick(index, el) {
        if (this.isDisabled() || this.selectedIndex === index) {
            return;
        }
        if (this.emphasizeSelectedItem) {
            var selectedClass = this.helper.getPrimaryClassName('selected-item');
            if (this.selectedIndex !== -1) {
                var selector = this.helper.getPart('list');
                var lis = selector.getElementsByTagName('li');
                var li = lis[this.selectedIndex];
                lib.removeClass(li, selectedClass);
            }
            lib.addClass(el, selectedClass);
        }
        this.selectedIndex = index;
        this.selectedItem = this.getSelectedItem();
        this.value = this.selectedItem['id'];
        /**
         * @event change
         *
         * 值发生变化时触发
         *
         * `Carousel`控件的值变化是以{@link Carousel#selectedIndex}属性为基准
         */
        this.fire('change');
    };

    /**
     * 翻页按钮点击处理函数
     * @param {number} nextPage 目标页的序号
     * @inner
     */
    function pageClick(nextPage) {
        if (this.currentPage === nextPage) {
            return;
        }
        else {
            this.setPage(nextPage);
        }
    };

    /**
     * 选择项切换处理函数，采用事件委托的方式
     * @param {Event} e 事件对象
     * @inner
     */
    function itemChangeHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (target.nodeName === 'IMG') {
            var el = target.parentNode;
            var index = parseInt(el.getAttribute('index'), 10);
            itemClick.call(this, index, el);
        }
    };

    /**
     * 底部工具条处理函数，采用事件委托的方式
     * @param {Event} e 事件对象
     * @inner
     */
    function toolbarHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (target.nodeName === 'LI') {
            var index = parseInt(target.getAttribute('index'), 10);
            pageClick.call(this, index);
        }
    };

    var exports = {
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
         * @param {number} option.selectedIndex 选中的项的序号
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
                selectedIndex: -1,
                disabled: false,
                emphasizeSelectedItem: true
            };
            u.extend(properties, options);
            if (properties.value) {
                properties.value = parseInt(properties.value, 10);
                u.each(properties.datasource, function (item, index) {
                    if (item.id === properties.value) {
                        properties.selectedIndex = index;
                    }
                });
                properties.selectedItem = properties.datasource[properties.selectedIndex];
            }
            properties.itemWidth = parseFloat(properties.itemWidth, 10);
            properties.itemHeight = parseFloat(properties.itemHeight, 10);
            properties.pageSize = parseFloat(properties.pageSize, 10);
            this.setProperties(properties);
        },

        /**
         * 创建控件主元素，默认使用`div`元素
         *
         * 如果需要使用其它类型作为主元素，
         * 需要在始终化时提供{@link Control#main}属性
         *
         * @return {HTMLElement}
         * @protected
         * @override
         */
        createMain: function () {
            return document.createElement('div');
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
            //左右的把手事件绑定
            this.helper.addDOMEvent('left-handler', 'click', u.bind(pointerClick, this, -1));
            this.helper.addDOMEvent('right-handler', 'click', u.bind(pointerClick, this, 1));
            //列表项切换
            this.helper.addDOMEvent('list', 'click', itemChangeHandler);
            //最下面翻页
            this.helper.addDOMEvent('toolbar', 'click', toolbarHandler);
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
                    list.innerHTML = 
                        getItemHtml.call(
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
            if (!value && value !== 0) {
                this.setPage();
                return;
            }
            this.value = parseInt(value, 10);
            this.selectedIndex = -1;
            u.each(this.datasource, function (item, index) {
                if (item.id === this.value) {
                    this.selectedIndex = index;
                }
            }, this);
            this.selectedItem = this.getSelectedItem();

            if (this.selectedIndex !== -1) {
                if (this.emphasizeSelectedItem) {
                    var selector = this.helper.getPart('list');
                    var lis = selector.getElementsByTagName('li');
                    var selectedClass = this.helper.getPrimaryClassName('selected-item');
                    u.each(lis, function (dom, i) {
                        lib.removeClass(dom, selectedClass);
                    });
                    var li = lis[this.selectedIndex];
                    lib.addClass(li, selectedClass);
                }
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
            var allDom = lib.getChildren(this.helper.getPart('toolbar'));
            u.each(allDom, function (dom, i) {
                lib.removeClass(dom, currentPageClass);
                var index = parseInt(dom.getAttribute('index'), 10);
                if (this.currentPage === index) {
                    lib.addClass(dom, currentPageClass);
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
        getSelectedItem: function() {
            return this.datasource[this.selectedIndex];
        }
    };

    var Carousel = eoo.create(Control, exports);
    require('esui/main').register(Carousel);
    return Carousel;
});
