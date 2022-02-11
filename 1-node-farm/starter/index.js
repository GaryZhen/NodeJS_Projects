const fs = require('fs');
const http = require('http');
const url = require('url');


// // readFileSync just like IO stream, I think it will be cool, if I understand the meaning of sync
// const textIn = fs.readFileSync('./txt/input.txt','utf-8');
// console.log(textIn);


// fs.readFile('./txt/starttttt.txt', 'utf-8', (err, data1) => {
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         if(err) return console.log('Here is error!💣！');
        
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//             console.log(data3);

//             fs.writeFile('/.txt/final.txt', `${data2} \n ${data3}`,'utf-8', err =>{   // here without data for we don't have other values to conveys in it.
//                 console.log('Your file has been written😁');
//             });

//         });
//     });
// });
// console.log('will read this');

// // easy conclusion, for callback functions: it is goes from outside into inside; conveny its result by parameter data into next call back function inside


/////////////////
// Server
// Below shows how to write a simple routing 
// if we got different path name from req.url, and then we will got different actions. 

// create a replace function? What to do? -- this is used for replace many paremters, it will input some info and return.. what's let?-- local variable
const replaceTemplate = (temp, product) =>{    
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);
   
    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');  //that's defintely an amazing design.
    return output;
}


// Blocking version 
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`,'utf-8');   // 阻塞的方式读入数据，解析文件地址下的html
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`,'utf-8'); 
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`,'utf-8'); 


const data = fs.readFileSync(`${__dirname}/dev-data/data.json`,'utf-8');    //解析json 数据
const dataObj = JSON.parse(data);
  

// 创造server
const server = http.createServer((req, res) => {    
    const { query, pathname } = url.parse(req.url, true);   //这个函数的作用是将url当作字符串解析，然后返回对应的url变量，你写的
    //url 仅仅是地址；解析之后，就能够拥有各种属性。

    //创造api
    //overview page
    if(pathname === '/' || pathname === '/overview'){      //这里是真尼玛神奇了，不能用pathName，只能用小写的？？我盲猜是因为名字会重复？ 
        res.writeHead(200, { 'Content-type': 'text/html'});   //向请求写入head状态
        
        //map的作用是将原数组的每个元素都调用一个回调函数，组合起来成一个新的数组
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');   //We use join('') in order to make tempCard to be a real string 
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
       // console.log(cardsHtml);
        res.end(output);  //这里返回整个html模板页面

    //product page
    }else if (pathname === '/product'){
        res.writeHead(200, { 'Content-type': 'text/html'});  
        const product = dataObj[query.id];  
        const output = replaceTemplate(tempProduct, product);
        res.end(output);

    //api
    }else if(pathname === '/api'){
        res.writeHead(200, {'Content-type': 'application/json'});  // 写头文件
        res.end(data);    //成功之后，打印之前同步读取的json数据
    
        //not found
    }else{
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1> Page not found!</h1>');
    }
});

 

server.listen(8000,'127.0.0.1',()=> {
    console.log('Listening to the request on port 8000');
});

