/* Author: Mingi mees

*/

$(document).ready(function(){
  $('#front-slider').tinycarousel({ pager: true, interval: false});
});

function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 3; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
$(document).ready(function(){
  var url = "http://chart.apis.google.com/chart?cht=qr&chs=340x340&chld=L&choe=UTF-8&chl=http%3A%2F%2Fmegaspkr.com%2F";
  var url2 = "http://megaspkr.com/";
  var uid = makeid();
  var urluid = url + uid;
  var urluid2 = url2 + uid;
  $(".uid").append(uid);
  $("img.right").attr("src", urluid);
  $(".beBtn a").attr("href", urluid2);
  $(".createBtn a").attr("href", urluid2);
  $(".slide3 iframe").attr("src", urluid2);
});
