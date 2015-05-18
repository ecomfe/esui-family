function mainNav(path) {
    path = path || '';
    var htmlItem = '<li><a href="{link}"><span class="{icon}"></span> {text}</a></li>';
    var childHtml = '<li><span><span class="{icon}"></span><a target="_blank" href="{link}">{text}</a></span></li>';
    var htmlItemWithChildren = '<li><a href="{link}"><span class="{icon}"></span> {text}</a><ul class="ui-submenu ui-submenu-fly-out ui-submenu-fill-width">{children}</ul></li>';

    var items = [
        {
            link: 'css/button.html',
            icon: 'ui-icon-css3',
            text: 'CSS'
        },
        {
            link: 'controls/Button.html',
            icon: 'ui-icon-code',
            text: 'Controls',
            children: [{
                link: 'controls/Button.html',
                text: 'Demo',
                icon: 'ui-icon-code'
            },{
                link: 'controls/API.html?uiName=esui',
                text: 'ESUI API',
                icon: 'ui-icon-code'
            },{
                link: 'controls/API.html?uiName=ubui',
                text: 'UB-UI API',
                icon: 'ui-icon-code'
            }]
        }
    ];
    var html = [];
    $.each(items, function (idx, item) {
        if (item.children) {
            var childrenHtml = [];
            var childHtmlTpl = '';
            $.each(item.children, function(index, child) {
                if (index === 0) {
                    childHtmlTpl = childHtml.replace('target="_blank"', '');
                }
                else {
                    childHtmlTpl = childHtml;
                }
                childrenHtml.push(childHtmlTpl.replace('{link}', path + child.link).replace('{icon}', child.icon).replace('{text}', child.text));
            });
            html.push(htmlItemWithChildren.replace('{link}', path + item.link).replace('{icon}', item.icon).replace('{text}', item.text).replace('{children}', childrenHtml.join('')))
        }
        else {
            html.push(htmlItem.replace('{link}', path + item.link).replace('{icon}', item.icon).replace('{text}', item.text));
        }
        
    });
    document.write(html.join(''));
}

function footer() {
    var footHtml = '<p class="ui-text-center contrast">HI群：1392158</p>';
    document.write(footHtml);
    exampleCode();
}

function exampleCode() {
    // 生成demo区域的html代码
    $('.example').each(function (index, item) {
        var $sample = $('<div class="highlight"><pre><code class="language-markup"></code></pre></div>');
        var $code = $sample.find('.language-markup');
        var $item = $(item);
        $sample.insertAfter($item);

        var sampleCode = $item.html();
        var indexOfFirstElement = sampleCode.indexOf('<');
        var arr = sampleCode.split('\n');
        var targetArr = [];
        var reg = new RegExp('^\\s{' + (indexOfFirstElement - 1) + '}')
        for (var i = 0; i < arr.length; i++) {
            targetArr.push(arr[i].replace(reg, ''));
        }
        $code.text(targetArr.join('\n'));
    });
    // 语法高亮
    if (typeof(Prism) !== 'undefined') {
        Prism.highlightAll();
    }
}

$(function () {

    // JS 组件列表
    var navItems =
        '<li class="ui-sidebar-item-header">按钮</li>' +
        '<li><a href="Button.html">Button</a></li>' +
        '<li><a href="CommandMenu.html">Command Menu</a></li>' +

        '<li class="ui-sidebar-item-header">表单和表单控件</li>' +
        '<li><a href="AutoComplete.html">AutoComplete <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="BoxGroup.html">Box Group</a></li>' +
        '<li><a href="Checkbox.html">Checkbox</a></li>' +
        '<li><a href="ColorPicker.html">Color Picker <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="Form.html">Form</a></li>' +
        '<li><a href="Label.html">Label</a></li>' +
        '<li><a href="Region.html">Region</a></li>' +
        '<li><a href="RichSelectors.html">Rich Selectors <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="ToggleSelectors.html">Rich Toggle Selectors <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="Select.html">Select</a></li>' +
        '<li><a href="SearchBox.html">SearchBox</a></li>' +
        '<li><a href="Slider.html">Slider <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="Spinner.html">Spinner</a></li>' +
        '<li><a href="Schedule.html">Schedule</a></li>' +
        '<li><a href="Textbox.html">TextBox</a></li>' +
        '<li><a href="TextLine.html">TextLine</a></li>' +
        '<li><a href="TokenField.html">TokenField <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="ValidityLabel.html">Validity</a></li>' +

        '<li class="ui-sidebar-item-header">表单日历</li>' +
        '<li><a href="Calendar.html">Calendar</a></li>' +
        '<li><a href="MonthView.html">Month View</a></li>' +
        '<li><a href="MultiCalendar.html">Multi Calendar <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
        '<li><a href="RangeCalendar.html">Range Calendar</a></li>' +
        '<li><a href="RichCalendar.html">Rich Calendar</a></li>' +

        '<li class="ui-sidebar-item-header">导航</li>' +
        '<li><a href="Accordion.html">Accordion <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
        '<li><a href="Crumb.html">Breadcrumbs</a></li>' +
        '<li><a href="Carousel.html">Carousel <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="Link.html">Link</a></li>' +
        '<li><a href="Tab.html">Tab</a></li>' +
        '<li><a href="Tree.html">Tree</a></li>' +
        '<li><a href="Wizard.html">Wizard</a></li>' +

        '<li class="ui-sidebar-item-header">数据表格</li>' +
        '<li><a href="Filter.html">Filter <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
        '<li><a href="Pager.html">Pager</a></li>' +
        '<li><a href="Table.html">Table</a></li>' +

        '<li class="ui-sidebar-item-header">提示和消息</li>' +
        '<li><a href="Alert.html">Alert <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
        '<li><a href="Tip.html">Tip</a></li>' +
        '<li><a href="TipLayer.html">TipLayer</a></li>' +
        '<li><a href="Toast.html">Toast Notice</a></li>' +

        '<li class="ui-sidebar-item-header">其他</li>' +
        '<li><a href="Dialog.html">Dialog</a></li>' +
        '<li><a href="Drawer.html">Drawer</a></li>' +
        '<li><a href="LightBox.html">LightBox <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
        '<li><a href="Panel.html">Panel</a></li>' +
        '<li><a href="Sticky.html">Sticky <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>';

    function generateNav(id, items) {
        $(id).html(navItems);
        var url = window.location.pathname;
        var filename = url.substring(url.lastIndexOf('/')+1);
        $(id + ' a[href="' + filename + '"]').parent().addClass('ui-sidebar-item-active');
    }

    generateNav('#navigator', navItems);

    // 样式集合列表
    navItems = '<li class="ui-sidebar-item-header">样式集合</li>' +
        '<li><a href="button.html">Button</a></li>' +
        '<li><a href="checkbox.html">Checkbox</a></li>' +
        '<li><a href="dropdown.html">Dropdown</a></li>' +
        '<li><a href="form.html">Form</a></li>' +
        '<li><a href="image.html">Image</a></li>' +
        '<li><a href="input.html">Input</a></li>' +
        '<li><a href="label.html">Label</a></li>' +
        '<li><a href="loader.html">Loader</a></li>' +
        '<li><a href="mask.html">Mask</a></li>' +
        '<li><a href="navbar.html">Nav Bar</a></li>' +
        '<li><a href="panel.html">Panel</a></li>' +
        '<li><a href="progress.html">Progress</a></li>' +
        '<li><a href="submenu.html">Submenu</a></li>' +
        '<li><a href="text.html">Text</a></li>' +
        '<li><a href="type.html">Type</a></li>' +
        '<li><a href="wizard.html">Wizard</a></li>';
    generateNav('#navigator-esf', navItems);


});