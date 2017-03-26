require('zepto-touch');

var Hogan = require('hogan.js');
var util = require('../common/util.js');
var dragprogressTpl = require('./index.coffee'),
    PRICE_CONSTANT = require('./PRICE_CONSTANT.js');

function DragProgress(data) {

    this.data = this.formatData(data || PRICE_CONSTANT);
    this.maxWidth = 0; // 纪录的实际的 px
    this.curWidth = 1;
    this.init();
}

DragProgress.prototype = {

    constructor: DragProgress,

    init: function () {
        this.getSelectedData();
        this.initElement();
        this.bindEvents();
    },

    bindEvents: function () {
        var self = this;

        // progress 作为一个整体,只需改变其 left 和 width, 因为两个按钮相对于它绝对定位的
        // 给两个 按钮注册事件, 是为了区分左右 , 更好处理逻辑
        self.progress
            .on('touchstart', '.range-pointer ', self._dragStart.bind(self))
            .on('touchmove', '.range-pointer ', self._dragMove.bind(self))
            .on('touchend', '.range-pointer ', self._dragEnd.bind(self));

        self.container.on('tap', '.js-submit', function () {
            self.filter();
        });

        //self.mask.on('touchmove', function (e) {
        //    e.stopPropagation();
        //});
        //
        //self.mask.on('tap', function (e) {
        //    e.preventDefault();
        //    self.dragProgress.reviseProgress();
        //    self.animateHide();
        //});
    },

    initElement: function () {

        var template = Hogan.compile(dragprogressTpl);

        this.container = $(template.render({
            'prices': this.data
        }));
        //
        //// 拖拽的进度条
        this.progress = this.container.find('[data-role="dp-progress"]');
        //// 对应进度条的相应的文案
        this.points = this.container.find('[data-role="dp-point-name"]');
    },
    setProgressParam: function () {
        this.maxWidth = this.progress.width();
    },
    _dragStart: function (e) {
        e.preventDefault();

        if (!this.maxWidth) {
            this.setProgressParam();
        }
        var targetTouches = e.targetTouches[0];

        this.prvTouchX = targetTouches.clientX;

        this.realLeft = parseInt(this.progress.css('left'), 10) / 100;
        this.realRight = parseInt(this.progress.css('right'), 10) / 100;

        this.progress.removeClass('transition');
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

        this.progress.addClass('transition');

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
        var targetData = $(target).data(),
            towardLeft = !!targetData.left,
            progressStyle = {},
            isMin = this._isMinStatus();

        var curLeft = this.reviseRealPos(this.realLeft + xSpacing / this.maxWidth);
        var curRight = this.reviseRealPos(this.realRight - xSpacing / this.maxWidth);

        if (towardLeft) {

            if (this.realLeft <= 0 && xSpacing < 0 || this.realLeft >= this.maximum && xSpacing > 0) {
                return;
            }

            if (xSpacing > 0 && isMin) {
                this.realRight = curRight;
                progressStyle = {'right': curRight};
            }

            this.realLeft = curLeft;
            progressStyle = util.extend({}, progressStyle, {'left': curLeft});
        } else {

            if (this.realRight <= 0 && xSpacing > 0 || this.realRight >= this.maximum && xSpacing < 0) {
                return;
            }
            if (isMin && xSpacing < 0) {
                this.realLeft = curLeft;
                progressStyle = {'left': curLeft};
            }

            this.realRight = curRight;
            progressStyle = util.extend({}, progressStyle, {'right': curRight});
        }
        var curWidth = 1 - this.realLeft - this.realRight;
        this.curWidth = curWidth;
        this._setStyle(progressStyle);
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
    _setStyle: function (progressStyle) {

        this._setSelectedDataIndex();

        for (key in progressStyle) {
            progressStyle[key] = progressStyle[key] * 100 + '%';
        }
        this.progress.css(progressStyle);

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
    reviseProgress: function () {
        var len = this.data.length;
        var allSelect = this.data[0].value + ',' + this.data[len - 1].value;
        if (this.selectedData === '' || this.selectedData === allSelect) {
            this.resetProgress();
        }
    },
    resetProgress: function () {
        this.realLeft = 0;
        this.realRight = 0;
        this._setStyle({
            'left': 0,
            'right': 0
        });
    }
};

module.exports = DragProgress;
