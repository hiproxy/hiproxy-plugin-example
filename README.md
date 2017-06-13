# hiproxy-plugin-example

hiproxy插件示例。这个插件为hiproxy添加了一个Rewrite指令、一个CLI命令和一个页面路由。

* **名令**：`hello`，执行`hiproxy hello --name <your-name> --age <your-age>`
* **指令**：`add`，在rewrite文件中使用`add $add_value 1600 88;`
* **路由**：`test`，服务启动之后，访问`http://127.0.0.1:<port>/test`

## 安装

```bash
npm install hiproxy/hiproxy-plugin-example -g
```

> **注意**：必须要把插件安装到全局。hiproxy cli默认去全局查找插件，所以必须保证安装到`npm root -g`所在的目录中，才能被正确加载。

## 使用

安装完成后，hiproxy会自动加载所有安装的插件并注册插件定义的命令、指令和页面。

### 命令

安装好这个示例插件之后，执行`hiproxy --help`，可以看到如下信息，从中我们能发现，有了`hello`这个命令。

![command-hello](https://github.com/hiproxy/hiproxy-plugin-example/raw/master/screen-shot/command.png)

执行`hp hello --help`，可以看到`hello`命令的帮助信息。

![hello-help](https://github.com/hiproxy/hiproxy-plugin-example/raw/master/screen-shot/hello-help.png)

### 页面

hiproxy-plugin-example为hiproxy添加了一个页面，url为`/test`，使用`hiproxy start --port 8888`启动服务之后，可以访问<http://127.0.0.1:8888/test>查看效果。

### 指令

hiproxy-plugin-example为hiproxy添加了一个rewrite指令`add`来做加法运算。指令的作用域为`[global, domain, location]`，这个指令接收三个参数：

* key：属性名称，用于把计算后得到的值赋值给当前作用于的props，比如：`$result`。
* num1：第一个加数，比如：`12`。
* num2：第二个加数，比如：`34`。

之后，我们可以使用这个计算出来的值，比如：`set_header Calc-Result $result`。

示例：

```bash
# rewrite rules
# need plugin `hiproxy-plugin-example`

set $gvar global-value;

domain test.hiproxy.io {
  set $host test.hiproxy.io;

  # hiproxy-plugin-example提供的指令
  add $addresult 9999 90000;

  location / {
    proxy_pass http://127.0.0.1:8000/;

    # hiproxy-plugin-example提供的指令
    add $add_value 1600 88;

    # 使用`add`计算的结果
    set_header Add_Result $addresult;
    set_header Test_Add_Value $add_value;

    set_header Global_Var $gvar;    
  }
}
```

## 开发者

开发者开发新插件时，可以参考`hiproxy-plugin-example`。

### 插件结构

插件作为一个独立的模块安装，入口文件需要导出一个对象，包括三个属性：

* **commands**: `<Array>`，用来扩展`hiproxy`的CLI命令，数组中每个对象作为一个命令配置，具体配置见[命令配置](#command-config)。

* **directives**: `<Array>`，用来扩展`hiproxy`的rewrite指令，数组中每个对象作为一个指令配置，具体配置见[指令配置](#directive-config)。

* **routes**: `<Array>`，用来扩展`hiproxy`的页面路由，数组中每个对象作为一个路由配置，具体配置见[路由配置](#route-config)。


<a name="command-config"></a>
### 命令配置

命令可以配置的内容为：`命令名称`、`描述`、`使用方法`、`处理函数`和`命令选项参数`。对应的字段为：

* 命令名称（command）：`<String>`，比如：`'hello'`。
* 描述信息（describe）：`<String>`，简单介绍命令的作用以及其他的信息，比如：`'A test command that say hello to you.'`。
* 使用方法（usage）：`<String>`，命令的使用方法提示信息，比如：`'hello [--name <name>] [-xodD]'`。
* 处理函数（fn）：`<Function>`，执行命令时，调用的函数。函数调用时`this`值为命令行参数解析后的对象。
* 命令选项（option）：`<Object>`，命令对应的选项，`key:value`形式。可以参考<https://github.com/hemsl/hemsl>。

一个完整的命令示例如下：

```js
{
  command: 'hello',
  describe: 'A test command that say hello to you.',
  usage: 'hello [--name <name>] [-xodD]',
  fn: function () {
    var cliArgs = this;

    console.log('Hi, welcome to use hiproxy example plugin');
    if (cliArgs.name ) {
      console.log('your name is', cliArgs.name.green);
    }

    if (cliArgs.age ) {
      console.log('your are', cliArgs.age.green, 'years old');
    }
  },
  options: {
    'name <name>': {
      alias: 'n',
      describe: 'your name'
    },
    'age': {
      alias: 'a',
      describe: 'your age'
    }
  }
}
```

<a name="directive-config"></a>
### 指令配置

命令可以配置的内容为：`指令名称`、`作用域`和`处理函数`。对应的字段为：

* 指令名称（name）：`<String>`，比如：`'add'`。
* 作用域（scope）：`<Array>`，指令对应的作用域，只有在这里指定的作用域里面才会执行。可选择的作用域为：`global`、`domain`、`location`、`request`和`response`。
* 处理函数（fn）：`<Function>`，执行指令时，调用的函数。

一个完整的指令示例如下：

```js
{
  name: 'add',
  scope: ['global', 'domain', 'location'],
  fn: function (key, a, b) {
    var props = this.props;
    var value = Number(a) + Number(b);

    this.props[key] = value;
  }
}
```

<a name="route-config"></a>
### 路由配置

路由可以配置的内容为：`路由规则`和`渲染函数`。对应的字段为：

* 路由规则（name）：`<String>`，比如：`'add'`。
* 渲染函数（render）：`<Function>`，渲染页面，接收三个参数：`(route, request, response)`，`route`为url匹配后的对象，细节可以查看<https://www.npmjs.com/package/url-pattern>。

一个完整的指令示例如下：

```js
{
  route: '/test(/:pageName)',
  render: function (route, request, response) {
    response.writeHead(200, {
      'Content-Type': 'text/html',
      'Powder-By': 'hiproxy-plugin-example'
    });

    var serverInfo = {
      route: route,
      pageID: route.pageName,
      time: new Date(),
      serverState: {
        http_port: global.hiproxyServer.httpPort,
        https_port: global.hiproxyServer.httpsPort,
        cliArgs: global.args,
        process_id: process.pid
      }
    };

    response.end('<pre>' + JSON.stringify(serverInfo, null, 4) + '</pre>');
  }
}
```





