var $ = require('zepto');
require('zepto-touch');

var Hogan = require('hogan.js');
var util = require('../common/util.js');
var sliderTpl = require('./index.coffee'),
    PRICE_CONSTANT = require('./PRICE_CONSTANT.js');

function Slider(data) {

    this.data = this.formatData(data || PRICE_CONSTANT);
    this.maxWidth = 0; // 纪录的实际的 px
    this.curWidth = 1;
    this.init();
}

Slider.prototype = {

    constructor: Slider,

    init: function () {
        this.getSelectedData();
        this.initElement();
        this.bindEvents();
    },

    bindEvents: function () {
        var self = this;

        // bar 作为一个整体,只需改变其 left 和 width, 因为两个按钮相对于它绝对定位的
        // 给两个 按钮注册事件, 是为了区分左右 , 更好处理逻辑
        self.bar
            .on('touchstart', '.slider-handle', self._dragStart.bind(self))
            .on('touchmove', '.slider-handle', self._dragMove.bind(self))
            .on('touchend', '.slider-handle', self._dragEnd.bind(self));

        self.container.on('tap', '.js-submit', function () {
            self.filter();
        });
    },

    initElement: function () {

        var template = Hogan.compile(sliderTpl);
        this.container = $(template.render({
			'data': this.data
		}));
        //// 拖拽的进度条
        this.bar = this.container.find('[data-role="slider-bar"]');
        //// 对应进度条的相应的文案
        this.points = this.container.find('[data-role="dp-point-name"]');
    },
    setBarParam: function () {
        this.maxWidth = this.bar.width();
    },
    _dragStart: function (e) {
        e.preventDefault();

        if (!this.maxWidth) {
            this.setBarParam();
        }
        var targetTouches = e.targetTouches[0];

        this.prvTouchX = targetTouches.clientX;

        this.realLeft = parseInt(this.bar.css('left'), 10) / 100;
        this.realRight = parseInt(this.bar.css('right'), 10) / 100;

        this.bar.removeClass('transition');
    },
    _dragMove: function (e) {
        e.preventDefault();

        this.curTouchX = e.targetTouches[0].clientX;
        var xSpacing = this.curTouchX - this.prvTouchX;
        this.prvTouchX = this.curTouchX;

        this._towardLeftOrRight(e.target, xSpacing);
    },
    _dragEnd: function (e) {
        e.preventDefault();

        this.realLeft = this.reviseEndPos(this.realLeft);
        this.realRight = this.reviseEndPos(this.realRight);

        if (this.realLeft + this.realRight === 1) {
            this.curWidth = this.minimum;
            this.realRight = 1 - this.minimum - this.realLeft;
        }

        this.bar.addClass('transition');

        this._setStyle({
            'left': this.realLeft,
            'right': this.realRight
        });

    },
    getSelectedData: function () {
        var curSelected = this.data[this.leftIndex].value
            + ','
            + this.data[this.rightIndex].value;
        if (curSelected !== this.selectedData) {
            this.selectedData = curSelected;
            return this.selectedData;
        }
        return false;
    },
    //判断触点倾向与左边还是右边
    _towardLeftOrRight: function (target, xSpacing) {
        var towardLeft = !!$(target).data('left'),
            barStyle = {},
            isMin = this._isMinStatus();

        var curLeft = this.reviseRealPos(this.realLeft + xSpacing / this.maxWidth);
        var curRight = this.reviseRealPos(this.realRight - xSpacing / this.maxWidth);

        if (towardLeft) {

            if (this.realLeft <= 0 && xSpacing < 0 || this.realLeft >= this.maximum && xSpacing > 0) {
                return;
            }

            if (xSpacing > 0 && isMin) {
                this.realRight = curRight;
                barStyle = {'right': curRight};
            }

            this.realLeft = curLeft;
            barStyle = util.extend({}, barStyle, {'left': curLeft});
        } else {

            if (this.realRight <= 0 && xSpacing > 0 || this.realRight >= this.maximum && xSpacing < 0) {
                return;
            }
            if (isMin && xSpacing < 0) {
                this.realLeft = curLeft;
                barStyle = {'left': curLeft};
            }

            this.realRight = curRight;
            barStyle = util.extend({}, barStyle, {'right': curRight});
        }
        var curWidth = 1 - this.realLeft - this.realRight;
        this.curWidth = curWidth;
        this._setStyle(barStyle);
    },
    reviseRealPos: function (pos) {
        return pos <= this.maximum ? pos < 0 ? 0 : pos : this.maximum;
    },
    reviseEndPos: function (pos) {
        var posInt = Math.floor(pos / this.minimum);
        if (pos % this.minimum >= this.minimum / 2) {
            return (posInt + 1) * this.minimum;
        }
        return posInt * this.minimum;
    },
    _isMinStatus: function () {
        if (this.curWidth <= this.minimum) {
            return true;
        }
        return false;
    },
    _setSelectedDataIndex: function () {
        this.leftIndex = Math.round(this.realLeft / this.minimum);

        this.rightIndex = Math.round(this.data.length - 1 - this.realRight / this.minimum);
    },
    _setStyle: function (barStyle) {

        this._setSelectedDataIndex();

        for (key in barStyle) {
            barStyle[key] = barStyle[key] * 100 + '%';
        }
        this.bar.css(barStyle);

        if (this.leftIndex > 0) {

            this.points.slice(0, this.leftIndex).removeClass('current');
        }

        if (this.rightIndex < this.points.length - 1) {
            this.points.slice(this.rightIndex + 1).removeClass('current');
        }

        this.points.slice(this.leftIndex, this.rightIndex + 1).addClass('current');
    },
    formatData: function (data) {
        var len = util.isArray(data) && data.length || 0;

        if (!len) {
            return [];
        }

        var itemWidth = 1 / (len - 1);
        this.minimum = itemWidth; //最小宽度比
        this.maximum = itemWidth * (len - 2); //最大移动范围
        this.leftIndex = 0;
        this.rightIndex = len - 1;
        itemWidth *= 100;

        return len && data.map(function (elem, index, arr) {
                elem.width = itemWidth;
                elem.left = index * itemWidth;
                return elem;
            });
    },
    reviseBar: function () {
        var len = this.data.length;
        var allSelect = this.data[0].value + ',' + this.data[len - 1].value;
        if (this.selectedData === '' || this.selectedData === allSelect) {
            this.resetBar();
        }
    },
    resetBar: function () {
        this.realLeft = 0;
        this.realRight = 0;
        this._setStyle({
            'left': 0,
            'right': 0
        });
    }
};

module.exports = Slider;
