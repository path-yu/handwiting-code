const fs = require('fs');
const path = require('path');
// 读取当前目录下的所有文件 dirList为文件列表,dirname表示当前的绝对路径
function readdir(dirList,dirname){
    function readerFile(filename){
        // 返回一个包含文件信息的描述对象
        let stat = fs.lstatSync(path.join(dirname,filename));
        // 如果当前文件类型为文件夹则递归读取, 并传入当前的新路径
        if(stat.isDirectory()){
            // 
            let res =  fs.readdirSync(path.join(dirname,filename));
            return readdir(res,path.join(dirname,filename))
        }
        // 读取文件
        fs.readFile(path.join(dirname,filename),(err,files) =>{
            if(err) return err
            // 利用toString方法打印文件中的内容
             console.log(files.toString())
        })
    }
    // 遍历文件列表, 并解析
    dirList.map(filename =>  readerFile(filename))
}
//利用readdirSync同步读取当前目录下的所有文件的文件名,
readdir(fs.readdirSync(__dirname),__dirname);
