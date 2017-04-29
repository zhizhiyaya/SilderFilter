html = '''
<div class="m-slider">
    <h2 class="caption">价格区间</h2>
    <div class="m-slider-hd">
        <ul class="range-list">
            {{#data}}
            <li class="current" data-role="dp-point-name" style="left: {{left}}%">
                <span class="price">{{{name}}}</span><span class="doc">·</span>
            </li>
            {{/data}}
        </ul>
    </div>
    <div class="m-slider-bd">
        <div class="slider-bar" data-role="slider-bar">
            <span class="slider-handle slider-handle-left" data-left="true" ></span>
            <span class="slider-handle slider-handle-right" data-right="true"></span>
        </div>
    </div>
</div>

<div class="m-filter-ft">
    <button class="m-filter-btn m-filter-btn-submit js-submit">确定</button>
</div>
'''

module.exports = html
