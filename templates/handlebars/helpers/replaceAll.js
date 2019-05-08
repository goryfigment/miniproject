module.exports = function(str, find, replace) {
    return String(str).replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace);
};