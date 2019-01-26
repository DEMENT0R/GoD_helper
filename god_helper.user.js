// ==UserScript==
// @name         GoD Helper II
// @namespace    God helper II
// @version      0.50.04
// @description  GoD helper
// @icon         https://play.galaxyofdrones.com/favicon.ico
// @author       DEMENTOR
// @match        https://*.galaxyofdrones.com/*
// @exclude      https://*.galaxyofdrones.com/login*
// @exclude      https://*.galaxyofdrones.com/register*
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
    var Cookies = window.Cookies;

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
    //var data;
    var full_data;
    var grids;
    var request_data;
    var raw_data;
    var request_url = "https://play.galaxyofdrones.com/";
    var data_response;
    //console.log("request_url = " + request_url);

    //Buildings
    var buildings_needed = 0;

    var trade_center = 0;
    var factories;

    var Minerals = [];
    var CommandCenter = []; //building_id: 1; type: 2;
    var Mine = []; //building_id: 2; type: 1;
    var PowerPlant = []; //building_id: 3
    var DroneBay = []; //building_id: 4
    var Warehouse = []; //building_id: 5
    var SensorTower = []; //building_id: 6
    var TradeOffice = []; //building_id: 7
    var DroneFactory = []; //building_id: 8
    var MissileTurret = []; //building_id: 9
    var ShieldGenerator = []; //building_id: 10

    //Units
    var units;

    //Additional
    var need_scouts = false;

    // Antierror
    var data_requesting_now = false;

    //get initial data
    data_requesting_now = true;
    requestSendGet ("https://play.galaxyofdrones.com/api/planet");

    setTimeout(function(){
        if (!data_requesting_now) {
            console.log(full_data);
            setTimeout(function(){
                insertControlPanel ();
                //getBuildings (); // OLD Trade Center
                getAllBuildings ();
            },1000);
        } else {
            console.log('Data Loading error!');
        }
    },1000);


    // OLD starts

    //startTimer ();
    //requestSendGet ("https://play.galaxyofdrones.com/api/planet");

    // OLD ends

    function insertControlPanel (){
        $('.player').append('<div class="player-energy" style="top: 142px;">'+
                                 '<a class="helper-refresh" href="#" title="Refresh">(R)</a> | '+
                                 '<a class="helper-upgrade" href="#" title="Full Upgrade">Upgr</a> | '+
                                 '<a class="helper-build" href="#" title="Full Upgrade">Build</a>'+
                            '</div>'+
                            '<div class="player-energy" style="top: 182px;">'+
                                 '<a class="helper-missions" href="#" title="All missions">Mis.</a> | '+
                                 '<a class="helper-expeditions" href="#" title="All expeditions">Exp.</a>'+
                            '</div>'+
                            '<div class="player-energy" style="top: 222px;">'+
                                 '<a class="helper-trade" href="#" title="Trade minerals">Sell</a> | '+
                                 '<a class="helper-train-1" href="#" title="Goliath x 10">Goliath</a> | '+
                                 '<a class="helper-train-2" href="#" title="Scout x 10">Scout</a> | '+
                                 '<a class="helper-train-3" href="#" title="Raven x 10">Raven</a>'+
                            '</div>');
        $(".helper-refresh").click(function() {
            requestSendGet ("https://play.galaxyofdrones.com/api/planet");
            setTimeout(function(){
            	getAllBuildings ();
            },1000);
        });
        $(".helper-upgrade").click(function() {
            fullUpgrade ();
        });
        $(".helper-build").click(function() {
            fullBuild ();
            setTimeout(function(){
            	getAllBuildings ();
            },1000);
        });
        $(".helper-missions").click(function() {
            allMissions ();
        });
        $(".helper-trade").click(function() {
        	console.log(request_data);
            tradeMinerals (TradeOffice[0], 500, 1);
        });

        $(".helper-train-1").click(function() {
			buyAllDrones (10, 1);
        });

        $(".helper-train-2").click(function() {
            buyAllDrones (10, 2);
        });

        $(".helper-train-3").click(function() {
            buyAllDrones (10, 6);
        });

        for (var i = 1; i < 8; i++) {
            addClickEventHandlerToSellMineral (i);
        }
        function addClickEventHandlerToSellMineral (i) {
            //console.log(i);
            $(".resource-"+i).click(function() {
            	var q = full_data.units[0].quantity;

            	if (full_data.is_capital) {
            		console.log('is_capital');
            		q = q + full_data.units[0].storage;
            	}

            	q = q * 100;

                console.log(q);
                var r = full_data.resources[i-1].quantity;
                console.log(r);
                if ((r > 0) && (q > 0)) {
                    if (r > q) {
                        r = q;
                    } else {
                        q = r;
                    }
                    tradeMinerals (TradeOffice[0], q, i);

				    setTimeout(function(){
						requestSendGet ("https://play.galaxyofdrones.com/api/planet");
				    },1000);
                }
            });
        }
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
                    console.log('Autoselling minerals!');
                    tradeMinerals (134140, 500, 4);
                    mineral_quantity[3] = 0;
                }

                if (need_scouts) {
                    buyDrones (134142, 20, 2);
                    buyDrones (134141, 20, 2);
                    buyDrones (134148, 20, 2);
                    buyDrones (134147, 20, 2);
                    buyDrones (134146, 20, 2);
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

    // RESET BUILDINGS LIST
    function resetBuildingList () {
	    Minerals = []; //building_id: __
	    CommandCenter = []; //building_id: 1; type: 2;
	    Mine = []; //building_id: 2; type: 1;
	    PowerPlant = []; //building_id: 3
	    DroneBay = []; //building_id: 4
	    Warehouse = []; //building_id: 5
	    SensorTower = []; //building_id: 6
	    TradeOffice = []; //building_id: 7
	    DroneFactory = []; //building_id: 8
	    MissileTurret = []; //building_id: 9
	    ShieldGenerator = []; //building_id: 10
    }
    // BUILDINGS PARSER
    function getAllBuildings () {
    	resetBuildingList (); //clearing data!!!

        requestSendGet ("https://play.galaxyofdrones.com/api/planet");
        setTimeout(function(){
            full_data.grids.forEach(function(item, i, grids) {
            	//Minerals
                if ((full_data.grids[i].building_id == null) && (full_data.grids[i].type == 1)) {
                	Minerals[Minerals.length] = full_data.grids[i].id;
                }

                //Already Builded
                if (full_data.grids[i].building_id != null) {
                    //console.log("See grid: ");
                    //console.log(full_data.grids[i]);
                    // CommandCenter
                    if (full_data.grids[i].building_id == 1) {
                    	CommandCenter[CommandCenter.length] = full_data.grids[i].id;
                    }

                    // Mine
                    if (full_data.grids[i].building_id == 2) {
                    	Mine[Mine.length] = full_data.grids[i].id;
                    }

                    // PowerPlant
                    if (full_data.grids[i].building_id == 3) {
                    	PowerPlant[PowerPlant.length] = full_data.grids[i].id;
                    }
                    // DroneBay
                    if (full_data.grids[i].building_id == 4) {
                    	DroneBay[DroneBay.length] = full_data.grids[i].id;
                    }
                    // Warehouse
                    if (full_data.grids[i].building_id == 5) {
                    	Warehouse[Warehouse.length] = full_data.grids[i].id;
                    }
                    // SensorTower
                    if (full_data.grids[i].building_id == 6) {
                    	SensorTower[SensorTower.length] = full_data.grids[i].id;
                    }
                    // TradeOffice
                    if (full_data.grids[i].building_id == 7) {
                    	TradeOffice[TradeOffice.length] = full_data.grids[i].id;
                    }
                    // DroneFactory
                    if (full_data.grids[i].building_id == 8) {
                    	DroneFactory[DroneFactory.length] = full_data.grids[i].id;
                    }
                    // MissileTurret
                    if (full_data.grids[i].building_id == 9) {
                    	MissileTurret[MissileTurret.length] = full_data.grids[i].id;
                    }
                    // ShieldGenerator
                    if (full_data.grids[i].building_id == 10) {
                    	ShieldGenerator[ShieldGenerator.length] = full_data.grids[i].id;
                    }
                }

                //Constructing
                if (full_data.grids[i].construction != null) {
                    //console.log("See grid: ");
                    //console.log(full_data.grids[i]);
                    // CommandCenter
                    if (full_data.grids[i].construction.building_id == 1) {
                    	CommandCenter[CommandCenter.length] = full_data.grids[i].id;
                    }

                    // Mine
                    if (full_data.grids[i].construction.building_id == 2) {
                    	Mine[Mine.length] = full_data.grids[i].id;
                    }

                    // PowerPlant
                    if (full_data.grids[i].construction.building_id == 3) {
                    	PowerPlant[PowerPlant.length] = full_data.grids[i].id;
                    }
                    // DroneBay
                    if (full_data.grids[i].construction.building_id == 4) {
                    	DroneBay[DroneBay.length] = full_data.grids[i].id;
                    }
                    // Warehouse
                    if (full_data.grids[i].construction.building_id == 5) {
                    	Warehouse[Warehouse.length] = full_data.grids[i].id;
                    }
                    // SensorTower
                    if (full_data.grids[i].construction.building_id == 6) {
                    	SensorTower[SensorTower.length] = full_data.grids[i].id;
                    }
                    // TradeOffice
                    if (full_data.grids[i].construction.building_id == 7) {
                    	TradeOffice[TradeOffice.length] = full_data.grids[i].id;
                    }
                    // DroneFactory
                    if (full_data.grids[i].construction.building_id == 8) {
                    	DroneFactory[DroneFactory.length] = full_data.grids[i].id;
                    }
                    // MissileTurret
                    if (full_data.grids[i].construction.building_id == 9) {
                    	MissileTurret[MissileTurret.length] = full_data.grids[i].id;
                    }
                    // ShieldGenerator
                    if (full_data.grids[i].construction.building_id == 10) {
                    	ShieldGenerator[ShieldGenerator.length] = full_data.grids[i].id;
                    }
                }
            });
			/*
            console.log("Minerals (0): ");
            console.log(Minerals);
            console.log("CommandCenter (1): ");
            console.log(CommandCenter);
            console.log("Mine (2): ");
            console.log(Mine);
            console.log("PowerPlant (3): ");
            console.log(PowerPlant);
            console.log("DroneBay (4): ");
            console.log(DroneBay);
            console.log("Warehouse (5): ");
            console.log(Warehouse);
            console.log("SensorTower (6): ");
            console.log(SensorTower);
            console.log("TradeOffice (7): ");
            console.log(TradeOffice);
            console.log("DroneFactory (8): ");
            console.log(DroneFactory);
            console.log("MissileTurret (9): ");
            console.log(MissileTurret);
            console.log("ShieldGenerator (10): ");
            console.log(ShieldGenerator);
            */
        },1000);
    }

    // AUTOBUILDING
    function fullBuild () {
    	//Mine
    	if (Mine.length < 5) {
            Minerals.forEach(function(item, i, Minerals) {
            	console.log("grid: " + item + "; building_id: " + 2);
                doBuild (item, 2);
            });
            getAllBuildings ();
            return;
    	}

    	//PowerPlant
    	if (PowerPlant.length < 1) {
    		buildings_needed = 1;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 3 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 3);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//DroneBay
    	if (DroneBay.length < 2) {
    		buildings_needed = 2 - DroneBay.length;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 4 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 4);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//Warehouse
    	if (Warehouse.length < 7) {
    		buildings_needed = 7 - Warehouse.length;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 5 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 5);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//SensorTower
    	if (SensorTower.length < 1) {
    		buildings_needed = 1;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 6 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 6);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//TradeOffice
    	if (TradeOffice.length < 1) {
    		buildings_needed = 1;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 7 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 7);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//DroneFactory
    	if (DroneFactory.length < 5) {
    		buildings_needed = 5 - DroneFactory.length;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 8 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 8);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//MissileTurret
    	if (MissileTurret.length < 1) {
    		buildings_needed = 1;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 9 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 9);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}

    	//ShieldGenerator
    	if (ShieldGenerator.length < 1) {
    		buildings_needed = 1;
            full_data.grids.forEach(function(item, i, Minerals) {
            	if ((item.building_id == null) && (item.construction == null) && (buildings_needed > 0)) {
	            	console.log("grid: " + item.id + "; building_id: " + 10 + "; buildings_needed: " + buildings_needed);
	                doBuild (item.id, 10);
	                buildings_needed = buildings_needed - 1;
            	}
            	if (buildings_needed < 1) {
            		return;
            	}
            });
            getAllBuildings ();
            return;
    	}
    }

    function doBuild (grid, building_id) {
    	console.log(grid + ": " + building_id);
    	request_url = "https://play.galaxyofdrones.com/api/construction/" + grid + "/" + building_id;
    	request_data = "";
    	requestSendPost (request_url, request_data);
    }

    // UPGRADES
    function fullUpgrade () {
        requestSendGet ("https://play.galaxyofdrones.com/api/planet");
        setTimeout(function(){
            full_data.grids.forEach(function(item, i, grids) {
                if ((full_data.grids[i].building_id != null) && (full_data.grids[i].upgrade == null) && (full_data.grids[i].construction == null) && (full_data.grids[i].level < 10)) {
                    console.log("Upgrading grid: ");
                    console.log(full_data.grids[i]);
                    doUpgrade (item.id);
                }
            });
        },1000);
    }

    function doUpgrade (grid){
        request_url = "https://play.galaxyofdrones.com/api/upgrade/" + grid;
        request_data = "";
        requestSendPost (request_url, request_data);
    }

    // MISSIONS
    function allMissions () {
        requestSendGet ("https://play.galaxyofdrones.com/api/mission");
        setTimeout(function(){
        	console.log(full_data.missions);
            full_data.missions.forEach(function(item, i, missions) {
                //goMission (mission.id);
            });
        },1000);
    }

    function goMission (mission){
        //https://play.galaxyofdrones.com/api/mission/633212
        request_url = "https://play.galaxyofdrones.com/api/mission/" + mission;
        request_data = "";
        //requestSendPost (request_url, request_data);
    }

    //Selling any minerals
    function sellAnyMinerals () {

    }

    /////////////////////
    // SMALL FUNCTIONS //
    /////////////////////

    function getBuildings () {
        trade_center = 0;
        //factories = '';

        requestSendGet ("https://play.galaxyofdrones.com/api/planet");
        setTimeout(function(){
            full_data.grids.forEach(function(item, i, grids) {
                if (item.building_id == 7) {
                    trade_center = item.id;
                }
                if (item.building_id == 8) {
                    //factories = item.id;
                }
            });
        },1000);
    }

    function sendScouts (planet, quantity){
        //https://play.galaxyofdrones.com/api/movement/scout/949
        request_data = $.toJSON({"quantity":quantity});
        request_url = "https://play.galaxyofdrones.com/api/movement/scout/" + planet;
        requestSendPost (request_url, request_data);
    }

    function buyAllDrones (quantity, drone_id) {
        DroneFactory.forEach(function(grid, i, DroneFactory) {
        	console.log("buyDrones — grid: " + grid + "; quantity: " + quantity + "; drone_id: " + drone_id);
            buyDrones (grid, quantity, drone_id);
        });
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
        console.log("building: " + building + "; mineral: " + mineral + "; quantity: " + quantity);
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
                console.log('Таких значений минералов не знаю:' + request_data);
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
                full_data = data;
                data_requesting_now = false;
            }
        });
    }
})();
