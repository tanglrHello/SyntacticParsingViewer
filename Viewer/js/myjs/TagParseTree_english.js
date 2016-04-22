
function TreeNode(nodeValue){
	this.nodevalue=nodeValue;
	this.children=new Array();
}


treenodes=new Array();   //按ID存放所有树节点
rootnode=new TreeNode("root_0");
treenodes[0]=rootnode;
console.log(rootnode);

function createJsTree(plaintree){
	var queue=new Array();
	var idqueue=new Array();  //记录queue中节点的#父节点#的ID值
	var currentMaxID=0;      //记录当前已经使用的最大的ID值 

	//清空rootnode的子节点
	rootnode.children=new Array();
	treenodes[0]=rootnode;

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
		//console.log(thisnode);
		if(thisnode.charAt(0)==" "){
			thisnode=thisnode.substring(1,thisnode.length);
		}
		label=thisnode.substring(1,thisnode.indexOf(" "));
		//alert(label);
		thisnodeID=currentMaxID+1;
		currentMaxID++;
		var w=Math.max(label.length*14,20);
		
		//myTree.add(thisnodeID,thisnodePID,(label+"_"+thisnodeID),(label.length)*15+30);
		newnode=new TreeNode(label+"_"+thisnodeID);
		treenodes[thisnodePID].children.push(newnode);
		treenodes[thisnodeID]=newnode;

		//console.log(treenodes);
		

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

			//myTree.add(currentMaxID+1,thisnodeID,(thisnode+"_"+(currentMaxID+1)),w+30);
			newnode=new TreeNode(thisnode+"_"+(currentMaxID+1));
			treenodes[thisnodeID].children.push(newnode);
			treenodes[currentMaxID+1]=newnode;

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
	console.log(treenodes);
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


function getCompleteEchartsTree(containIndex){
	return getEchartsTree(rootnode,containIndex);
}


function getEchartsTree(tree,containIndex){
	var etree={};
	if(containIndex){
		etree['name']=tree.nodevalue;
	}
	else{
		etree['name']=tree.nodevalue.split("_")[0];
	}

	if(!tree.hasOwnProperty("children")){   //叶子节点
		return etree;
	}
	else{
		etree['children']=new Array();

		//console.log(tree.children);
		for(var c in tree.children){
			//console.log(c);
			var subtree=getEchartsTree(tree['children'][c],containIndex);
			//console.log(subtree);
			//console.log("**");
			etree['children'].push(subtree);
		}
		//console.log(etree);
		return etree;
	}
}


function showNodeIndexFunc(){
	btn=document.getElementById("showNodeIndexBtn");
	if(btn.innerText=="show NodeID"){
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
		btn.innerText="hide NodeID";
	}
	else{
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
		btn.innerText="show NodeID";
	}
}


function deleteNodeFunc(){
	var nodeID=document.getElementById("nodeIndexID").value;

	//检查节点ID是否有效
	res=checkNodeID(nodeID,rootnode);
	if(!res){
		document.getElementById("nodeIndexID").style.background="#FFAAAA";
		alert(nodeID+" is an invalid node ID or the ID of root node是无效的节点ID或根节点ID");
		return;
	}
	else{
		document.getElementById("nodeIndexID").style.background="#FFFFFF";
	}

	//找到该节点，将其所有子节点作为其父节点的子节点，插入到该节点本来所在的位置(先插入子节点再删除原节点)
	var queue=[rootnode];
	var deletedFlag=false;
	while(queue.length!=0){
		var currentNode=queue.shift();
		for(var i=0;i<currentNode.children.length;i++){
			if(currentNode.children[i].nodevalue.split("_")[1]==nodeID){
				var j=0;
				for(j=0;j<currentNode.children[i+j].children.length;j++){
					//console.log(currentNode.children[i+j][j]);
					currentNode.children.splice(i+j,0,currentNode.children[i+j].children[j]);
				}
				currentNode.children.splice(i+j,1);  //删除
				deletedFlag=true;
				break;
			}
		}
		if(deletedFlag){
			break;
		}
		else{
			for(var i=0;i<currentNode.children.length;i++){
				queue.push(currentNode.children[i]);
			}
		}
		
	}

	//从treenodes数组中删除该节点(并不实际删除，因为该数组的长度会用来得到新节点的ID，所以将ID值后面加上符号"a"使其变成无效的ID)
	for(var i=0;i<treenodes.length;i++){
		if(treenodes[i].nodevalue.split("_")[1]==nodeID){
			treenodes[i].nodevalue+="deleted";
		}
	}

	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}


function deleteSubtreeFunc(){
	var nodeID=document.getElementById("nodeIndexID").value;

	//检查节点ID是否有效
	res=checkNodeID(nodeID,rootnode);
	if(!res){
		document.getElementById("nodeIndexID").style.background="#FFAAAA";
		alert(nodeID+" is an invalid node ID or the ID of root node");
		return;
	}
	else{
		document.getElementById("nodeIndexID").style.background="#FFFFFF";
	}

	//找到该节点并将其从父节点的子节点数组中删除
	var queue=[rootnode];
	var deletedFlag=false;
	while(queue.length!=0){
		var currentNode=queue.shift();
		for(var i=0;i<currentNode.children.length;i++){
			if(currentNode.children[i].nodevalue.split("_")[1]==nodeID){
				currentNode.children.splice(i,1);  //删除
				deletedFlag=true;
				break;
			}
		}
		if(deletedFlag){
			break;
		}
		else{
			for(var i=0;i<currentNode.children.length;i++){
				queue.push(currentNode.children[i]);
			}
		}
	}

	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}


function editNodeFunc(){
	var nodeID=document.getElementById("nodeIndexID").value;
	var newContent=document.getElementById("nodeContentID").value;

	//检查节点ID是否有效
	res=checkNodeID(nodeID,rootnode);
	if(!res){
		document.getElementById("nodeIndexID").style.background="#FFAAAA";
		alert(nodeID+" is an invalid node ID or the ID of root node");
		return;
	}
	else{
		document.getElementById("nodeIndexID").style.background="#FFFFFF";
	}

	//找到该节点并将修改其内容
	var queue=[rootnode];
	var findFlag=false;
	while(queue.length!=0){
		var currentNode=queue.shift();
		for(var i=0;i<currentNode.children.length;i++){
			if(currentNode.children[i].nodevalue.split("_")[1]==nodeID){
				currentNode.children[i].nodevalue=newContent+"_"+nodeID;   //修改节点内容
				findFlag=true;
				break;
			}
		}
		if(findFlag){
			break;
		}
		else{
			for(var i=0;i<currentNode.children.length;i++){
				queue.push(currentNode.children[i]);
			}
		}
	}

	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}


//为指定节点添加兄弟节点，position的值为"left"或者"right"
function addSibling(position){
	var nodeID=document.getElementById("nodeIndexID").value;
	var newContent=document.getElementById("nodeContentID").value;

	//检查节点ID是否有效
	res=checkNodeID(nodeID,rootnode);
	if(!res){
		document.getElementById("nodeIndexID").style.background="#FFAAAA";
		alert(nodeID+" is an invalid node ID or the ID of root node");
		return;
	}
	else{
		document.getElementById("nodeIndexID").style.background="#FFFFFF";
	}

	//找到该节点并添加兄弟节点
	var queue=[rootnode];
	var findFlag=false;
	
	while(queue.length!=0){
		var currentNode=queue.shift();
		for(var i=0;i<currentNode.children.length;i++){
			if(currentNode.children[i].nodevalue.split("_")[1]==nodeID){
				if(position=="left"){								
					var newnode=new TreeNode("null_"+treenodes.length);					
					currentNode.children.splice(i,0,newnode);		
					treenodes.push(newnode);								
				}
				else if(position=="right"){
					newnode=new TreeNode("null_"+treenodes.length);
					currentNode.children.splice(i+1,0,newnode);		
					treenodes.push(newnode);			
				}
				
				findFlag=true;
				break;
			}
		}
		if(findFlag){
			break;
		}
		else{
			for(var i=0;i<currentNode.children.length;i++){
				queue.push(currentNode.children[i]);
			}
		}
	}
	
	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}

//为指定节点添加子节点，作为其最右的子节点
function addRightChild(){
	var nodeID=document.getElementById("nodeIndexID").value;
	var newContent=document.getElementById("nodeContentID").value;

	//检查节点ID是否有效
	if(nodeID!="0"){                //根节点可以添加子节点，特殊处理
		res=checkNodeID(nodeID,rootnode);
		if(!res){
			document.getElementById("nodeIndexID").style.background="#FFAAAA";
			alert(nodeID+" is an invalid nodeID");
			return;
		}
	}
	document.getElementById("nodeIndexID").style.background="#FFFFFF";

	//找到该节点并添加子节点
	var queue=[rootnode];
	var findFlag=false;
	
	while(queue.length!=0){
		var currentNode=queue.shift();
		if(currentNode.nodevalue.split("_")[1]==nodeID){
			var newnode=new TreeNode("null_"+treenodes.length);
			currentNode.children.push(newnode);
			treenodes.push(newnode);

			findFlag=true;
			break;
		}

		for(var i=0;i<currentNode.children.length;i++){
			queue.push(currentNode.children[i]);
		}
		
	}

	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}


function resetTreeFunc(){
	var oriTreeText=document.getElementById("conpparse_ori").value;
	console.log(oriTreeText);
	createJsTree(oriTreeText);

	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();
	return;
}


function linkNodes(){
	var nodeIDs=document.getElementById("parent_child_ID").value;
	var parentID=null;
	var childID=null;

	//格式检查
	if(nodeIDs.split(" ").length!=2){
		alert("There should be exactly two node IDs split by a SINGLE space");
		document.getElementById("parent_child_ID").style.background="#FFAAAA";
		return false;
	}
	else{
		//父节点
		parentID=nodeIDs.split(" ")[0];
		if(parentID!="0"){                //根节点可以作为父节点
			res=checkNodeID(parentID,rootnode);
			if(!res){
				document.getElementById("parent_child_ID").style.background="#FFAAAA";
				alert(parentID+" is an invalid nodeID");
				return;
			}
		}

		//子节点
		childID=nodeIDs.split(" ")[1];
		res=checkNodeID(childID,rootnode);
		if(!res){
			document.getElementById("parent_child_ID").style.background="#FFAAAA";
			alert(childID+" is an invalid node ID or the ID of root node");
			return;
		}		
	}

	//结构检查，“父节点”不能是“子节点”的子孙节点
	var queue=[rootnode];
	var childNode=null;
	var parentNode=null;
	for(var i=0;i<treenodes.length;i++){
		if(treenodes[i].nodevalue.split("_")[1]==childID){
			childNode=treenodes[i];
		}
		if (treenodes[i].nodevalue.split("_")[1]==parentID) {
			parentNode=treenodes[i];
		}
	}

	res=checkNodeID(parentID,childNode);
	if(res){   //"子节点"的子孙节点中包括"父节点"
		alert("node"+childID+" is the ancestor of node"+parentID+"，this change cannot keep the tree structure");
		document.getElementById("parent_child_ID").style.background="#FFAAAA";
		return false;
	}

	//结构检查，两个节点不能是同一个节点
	if(childID==parentID){
		alert("two nodes should not be the same node");
		document.getElementById("parent_child_ID").style.background="#FFAAAA";
		return false;
	}

	//结构检查，“子节点”当前已经是“父节点”的子节点
	for(var i=0;i<parentNode.children.length;i++){
		if(parentNode.children[i]==childNode){
			return;
		}
	}
		
	//console.log("&&&&&");
	//console.log(parentNode);
	//修改树结构，如果修改后不能维持原句的词语语序，则不修改并提示
	//case1:"子节点"是"父节点"的子孙节点（必须是“父节点”的某个子节点的最左或者最右子孙）
	findFlag=false;
	for(var i=0;i<parentNode.children.length;i++){
		//console.log("*",i);

		//沿着最左子节点一直查探
		var tmp=parentNode.children[i];
		console.log(tmp);
		while(tmp.children.length!=0){
			if(tmp.children[0]==childNode){
				findFlag=true;

				//从“子节点”的当前父节点的子节点数组中将其删除
				tmp.children.splice(0,1);
				//向“父节点”的子节点数组中，第i个子节点的左边添加“子节点”
				parentNode.children.splice(i,0,childNode);
			}
			else{
				tmp=tmp.children[0];
			}
		}
		if(findFlag){
			break;
		}

		//沿着最右子节点一直查探
		if(!findFlag){
			var tmp=parentNode.children[i];
			while(tmp.children.length!=0){
				if(tmp.children[tmp.children.length-1]==childNode){
					findFlag=true;
					console.log("------");
					console.log(tmp);
					//从“子节点”的当前父节点的子节点数组中将其删除
					tmp.children.splice(tmp.children.length-1,1);
					//向“父节点”的子节点数组中，第i个子节点的右边添加“子节点”
					parentNode.children.splice(i+1,0,childNode);
				}
				else{
					tmp=tmp.children[tmp.children.length-1];
				}
			}
		}		
	}

	//case2“："子节点"不是“父节点”的子孙节点
	//找到两者最低公共节点X
	//case2-1：如果“父节点”所在的子树在“子节点”的左边，则“子节点”必须在“父节点”所在子树的根节点A（X的子节点之一）的右兄弟节点的最左子孙节点中，"父节点"必须是A的最右子孙节点
	//case2-2：如果“父节点”所在的子树在“子节点”的右边，则“子节点”必须在“父节点”所在子树的根节点A（X的子节点之一）的左兄弟节点的最左子孙节点中，“父节点”必须是A的最左子孙节点
	if(!findFlag){
		var queue=[rootnode];

		var LCA_node=lowestCommonAncestorNode(childNode,parentNode,rootnode);
		console.log(LCA_node);
		//var leftSiblingNode=null;
		//var rightSiblingNode=null;
		//var parentIndexInSiblings=null;  //"父节点"是在其父节点的子节点数组中的下标
		//var parentParentNode=null;    //"父节点"的父节点
		//var findParentFlag=false;

		//之前已经否定了两个节点互为祖先子孙节点的情况，所以LCA_node一定不是两个节点中的一个（并且处理到这里parentID一定不为0）
		//判断两个节点分别在以LCA_node的哪个子节点为根节点的子树中
		var parentNodeSubtreeIndex=null;
		var childNodeSubtreeIndex=null;
		for(var i=0;i<LCA_node.children.length;i++){
			if(checkNodeID(parentID,LCA_node.children[i])){
				parentNodeSubtreeIndex=i;
			}
			if(checkNodeID(childID,LCA_node.children[i])){
				childNodeSubtreeIndex=i;
			}
		}
		console.log(childNodeSubtreeIndex,parentNodeSubtreeIndex);

		//case2-1
		if(parentNodeSubtreeIndex<childNodeSubtreeIndex){
			var flag1=isLeftestORrightestNode(parentNode,LCA_node.children[parentNodeSubtreeIndex],"right");
			var flag2=isLeftestORrightestNode(childNode,LCA_node.children[childNodeSubtreeIndex],"left");
			if(flag1&&flag2){
				findFlag=true;
				//找到childNode的父节点，并从其子节点数组中删除childNode
				for(var i=0;i<treenodes.length;i++){
					for(var j=0;j<treenodes[i].children.length;j++){
						if(treenodes[i].children[j]==childNode){
							treenodes[i].children.splice(j,1);
						}
					}
				}
				//将childNode添加为parentNode的最后一个子节点
				parentNode.children.push(childNode);
			}
		}
		//case2-2
		else{
			var flag1=isLeftestORrightestNode(parentNode,LCA_node.children[parentNodeSubtreeIndex],"left");
			var flag2=isLeftestORrightestNode(childNode,LCA_node.children[childNodeSubtreeIndex],"right");
			console.log("fff");
			console.log(flag1,flag2);
			if(flag1&&flag2){
				findFlag=true;
				//找到childNode的父节点，并从其子节点数组中删除childNode
				for(var i=0;i<treenodes.length;i++){
					for(var j=0;j<treenodes[i].children.length;j++){
						if(treenodes[i].children[j]==childNode){
							treenodes[i].children.splice(j,1);
						}
					}
				}
				//将childNode添加为parentNode的第一个子节点
				parentNode.children.splice(0,0,childNode);
			}
		}

		
		//找到"父节点"的左右兄弟节点
		/*while(queue.length>0){
			var currentNode=queue.shift();
			for(var i=0;i<currentNode.children.length;i++){
				if(currentNode.children[i].nodevalue.split("_")[1]==parentID){		
					parentIndexInSiblings=i;							
					parentParentNode=currentNode;						
					if(i>0){
						leftSiblingNode=currentNode.children[i-1];
					}
					if(i<currentNode.children.length-1){
						rightSiblingNode=currentNode.children[i+1];
					}					
					findParentFlag=true;
					break;
				}
			}
			if(findParentFlag){
				break;
			}
			else{
				for(var i=0;i<currentNode.children.length;i++){
					queue.push(currentNode.children[i]);
				}
			}
		}*/
		
	}

	if(!findFlag){
		alert("This movement will not keep the sequence of words in the sentence");
		document.getElementById("parent_child_ID").style.background="#FFAAAA";
		return false;
	}

	document.getElementById("parent_child_ID").style.background="#FFFFFF";
	
	//刷新页面显示
	showIndex=document.getElementById("showNodeIndexBtn").innerText;
	if(showIndex=="show NodeID"){
		var tree_data=getCompleteEchartsTree(false);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}
	else{
		var tree_data=getCompleteEchartsTree(true);
		showEchartsTree(document.getElementById("bpres_tree_container"),tree_data);
	}

	//刷新当前句法树文本框值
	generateNewTreeText();

	return;
}
//判断node是否是root的最左或最右子孙节点，type可取"left"或"right"
function isLeftestORrightestNode(node,root,type){
	if(type=="left"){
		//在root及其最左子孙中查探
		var tmp=root;
		if(tmp){
			if(tmp==node){
				return true;
			}
			
			while(tmp.children.length!=0){
				console.log(tmp);
				if(tmp.children[0]==node){
					return true
				}
				else{
					tmp=tmp.children[0];
				}
			}
			return false;
		}
	}
	else if(type="right"){
		//在root及其最右子孙中查探
		var tmp=root;
		if(tmp){
			if(tmp==node){
				return true;
			}
			
			while(tmp.children.length!=0){
				console.log(tmp);
				if(tmp.children[tmp.children.length-1]==node){
					return true
				}
				else{
					tmp=tmp.children[tmp.children.length-1];
				}
			}
			return false;
		}
	}
}
//寻找以root为根的树中，node1和node2的最低公共祖先节点
//case1:如果找到n1或n2，就把它返回给它的父结点调用处（有可能另一个节点是其子孙节点，一路返回至调用处依然是最低公共父节点）
//case2:如果向下到头都没有找到，那么返回NULL
//case3:如果当前结点左右子树都返回非NULL，那么当前结点就是最近公共父结点，返回这个节点给上一级
function lowestCommonAncestorNode(node1,node2,root){
	if(node1==node2){
		return node1;
	}
	if(node1==root){
		return root;
	}
	if(node2==root){
		return root;
	}
	if(root.children.length==0){
		return false;
	}

	var findFlags=new Array(root.children.length);
	for(var i=0;i<findFlags.length;i++){
		findFlags[i]=false;
	}
	for(var i=0;i<root.children.length;i++){
		findFlags[i]=lowestCommonAncestorNode(node1,node2,root.children[i]);
	}
	var count=0;
	for(var i=0;i<findFlags.length;i++){
		if(findFlags[i]!=false){
			count+=1;
		}
	}
	if(count==2){   //case1
		return root;
	}
	else if(count==0){   //case 2
		return false;
	}
	else{
		for(var i=0;i<findFlags.length;i++){
			if(findFlags[i]!=false){
				return findFlags[i];          //case3
			}
		}
	}
}


function getNodeContent(){
	var nodeID=document.getElementById("nodeIndexID").value;	

	//检查节点ID是否有效
	if(nodeID!="0"){
		res=checkNodeID(nodeID,rootnode);
		if(!res){
			document.getElementById("nodeIndexID").style.background="#FFAAAA";
			alert(nodeID+" is an invalid nodeID");
			return;
		}
	}
	document.getElementById("nodeIndexID").style.background="#FFFFFF";

	//找到该节点并获取内容
	var queue=[rootnode];
	var findFlag=false;
	
	while(queue.length!=0){
		var currentNode=queue.shift();
		for(var i=0;i<currentNode.children.length;i++){
			if(currentNode.children[i].nodevalue.split("_")[1]==nodeID){										
				document.getElementById("nodeContentID").value=currentNode.children[i].nodevalue.split("_")[0];
				findFlag=true;
				break;
			}
		}
		if(findFlag){
			break;
		}
		else{
			for(var i=0;i<currentNode.children.length;i++){
				queue.push(currentNode.children[i]);
			}
		}
	}
}


//根据当前标注的树结构，得到句法结构的文本形式，与BerkeleyParser的输出格式一致
function generateNewTreeText(){
	var newTreeText="";
	
	for(var i=0;i<rootnode.children.length;i++){
		newTreeText+=getTreeText(rootnode.children[i]);
		if(i!=rootnode.children.length-1){
			newTreeText+=" ";
		}
	}

	newTreeText="( "+newTreeText+" )";
	document.getElementById("conpparse_now").value=newTreeText;
	return;
}
function getTreeText(treeroot){
	var treeText="(";
	//treeroot的孩子是子节点
	if(treeroot.children.length==1 && treeroot.children[0].children.length==0){
		treeText+=treeroot.nodevalue.substr(0,treeroot.nodevalue.lastIndexOf("_"));
		treeText+=" ";
		treeText+=treeroot.children[0].nodevalue.substr(0,treeroot.children[0].nodevalue.lastIndexOf("_"));
		treeText+=")";
		return treeText;
	}
	else{
		treeText+=treeroot.nodevalue.substr(0,treeroot.nodevalue.lastIndexOf("_"))+" ";
		for(var i=0;i<treeroot.children.length;i++){
			treeText+=getTreeText(treeroot.children[i]);
			if(i!=treeroot.children.length-1){
				treeText+=" ";
			}
		}

		treeText+=")";
		return treeText;
	}
}


//**********提交表单（或者修改节点值时），检查每个节点的值是否有效，例如是否是有效的phrase类型等等**********
function checkConpresNodeValidFunc(){
	console.log("checkConpresNodeValidFunc");
	var validPhraseTag=['ADJP','ADVP','CLP','CP','DNP',
						'DP','DVP','FRAG','IP','LCP',
						'LST','NP','PP','PRN','QP','UCP','VP',
						'VCD','VCP','VNV','VPT','VRD','VSB',
						'ADV','APP','BNF','CND','DIR','EXT',
						'FOC','HLN','IJ','IMP','IO',
						'LGS','LOC','MNR','OBJ','PN',
						'PRD','PRP','Q','SBJ','SHORT','TMP',
						'TPC','TTL','WH','VOC'];
	var validPOS=['AD','AS','BA','CC','CD','CS','DEC','DEG','DER','DEV',
                  'DT','ETC','FW','IJ','JJ','LB','LC','M','MSP','NN',
                  'NR','NT','OD','ON','P','PN','PU','SB','SP','VA',
                  'VC','VE','VV'];

    var queue=[rootnode];
    while(queue.length>0){
    	var thisnode=queue.shift();
    	//根节点不检查
    	if(thisnode.nodevalue.split("_")[1]!='0'){    		    
	    	//叶子节点
	    	if(thisnode.children.length==0){}

	    	//子节点是叶子节点
	    	else if(thisnode.children[0].children.length==0){  //只检查第一个子节点，应该只有一个子节点，这里不检查子节点数
	    		var posRightFlag=false; 
	    		for(var i=0;i<validPOS.length;i++){
	    			if(validPOS[i]==thisnode.nodevalue.split("_")[0]){
	    				posRightFlag=true;
	    				break;
	    			}
	    		}
	    		if(posRightFlag==false){
	    			alert("node["+thisnode.nodevalue+"] is not a valid part-of-speech, valid part-of-speech includes: "+validPOS);
	    			return false;
	    		}
	    	}

	    	//自身和子节点都不是叶子节点
	    	else{
	    		var tagRightFlag=false;
	    		for(var i=0;i<validPhraseTag.length;i++){
	    			if(validPhraseTag[i]==thisnode.nodevalue.split("_")[0]){
	    				tagRightFlag=true;
	    				break;
	    			}
	    		}
	    		if(tagRightFlag==false){
	    			alert("node["+thisnode.nodevalue+"] is not a valid tag for phrase, valid phrase tags are: "+validPhraseTag);
	    			return false;
	    		}
	    	}

	    	if(thisnode.children.length!=0){
	    		for(var i=0;i<thisnode.children.length;i++){
	    			queue.push(thisnode.children[i]);
	    		}
	    	}
	    }
    }
    
    return true;
}

//**********提交表单时，检查当前的标注是否和标注的分词和词性一致，并且词性节点只能有一个子节点*********
function checkConpresConsistencyFunc(){
	console.log("checkConpresConsistencyFunc");
	var posres=new Array();
	var segres=new Array();

	//迭代的先序遍历
	var stack=new Array();
	stack.push(rootnode);
	while(stack.length>0){
		thisnode=stack.pop();
		
		//叶子节点
		if(thisnode.children.length==0){
			segres.push(thisnode.nodevalue.split("_")[0]);
			continue;
		}

		//非叶子节点，将子节点从右至左压栈
		//同时判断该节点是否是词性节点
		for(var i=thisnode.children.length-1;i>=0;i--){
			//词性节点（子节点中有叶子节点，并且仅有一个子节点）
			if(thisnode.children[i].children.length==0 && thisnode.children.length!=1){
				alert("If node"+thisnode.nodevalue+" is a part-of-speech node, it should have only one child node");
				return false;
			}
			else if(thisnode.children[i].children.length==0 && thisnode.children.length==1){
				posres.push(thisnode.nodevalue.split("_")[0]);
			}

			
			//压栈
			stack.push(thisnode.children[i]);
			var queuestr="";
			for(var j=0;j<stack.length;j++){
				queuestr+=stack[j].nodevalue+" ";
			}
		}		
	}

	//检查词性和分词
	console.log(posres);
	console.log(segres);
	var segpos_tag=document.getElementById("segpos").value.split(" ");
	for(var i=0;i<segpos_tag.length;i++){
		var seg=segpos_tag[i].split("_")[0];
		var pos=segpos_tag[i].split("_")[1];

		if(seg!=segres[i]){			
			alert("Word segment is not consistent with that in original tree");
			return false;
		}
		if(pos!=posres[i]){
			//忽略自定义的时间地点词性
			if(pos=="time"||pos=="loc"){
				continue;
			}
			alert("Part-of-speech tag are not consistent with that in original tree");
			return false;
		}

	}

	
	return true;
}


//检查用户输入的节点ID是否有效
function checkNodeID(nodeID,tree){
	if (nodeID=="0"){
		return false;
	}
	if(tree.nodevalue.split("_")[1]==nodeID){
		return true;
	}
	else{
		var findFlag=false;
		//console.log(tree.children);
		for(var subtree in tree.children){
			findFlag=checkNodeID(nodeID,tree.children[subtree])||findFlag;
		}
		return findFlag;
	}
}


function showEchartsTree(tree_container,tree_data){
	// 路径配置
	require.config({
	  paths: {
	    echarts: 'http://echarts.baidu.com/build/dist'
	  }
	});

	// 使用
	require(
	  [
	    'echarts',
	    'echarts/chart/tree',
	  ],
	
	function (ec) {
	    // 基于准备好的dom，初始化echarts图表
	    var myChart = ec.init(tree_container); 
	    
	    console.log(tree_data);
	    //设置数据
	    var option={
			title : {
	        text: ''
		    },
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    series : [
		        {
		            name:'conp_tree',
		            type:'tree',
		            orient: 'vertical',  // vertical horizontal
		            rootLocation: {x:'center',y: "top"}, // 根节点位置  {x: 100, y: 'center'}
		            nodePadding: 50,
		            layerPadding: 50,
		            hoverable: true,
		            roam: true,
		            symbolSize: 10,
		            itemStyle: {
		                normal: {
		                    color: '#a2b700',
		                    label: {
		                        show: true,
		                        position: 'top',
		                        formatter: "{b}",
		                        textStyle: {
		                            color: '#000',
		                            fontSize: 5
		                        }
		                    },
		                    lineStyle: {
		                        color: '#ccc',
		                        type: 'curve' // 'curve'|'broken'|'solid'|'dotted'|'dashed'

		                    }
		                },
		                emphasis: {
		                    color: '#4883b4',
		                    label: {
		                        show: false,
		                    },
		                    borderWidth: 0
		                }
		            },
		            
		            data: []
		        }
		    ]
		};

		option["series"][0]["data"]=[tree_data];
		//console.log(tree_data.toJSONString());
	    // 为echarts对象加载数据 

	    myChart.setOption(option); 
	  }
	);
}