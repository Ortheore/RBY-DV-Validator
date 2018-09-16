//Could maybe sort results?
//Also adding the results in JSON will either save me a ton of work or be a waste of time, idk
//Edit: def do it

function checkRedundancy(){
	//clear previous output
	document.getElementById("results").innerText="";
	//Get input
	//Could probably think of better names for DV arrays but oh well
	var newSpreads=document.getElementById("input").value.split("\n");
	for(var i=0; i<newSpreads.length;i++){
		newSpreads[i]=newSpreads[i].split("/");
	}
	var betterSpreads=[];
	var initIndex=0;
	var ignoreATK=document.getElementById("ignoreATK").checked;//Storing this in a separate variable in case I change my mind about optimising ATK on pure SPATKers
	if(ignoreATK){//If a pokemon is a pure special atker it doesn't care about atk dvs
		initIndex=1;
	}
	
	//Check DVs
	for(var n=0;n<newSpreads.length;n++){
		//Don't forget to calc HP DV!!!
		var newDVs=newSpreads[n];
		var hp=0;
		//Unsure if this is necessary, but I want to make sure that I'm working with numbers not strings
		for(var c=0;c<newDVs.length;c++){
			newDVs[c]=Number(newDVs[c]);
		}
		if(newDVs[0]%2==1) hp+=8;
		if(newDVs[1]%2==1) hp+=4;
		if(newDVs[2]%2==1) hp+=2;
		if(newDVs[3]%2==1) hp+=1;
		newDVs.push(hp);
		
		//Now to ACTUALLY check redundancy
		var newBetter=null;
		var addSpread=false;//This flags the spread to be pushed, freeing up newBetter to be freely modified for each test
		for(var b=0;b<betterSpreads.length;b++){
			var betterDVs=betterSpreads[b];
			var index=initIndex;//initIndex will be used for all spreads, so I need a copy I can modify within the loop
			//Set newBetter, but try make sure it's not null.
			do{
				newBetter=compNums(newDVs[index], betterDVs[index]);
				index++;
			}while(newBetter===null && index<newDVs.length);
			
			if(newBetter===null){
				if(ignoreATK){
					//If newBetter is still null, but we're ignoring ATK, then ATK may still differ. In that case, we actually want the smallest ATK value, since there's no reason not to minimise ATK if you're not using it (even though it's practically irrelevant)
					var tiebreak=compNums(newDVs[0], betterDVs[0]);
					if(tiebreak===null||tiebreak===true){
						newBetter=false
					}else{
						newBetter=true;
					}				
				}else{
					//If newBetter is null and we're not ignoring ATK, then the spreads are identical and one should be removed
					newBetter=false;
				}
			}
			
			for(var t=index;t<newDVs.length;t++){
				var testDV=compNums(newDVs[t], betterDVs[t]);
				if(newBetter!==testDV && testDV!==null){//If some values are better but some aren't, neither spread is redundant
					newBetter=null;
					break;
				}
			}
			
			//If new spread is redundant, must stop checking immediately
			if(newBetter===false){
				addSpread=false;
				break;
			}
			
			if(newBetter){
				betterSpreads.splice(b, 1);
				addSpread=true;
				b--;
			}		
		}

		if(newBetter===null){
			betterSpreads.push(newDVs);
			continue;
		}
		if(addSpread){
			betterSpreads.push(newDVs);
		}else{
			//If newer is not better, just leave it and move on
		}
	}
	
	//Construct output
	var output="";
	for(var s=0;s<betterSpreads.length;s++){
		var spread=betterSpreads[s];
		output+=spread[0]+"/"+spread[1]+"/"+spread[2]+"/"+spread[3]+"("+spread[4]+")\n";
	}
	document.getElementById("results").innerText=output;
	
	//Construct JSON
	for(var h=0;h<betterSpreads.length;h++){
		betterSpreads[h].splice(-1, 1);
	}
	var json="\n\nJSON (excludes HP DV)\n\n"+JSON.stringify(betterSpreads);
	document.getElementById("results").innerText+=json;
}

function compNums(a, b){
	if(a>b){
		return true;
	}else if(a===b){
		return null;
	}else{
		return false;
	}
}