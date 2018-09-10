//Could maybe sort results?
//Also adding the results in JSON will either save me a ton of work or be a waste of time, idk

function checkRedundancy(){
	//Get input
	//Could probably think of better names for DV arrays but oh well
	var newSpreads=document.getElementById("input").value.split("\n");
	for(var i=0; i<newSpreads.length;i++){
		newSpreads[i]=newSpreads[i].split("/");
	}
	var betterSpreads=[];
	
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
		var targIndex;
		for(var b=0;b<betterSpreads.length;b++){
			var betterDVs=betterSpreads[b];
			newBetter=compNums(newDVs[0], betterDVs[0]);
			
			for(var t=1;t<newDVs.length;t++){
				alert(newDVs.toString()+"\n"+betterDVs.toString()+"\nnewBetter: "+newBetter+"\ncompNums: "+compNums(newDVs[t], betterDVs[t]));
				if(newBetter!==compNums(newDVs[t], betterDVs[t])){//If some values are better but some aren't, neither spread is redundant
					newBetter=null;
					break;
				}
			}
			
			if(newBetter){//If this is true, I will need to save the appropriate index to overwrite with the better spread
				targIndex=b;
				break;
			}
			if(newBetter===false){
				break;
			}
		}

		if(newBetter===null){
			betterSpreads.push(newDVs);
			continue;
		}
		if(newBetter){
			betterSpreads[targIndex]=newDVs;
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
}

function compNums(a, b){
	if(a>=b){
		return true;
	}else{
		return false;
	}
}