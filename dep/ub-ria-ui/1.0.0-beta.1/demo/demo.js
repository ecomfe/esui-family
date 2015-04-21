require.config({
    'baseUrl': '../src',
    'paths': {},
    'packages': [
        {
            'name': 'mini-event',
            'location': '../dep/mini-event/1.0.2/src',
            'main': 'main'
        },
        {
            'name': 'underscore',
            'location': '../dep/underscore/1.5.2/src',
            'main': 'underscore'
        },
        {
            'name': 'moment',
            'location': '../dep/moment/2.7.0/src',
            'main': 'moment'
        },
        {
            'name': 'etpl',
            'location': '../dep/etpl/3.0.0/src',
            'main': 'main'
        },
        {
            'name': 'esui',
            'location': '../dep/esui/3.2.0-beta.1/src',
            'main': 'main'
        },
        {
            'name': 'eoo',
            'location': '../dep/eoo/0.1.1/src',
            'main': 'main'
        },
        {
            'name': 'er',
            'location': '../dep/er/3.1.0-beta.6/src',
            'main': 'main'
        },
        {
            'name': 'ef',
            'location': '../dep/ef/3.1.0-beta.3/src',
            'main': 'main'
        },
        {
            'name': 'eicons',
            'location': '../dep/eicons/1.0.0-beta.1/src',
            'main': 'main.less'
        },
        {
            'name': 'esf',
            'location': '../dep/esf/1.0.0-beta.1/src'
        },
        {
            'name': 'est',
            'location': '../dep/est/1.3.0/src'
        }
    ]
});

$(function () {
    function hideSource(e) {
        $('.source-visible').removeClass('source-visible');
    }

    function viewSource(e) {
        var target = $(e.target);
        var section = target.closest('.view');
        hideSource();
        if (target.hasClass('view-markup')) {
            section.find('.source-markup').addClass('source-visible');
        }
        else if (target.hasClass('view-script')) {
            section.find('.source-script').addClass('source-visible');
        }
    }

    $('.view').on('click', '.viewer li', viewSource);
    $('.source, .viewer li').on('mousedown', false);
    //$('html').on('mousedown', hideSource);

    var navItems = [
        '<li><a href="Accordion.html">Accordion</a></li>',
        '<li><a href="Alert.html">Alert</a></li>',
        '<li><a href="AutoComplete.html">AutoComplete</a></li>',
        '<li><a href="Carousel.html">Carousel</a></li>',
        '<li><a href="ColorPicker.html">ColorPicker</a></li>',
        '<li><a href="Filter.html">Filter</a></li>',
        '<li><a href="LightBox.html">LightBox</a></li>',
        '<li><a href="MultiCalendar.html">MultiCalendar</a></li>',
        '<li><a href="Slider.html">Slider</a></li>',
        '<li><a href="Spinner.html">Spinner</a></li>',
        '<li><a href="Sticky.html">Sticky</a></li>',
        '<li><a href="TokenField.html">TokenField</a></li>',
        '<li><a href="ToggleSelectors.html">ToggleSelectors</a></li>',
        '<li><a href="RichSelectors.html">RichSelectors</a></li>'
        //'<li><a href="Uploader.html">Uploader</a></li>'

    ];
    $('#navigator').html(navItems.join(''));

    $('.example').each(function (index, item) {
        var $sample = $('<pre class="source source-markup"><code class="language-markup"></code></pre>');
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
    //Prism.highlightAll();
});
var ready = (function () {
    var list = [];
    return function (callback) {
        if (callback) {
            list.push(callback);
        }
        else {
            for (var i = 0; i < list.length; i++) {
                list[i]();
            }
            ready = function (callback) {
                callback();
            };
        }
    }
}());
