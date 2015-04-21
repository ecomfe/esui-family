$(function () {
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
    Prism.highlightAll();
});