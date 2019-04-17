var $ = require('jquery');

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace);
}

function comparer(index) {
    return function(a, b) {
        var valA = parseFloat(replaceAll(getCellValue(a, index),',', '')), valB = parseFloat(replaceAll(getCellValue(b, index), ',', ''));
        return valA - valB;
    }
}

function getCellValue(row, index) {
    return $(row).children('td').eq(index).html()
}

$(document).ready(function() {
    $(document).on('click', '.sortable', function () {
        var $this = $(this);
        var $sortable = $this.closest('table').find('.sortable');
        for (var s = 0; s < $sortable.length; s++){
            if($sortable[s] != this) {$sortable[s].asc = false;}
            $($sortable[s]).removeClass('ascending').removeClass('descending');
        }
        var table = $this.parents('table').eq(0);
        var rows = table.find('tr:gt(0)').toArray().sort(comparer($this.index()));

        this.asc = !this.asc;
        if (!this.asc){
            rows = rows.reverse();
            $this.addClass('descending');
        } else {
            $this.addClass('ascending');
        }
        for (var i = 0; i < rows.length; i++){table.append(rows[i])}
    });
});