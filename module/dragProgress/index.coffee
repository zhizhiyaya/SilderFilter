html = '''
<div class="m-dragprogress">
    <h2 class="caption">价格区间</h2>
    <div class="yo-dragprogress-hd">
        <ul class="range-list">
            {{#prices}}
            <li class="current" data-role="dp-point-name" style="left: {{left}}%">
                <span class="price">{{{name}}}</span><span class="doc"><i class="yo-ico">&#xf083;</i></span>
            </li>
            {{/prices}}
        </ul>
    </div>
    <div class="m-dragprogress-bd">
        <div class="range-bar" data-role="dp-progress">
            <span class="range-pointer range-pointer-left" data-left="true" ></span>
            <span class="range-pointer range-pointer-right" data-right="true"></span>
        </div>
    </div>
</div>

<div class="m-filter-ft">
    <button class="m-filter-btn m-filter-btn-submit js-submit">确定</button>
</div>
'''

module.exports = html