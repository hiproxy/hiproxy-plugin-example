/**
 * @file hiproxy plugin routes
 * @author zdying
 */

'use strict';

module.exports = [
  {
    route: '/test',
    render: function (route, request, response) {
      var routeArr = route.split('/');
      var pageName = routeArr.slice(2).join('/');

      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Powder-By': 'hiproxy-plugin-example'
      });

      response.end(JSON.stringify({
        route: route,
        pageID: pageName,
        time: new Date(),
        serverState: {
          http_port: hiproxyServer.httpPort,
          https_port: hiproxyServer.httpsPort,
          cliArgs: global.args,
          process_id: process.pid
        }
      }));
    }
  }
];