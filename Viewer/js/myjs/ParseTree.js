function PrintParseTree(){
	var is_ch = /chrome/.test(navigator.userAgent.toLowerCase()); 

	var bpres=document.getElementById("bpres").innerText;
	if(bpres==""){
		return;
	}

	iscorrect=validateTree(bpres);
	if(iscorrect){
		drawTree(bpres);
	}
	else{
		alert("句法分析结果有误！")
	}
}

function drawTree(plaintree){
	//alert("drawtree");
	var myTree = new ECOTree('myTree','bpres_tree_container');	
	myTree.config.expandedImage="../static/TreeImg/trans.gif";
	myTree.config.collapsedImage="../static/TreeImg/plus.gif";
	myTree.config.transImage="../static/TreeImg/trans.gif";
	myTree.config.defaultNodeWidth=50;
	myTree.config.defaultNodeHeight=20;
	myTree.config.iSubtreeSeparation=30;
	myTree.config.iSiblingSeparation=20;
	myTree.config.iLevelSeparation=30;
	myTree.config.nodeColor="#FFFFFF";
	myTree.config.nodeBorderColor="#000000";

	myTree.config.defaultTarget=false;
	myTree.add(0,-1,"root");
	addTreeNodes(myTree,plaintree);

	myTree.UpdateTree();
}

function addTreeNodes(myTree,plaintree){
	//alert("addtreenodes");
	
	var queue=new Array();
	var idqueue=new Array();  //记录queue中节点的#父节点#的ID值
	var currentMaxID=0;      //记录当前已经使用的最大的ID值 

	//去掉句法分析结果最外层的一对小括号和空格
	if(plaintree.charAt(0)=='('&&plaintree.charAt(plaintree.length-1)==')'){
		plaintree=plaintree.substring(2,plaintree.length-2);
		//alert(plaintree);
	}

	queue.push(plaintree);
	idqueue.push(0);  

	while(queue.length>0){
		//取出队列中第一个节点
		thisnode=queue.shift();
		thisnodePID=idqueue.shift();
		//alert(thisnode);
		//alert(thisnodePID);
		
		//处理该节点的label，在myTree中生成一个子节点
		console.log(thisnode);
		if(thisnode.charAt(0)==" "){
			thisnode=thisnode.substring(1,thisnode.length);
		}
		label=thisnode.substring(1,thisnode.indexOf(" "));
		//alert(label);
		thisnodeID=currentMaxID+1;
		currentMaxID++;
		var w=Math.max(label.length*14,20);
		myTree.add(thisnodeID,thisnodePID,label,(label.length)*15);
		console.log(label);
		

		//去除最外层的括号和该节点的label
		thisnode=thisnode.substring(
			thisnode.indexOf(label)+label.length+1,
			thisnode.lastIndexOf(")")
		);
		
		//alert(thisnode);

		//判断是否到叶子节点
		if(thisnode.indexOf("(")==-1){   
			//为叶子节点直接生成word节点
			var w=Math.max(thisnode.length*14,20);
			myTree.add(currentMaxID+1,thisnodeID,thisnode,w);
			currentMaxID++;
			continue;
		}
		
		//非叶子节点进行以下处理
		//将该节点的子节点加到queue中var stack=new Array();
		startIndex=0;
		stack=new Array();
		for(i=startIndex;i<thisnode.length;i++){
			//alert(thisnode.charAt(i));
			if(thisnode.charAt(i)=='('){
				stack.push("(");
				//alert(stack.length);
			}
			else if(thisnode.charAt(i)==")"){
				//validateTree()函数中已经检查过树结构的正确性，这里不再检查
				stack.pop();
				//alert(stack.length);

				//读到一个子节点的末尾
				if(stack.length==0){
					queue.push(thisnode.substring(startIndex,i+1));
					startIndex=i+1;
					idqueue.push(thisnodeID);
					//alert("sd"+queue);
				}
			}
		}

		
	}

}

function validateTree(plaintree){
	var stack= new Array();
	for(i=0;i<plaintree.length;i++){
		var b=0;
		
		if(plaintree.charAt(i)=='('){
			stack.push("(");
		}
		else if(plaintree.charAt(i)==")"){
			if(stack.length==0){
				return false;
			}
			else{
				stack.pop();
			}
		}
		
	}
	return stack.length==0;
}