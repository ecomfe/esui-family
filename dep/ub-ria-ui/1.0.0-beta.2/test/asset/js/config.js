require.config({
    'waitSeconds': 2,
    'baseUrl': '../..',
    'packages': [
        {
            'name': 'ubRiaUi',
            'location': 'src',
            'main': 'main'
        },
        {
            'name': 'esui',
            'location': 'dep/esui/3.2.0-beta.2/src',
            'main': 'main'
        },
        {
            'name': 'mini-event',
            'location': 'dep/mini-event/1.0.2/src',
            'main': 'main'
        },
        {
            'name': 'underscore',
            'location': 'dep/underscore/1.5.2/src',
            'main': 'underscore'
        },
        {
            'name': 'moment',
            'location': 'dep/moment/2.7.0/src',
            'main': 'moment'
        },
        {
            'name': 'etpl',
            'location': 'dep/etpl/3.0.1/src',
            'main': 'main'
        },
        {
            'name': 'eoo',
            'location': 'dep/eoo/0.1.4/src',
            'main': 'main'
        },
        {
            'name': 'jquery',
            'location': 'dep/jquery/1.9.1/src',
            'main': 'jquery.min'
        },
        {
            'name': 'eicons',
            'location': 'dep/eicons/1.0.0-beta.1/src',
            'main': 'main.less'
        },
        {
            'name': 'esf',
            'location': 'dep/esf/1.0.0-rc.2/src'
        },
        {
            'name': 'est',
            'location': 'dep/est/1.3.0/src'
        },
        {
            'name': 'unit',
            'location': 'test/unit'
        }
    ],
    'paths': {
        'jquery-simulate': 'test/third-party/jquery.simulate'
    },
    'shim': {
        'jquery-simulate': ['jquery'],
        'matchers': ['jasmine']
    }
});
