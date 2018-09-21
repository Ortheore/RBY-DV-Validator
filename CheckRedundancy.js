//Could maybe sort results?
//Also note that at the very least, putting stuff in text area 2 but not 1 may cause strange behaviour, but this doesn't stop the program being functional if you're not being silly, so I don't consider this a priority

function processSets(){
	//clear previous output
	document.getElementById("results").innerText="";
	//Get input
	//Could probably think of better names for DV arrays but oh well
	var newSpreads1=document.getElementById("input1").value.split("\n");
	for(var i=0; i<newSpreads1.length;i++){
		newSpreads1[i]=newSpreads1[i].split("/");
	}
	var betterSpreads1=checkRedundancy(newSpreads1);
	
	var betterSpreads2=null;
	if(document.getElementById("input2").value!==""){
		var newSpreads2=document.getElementById("input2").value.split("\n");
		for(var i=0; i<newSpreads2.length;i++){
			newSpreads2[i]=newSpreads2[i].split("/");
		}
		betterSpreads2=checkRedundancy(newSpreads2);
	}
	
	//Construct output
	if(betterSpreads2===null){
		var output="";
		for(var s=0;s<betterSpreads1.length;s++){
			var spread=betterSpreads1[s];
			output+=spread[0]+"/"+spread[1]+"/"+spread[2]+"/"+spread[3]+"("+spread[4]+")\n";
		}
		document.getElementById("results").innerText=output;
	
		//Construct JSON
		for(var h=0;h<betterSpreads1.length;h++){
			betterSpreads1[h].splice(-1, 1);
		}
		var json="\n\nJSON (excludes HP DV)"+JSON.stringify(betterSpreads1);
		document.getElementById("results").innerText+=json;
	}else{
		var common=[], set1Only=[], set2Only=[];
		var match;
		for(var m=0;m<betterSpreads1.length;m++){
			match=false;
			for(var x=0;x<betterSpreads2.length;x++){
				var arrMatch=true;
				for(var l=0;l<betterSpreads1[m].length;l++){
					if(betterSpreads1[m][l]!==betterSpreads2[x][l]){
						arrMatch=false;
					}
				}
				if(arrMatch){
					common.push(betterSpreads1[m]);
					betterSpreads2.splice(x,1); 
					match=true;
					break;
				}
			}
			if(!match){
				set1Only.push(betterSpreads1[m]);
			}
		}
		set2Only=betterSpreads2;//Because matches are removed from betterSpreads2 as they're found, anything left in that array by now should be unique to set 2
		
		//Unique spreads should be better than common ones, not inferior. Filter out all inferior ones
		//Removing for now, but might want to add later
		//set1Only=compareSpreads(common, set1Only);
		//set2Only=compareSpreads(common, set2Only);
		
		//Construct output
		var output="";
		if(common.length>0){
			output+="\n\nSpreads common to both sets\n\n"
			output+=constructOutput(common);
		}
		if(set1Only.length>0){
			output+="\n\nSpreads unique to set 1\n\n"
			output+=constructOutput(set1Only);
		}
		if(set2Only.length>0){
			output+="\n\nSpreads unique to set 2\n\n"
			output+=constructOutput(set2Only);
		}
		//Construct JSON
		output+="\nJSON (excludes HP DVs and assumes that common DVs will be stored in a separate common object)";
		if(common.length>0){
			output+="\n\nSpreads common to both sets\n\n"
			common=removeHPDV(common);
			output+=JSON.stringify(common);
		}
		if(set1Only.length>0){
			output+="\n\nSpreads unique to set 1\n\n"
			set1Only=removeHPDV(set1Only);
			output+=JSON.stringify(set1Only);
		}
		if(set2Only.length>0){
			output+="\n\nSpreads unique to set 2\n\n"
			set2Only=removeHPDV(set2Only);
			output+=JSON.stringify(set2Only);
		}
		document.getElementById("results").innerText+=output;
	}
}

function checkRedundancy(dataset){
	var betterSpreads=[];
	var initIndex=0;
	var ignoreATK=document.getElementById("ignoreATK").checked;//Storing this in a separate variable in case I change my mind about optimising ATK on pure SPATKers
	if(ignoreATK){//If a pokemon is a pure special atker it doesn't care about atk dvs
		initIndex=1;
	}
	
	//Check DVs
	for(var n=0;n<dataset.length;n++){
		//Don't forget to calc HP DV!!!
		var newDVs=dataset[n];
		//Unsure if this is necessary, but I want to make sure that I'm working with numbers not strings
		for(var c=0;c<newDVs.length;c++){
			newDVs[c]=Number(newDVs[c]);
		}
		newDVs.push(calcHP(newDVs));
		
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
	
	return betterSpreads;
}

function constructOutput(array){
	var output="";
	for(var a=0;a<array.length;a++){
		var spread=array[a];
		output+=spread[0]+"/"+spread[1]+"/"+spread[2]+"/"+spread[3]+"("+spread[4]+")\n";
	}
	return output;
}

function removeHPDV(dvSpreads){
	for(var d=0;d<dvSpreads.length;d++){
		dvSpreads[d].pop();
	}
	return dvSpreads;
}

function compareSpreads(common, testSpreads){
	for(var t=0;t<testSpreads.length;t++){
		var redundant=true;
		
		for(var c=0;c<common.length;c++){
			for(var a=0; a<testSpreads[t].length;a++){
				if(testSpreads[t][a]>common[c][a]){
					redundant=false;
				}
			}
		}
		
		if(redundant){
			testSpreads.splice(t,1);
			t--;
		}
	}
	return testSpreads;
}

function calcHP(spread){
	var hp=0;
	if(spread[0]%2==1) hp+=8;
	if(spread[1]%2==1) hp+=4;
	if(spread[2]%2==1) hp+=2;
	if(spread[3]%2==1) hp+=1;
	return hp;
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