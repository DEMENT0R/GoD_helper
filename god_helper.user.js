// ==UserScript==
// @name         GoD Helper
// @namespace    God helper
// @version      0.31
// @description  try to take over the world!
// @icon         https://galaxyofdrones.com/favicon.ico
// @author       DEMENTOR
// @match        https://galaxyofdrones.com/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://raw.githubusercontent.com/Krinkle/jquery-json/master/dist/jquery.json.min.js
// @require      https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// @update       https://github.com/DEMENT0R/GoD_helper/raw/master/god_helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    //main variables
    var x_csrf_token = document.querySelector('meta[name="csrf-token"]').content;
    var x_xsrf_token = Cookies.get('XSRF-TOKEN');

    var incoming = 0;
    var planet = 0;
    var building = 0;
    var quantity = 0;
    var mineral = 1;
    var mineral_quantity = [0, 0, 0, 0, 0, 0, 0];
    var request_data;
    var raw_data;
    var request_url = "https://galaxyofdrones.com/";
    var data_response;
    //console.log("request_url = " + request_url);

    insertControlPanel ();
    startTimer ();

    function insertControlPanel (){
        $('.sidebar-nav').append('<center>'+
                                 '<a class="btn btn-default test" href="#" title="test">..</a>'+
                                 '<a class="btn btn-default transmute" href="#" title="Transmute">E</a>'+
                                 '<a class="btn btn-default trade" href="#" title="Trade">S</a>'+
                                 '</center>');
        $(".test").click(function() {
            test();
        });
        $(".transmute").click(function() {
            transmuteMinerals (134150, 10, 4);
        });
        $(".trade").click(function() {
            tradeMinerals (134140, 10, 4);
        });
    }

    function startTimer (){
        var i = 0;
        setInterval(function(){
            requestSendGet ("https://galaxyofdrones.com/api/planet");
            if (mineral_quantity[3] > 10){
                tradeMinerals (134140, 10, 4);
            }
        },1000);
    }

    function test (){
        //alert(planet);
        //alert(incoming);
        alert(mineral_quantity[3]);
    }

    //Transmute minerals
    //building_id: 3
    //test building num 408875
    function transmuteMinerals (building, quantity, mineral){
        //request_data = JSON.stringify({"quantity":quantity});
        request_data = $.toJSON({"quantity":quantity});
        request_url = "https://galaxyofdrones.com/api/producer/" + building +"/" + mineral;
        requestSendPost (request_url, request_data);
    }
    function tradeMinerals (building, quantity, mineral){
        //request_data = JSON.stringify({"quantity":{mineral: quantity}});
        switch (mineral) {
            case 1:
                request_data = $.toJSON({"quantity":{1: quantity}});
                break;
            case 2:
                request_data = $.toJSON({"quantity":{2: quantity}});
                break;
            case 3:
                request_data = $.toJSON({"quantity":{3: quantity}});
                break;
            case 4:
                request_data = $.toJSON({"quantity":{4: quantity}});
                break;
            case 5:
                request_data = $.toJSON({"quantity":{5: quantity}});
                break;
            case 6:
                request_data = $.toJSON({"quantity":{6: quantity}});
                break;
            case 7:
                request_data = $.toJSON({"quantity":{7: quantity}});
                break;
            default:
                alert( 'Я таких значений не знаю' );
        }
        request_url = "https://galaxyofdrones.com/api/movement/trade/" + building;
        requestSendPost (request_url, request_data);
    }

    //POST-request
    function requestSendPost (request_url, request_data){
        $.ajax({
            type: "POST",
            url: request_url,
            data: request_data,
            dataType: 'json',
            contentType: "application/json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('x-csrf-token', x_csrf_token);
                xhr.setRequestHeader('x-xsrf-token', x_xsrf_token);
                xhr.setRequestHeader('accept', 'application/json, text/javascript, */*; q=0.01');
            }
        });
    }

    //GET-request
    function requestSendGet (request_url){
        //request_url = "https://galaxyofdrones.com/api/planet";
        $.ajax({
            type: "GET",
            url: request_url,
            //dataType: 'json',
            //contentType: "application/json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('x-csrf-token', x_csrf_token);
                xhr.setRequestHeader('x-xsrf-token', x_xsrf_token);
                xhr.setRequestHeader('accept', 'application/json, text/javascript, */*; q=0.01');
            },
            success:  function(data) {
                planet = data.id;
                incoming = data.incoming;
                mineral_quantity[3] = data.resources[3].quantity;
                //alert(data.resources[3].quantity);

                //alert(data.test);
                //alert(data.toSource());
            }
        });
    }
})();
