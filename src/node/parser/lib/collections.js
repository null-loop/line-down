exports.each=function(n,t){for(var r in n)n.hasOwnProperty(r)&&t(r,n[r])},exports.contains=function(n,t){return exports.containsByPredicate(n,function(n,r){return r===t})},exports.containsByPredicate=function(n,t){var r=!1;return exports.each(n,function(n,e){t(n,e)&&(r=!0)}),r};