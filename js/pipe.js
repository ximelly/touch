class Pipe{
    constructor(){
        this.pipes={};
    }
    on(type,fn){
        this.pipes[type]=this.pipes[type]||[];
        if(this.pipes[type].findIndex(fn)==-1){//findIndex VS indexOf  ？？？
            this.pipes[type].push(fn);
        }
    }
    emit(type,...args){
        if(this.pipes[type]){//这个事件是否被监听
            this.pipes[type].forEach((fn)=>{
                fn.apply(this,[...args]);
            })
        }
    }
}