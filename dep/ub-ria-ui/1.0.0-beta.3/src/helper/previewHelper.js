/**
 * 构造图片,视频和Flash显示的HTML片段
 * @file previewHelper.js
 * @author chuzhenyang(chuzhenyang@baidu.com)
 */

define(function (require) {
    require('../FlashObject');

    var esui = require('esui/main');
    var $ = require('jquery');

    var previewHelper = {

        /**
         * 构造Image,Video,Flash和flv的HTML节点
         *
         * @param {Object=} options 渲染的参数
         *    {string} id 节点的id,如果不设置,则会给一个默认的id
         *    {string} url 资源的URL地址
         *    {string} type 资源的类型,共支持四种类型
         *    1.image: 图片类型
         *    2.flash: 带有'swf'后缀名的flash文件
         *    3.flv: 带有'flv'后缀名的视频文件
         *    4.video: 带有'mp4|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid'后缀名的文件
         *    {number|string} width 资源的宽度,对于图片而言,使用一个带‘px’的字符串,而其它三种类型则是数字
         *    {number|string} height 资源的高度,对于图片而言,使用一个带‘px’的字符串,而其它三种类型则是数字
         *    {string} title 对于video类型,可以为其添加一个title的属性
         *    {string} swfPath 用来播放flv格式视频的swf文件路径
         * @return {ELement} 构造好的HTML节点对象
         */
        preview: function (options) {
            var type = options.type || this.analysizeType(options.url);
            var previewNode = null;
            options.swfPath = options.swfPath;

            // 必须设置url,或者没有设置type同时通过analysizeType方法也无法拿到type,则直接返回
            if (!options.url || !type) {
                return;
            }

            switch (type.toLowerCase()) {
                case 'image':
                    previewNode = getImageHtml(options);
                    break;
                case 'flash':
                    previewNode = getFlashHtml(options);
                    break;
                case 'flv':
                    previewNode = getFlvHtml(options);
                    break;
                case 'video':
                    previewNode = getVideoHtml(options);
                    break;
            }

            return previewNode;
        },

        /**
         * 根据资源的URL地址分析出其所属类型
         *
         * @param {string} url 资源的URL地址
         * @return {string} 资源的type类型
         */
        analysizeType: function (url) {
            var type = '';
            if (/\.(?:jpg|png|gif|jpeg|bmp)$/i.test(url)) {
                type = 'image';
            }
            else if (/\.swf/i.test(url)) {
                type = 'flash';
            }
            else if (/\.(?:mp4|mov|mkv|mpg|avi|rmvb|rm|ogg|wmv|mp3|wma|mid)/i.test(url)) {
                type = 'video';
            }
            else if (/\.flv/i.test(url)) {
                type = 'flv';
            }

            return type;
        }
    };

    /**
     * 构造Image的HTML节点
     *
     * @param {Object=} options 渲染的参数
     *    {string} width 图片的宽度
     *    {string} height 图片的高度
     * @return {ELement} 构造好的图片节点对象
     */
    function getImageHtml(options) {
        var img = new Image();
        img.src = options.url;
        if (options.width) {
            img.style.width = options.width;
        }
        if (options.height) {
            img.style.height = options.height;
        }

        return img;
    }

    /**
     * 构造FLash的HTML节点
     *
     * @param {Object=} options 渲染的参数
     *    {string} id 节点的id,如果不设置,则会给一个默认的名为'preview-fla'的id
     *    {string} url FLash的URL地址
     *    {string} width FLash的宽度
     *    {string} height FLash的高度
     * @return {ELement} 构造好的FLash节点对象
     */
    function getFlashHtml(options) {
        return esui.create('FlashObject', {
            id: options.id || 'preview-fla',
            url: options.url,
            width: parseInt(options.width, 10),
            height: parseInt(options.height, 10),
            wmode: 'transparent'
        });
    }

    /**
     * 构造Flv视频的HTML节点
     *
     * @param {Object=} options 渲染的参数
     *    {string} id 节点的id,如果不设置,则会给一个默认的名为'preview-flv'的id
     *    {string} url Flv视频的URL地址
     *    {string} width Flv视频的宽度
     *    {string} height Flv视频的高度
     * @return {ELement} 构造好的Flv视频节点对象
     */
    function getFlvHtml(options) {
        return esui.create('FlashObject', {
            id: options.id || 'preview-flv',
            url: options.swfPath,
            width: options.width,
            height: options.height,
            wmode: 'transparent',
            flashvars: 'play_url=' + options.url
        });
    }

    /**
     * 构造video的HTML节点
     *
     * @param {Object=} options 渲染的参数
     *    {string} id 节点的id,如果不设置,则会给一个默认的名为'preview-video'的id
     *    {string} url video的URL地址
     *    {string} title video的title
     *    {string} width video的宽度
     *    {string} height video的高度
     * @return {ELement} 构造好的video节点对象
     */
    function getVideoHtml(options) {
        var video = document.createElement('VIDEO');
        var source = document.createElement('SOURCE');
        $(video).attr('id', options.id || 'preview-video');
        $(video).attr('title', (options.title || '') + '(提示：浏览器只支持H.264编码格式的MP4)');
        $(video).attr('autoplay', 'autoplay');
        $(video).attr('loop', 'loop');
        $(video).attr('controls', 'controls');
        $(video).attr('width', options.width);
        $(video).attr('height', options.height);
        $(source).attr('src', options.url);
        $(source).attr('type', 'video/mp4');
        $(video).append(source);

        return video;
    }

    return previewHelper;
});
