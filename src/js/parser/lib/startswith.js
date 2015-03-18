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

var col = require('./collections.js');
var digits = '0123456789';

exports.startsWith = function (symbol, line, fixedCount, preserveWhitespace, allowFloatingNumber) {
    var doesStartWith = false;
    var r = line;
    var count = 0;
    var f = false;
    var numberCount = '';
    var inClasses = false;
    var inId = false;
    var inData = false;
    var classes = '';
    var id = '';
    var data = '';
    var inferBaseCss = false;
    var allSymbol = symbol;
    if (allSymbol.length && allSymbol.length > 1)
    {
        symbol = allSymbol[0];
    }

    while (r.length > 0 && !f) {
        var c = r[0];
        if (c == symbol && !inData && !inClasses && !inId) {
            count++;
            if (allSymbol.length && allSymbol.length > 1 && count <= allSymbol.length)
            {
                symbol = allSymbol[count];
                doesStartWith = true;
            }
            else
            {
                doesStartWith = true;
            }
            r = r.substring(1);
        }
        else if (col.contains(digits, c) && !inClasses && !inId && ((count == 1) || (count > 1 && allowFloatingNumber))) {
            numberCount = numberCount + c;
            r = r.substring(1);
        }
        else if (c == '@' && !inClasses && count > 0) {
            inClasses = true;
            inId = false;
            r = r.substring(1);
        }
        else if (c == '@' && inClasses && classes.length === 0 && !inferBaseCss){
            inferBaseCss = true;
            r = r.substring(1);
        }
        else if (c == '@' && inClasses) {
            inClasses = false;
            r = r.substring(1);
        }
        else if (c == '?' && !inId && count > 0) {
            inId = true;
            inClasses = false;
            r = r.substring(1);
        }
        else if (c == '?' && inId) {
            inId = false;
            r = r.substring(1);
        }
        else if (c == '$' && !inData && count > 0)
        {
            inData = true;
            r = r.substring(1);
        }
        else if (c == '$' && inData){
            inData = false;
            r = r.substring(1);
        }
        else if (inClasses && c != ' ' && c != '?') {
            classes = classes + c;
            r = r.substring(1);
        }
        else if (inId && c != ' ' && c != '@') {
            id = id + c;
            r = r.substring(1);
        }
        else if (inData && c!= ' ' && c!='$'){
            data = data + c;
            r = r.substring(1);
        }
        else if (count > 0) {
            f = true;
        } else {
            doesStartWith = false;
            f = true;
        }
    }

    if (numberCount.length > 0 && !allowFloatingNumber) {
        count = parseInt(numberCount);
    }
    if (!preserveWhitespace) {
        r = r.trim();
    }

    if (fixedCount && count != fixedCount) {
        // no match
        return {
            startsWith: false,
            remainingLine: line
        };
    }

    if (classes && inferBaseCss) {
        var sc = classes.split('&');
        var extras = [];
        col.each(sc,function(k,v){
            if (v.indexOf('-')!=-1){
                var cs = v.split('-');
                var ex = cs[0];
                if (!col.contains(extras,ex) && !col.contains(sc,ex)) extras.push(ex);
            }
        });
        var extraClasses='';
        var eci = 0;
        col.each(extras,function(k,v){
            extraClasses=extraClasses+(eci>0?'&':'')+v;
            eci++;
        });
        if (extraClasses.length>0){
            classes = extraClasses + '&' + classes;
        }
    }

    var dataPairs;
    if (data && data.length > 0)
    {
        dataPairs = [];
        // split by & then by =
        var pairs = data.split('&');
        col.each(pairs,function(k,v){
            var pair = v.split('=');
            var key = '';
            var value = '';
            if (pair.length==1){
                key = 'id';
                value = pair[0];
            }
            else
            {
                key = pair[0];
                value = pair[1];
            }
            dataPairs.push({
                key:key,
                value:value
            });
        });
    }

    return {
        id: id,
        classes: classes,
        dataPairs:dataPairs,
        startsWith: doesStartWith,
        symbol: symbol,
        symbolCount: count,
        remainingLine: r,
        numberCapture:numberCount
    };
};