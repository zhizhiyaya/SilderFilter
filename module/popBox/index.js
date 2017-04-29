require('zepto-touch');
var util = require('../common/util.js');

var boxTpl = require('./index.coffee'),
    SWITCHBTN = '.js-switch-btn', // 默认在头里的开关按钮
    PAGE_HEADER = '.m-header-ugc',  // 页面的头
    BOX_CONTAINER = '.js-pop-box', // box container
    BOX_MASK = '.js-box-mask', // MASK
    BOX_HEIGHT = 192,
    OFFSET_TOP = 0, // IOS 记得 + 20
    HEADER_HEIGHT = 44,
    ANIMATION_DURATION = 200,
    isIos = false
    isLowerAd = false; // 低版本安卓

function PopBox(option) {
    this.root = option && option.context || document.body;
    this.option = util.extend({},
        {'height' : BOX_HEIGHT, 'offsetTop': OFFSET_TOP,'isNeedAddBox': true}, // isNeedAddBox 默认需要 append Box 到 body, 视实际情况而定, box 写在 view 里就可以时,需设为 false
        option);
    isIos = !!this.option.isIos;
    isLowerAd = !!this.option.isLowerAd;
    this.isOpen = false;
    this.hasBox = false;
}

PopBox.prototype = {
    constructor: PopBox,
    initPopBox: function () {
        this.initElement();
        this.renderBox();
        this.addSwitchEvent();
    },
    initElement: function () {
        this.container = this.option.isNeedAddBox ? $(boxTpl.boxTmpl) : $(this.root).find(BOX_CONTAINER);
        this.mask = this.option.isNeedAddBox ? $(boxTpl.maskTmpl) : $(this.root).find(BOX_MASK);

        this.viewHeader = $(this.root).find(PAGE_HEADER);
        this.switchBtn = $(this.root).find(SWITCHBTN);
    },
    renderBox: function () {
        if (this.option.isNeedAddBox) {

            var boxMask = !this.hasBox && $(document.body).find(BOX_MASK);
            if (boxMask.length === 0) {

                this._addPopBox();
            }
        } else {
            this._setPopBoxStyle();
        }
    },
    addSwitchEvent: function () {
        var self = this;
        self.switchBtn.on('tap', function (e) {
			e.stopPropagation();
            self.switch();
        });

        self.container.on('touchmove', function(e) {
            e.stopPropagation();
        });
    },
    // 单击操作下 显示或隐藏
    switch: function () {

        var self = this;

        if (self.isOpen) {
            self.animateHide();
        } else {
            self.show();
        }
    },
    /**
     * @method 显示 GEO 筛选
     */
    show: function () {
        var self = this;

        // 左滑块容易触发回退手势,回退到上个页面,这里禁用一下
        self.option.onShow && self.option.onShow();

        if (self.option.isNeedAddBox && !self.isCloneHeader) {

            self._cloneHeader();
        }

        self.isOpen = true;
        // menu show
        var targetTransformY = Math.floor(BOX_HEIGHT);

        if (this.option.isNeedAddBox) {
            targetTransformY += HEADER_HEIGHT + this.option.offsetTop
        }

        var targetTransformYCssRule = 'translateY(' + targetTransformY + 'px)';



        if (isLowerAd) {
            // 低版本安卓
            self.container.addClass('not-animated');
        } else {
            //可用动画的
            self.container.removeClass('not-animated');
        }

        self.container
            .css({
                'transform': targetTransformYCssRule,
                '-webkit-transform': targetTransformYCssRule
            });

        self.mask.show();

        self.option.isNeedAddBox && setTimeout(function () {

            self._removeFakeHeader();

        }, ANIMATION_DURATION * 2);
    },
    /**
     * @method 带动画的隐藏 BOX
     */
    animateHide: function () {

        var self = this;

        if (self.option.isNeedAddBox && !self.isCloneHeader) {

            this._cloneHeader();
        }

        self._setTranslateY();

        self.mask.hide();

        setTimeout(function () {

            self.option.isNeedAddBox && self._removeFakeHeader();

            self.isOpen = false;  // 保证菜单已被收起

        }, ANIMATION_DURATION * 2);

        // 恢复手势回退
        self.option.onHide && self.option.onHide();
    },
    /**
     * @method 不带动画的隐藏 BOX, 比如在发现页切换到别的页面时
     */
    hide: function () {
        var self = this;

        self.container.addClass('not-animated');
        self.mask.hide();

        self.isOpen = false;

        self._setTranslateY();

        // 恢复手势回退
        self.option.onHide();
    },
    //设置
    _setTranslateY: function () {
        var self = this;
        var targetTransformYCssRule = 'translateY(0)';

        self.container.css({
            'transform': targetTransformYCssRule,
            '-webkit-transform': targetTransformYCssRule
        });
    },
    /**
     * @method 将容器和 mask 添加到body
     */
    _addPopBox: function () {
        this._setPopBoxStyle();
        this.container.appendTo(document.body);

        this.mask.css({
                display: 'none',
                top: BOX_HEIGHT
            })
            .appendTo(document.body);
    },
    _setPopBoxStyle: function () {
        var styleOpt = {
            top: -BOX_HEIGHT,
            height: BOX_HEIGHT
        };
        if (this.option.isNeedAddBox) {
            styleOpt = util.extend({}, styleOpt, {'zIndex': 3001})
        }

        this.container.css(styleOpt);
    },
    _cloneHeader: function () {

        var cssRule = {
            'zIndex': 9999
        };

        this.fakeHeader = $(this.viewHeader).clone();

        var iHeight = $(this.viewHeader).height();
        var fakeHeaderHeight = iHeight + 20 + 'px';

        isIos && util.extend(cssRule, {'paddingTop': this.option.offsetTop, 'height': fakeHeaderHeight});

        this.fakeHeader.css(cssRule)
            .appendTo(document.body);

        this.isCloneHeader = true;
    },
    //移除假头
    _removeFakeHeader: function () {
        var self = this;
        if (self.isCloneHeader && self.fakeHeader) {
            self.fakeHeader.remove();
            self.isCloneHeader = false;
        }
    }
};

module.exports = PopBox;
