
/*
    Swiper构造函数
        参数: class-name - >轮播图容器的类名
    1.选中所有的dom结构,把所有的根swiper有关的元素放在有关对象里面
        root:根节点 wrapper -->滑块容器 slides--> 所有的滑块
    2.处理第二个参数-> options配置对象
    3.初始化 -> 开始控制配置轮播图
*/
function Swiper(class_name,options){
    this.dom = {};//this指向实例化对象
    this.privateDate = {};//处理第二个参数 options配置对象
    selectDom.call( this, class_name );
    handlOptions.call(this,options);
    init.call(this);
}
function selectDom(class_name){
    //获取根节点[轮播图容器]
    this.dom.root = document.querySelector(class_name);
    //获取滑块容器
    this.dom.wrapper = this.dom.root.querySelector('.swiper-wrapper');
    //获取滑块集合
    this.dom.slides = this.dom.wrapper.children;
    //前进
    this.dom.next_btn = this.dom.root.querySelector('.swiper-button-next');
    //后退
    this.dom.previous_btn = this.dom.root.querySelector('.swiper-button-prev');
    //分页器
    this.dom.pagination = this.dom.root.querySelector('.swiper-pagination');
}
function handlOptions(options){
    let {direction} = options;
    Object.assign(this.privateDate, options);
    direction = direction ? direction : 'horizontal';
    //合并用户传进来的参数
    Object.assign(this.privateDate,{
        direction:direction
    })
}
/*初始轮播图的函数 
    1: 我们需要知道现在滑到了第几张, 轮播图容器的高度和宽度 --> 给滑块和滑块容器设置宽度和高度
*/
function init(){
    let width = this.dom.root.offsetWidth,
        height = this.dom.root.offsetHeight;
    Object.assign(this.privateDate,{
        index:0,
        width:width,
        height:height
    })
    let {wrapper,previous_btn,next_btn} = this.dom;
    //设置高度或者宽度
    width_or_height.call(this);
    //给wrapper元素绑定拖拽
    drag.call(this,wrapper)
    //判断要不要给前进后退绑定点击事件
    next_btn ? next_btn.addEventListener('click', go_or_back.bind(this) ): '';//前进
    previous_btn ? previous_btn.addEventListener('click',go_or_back.bind(this) ): '';//后退
    //生成分页器
    this.dom.pagination ? make_bullets.call(this) : '';
     //判断要不要给分页器绑定点击事件
    this.privateDate.bullet_clickable === true ? bullet_click.call(this) : '';
    //判断是否需要自动播放
    if( this.privateDate.autoplay ){
        //先设置延时
        this.privateDate.timeout ? '' : this.privateDate.timeout = 3000;//如果没有设置timeout就默认设置timeout为3000ms
        autoplay.call(this);  //再去执行函数
    }
    //给大盒子绑定鼠标移入和移出事件
    this.privateDate.autoplay ? container_mouse.call(this)  : '';
}
//根据轮播图的方向来判断是设置宽度或者高度
function width_or_height(){
    //设置滑块容器的宽度
    let { wrapper, slides, previous_btn, next_btn} = this.dom;
    let {width, height, direction} = this.privateDate;
    if( direction === 'horizontal' ){//如果是水平方向的轮播
        wrapper.style.width = `${width * slides.length}px`;
        wrapper.style.height = `${height}px`;
    }else{//如果是竖直方向的轮播
        wrapper.style.height = `${ height * slides.length }px`;
        wrapper.style.width = `${ width }px`;
        //改变弹性盒模型的主轴排列方向
        wrapper.classList.add('flex-direction');
    }
    wrapper.classList.toggle('wrapper-transition');
    //前进和后退按钮设置透明和不透明
    previous_btn &&  next_btn ? toogle_opacity.call(this) : '';
    //给每个滑块设置宽和高 slide_item每一个滑块
    [].forEach.call(slides, function (slide_item) {
        //函数里的this默认指向window 
        slide_item.style.width = `${width}px`;
        slide_item.style.height = `${height}px`;
    })
}
function drag(ele){
    //mouse_position 鼠标的坐标
    let mouse_position = {x:0, y:0},
    next_or_not = false;//用来储存表示是否滑动下一张  true表示可以滑动
        isclick = false;//是否按下了鼠标
    Object.assign(this.privateDate,{
        move_x :0, //水平方向拖到的距离
        move_y:0//竖直方向向拖动的距离
    })
    //鼠标按下
    ele.addEventListener('mousedown',function(e){
        e.stopPropagation();
        isclick = true;
        ele.classList.toggle('wrapper-transition')//鼠标按下清除过度效果
        mouse_position = {x:e.clientX, y:e.clientY}
    }.bind(this))
      //鼠标滑动
      document.addEventListener('mousemove',function(e){
        e.stopPropagation();
        if(!isclick) return
        let {width, height} = this.privateDate;
        //如果轮播图是水平方向我们就只需要判断moveX,并且给滑块容器设置的平移为水平方向的平移
        if(this.privateDate.direction === 'horizontal'){
            this.privateDate.move_x += e.clientX - mouse_position.x;
            Math.abs(this.privateDate.move_x - this.privateDate.index * -this.privateDate.width ) >=  width*0.4 ?
                 next_or_not = true : next_or_not = false
                //限定拖动滑动的距离
           this.privateDate.move_x = Math.min( Math.max( this.privateDate.move_x, (this.dom.slides.length-1) * -width + -width * 0.15 ), width * 0.15 )
           move_wrapper.call(this, ele, 'horizontal', this.privateDate.move_x)
            
        }else{//如果是竖直方向的滑动就走这里
            this.privateDate.move_y += e.clientY - mouse_position.y;
            console.log( this.privateDate.move_y )
            Math.abs(this.privateDate.move_y - this.privateDate.index * -this.privateDate.height) >= height*0.4 ?
                next_or_not = true : next_or_not = false;
                //限定拖动滑动的距离
                this.privateDate.move_y = Math.min( Math.max( this.privateDate.move_y, (this.dom.slides.length-1) * -height + -height * 0.15 ), height * 0.15 );
           move_wrapper.call(this, ele, 'vertical', this.privateDate.move_y)
        }   
        //重新赋值鼠标的坐标
        mouse_position = {x:e.clientX, y:e.clientY}
    }.bind(this))
    document.addEventListener('mouseup',function(e){
        e.stopPropagation();
        if(!isclick) return;
        ele.classList.toggle('wrapper-transition')
        let {direction} = this.privateDate;//拿到方向
        if(next_or_not){
            if(direction === 'horizontal'){
                this.privateDate.index * -this.privateDate.width < this.privateDate.move_x ?
                    --this.privateDate.index : ++this.privateDate.index;
            }else{
                this.privateDate.index * -this.privateDate.height < this.privateDate.move_y ?
                --this.privateDate.index : ++this.privateDate.index;
            }
            //算出需要移动的距离
             move_dis.call(this,ele);
            toggle_bullet_bgc.call(this);//切换分页器小圆圈
        }else{
            if(direction === 'horizontal'){
                this.privateDate.move_x = this.privateDate.index * - this.privateDate.width;
                move_wrapper.call(this, ele, 'horizontal', this.privateDate.move_x);
            }else{
                this.privateDate.move_y = this.privateDate.index * - this.privateDate.height;
                move_wrapper.call(this, ele, 'vertical', this.privateDate.move_y);
            }
        }
        isclick = false;
        next_or_not = false;
    }.bind(this))
}   
//移动wrapper
function move_wrapper(ele, direc, distance){
    //ele 是swiper-wrapper direc方向  distance移动多少距离
    if( direc ===  'horizontal'){
        ele.style.transform = `translateX(${distance}px)`
    }else{
        ele.style.transform = `translateY(${distance}px)`
    }
}
//计算应该移动多少距离
function move_dis(ele) {//ele移动哪个元素

    let {width, height, direction} = this.privateDate;
    if( direction === 'horizontal' ){
        this.privateDate.index = Math.max(Math.min( this.privateDate.index, this.dom.slides.length -1 ), 0);
        this.privateDate.move_x = this.privateDate.index * -width;
        move_wrapper(ele, direction, this.privateDate.move_x);
    }else{//如果是竖直方向移动
        this.privateDate.index = Math.max(Math.min( this.privateDate.index, this.dom.slides.length -1 ), 0);
        this.privateDate.move_y = this.privateDate.index * -height;
        move_wrapper(ele, direction, this.privateDate.move_y);
    }
}
//给大盒子绑定鼠标移入和移出事件
function container_mouse (){
    let {root} = this.dom;
    root.addEventListener('mouseenter', function(e){
        e.stopPropagation();
        clearInterval(this.privateDate.timer);
    }.bind(this))
    root.addEventListener('mouseleave', function(e){
        e.stopPropagation();
        autoplay.call(this)
        
    }.bind(this))
}

/*
    给前进和后退按钮加opacity类名
*/
function toogle_opacity() {
    this.dom.previous_btn.classList.toggle('opacity');
    this.dom.next_btn.classList.toggle('opacity');
}


//前进后退按钮函数
function go_or_back(e){
    e.stopPropagation();
    if(e.target.className.includes('next') ){
        this.privateDate.index = Math.min(  ++this.privateDate.index , this.dom.slides.length - 1 );
    }else{
        this.privateDate.index = Math.max(  --this.privateDate.index , 0 );
    }
    click_move.call(this);
    function click_move(){
        if(this.privateDate.direction === 'horizontal'){
            this.privateDate.move_x = this.privateDate.index * -this.privateDate.width ;
            //移动wrapper
            move_wrapper(this.dom.wrapper, this.privateDate.direction, this.privateDate.move_x);
        }else{
            this.privateDate.move_y = this.privateDate.index * -this.privateDate.height ;
            //移动wrapper
            move_wrapper(this.dom.wrapper, this.privateDate.direction, this.privateDate.move_y);
        }
        toggle_bullet_bgc.call(this)//切换小圆点背景颜色
    }
}
//生成分页器
function make_bullets() {
    let fragment = document.createDocumentFragment(); //fragment[碎片] 生成文档碎片
    let {slides, pagination} = this.dom;
    for( let i = 0, length = slides.length; i < length; i++ ){
        var bullet_span = document.createElement('span'); //创建span标签 
        //设置类名
        bullet_span.setAttribute( 'class', 'swiper-pagination-bullet' );
        //给每一个都绑定一个下标
        bullet_span.own_index = i;
        fragment.append(bullet_span);
    }
    pagination.append(fragment);
    pagination.children[this.privateDate.index].classList.add('bullet-bgc');
    //给this.dom对象添加子弹头属性
    Object.assign( this.dom, {
        bullets: pagination.querySelectorAll('.swiper-pagination-bullet')
    } )
}

//给分页器小圆圈切换类名
function toggle_bullet_bgc(){
    let {dom, privateDate} = this;
    dom.bullets.forEach(function(item){
        item.classList.remove('bullet-bgc')
    });
    dom.bullets[privateDate.index].classList.add('bullet-bgc')
}
//给小圆圈绑定点击事件
function bullet_click(){
    const {bullets, wrapper} = this.dom;
    const { privateDate} = this;
    bullets.forEach(function(item){
        item.addEventListener('click', handle_click.bind(this))
    }.bind(this))
   function  handle_click(e){
       e.stopPropagation();
       privateDate.index = e.target.own_index //把私用数据里的index,变成span标签携带的下标
        move_dis.call(this,wrapper)
        toggle_bullet_bgc.call(this)
   }
}
//自动轮播函数
function autoplay(){
    const {privateDate, dom } = this;
    let timer = setInterval(function(){
        privateDate.index = (++privateDate.index) % dom.slides.length;
        move_dis.call(this, dom.wrapper);
        toggle_bullet_bgc.call(this)//更新分页器
    }.bind(this),privateDate.timeout);
    console.log(privateDate.timeout)
    privateDate.timer = timer;
}