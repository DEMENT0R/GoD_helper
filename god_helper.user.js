// ==UserScript==
// @name         GoD Helper
// @namespace    God helper
// @version      0.41.09
// @description  GoD helper
// @icon         https://play.galaxyofdrones.com/favicon.ico
// @author       DEMENTOR
// @match        https://*.galaxyofdrones.com/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://raw.githubusercontent.com/Krinkle/jquery-json/master/dist/jquery.json.min.js
// @require      https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// @downloadURL  https://github.com/DEMENT0R/GoD_helper/raw/master/god_helper.user.js
// @updateURL    https://github.com/DEMENT0R/GoD_helper/raw/master/god_helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    var $ = window.jQuery;

    //main variables
    var x_csrf_token = document.querySelector('meta[name="csrf-token"]').content;
    var x_xsrf_token = Cookies.get('XSRF-TOKEN');

    var incoming = 0;
    var planet = 0;
    var building = 0;
    var quantity = 0;
    var mineral = 1;
    var mineral_quantity = [0, 0, 0, 0, 0, 0, 0, 0];
    var drones_quantity = [0, 0, 0, 0, 0, 0, 0, 0];
    var drones_storage_quantity = [0, 0, 0, 0, 0, 0, 0, 0];
    var data;
    var grids;
    var request_data;
    var raw_data;
    var request_url = "https://play.galaxyofdrones.com/";
    var data_response;
    //console.log("request_url = " + request_url);

    insertControlPanel ();
    startTimer ();
    requestSendGet ("https://play.galaxyofdrones.com/api/planet");

    function insertControlPanel (){
        $('.player').append('<center><div class="player-energy" style="top: 142px;">'+
                                 '<a class="btn upgrade" href="#" title="Full Upgrade">Up</a>|'+
                                 '<a class="btn trade" href="#" title="Trade minerals">Sell</a>|'+
                                 '<a class="btn train" href="#" title="Train scouts">Scouts</a>'+
                            '</div></center>');
        $(".upgrade").click(function() {
            fullUpgrade ();
        });
        $(".trade").click(function() {
            tradeMinerals (134140, 100, 4);
        });
        $(".train").click(function() {
            buyDrones (134142, 1, 2);
            buyDrones (134141, 1, 2);
            buyDrones (134148, 1, 2);
            buyDrones (134147, 1, 2);
            buyDrones (134146, 1, 2);
        });
    }

    function startTimer (){
        var minuter = 0;
        var reseter = 0;
        setInterval(function(){
            minuter++;
            reseter++;
            if (minuter > 60) {
                requestSendGet ("https://play.galaxyofdrones.com/api/planet");
                if (mineral_quantity[3] > 500){
                    tradeMinerals (134140, 500, 4);
                    mineral_quantity[3] = 0;
                }

                if (need_scouts) {
                    buyDrones (134142, 1, 2);
                    buyDrones (134141, 1, 2);
                    buyDrones (134148, 1, 2);
                    buyDrones (134147, 1, 2);
                    buyDrones (134146, 1, 2);
                }

                //sendScouts (949, drones_quantity[1]);
                //sendScouts (11257, drones_quantity[1]);
                //sendScouts (14344, drones_storage_quantity[1]);
                //sendScouts (6340, drones_storage_quantity[1]);

                minuter = 0;
            }
            if (reseter > 3600) {
                location.reload(true);
            }
        },1000);
    }

    function fullUpgrade () {
        requestSendGet ("https://play.galaxyofdrones.com/api/planet");
        /*
        for (var grid in grids) {
            console.log(grid); // 0 1 2 3 4 5
        }
        */
        setTimeout(function(){
            grids.forEach(item => {
                // нельзя прервать — выполнится для всех элементов массива в независимости от условий
                //console.log(item.id); // 'a' 'b' 'c' 'd' 'e' 'f'
                doUpgrade (item.id);
            });
        },5000);
    }

    function doUpgrade (grid){
        request_url = "https://play.galaxyofdrones.com/api/upgrade/" + grid;
        request_data = "";
        requestSendPost (request_url, request_data);
    }

    function sendScouts (planet, quantity){
        //https://play.galaxyofdrones.com/api/movement/scout/949
        request_data = $.toJSON({"quantity":quantity});
        request_url = "https://play.galaxyofdrones.com/api/movement/scout/" + planet;
        requestSendPost (request_url, request_data);
    }

    function buyDrones (building, quantity, drone_id){
        //https://play.galaxyofdrones.com/api/trainer/134148/2
        request_data = $.toJSON({"quantity":quantity});
        request_url = "https://play.galaxyofdrones.com/api/trainer/" + building +"/" + drone_id;
        requestSendPost (request_url, request_data);
    }


    //Transmute minerals
    //building_id: 3
    //test building num 408875
    function transmuteMinerals (building, quantity, mineral){
        //request_data = JSON.stringify({"quantity":quantity});
        request_data = $.toJSON({"quantity":quantity});
        request_url = "https://play.galaxyofdrones.com/api/producer/" + building +"/" + mineral;
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
                alert( 'Таких значений минералов не знаю' );
        }
        request_url = "https://play.galaxyofdrones.com/api/movement/trade/" + building;
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
        //request_url = "https://play.galaxyofdrones.com/api/planet";
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
                console.log(data);
                planet = data.id;
                incoming = data.incoming;
                mineral_quantity[3] = data.resources[3].quantity;
                drones_quantity[1] = data.units[1].quantity;
                drones_storage_quantity[1] = data.units[1].quantity;
                //alert(data.resources[3].quantity);
                //alert(data.units[1].quantity);

                //alert(data.test);
                //alert(data.toSource());
            }
        });
    }
})();
