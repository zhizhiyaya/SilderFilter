require('zepto-touch');

var util = require('../../module/common/util.js');

var PopBox = require('../../module/popBox/index.js'),
    DragProgress = require('../../module/dragProgress/index.js');

function DragFilter (options) {
    PopBox.call(this, options);
    this.init();
}

DragFilter.prototype = {
    constructor: DragFilter,
    init: function () {
        this.dragProgress = new DragProgress();
        this.initElement();
        this.dragProgress.container.prependTo(this.container);
        this.renderBox();
		debugger
		this.addSwitchEvent();
        this.addEvent();
    },
    addEvent: function (options) {
        var self = this;
        self.container.on('touchmove', function(e) {
            e.stopPropagation();
        });
        self.container.on('tap', '.js-submit', function () {
            self.filter();
        });

        self.mask.on('touchmove', function (e) {
            e.stopPropagation();
        });

        self.mask.on('tap', function (e) {
            e.preventDefault();
            self.dragProgress.reviseProgress();
            self.animateHide();
        });
    },
    filter: function () {
        var self = this;
        var filterData = self.dragProgress.getSelectedData();

        if (filterData ){
            self.option.callback && self.option.callback(filterData);

            if (filterData === '' || filterData === '0,不限') {
                self.switchBtn.html('筛选');
            } else {
                self.switchBtn.html('已筛选');
            }
        }
        self.animateHide();
    },
    reset: function () {
        this.dragProgress.resetProgress();
        this.filter();
    }
};
DragFilter.prototype = util.extend({}, new PopBox(), DragFilter.prototype);

module.exports = DragFilter;
