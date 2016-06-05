
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var generiraniEHRid = ["", "", ""];

var allHeights = [];
var allWeights = [];
var times = [];

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function pridobiPodatke() {
	var sessionId = getSessionId();
	$("#datumi").empty();

	var ehrId = $("#EHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#novoObvestilo").append("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite EHR ID ali kliknite na željenega uporabnika!</span><br>");
	} else {
	$.ajax({
		url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
        type: 'GET',
		headers: {"Ehr-Session": sessionId},
		success: function(data) {
            var party = data.party;
            $.ajax({
				url: baseUrl + "/view/" + ehrId + "/height",
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
				    if (res.length == 0)return;
        			 $("#novoObvestilo").append("<span class='obvestilo " +
                      "label label-success'>Berem podatke o višini.</span><br>");
                      st = 0;
			        for (var i in res) {
			        	$("#novoObvestilo").append("<span class='obvestilo " +
                      "label label-success'>Čas : " + res[i].time + " višina: " + res[i].height + " cm.</span><br>");
			            allHeights[st] = res[i].height;
			            times[st] = res[i].time;
			            $("#datumi").append('<option value="' + st + '">' + times[st] + '</option>');
			            st++;
			        }
				
						if (allHeights.length > 0) {        
					        $.ajax({
								url: baseUrl + "/view/" + ehrId + "/weight",
								type: 'GET',
								headers: {"Ehr-Session": sessionId},
								success: function (res) {
								    if (res.length > 0) {
				        			 $("#novoObvestilo").append("<span class='obvestilo " +
				                      "label label-success'>Berem podatke o teži.</span><br>");
				                      st = 0;
								        for (var i in res) {
							        	$("#novoObvestilo").append("<span class='obvestilo " +
				                      "label label-success'>Čas: " + res[i].time + " teža: " + res[i].weight + " kg.</span><br>");
								            allWeights[st] = res[i].weight;
								            st++;
								        }
								        //narisiGraf(allHeights[allHeights.length-1], allWeights[allWeights.length-1], times[times.length-1]);
								        narisiGraf(allHeights[0], allWeights[0], times[0]);
								    }
								},
								error: function (error) {
								    $('#novoObvestilo').append("<span class='obvestilo label " +
            						 "label-danger fade-in'>Napaka: " + JSON.parse(error.responseText).userMessage + "</span><br>");
								}
				            });
						}  
						else {
							 $("#novoObvestilo").append("<span class='obvestilo " +
				                      "label label-danger'>Ni bilo podatka o višini!</span><br>");
						}
				},
				error: function (error) {
				    $('#novoObvestilo').append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka: " + JSON.parse(error.responseText).userMessage+ "</span><br>");
				}
            });
			},
		error: function (error) {
		    $('#novoObvestilo').append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka: " + JSON.parse(error.responseText).userMessage+ "</span><br>");
		}
    });
	}
}

function parametriZaDoločenDatum() {
	var st = $("#datumi").val();
	if (st == null) $("#novoObvestilo").append("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim kliknite na željen datum!</span><br>");
    else {
		narisiGraf(allHeights[st], allWeights[st], times[st]);
    	
    }
}

function narisiGraf(height, weight, time)  {
	$("#fillgauge1").empty();
	
	var itm = weight*10000/(height*height);
	
    var config1 = liquidFillGaugeDefaultSettings();
	config1.circleThickness = 0.2;
    config1.textVertPosition = 0.2;
    config1.waveAnimateTime = 1000;
    config1.displayPercent = false;
    
    if (itm < 16) {
    	config1.circleColor = "#3366FF";
    }else if(itm < 17) {
    	config1.circleColor = "#333399";
    }else if(itm < 18.5) {
    	config1.circleColor = "#666699";
    }else if(itm < 25) {
    	config1.circleColor = "#008000";
    }else if(itm < 30) {
    	config1.circleColor = "#ffff00";
    }else if(itm < 35) {
    	config1.circleColor = "#f39911";
    }else if(itm < 40) {
    	config1.circleColor = "#ff0000";
    }else {
    	config1.circleColor = "#800000";
    }
    
    var gauge1 = loadLiquidFillGauge("fillgauge1", itm, config1);
	
	$("#datum").html("<span class='obvestilo " +
		"label label-success' style='margin-left:25px;'>Datum meritev: " + time + "</span><br><br>")
	

}

function generirajVse() {
    console.log("začetek generiranja");
    for (var i = 1; i < 4; i++) {
        generirajPodatke(i);
    }
}

function napisiEHRid(stPacienta) {
	switch (stPacienta) {
		case 1:
			if (generiraniEHRid[0] != "") document.getElementById('EHRid').value=generiraniEHRid[0];
			else document.getElementById('EHRid').value='bb3e3c5d-c9a8-450b-a2ac-1b5f7ce8cbb9';
			break;
		case 2:
			if (generiraniEHRid[1] != "") document.getElementById('EHRid').value=generiraniEHRid[1];
			else document.getElementById('EHRid').value='480d5b24-d5e2-4ef3-b6ec-8f1592f63109';
			break;
		case 3:
			if (generiraniEHRid[2] != "") document.getElementById('EHRid').value=generiraniEHRid[2];
			else document.getElementById('EHRid').value='1787f0cf-c62d-48a8-9e0a-da75a968c6c4';
			break;
	}
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
    var sessionId = getSessionId();
    var ehrId = "";
    
    var ime = "";
	var priimek = "";
	var datumRojstva = "";
	var statusAktivnosti = "";
    
    switch (stPacienta) {
        case 1:
            ime = "Franci";
            priimek = "Balanci";
            datumRojstva = "1955-09-24T11:11";
            statusAktivnosti = "upokojen";
            break;
        case 2:
            ime = "Anica";
            priimek = "Trivik";
            datumRojstva = "1999-03-13T17:05";
            statusAktivnosti = "v izobraževanju";
            break;
        case 3:
            ime = "Joža";
            priimek = "Nedeljko";
            datumRojstva = "1975-11-25T02:45";
            statusAktivnosti = "brezposeln";
            break;
        default:
            return;
    }
    $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: ime,
	            lastNames: priimek,
	            dateOfBirth: datumRojstva,
	            partyAdditionalInfo: [
	            	{key: "ehrId", value: ehrId},
	            	{key: "statusAktivnosti", value: statusAktivnosti}
	            	]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                if (party.action == 'CREATE') {
	                    $("#novoObvestilo").append("<span class='obvestilo " +
                      "label label-success'>Uspešno kreiran EHR: <br>'" +
                      ehrId + "'.</span><br><br>");
                      generirajMeritveVitalnihZnakov(stPacienta, ehrId);
                      generiraniEHRid[stPacienta-1] = ehrId;
	                  return ehrId;
	                }
	            },
	            error: function(err) {
	            	$("#novoObvestilo").append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!</span><br>");
                return;
	            }
	        });
	    }
	});
  return ehrId;
}

function generirajMeritveVitalnihZnakov(stPacienta, ehrId) {
	switch(stPacienta) {
		case 1:
			dodajMeritveVitalnihZnakov(ehrId, "2005-01-11T07:17", "176.7", "76", "36.6", "128", "81", "96");
        	dodajMeritveVitalnihZnakov(ehrId, "2007-04-24T13:12", "176.7", "75", "36.9", "124", "84", "97");
        	dodajMeritveVitalnihZnakov(ehrId, "2009-07-15T11:45", "176.7", "78", "37.5", "133", "80", "98");
        	dodajMeritveVitalnihZnakov(ehrId, "2011-11-13T09:33", "176.7", "74", "36.2", "111", "86", "94");
        	dodajMeritveVitalnihZnakov(ehrId, "2015-05-01T16:08", "176.7", "73", "36.4", "121", "88", "92");
			break;
		case 2:
			dodajMeritveVitalnihZnakov(ehrId, "2005-01-11T07:17", "119.5", "42", "36.2", "128", "81", "96");
        	dodajMeritveVitalnihZnakov(ehrId, "2007-04-24T13:12", "134.7", "43", "36.4", "124", "81", "97");
        	dodajMeritveVitalnihZnakov(ehrId, "2009-07-15T11:45", "147.7", "40", "37.1", "120", "80", "98");
        	dodajMeritveVitalnihZnakov(ehrId, "2011-11-13T09:33", "158.7", "38", "36.6", "121", "82", "96");
        	dodajMeritveVitalnihZnakov(ehrId, "2015-05-01T16:08", "161.7", "41", "36.7", "123", "79", "98");
			break;
		case 3:
			dodajMeritveVitalnihZnakov(ehrId, "2005-01-11T07:17", "186.2", "130", "34.6", "138", "91", "94");
        	dodajMeritveVitalnihZnakov(ehrId, "2007-04-24T13:12", "186.2", "135", "39.9", "144", "94", "96");
        	dodajMeritveVitalnihZnakov(ehrId, "2009-07-15T11:45", "186.2", "133", "37.5", "143", "90", "98");
        	dodajMeritveVitalnihZnakov(ehrId, "2011-11-13T09:33", "186.2", "124", "37.2", "141", "96", "94");
        	dodajMeritveVitalnihZnakov(ehrId, "2015-05-01T16:08", "186.2", "129", "38.4", "141", "98", "91");
			break;
		default:
			return;
	}
}

function dodajMeritveVitalnihZnakov(ehrId, datumInUra, telesnaVisina, telesnaTeza, 
                    telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak,
                    nasicenostKrviSKisikom) {
    var sessionId = getSessionId();
    
    
    $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	var podatki = {
		// Struktura predloge je na voljo na naslednjem spletnem naslovu:
	    "ctx/language": "en",
	    "ctx/territory": "SI",
	    "ctx/time": datumInUra,
	    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
	    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
	   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
	    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
	    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
	    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
	};
	var parametriZahteve = {
	    ehrId: ehrId,
	    templateId: 'Vital Signs',
	    format: 'FLAT'
	};
	$.ajax({
	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(podatki),
	    success: function (res) {
	      /*  $("#novoObvestilo").append(
          "<span class='obvestilo label label-success fade-in'>Uspešno dodajanje meritev vitalnih znakov<br>" +
          res.meta.href + ".</span><br>");*/
	    },
	    error: function(err) {
	    	$("#novoObvestilo").append(
        "<span class='obvestilo label label-danger fade-in'>Napaka '" +
        JSON.parse(err.responseText).userMessage + "'!</span><br>");
	    }
	});
    
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
