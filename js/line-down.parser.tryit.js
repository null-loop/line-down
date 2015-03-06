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

(function (ld, $, undefined) {
  $('#regenerateLinedown').click(function() {
      var linedownContent = $('#linedownInput')[0].value;
      var html = ld.parse(linedownContent);
      $('#linedownOutput')[0].value = html;

      var dom = $(html);
      $('#linedownHtml').empty();
      $('#linedownHtml').append(dom);
  });


  //var a = document.getElementById('a');
  //var b = document.getElementById('b');
  //var result = document.getElementById('result');

  function diffResult(expected, actual, result) {
    var diff = JsDiff[diffChars](a.textContent, b.textContent);
    var fragment = document.createDocumentFragment();
    for (var i=0; i < diff.length; i++) {

      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        var swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }

      var node;
      if (diff[i].removed) {
        node = document.createElement('del');
        node.appendChild(document.createTextNode(diff[i].value));
      } else if (diff[i].added) {
        node = document.createElement('ins');
        node.appendChild(document.createTextNode(diff[i].value));
      } else {
        node = document.createTextNode(diff[i].value);
      }
      fragment.appendChild(node);
    }

    result.textContent = '';
    result.appendChild(fragment);
  }

  window.onload = function() {
    onDiffTypeChange(document.querySelector('#settings [name="diff_type"]:checked'));
    changed();
  };

  a.onpaste = a.onchange =
  b.onpaste = b.onchange = changed;

  if ('oninput' in a) {
    a.oninput = b.oninput = changed;
  } else {
    a.onkeyup = b.onkeyup = changed;
  }

  function onDiffTypeChange(radio) {
    window.diffType = radio.value;
    document.title = "Diff " + radio.value.slice(4);
  }

  var radio = document.getElementsByName('diff_type');
  for (var i = 0; i < radio.length; i++) {
    radio[i].onchange = function(e) {
      onDiffTypeChange(e.target);
      changed();
    }
  }


})(window.linedown = window.linedown || {}, jQuery)
