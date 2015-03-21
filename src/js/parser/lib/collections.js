/*
 Copyright (C) 2015 Daniel Gray, Grayholme Ltd

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
exports.each = function(a,h){
    for(var n in a){
        if (a.hasOwnProperty(n)){
            h(n,a[n]);
        }
    }
};

exports.contains = function(a,o){
    return exports.containsByPredicate(a,function(k,v){
        return v===o;
    });
};

exports.containsByPredicate = function(a,p){
    var has = false;
    exports.each(a,function(k,v){
        if (p(k,v)) { has = true; }
    });
    return has;
};