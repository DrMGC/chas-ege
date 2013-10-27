$('#zadaniya').html('');
for(var i=1;i<=nabor.nZad;i++){
	document.getElementById('zadaniya').innerHTML+='<tr><td><label for="cB'+i+'" >B'+i+'</label></td>'+
	'<td><input type="text" class="kolvo" value="1" id="cB'+i+'" data-jstorage-id="poln-cB'+i+'"></td></tr>';
}

$('#gotov').hide();
var vr1=svinta?100:200;
var vr2=svinta?100:1500;

var startxt='';
window.vopr.txt='';
var intervPole;
var nV=1;
var nZ=1;
var aZ=[];
var iZ=[];
var aV;
var strVopr='';
var strOtv='';
var voprosy=[];

function vse1(){
	for(var i=1;i<=nabor.nZad;i++)
		$('#cB'+i).val(1);
	$('#cV').val(1);
}

function vse0(){
	for(var i=1;i<=nabor.nZad;i++)
		$('#cB'+i).val(0);
	$('#cV').val(1);
}

function zapusk(){
	$.jStorage.sohrData()
	for(var i=1;i<=nabor.nZad;i++)
		aZ[i]=1*($('#cB'+i).val());
	cacheKat();
	kZ=aZ.sum();
	if(!kZ){
		alert('Ни одно задание не выбрано.');
		return;
	}
	iZ=aZ.slice();
	nZ=1;
	$('#panel').html('Тест составляется, подождите...');
	$('#gotov').show();
	zadan();
}

function testGotov(){
	$('#gotov').hide();
	allCanvasToBackgroundImage();
	$('#panel').remove();
	alert('Тест составлен.\nМожно приступать к решению!');
}

function konecSozd(){
	$('#prov_knopki').show();
	MathJax.Hub.Typeset('rez',testGotov);
}

function zadan(){
	if (nZ>nabor.nZad){
		konecSozd();
		return;
	}else if(iZ[nZ]==0){
		nZ++;
		zadan();
	}else{
		iZ[nZ]--;
		zagr(nabor.adres+nabor.prefix+nZ+'/main.js');
		vopr.podg();
		intervPole=setTimeout("zagr(nabor.adres+nabor.prefix+nZ+'/'+nomer+'.js');",vr1);
		intervPole=setTimeout('obnov();',vr1+vr2);
	}
	return;
}

function obnov(){
	if((window.vopr.txt!=0)&&(startxt!=window.vopr.txt)){
		clearInterval(intervPole);
		if(!sootvKat()){
			iZ[nZ]++;
			zadan();
			return;
		}
		var sdel=aZ.sum()-iZ.sum();
		starttxt=window.vopr.txt;
		strVopr=
			'<br/>'+
			'<div class="d">'+
				'<div class="b">B'+nZ+(aZ[nZ]==1?'':'-'+(aZ[nZ]-iZ[nZ]))+
				'</div>'+
				window.vopr.txt+
				'<div class="r">'+
					'Ответ:'+
					'<textarea class="text_otv" rows="1"></textarea>'+
					'<div class="otv_ver" id="otv_ver'+(sdel-1)+'">'+
						'Правильно!'+
					'</div>'+
					'<div class="otv_nev" id="otv_nev'+(sdel-1)+'">'+
						'Неправильно!<br/>'+
						'Правильный ответ: '+window.vopr.ver.join('или')+
					'</div>'+
				'</div>';
		var din=document.createElement('div');
		din.innerHTML=strVopr;
		din.class='d d3';
		din.width="100%";
		document.getElementById('rez').appendChild(din);
		try{
			window.vopr.dey();
		}catch(e){}
		
		//Копируем вопрос в массив
		voprosy.push(vopr.clone());
		
		var w=sdel/kZ;
		$('.tx').text((100*w).toFixedLess(1).dopdo(' ',4)+'%');
		$('#pr1').width($('#pr0').width()*w);
		var v=(vr1+vr2)*(kZ-sdel)/1000;
		$('#vrem').text(sdel+' из '+kZ+' '+v.toDvoet());
		zadan();
	}else{
		setTimeout("zagr('nabor.adres+nabor.prefix+"+nZ+"+'/'+nomer+'.js');",vr1);
		intervPole=setTimeout('obnov();',vr1+vr2);		
	}
}

function prov(){
	var nVer=0;
	var nNev=0;
	var textareas=$('textarea');
	console.log(textareas[0]);
	for(var i=0;i<aZ.sum();i++)
	{
		if(voprosy[i].vrn.call(voprosy[i],textareas[i].value)){
			nVer++;
			$('#otv_ver'+i).show();
		}else{
			nNev++;
			$('#otv_nev'+i).show();		
		}
	}
	$('#but_prov').hide();
	$('#prov_knopki').append('<br/>Правильно решено '+chislitlx(nVer,'задание')+' из '+aZ.sum());
}

galkiKat('#galki_kat','pech');
$('#prov_knopki').hide();