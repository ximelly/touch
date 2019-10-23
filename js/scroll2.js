function assert(desccribe,msg){
    if(!desccribe){
        throw new Error(msg||"error");
    }
}

function getElement(el){
    assert(el,"父容器不能为空");
    if(typeof el=="string"){
        return document.querySelector(el);
    }else if(el instanceof HTMLElement){
        return el;
    }else{
        return false;
    }
}


class Scroll extends Pipe{
    constructor(container,options){
        super();
        this.container=getElement(container);
        assert(this.container,"未找到父容器");
        this.child=this.container.children[0];
        assert(this.child,"未找到子容器");
        let defaultOptions={
            scrollY:true,
            scrollX:false,
            factor:0.2,
            animateDuring:1000,
            animateType:"ease"
        }
        this.options=Object.assign({},defaultOptions,options);
        this.position={
            x:0,
            y:0
        }
        this.maxY=this.child.offsetHeight-this.container.offsetHeight;//最多能往上移动多少
        this.maxX=this.child.offsetWidth-this.container.offsetWidth;//最多能往左移动多少
        this._initEvent();
    }
    _initEvent(){
        let startX,startY,startPostion;
        this._touchstart=ev=>{
            ev.preventDefault();
            ev.cancelBubble=true;
            this.child.style.transition=``;
            startPostion={...this.position};
            let touch=ev.targetTouches[0];
            startX=touch.clientX;
            startY=touch.clientY;

            this.emit("start",startX,startY);
        }
        this._touchmove=ev=>{
            ev.preventDefault();
            ev.cancelBubble=true;
            let touch=ev.targetTouches[0];
            let disX=touch.clientX-startX;
            let disY=touch.clientY-startY;

            this.position.x=startPostion.x+disX;
            this.position.y=startPostion.y+disY;
            this._handleBoundary();
        }
        this._touchend=ev=>{
            ev.preventDefault();
            ev.cancelBubble=true;
            let {x,y}=this.position;
            if(y>0){
                y=0;
            }
            if(x>0){
                x=0;
            }
            if(y<-this.maxY){
                y=-this.maxY;
            }
            if(x<-this.maxX){
                x=-this.maxX;
            }
            this.position.x=x;
            this.position.y=y;
            this.child.style.transition=`${this.options.animateDuring}ms transform ${this.options.animateType}`;
            this._move(x,y);
            this.emit("end",x,y);
        }
        this._move=(x,y)=>{
            if(this.options.scrollY&&this.options.scrollX){
                this.child.style.transform=`translate(${x}px,${y}px)`;
            }else if(this.options.scrollY){
                this.child.style.transform=`translateY(${y}px)`;
            }else if(this.options.scrollX){
                this.child.style.transform=`translateX(${x}px)`;
            }
        }
        this._handleBoundary=()=>{
            let {x,y}=this.position;

            //当水平或垂直超出边际时使移动速度变慢
            this.maxY=this.maxY<0?0:this.maxY;
            this.maxX=this.maxX<0?0:this.maxX;

            if(y>0){
                y*=this.options.factor;
            }
            if(x>0){
                x*=this.options.factor;
            }
            if(y<-this.maxY){
                y=-this.maxY+(y+this.maxY)*this.options.factor;
            }
            if(x<-this.maxX){
                x=-this.maxX+(x+this.maxX)*this.options.factor;
            }
            this._move(x,y);
            this.emit("move",x,y);
        }
        this.child.addEventListener("touchstart",this._touchstart,false);
        this.child.addEventListener("touchmove",this._touchmove,false);
        this.child.addEventListener("touchend", this._touchend,false);
    }
    destory(){
        this.child.removeEventListener("touchstart",this._touchstart,false);
        this.child.removeEventListener("touchmove",this._touchmove,false);
        this.child.removeEventListener("touchend", this._touchend,false);
    }
}