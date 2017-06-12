/**
 * @file hiproxy plugin routes
 * @author zdying
 */

'use strict';

module.exports = [
  {
    route: '/test(/:pageName)',
    render: function (route, request, response) {
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Powder-By': 'hiproxy-plugin-example'
      });

      response.end(JSON.stringify({
        route: route,
        pageID: route.pageName,
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