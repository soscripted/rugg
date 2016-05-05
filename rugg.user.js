// ==UserScript==
// @name         RUGG
// @version      1.0.2
// @author       ᴉʞuǝ
// @description  Generate RawGit URLs directly from GitHub
// @namespace    https://github.com/soscripted
// @require      https://code.jquery.com/jquery-2.2.3.min.js
// @match        *://*.github.com/*
// @resource     html https://cdn.rawgit.com/soscripted/rugg/master/rugg.html
// @resource     css  https://cdn.rawgit.com/soscripted/rugg/master/rugg.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==
(function($) {

    function rawgit(url){
        var cdnDomain = 'cdn.rawgit.com';
        var devDomain = 'rawgit.com';

        var REGEX_GIST_URL = /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+\..+)$/i;
        var REGEX_RAW_URL  = /^(https?):\/\/raw\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+\..+)/i;
        var REGEX_REPO_URL = /^(https?):\/\/github\.com\/(.[^\/]+?)\/(.[^\/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i;

        var urls = {
            development: undefined,
            production: undefined
        };

        url = url.trim();

        if (REGEX_RAW_URL.test(url)) {
            urls.development =  url.replace(REGEX_RAW_URL, '$1://' + devDomain + '/$2/$3');
            urls.proudction = url.replace(REGEX_RAW_URL, '$1://' + cdnDomain + '/$2/$3');
        } else if (REGEX_REPO_URL.test(url)) {
            urls.development =  url.replace(REGEX_REPO_URL, '$1://' + devDomain + '/$2/$3/$4');
            urls.production =  url.replace(REGEX_REPO_URL, '$1://' + cdnDomain + '/$2/$3/$4');
        } else if (REGEX_GIST_URL.test(url)) {
            urls.development = url.replace(REGEX_GIST_URL, '$1://' + devDomain + '/$2');
            urls.production = url.replace(REGEX_GIST_URL, '$1://' + cdnDomain + '/$2');
        } else {
            throw 'There was an error generating RawGit urls for this file.';
        }

        return urls;

    }

    function inject(){
        var html = GM_getResourceText('html'),
            css  = GM_getResourceText('css');

        GM_addStyle(css);

        $('.file-header').has('a:contains(Raw)').append(html);

        $('.rawgit-pro, .rawgit-dev').on('click', function() {
            $(this).select();
        });

        var $actions = $('.file-actions').has('a:contains(Raw)'),
            $rawgit = $('<button/>', {
                value: 'RawGit',
                text: 'RawGit',
                class: 'btn btn-sm',
                click: function(e) {
                    e.preventDefault();
                    var $wrapper = $(this).parents('.file-header').find('.rawgit-wrapper');

                    if($wrapper.is(':visible')){
                        $wrapper.fadeOut();
                        return;
                    }

                    var $raw = $(this).parent().find('a:contains(Raw)');
                    var href = $raw.attr('href');
                    var url = 'https://' + location.host + href;

                    try {

                        var urls = rawgit(url);

                        var $production = $(this).parents('.file-header').find('.rawgit-pro');
                        var $development = $(this).parents('.file-header').find('.rawgit-dev');

                        $production.val(urls.production);
                        $development.val(urls.development);
                        $wrapper.fadeIn();
                    }
                    catch(err) {
                        alert(err);
                    }
                }
            });

        $actions.prepend($rawgit);
    }

    $(document)
        .ready(inject)
        .on('pjax:complete', inject);

}(jQuery));
