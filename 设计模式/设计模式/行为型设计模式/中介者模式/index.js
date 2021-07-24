// class Player{
//     constructor(name,team){
//         this.name = name;
//         this.enemy = null;
//     }
//     win(){
//         console.log(this.name + '胜利')
//     }
//     lose(){
//         console.log(this.name + '失败')
//     }
//     die(){
//         this.lose();
//         this.enemy.win();
//     }
// }
// let player = new  Player('小明');
// let player1 = new Player('张三');
// player.enemy = player1;
// player1.enemy = player;

// player1.die()
//张三失败
// 小明胜利
// 玩家类
class Player{
    constructor(name,teamName){
        // 记录玩家需要储存的信息
        this.name = name;
        this.live = true;
        this.teamName = teamName;
        // 其他信息( 队友 敌人) 全部由中介这者处理
        playerMediator.addPlayer(this)
    }
    // 胜利
    win(){
        console.log(this.name + '胜利')
    }
    // 失败
    lose(){
        console.log(this.name + '失败')
    }
    // 死亡
    die(){
        //自身存活状态发生改变
        this.live = false
        // 告知中介者 , 做后续处理
        playerMediator.playerDie(this)
    }
}
// 中介者
let playerMediator = (function(){
    // 队伍玩家信息
    let teamInfo = {},// 保存队伍玩家信息
        teamList = [];// 保存队伍的name
    return {
        //浏览队伍所有信息
        reviewInfo(){
            console.log(teamInfo)
        },
        // 玩家假如
        addPlayer(player){
            let teamName = player.teamName
            if(!teamInfo[teamName]){
                teamInfo[teamName] = [];
                teamList.push(teamName)
            }
            teamInfo[teamName].push(player)
        },
        // 玩家阵亡
        playerDie(player){
            // 玩家属于哪一对
            let team = teamInfo[player.teamName];
           // 检测玩家所在队伍是否全部阵亡
           let isAllDie = team.every(p => p.live === false);
           // 假设全部阵亡
            if(isAllDie){
                //该对触发lose信息
               team.forEach(p => p.lose());
               // 从teamList 删除该队信息
              teamList.splice(teamList.indexOf(player.teamName),1);
                //检测是否只剩下一队 当只剩下一对时触发 win方法
               if(teamList.length === 1) {
                  let winTeamName = teamList[0];
                  teamInfo[winTeamName].forEach(p => p.win())
               }
            }
        }
    }
})()
let p1 = new Player("小明","red");
let p2 = new Player("小白","red");
let p3 = new Player("张一","green");
let p4 = new Player("张二","green");
let p5 = new Player("张三","green");
let p6 = new Player("李一","blue");
let p7 = new Player("李二","blue");
let p8 = new Player("李三","blue");

p1.die()
p2.die()
p3.die()
p4.die();
p5.die()
playerMediator.reviewInfo();