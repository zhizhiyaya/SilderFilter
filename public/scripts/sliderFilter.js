require('zepto-touch');

var util = require('../../module/common/util.js');

var PopBox = require('../../module/popBox/index.js');
var Slider = require('../../module/slider/index.js');

function SliderFilter(options) {
    PopBox.call(this, options);
    this.init();
}

SliderFilter.prototype = {
    constructor: SliderFilter,
    init: function () {
        this.slider = new Slider();
        this.initElement();debugger 
        this.slider.container.prependTo(this.container);
        this.renderBox();
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
            self.slider.reviseProgress();
            self.animateHide();
        });
    },
    filter: function () {
        var self = this;
        var filterData = self.slider.getSelectedData();

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
        this.slider.resetProgress();
        this.filter();
    }
};
SliderFilter.prototype = util.extend({}, new PopBox(), SliderFilter.prototype);

module.exports = SliderFilter;
