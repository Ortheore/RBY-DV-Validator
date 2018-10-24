function CalculateDVs(){
	//Important: I'm not bothering to check the ATK DV if it's ignored, since that's such a minute and generally useless optimisation that I don't think it's worth bothering with. I say this just because I do check in it in the DV redundancy checker, where I use it to arbitrarily distinguish between spreads that are identical when ATK is ignored. Tbh I probably ought to go back and change that in the redundancy thing, but cbf
	/*
		For reference:
		If not an int, always round down. That said, I don't think I need to make use of it in my script
		
		Generic stat formula: int(((BaseStat + DV)*2+StatPoint)*Level/100)+E
		E=5 for non-HP stats, and E=Level+10 for HP
		
		HP Formula: STAT = int(((BaseStat + DV)*2+StatPoint)*Level/100)+Level+10
		Non-HP Formula: STAT = int(((BaseStat + DV)*2+StatPoint)*Level/100)+5
		
		StatPoint = int((SQRT(StatExp-1)+1)/4)
		Max StatExp value is 65025
		Plugging that value into the formula gives a value of 63 as the max StatPoint value
		
		Working backwards to calculate DVs:
		Stat-E=(((BaseStat + DV)*2+StatPoint)*Level/100)
		(Stat-E)*100/Level=(BaseStat + DV)*2+StatPoint
		(Stat-E)*100/Level-StatPoint=(BaseStat + DV)*2
		((Stat-E)*100/Level-StatPoint)/2=BaseStat+DV
		DV=((Stat-E)*100/Level-StatPoint)/2-BaseStat
		
		Woops I forgot I'm not checking HP lol
		Simplified formula (assuming level=100)
		DV=(Stat-68)/2-BaseStat
	*/
	var pokemon=document.getElementById("pokemon").value;
	document.getElementById("results").innerText="";
	var stats=[];
	var dvs=[];
	
	stats[0]=document.getElementById("atk").value;
	stats[1]=document.getElementById("def").value;
	stats[2]=document.getElementById("spe").value;
	stats[3]=document.getElementById("spc").value;
	
	var baseStats=encounterDex[pokemon].baseStats;
	
	for(var i=0;i<stats.length;i++){
		dvs[i]=(stats[i]-68)/2-baseStats[i];
	}
	
	var ignoreATK=document.getElementById("ignoreATK").checked;
	var encounter=encounterDex[pokemon].encounter;
	if(typeof encounter==="number"){
		encounter="rb"+encounter.toString();//I should've just stored these as strings. Oh well, too lazy to go back and change. RB is chosen because it outclasses Y except for that one weird DV spread
	}
	if(ignoreATK) encounter+="NoATK";
	var y15=encounterDex[pokemon].y15;
	
	var possibleDVs=[];
	switch(encounter){
		case "rb30":
			addSubArrays(possibleDVs, encounterDVs.rb30);
		case "rb25":
			addSubArrays(possibleDVs,encounterDVs.rb25);
		case "rb20":
			addSubArrays(possibleDVs,encounterDVs.rb20);
		case "rb15":
			addSubArrays(possibleDVs,encounterDVs.rb15);
		case "rb10":
			addSubArrays(possibleDVs,encounterDVs.rb10);
			addSubArrays(possibleDVs,encounterDVs.rbyAll);
			if(y15)addSubArrays(possibleDVs,[9,10,15,15]);
			break;
		case "y30":
			addSubArrays(possibleDVs,encounterDVs.y30);
		case "y25":
			addSubArrays(possibleDVs,encounterDVs.y25);
		case "y20":
			addSubArrays(possibleDVs,encounterDVs.y20);
		case "y15":
			addSubArrays(possibleDVs,encounterDVs.y15);
			addSubArrays(possibleDVs,encounterDVs.rbyAll);
			break;
		case "rb30NoATK":
			addSubArrays(possibleDVs,encounterDVs.rb30NoATK);
		case "rb25NoATK":
			addSubArrays(possibleDVs,encounterDVs.rb25NoATK);
		case "rb20NoATK":
			addSubArrays(possibleDVs,encounterDVs.rb20NoATK);
		case "rb15NoATK":
			addSubArrays(possibleDVs,encounterDVs.rb15NoATK);
		case "rb10NoATK":
			addSubArrays(possibleDVs,encounterDVs.rb10NoATK);
			addSubArrays(possibleDVs,encounterDVs.allNoATK);
			if(y15)addSubArrays(possibleDVs,[9,10,15,15]);//1 ATK is also possible, but this is getting ignored anyway, so it doesn't matter
			break;
		case "y30NoATK":
			addSubArrays(possibleDVs,encounterDVs.y30NoATK);
		case "y25NoATK":
			addSubArrays(possibleDVs,encounterDVs.y25NoATK);
		case "y20NoATK":
			addSubArrays(possibleDVs,encounterDVs.y20NoATK);
		case "y15NoATK":
			addSubArrays(possibleDVs,encounterDVs.y15NoATK);
			addSubArrays(possibleDVs,encounterDVs.allNoATK);
			break;
		default:
			document.getElementById("results").text="Error";
	}
	
	var validDVs=false;
	if(possibleDVs.length===0){
		document.getElementById("results").text="Error, possibleDVs array empty";
	}else{
		for(i=0;i<possibleDVs.length;i++){
			var statDV=true;
			for(var a=0;a<possibleDVs[i].length;a++){
				if((a===0)&&ignoreATK)continue;
				if(dvs[a]>possibleDVs[i][a]){
					statDV=false;
					break;
				}
			}
			if(statDV){
				alert("Submitted DVs: "+dvs.toString()+"\nReference spread: "+possibleDVs[i].toString());
				validDVs=true;
				break;
			}
		}
		if(validDVs){
			document.getElementById("results").innerText+="Valid DVs.";
		}else{
			document.getElementById("results").innerText+="Invalid DVs.";
		}
	}
	
}

function addSubArrays(mainArr, subArr){
	if(Array.isArray(subArr[0])){
			for(var n=0;n<subArr.length;n++){
			alert("SubArr: "+subArr[n].toString());
			mainArr.push(subArr[n]);
		}
	}else{
		mainArr.push(subArr);
		alert("subArr is: "+subArr);
	}
}
