GlobalFunc=[];

/*Surface Definition*/
function CreateSurface(){
	function surface(){};
	surface.prototype.sheight=screen.height||window.innerHeight||document.body.clientHeight,
	surface.prototype.swidth=screen.width||window.innerWidth||document.body.clientWidth;
	try{
        surface.prototype.canvas=document.createElementNS("http://www.w3.org/2000/svg","svg"),surface.prototype.canvas.style && (surface.prototype.canvas.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
    }
	catch(err){
        surface.prototype.canvas=document.createElement("div");
	}
	document.body.appendChild(surface.prototype.canvas);
	surface.prototype.canvas.id="canvas";
	surface.prototype.canvas.setAttribute('width',String(surface.prototype.swidth));
	surface.prototype.canvas.setAttribute('height',String(surface.prototype.sheight));
	surface.prototype.canvas.style.cssText="left: 0px; top: 0px; position: absolute;";
	for(var obj in GlobalFunc)this[String(obj)]=GlobalFunc[obj];
	surface.prototype.canvas.shapeCount=0;
	surface.prototype.canvas.shapes=[];
	surface.prototype.canvas.checkwall=CW.bind();
	surface.prototype.canvas.objCol=OC.bind();
	return new surface;
}

function CreateMesh(surface){
	var tMesh=[];
	for(var i=0;i<surface.swidth;i++){
		tMesh[i]=[];
		for(var j=0;j<surface.sheight;j++){
			tMesh[i][j]= new meshElem;
		}
	}
	surface.canvas.mesh=tMesh;
	
	/*shape mesh creation*/
	surface.canvas.setmesh=function(obj){
		switch(obj.shape){
			case	'circle':	var x=0,y=0,xc=0,yc=0,p=0;
								xc=obj.parameters.cx;
								yc=obj.parameters.cy;
								if(surface.canvas.objCol(xc,yc,obj)){
									return false;
								}
								surface.canvas.mesh[xc][yc]=obj;
								/* Bresenham's circle algorithm */
								for(var ir=obj.parameters.cr;ir>1;ir--){
									x = 0; 
									y = ir; 
									p = 3 - 2 * ir;
									while (y >= x&&xc>=x&&yc>=y) // only formulate 1/8 of circle
									{
										var checkCol=	surface.canvas.objCol(xc-x,yc-y,obj)
														||surface.canvas.objCol(xc-y,yc-x,obj)
														||surface.canvas.objCol(xc+y,yc-x,obj)
														||surface.canvas.objCol(xc+x,yc-y,obj)
														||surface.canvas.objCol(xc-x,yc+y,obj)
														||surface.canvas.objCol(xc-y,yc+x,obj)
														||surface.canvas.objCol(xc+y,yc+x,obj)
														||surface.canvas.objCol(xc+x,yc+y,obj);
										if(checkCol)
										{
											return false;
										}
										surface.canvas.mesh[xc-x][yc-y]=obj;//upper left left
										surface.canvas.mesh[xc-y][yc-x]=obj;//upper upper left
										surface.canvas.mesh[xc+y][yc-x]=obj;//upper upper right
										surface.canvas.mesh[xc+x][yc-y]=obj;//upper right right
										surface.canvas.mesh[xc-x][yc+y]=obj;//lower left left
										surface.canvas.mesh[xc-y][yc+x]=obj;//lower lower left
										surface.canvas.mesh[xc+y][yc+x]=obj;//lower lower right
										surface.canvas.mesh[xc+x][yc+y]=obj;//lower right right
										
										if (p < 0) p += 4*x++ + 6; 
											else p += 4*(x++ - y--) + 10; 
									} 

								}
								break;
			default:			return false;
		}
		return true;
	}
	/*end*/
}

initgraph=function(){
	this.surface=CreateSurface();
	CreateMesh(this.surface);
}
/*End*/

/*others*/
function colorpad(color){
       var color1;
     if(typeof color == "string"){
         return color;
     }
     else if(color == null)
            return 'blue';
     else if(typeof color == "number"){
         color1=color;
		if(color1>4095)
			color1=4095;
		var t=color1.toString(16),i;
		for(i=t.length;i<3;i++){
            t="0"+t;
		}
		t="#"+t;
		return t;
     }
    return 'blue';
}
/**/

/*shape definitions*/

GlobalFunc['createshape']=function(){
	var shape=null;
	
	surface.canvas.shapeCount+=1;
	switch(arguments[0]){
		case 'circle':	shape=circle(arguments[1],arguments[2],arguments[3],colorpad(arguments[4]),colorpad(arguments[5]));
						
						break;
						
	}
	if(shape!=null){
		surface.canvas.shapes[shape.id]=shape;
	}else if(shape==null){
		surface.canvas.shapeCount-=1;
		if(surface.canvas.shapeCount<0)surface.canvas.shapeCount=0;
	}
	return shape;
}
function circle(x,y,r,sc,fc){
	var me=new meshElem("circle");
	me.parameters.cx=x;
	me.parameters.cy=y;
	me.parameters.cr=r;
	if(surface.canvas.checkwall(me)){
		me.remParameters();
		return null;
	}
	if(!surface.canvas.setmesh(me)){
		me.remParameters();
		return null;
	}

	try{
		
		
        var elem;
        try
		{
            elem=document.createElementNS("http://www.w3.org/2000/svg","circle");
            elem.style && (elem.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
            surface.canvas.appendChild(elem);
            elem.setAttribute('cx',x);
            elem.setAttribute('cy',y);
            elem.setAttribute('r', r);
            elem.setAttribute('fill',fc);
            elem.setAttribute('stroke', sc);
            elem.id=String(surface.canvas.shapeCount);
            elem.etype= 'svg';
            elem.radius=String(r);
		}
		catch(err){
            if(document.namespaces['rvml']==undefined)
            {
                document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
                document.namespaces.add("rvml","urn:schemas-microsoft-com:vml","#default#VML");
            }
            document.getElementById('canvas').innerHTML+="<rvml:shape etype='vml' id='"+String(surface.canvas.shapeCount)+"' radius='"+String(r)+"' style='POSITION: absolute; FILTER: ; WIDTH: 1px; HEIGHT: 1px; TOP: 0px; LEFT: 0px' class='rvml' coordsize = '1,1' strokecolor = "+sc+" fillcolor="+fc+" path = ' ar"+(String(x-r)+","+String(y-r)+","+String(x+r)+","+String(y+r)+","+String(x)+","+String(y-r)+","+String(x)+","+String(y-r))+" x e'></rvml:shape>";
            elem=document.getElementById(String(surface.canvas.shapeCount));
        }
		surface.canvas.mesh[x][y].parameters.element=elem;
		surface.canvas.mesh[x][y].id=surface.canvas.shapeCount;
	}
	catch(err){
        document.getElementById('test').innerHTML+="Error: "+err;
		return null;
	}
	return surface.canvas.mesh[x][y];
}	
/* shape definitions End*/


/*shape Elements and Parameter Definitions*/

/*Shape Element Constructor*/
function meshElem(shape){
	this.shape=shape;
	this.id=-1;
	this.getParameters();
	this.setposition=	setpositionf.bind(this);
	this.move=	movef.bind(this);
	this.stop=	stopf.bind(this);
	this.pause=	pausef.bind(this);
	this.resume=	resumef.bind(this);
	this.resolvecollision= rescolf.bind(this);
};
/*end*/
meshElem.prototype.shape="";
meshElem.prototype.parameters= null;
/*Shape Parameter creation*/
meshElem.prototype.getParameters=function(){
	var par={};
	switch(this.shape){
		case 'circle':	par.element=null;
						par.cx=0;
						par.cy=0;
						par.cr=0;
						par.speed=0;
						par.acc=0;
						par.angle=0;
						par.cpx=0;
						par.cpy=0;
						par.cnx=0;
						par.cny=0;
						par.gravity=false;
						par.mhandle=null;
						par.reflect=false;
						par.move=false;
						this.collision={
							id:-1,
							worker:null
						};
						break;
		default:		par=null;
						break;
	}
	this.parameters=par;
}
/*end*/
meshElem.prototype.setParameters=function(obj){
	switch(this.shape){
		case 'circle':	this.id=obj.id;
						this.parameters.element=obj.parameters.element;
						this.parameters.cx=obj.parameters.cx;
						this.parameters.cy=obj.parameters.cy;
						this.parameters.cr=obj.parameters.cr;
						this.parameters.speed=obj.parameters.speed;
						this.parameters.acc=obj.parameters.acc;
						this.parameters.angle=obj.parameters.angle;
						this.parameters.cpx=obj.parameters.cpx;
						this.parameters.cpy=obj.parameters.cpy;
						this.parameters.cnx=obj.parameters.cnx;
						this.parameters.cny=obj.parameters.cny;
						this.parameters.gravity=obj.parameters.gravity;
						this.parameters.mhandle=obj.parameters.mhandle;
						this.parameters.reflect=obj.parameters.reflect;
						this.parameters.move=obj.parameters.move;
						break;
		default:		break;							
	}
	return true;
}
meshElem.prototype.remParameters=function(){
	switch(this.shape){
		case 'circle':	this.parameter=null;
						this.shape="";
						this.id=-1;
						break;
		default:		break;							
	}
	
}
/*End*/


/*Shape dynamics*/

/*shape position setting on canvas*/
setpositionf=function(){
	
	var me1=this,me={},me2={},x,y;
	if(this.parameters==null||this.parameters.element==null){
		return me1;
	}
	
	switch(this.shape){
		case	'circle':   x=this.parameters.cnx;
							y=this.parameters.cny;
							me=new meshElem(this.shape);
							me.setParameters(this);
							me.parameters.cpx=this.parameters.cx;
							me.parameters.cpy=this.parameters.cy;
							me.parameters.cx=x;
							me.parameters.cy=y;				//vary important to avoid detect if the pixel is occupied by others
							surface.canvas.checkwall(me);
							if(!surface.canvas.setmesh(me)){
								/*unable to set the mesh*/
								
								if(me.parameters.reflect){
									/*Shape collision*/
									me2=me1;
									me1=me;
									me=me2;
									me.resolvecollision();
									me.parameters.move=false;
									
								}
							}
							
							x=me.parameters.cx;
							y=me.parameters.cy;	
							switch(me.parameters.element.etype){
								case 'vml':	var r=parseInt(me.parameters.cr);
											document.getElementById(me.parameters.element.id).path="' ar"+String(x-r)+","+String(y-r)+","+String(x+r)+","+String(y+r)+","+String(x)+","+String(y-r)+","+String(x)+","+String(y-r)+" x e'";
											break;
								case 'svg': me.parameters.element.cx.baseVal.value=x;
											me.parameters.element.cy.baseVal.value=y;
											break;
							}
							me1.remParameters();
							break;
		default:			break;
	}
	try{
	surface.canvas.shapes[me.id]=me;
	}
	catch(err){
		document.getElementById('test').innerHTML+=" Error->"+me.id;
	}
	return me;
}
/*end*/

/*Math functions*/
function adjustangle(angle){
	var angle1=360,sign=1;
	if(angle!=0){
	angle1=Math.abs(angle);
	sign=angle/angle1;
	while(angle1>360)
		angle1=angle1-360;
	if(angle1>180&&angle1<360)
		angle1=angle1-360;
	}
	if(angle1==360)
	{
		sign=1;
	}
	return sign*angle1;
}
function correctangle(angle){
	var angle1=360+adjustangle(angle);
	while(angle1>360)
		angle1=angle1-360;
	if(angle1==0)
		angle1=360;
	return angle1;
}
/**/

/*set move parameter to true to start moving and set speed to keep moving*/

function checkobjectmovable(me){
	if(me.parameters==null||me.parameters.element==null){
		return false;
	}
	if(me.parameters.move==true){
		if(me.parameters.speed>0){
			return true;
		}
		me.parameters.move=false;
	}
	return false;
}
function CalNextPos(me){
	if(me.parameters.angle!=null){
	var pi=(Math.PI/180);
	var angle,nx=-1,ny=-1,r;
	me.parameters.speed=me.parameters.speed+me.parameters.speed*me.parameters.acc/50;
	if(me.parameters.gravity){
		me.parameters.acc=-10;
	}
	
	if(me.parameters.speed>=200){
		me.parameters.speed=200;
	}
	if(me.parameters.colang!=null){
		me.parameters.angle=me.parameters.colang;
		me.parameters.colang=null;
	}
	
	angle=pi*adjustangle(me.parameters.angle);
	r=me.parameters.speed;
	nx=	me.parameters.cx+Math.round(r*Math.cos(angle));
	ny=	me.parameters.cy-Math.round(r*Math.sin(angle));
	me.parameters.cnx=nx;	
	me.parameters.cny=ny;
	}
}
function moworker(me){
	me.parameters.mhandle=window.setInterval(function(){
		if(me.parameters==null||me.parameters.element==null){
			//alert("process error");
			return false;
		}
		if(!checkobjectmovable(me)){
			me.pause();
		}
		else
		{
			CalNextPos(me);
			var me1=me.setposition();
			me=me1;
		}
		return true;
	},15);
}
movef=function(){
	var me=this;
	if(me.parameters==null||me.parameters.element==null){
		return false;
	}
	me.parameters.move=true;
	moworker(me);
}
stopf=function(){
	var me=this;
	if(me.parameters==null||me.parameters.element==null){
		return false;
	}
	if(me.parameters.mhandle!=null){
		clearInterval(me.parameters.mhandle);
		me.parameters.mhandle=null;
		me.parameters.speed=0;
		me.parameters.angle=null;
		return true;
	}
		
	return false;
}
pausef=function(){
	var me=this;
	if(me.parameters==null||me.parameters.element==null){
		return false;		
	}	
	if(me.parameters.mhandle!=null){
		clearInterval(me.parameters.mhandle);
		me.parameters.mhandle=null;
		return true;
	}
	
	return false;
}
resumef=function(){
	var me=this;
	if(me.parameters==null||me.parameters.element==null){
		return false;
	}
	moworker(me);
}
/*Shape dynamics END*/


/*Collision*/
CW=function(obj){
	var rx=false,ry=false;
	switch(obj.shape){
		case 'circle':	var pi=(Math.PI/180);
						var test=document.getElementById('test');
						if(obj.parameters.cx-obj.parameters.cr<=1){
							//obj.parameters.cy=obj.parameters.cy+Math.round((obj.parameters.cr+obj.parameters.cx)*Math.tan(pi*(180-obj.parameters.angle)))
							obj.parameters.cx=obj.parameters.cr+1;
							obj.parameters.angle=-adjustangle(180+obj.parameters.angle);
							rx=true;
						}else
						if(obj.parameters.cx+obj.parameters.cr>=surface.swidth-10){
							obj.parameters.cx=surface.swidth-obj.parameters.cr-10;
							//obj.parameters.cy=obj.parameters.cy+Math.round((obj.parameters.cr+obj.parameters.cx)*Math.tan(pi*obj.parameters.angle))
							obj.parameters.angle=-adjustangle(180+obj.parameters.angle);
							rx=true;
						}else
							rx=false;
						if(obj.parameters.cy-obj.parameters.cr<=1){
							obj.parameters.cy=obj.parameters.cr+1;
							//obj.parameters.cx=obj.parameters.cx-Math.round(obj.parameters.cr*Math.tan(pi*(90-obj.parameters.angle)))
							obj.parameters.angle=-adjustangle(obj.parameters.angle);
							ry=true;
						}else
						if(obj.parameters.cy+obj.parameters.cr>=surface.sheight-100){
							obj.parameters.cy=surface.sheight-obj.parameters.cr-100;
							//obj.parameters.cx=obj.parameters.cx-Math.round(obj.parameters.cr*Math.tan(pi*(90-obj.parameters.angle)))
							obj.parameters.angle=-adjustangle(obj.parameters.angle);
							ry=true;
						}
						else
							ry=false;
						break;
		default:		rx=true;ry=true;
	}
	return rx||ry;
}
OC=function(tx,ty,obj){
	var tobj,tid,sid,sx,sy;
	tobj=surface.canvas.mesh[tx][ty];
	tid=tobj.id;
	sid=obj.id;
	if(tid!=-1){
		if(tid!=sid){
			/*sx=surface.canvas.shapes[sid].mx;
			sy=surface.canvas.shapes[sid].my;
			surface.canvas.mesh[sx][sy].collision.id=tid;*/
			if(sid!=-1){
				surface.canvas.shapes[sid].collision.id=tid;
			}
			
			return true;
		}
	}
	return false;
}
function collisionworker(obj){
	var tobj,tx,ty;
	tobj=surface.canvas.shapes[obj.collision.id];
	if(tobj.collision.id==obj.id&&tobj.collision.worker!=null){ // working our collision
		return false;
	}
	if(obj.collision.worker==null){
		var loopcount=0,ater=false;
		obj.collision.worker=window.setInterval(function(){
			var colresloved=false;
			if(obj.parameters.mhandle==null&&obj.collision.worker!=null){	//wait for self to be stopped
				tobj=surface.canvas.shapes[obj.collision.id];
				if(tobj.parameters.mhandle==null){ // wait for target to be stopped
					if(tobj.collision.id==-1&&tobj.id!=-1){		//
						tobj.collision.id=obj.id;
						//document.getElementById('test').innerHTML+=" WCS sid->"+obj.id+" tid->"+tobj.id+" WRK->"+obj.collision.worker+" unkey"+unkey+" && ";;
						calaftercollision(obj,tobj);
						
						
						
						//document.getElementById('test').innerHTML+=" WC sid->"+obj.id+" tid->"+tobj.id;
						colresloved=true;
					}else if(tobj.collision.id==obj.id){
						//document.getElementById('test').innerHTML+=" WCA sid->"+obj.id+" tid->"+tobj.id;
						//colresloved=true;
						tobj.collision.id=-1;
						clearInterval(tobj.collision.worker);
					}
				}
				else{
					if(tobj.collision.id==-1){
						tobj.pause();
					}
				}
			}
			if(loopcount<=5){
				loopcount=loopcount+1;
			}
			else{
				//document.getElementById('test').innerHTML+=" WCAT sid->"+obj.id+" tid->"+tobj.id;
				obj.parameters.angle+=180;
				ater=true;
				colresloved=true;
			}
			if(colresloved==true){
				clearInterval(obj.collision.worker);
				obj.collision.worker=null;
				//document.getElementById('test').innerHTML+=" WCE sid->"+obj.id+" tid->"+tobj.id+"## ";
				if(ater==false){
					tobj.collision.id=-1;
				}	
					tobj.move();
				
				obj.collision.id=-1;
				obj.move();
				
				
			}
		},1);
		return true;
	}
	return false;
}
rescolf=function(){
	var me=this;
	if(me.parameters==null||me.parameters.element==null||me.collision.id==-1||me.id==-1){
		return false;
	}
	return collisionworker(me);
}
function aftercollisionangle(obj,tobj){
	var colangle,colangle1,sangle,dangle,ncolang,rangle,sx,sy,tx,ty,sign=1;
	sx=obj.parameters.cx;
	sy=obj.parameters.cy;
	tx=tobj.parameters.cx;
	ty=tobj.parameters.cy;
	colangle=Math.round(Math.atan(Math.abs(sy-ty)/Math.abs(sx-tx))*(180/(Math.PI)));
	if(sy>ty){
		if(sx>tx)
			colangle=180-colangle;
	}else{
		if(sx>tx)
			colangle=180+colangle;
		else
			colangle=360-colangle;
	}
	
	colangle1=correctangle(colangle);
	sangle=correctangle(obj.parameters.angle);
	dangle=sangle-colangle1;//Math.abs(sangle-colangle1);
	
	if(Math.abs(dangle)<90){
		ncolang=colangle1-180;
		rangle=ncolang-dangle
		rangle=adjustangle(rangle);
	}else
		rangle=obj.parameters.angle;
	return rangle;
}
function calaftercollision(obj,tobj){
	obj.parameters.angle=aftercollisionangle(obj,tobj);
	tobj.parameters.angle=aftercollisionangle(tobj,obj);
	var speed=obj.parameters.speed;
	obj.parameters.speed=tobj.parameters.speed;
	tobj.parameters.speed=speed;
}
/*Collision End*/


/*By Biplab Sarkar*/