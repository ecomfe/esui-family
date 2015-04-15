/**
 * @file build默认配置
 * @author errorrik[errorrik@gmail.com]
 */
process.chdir(__dirname);
var cwd = process.cwd();
var path = require('path');
var fs = require('fs');

var args = {};
(function () {
    for (var i = 4; i < process.argv.length; i++) {
        var arg = process.argv[i];
        var pair = arg.split('=');
        var key = pair[0].substring(2);
        var value = pair[1] === undefined ? true : pair[1];
        args[key] = value;
    }
}());

/**
 * 输入目录
 *
 * @type {string}
 */
exports.input = cwd;

/**
 * 输出目录
 *
 * @type {string}
 */
exports.output = path.resolve(cwd, args.output || 'output');

/**
 * 排除文件pattern列表
 *
 * @type {Array}
 */
exports.exclude = [
    'edp-build-config.js',
    'module.conf',
    'README.md'
];

exports.getProcessors = function () {
    return [
        new ModuleCompiler({
            files: [
                'assets/build/*.js',
            ],
            getCombineConfig: function () {
                var config = {
                    'build/ui': {
                        files: ['~ub-ria-ui', '~esui', '~mini-event', '~moment', '~etpl', '~eoo', '~underscore']
                    }
                }

                return config;
            }
        }),
        new JsCompressor( {
                files: [
                    'assets/build/*.js'
                ],
                sourceMapOptions: {
                    enable: true
                }
            }
        ),
    ];
};

exports.injectProcessor = function ( processors ) {
    for ( var key in processors ) {
        global[ key ] = processors[ key ];
    }
};
