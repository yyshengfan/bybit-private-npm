/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendHttp } = require('../index');
const funName = 'withdraw.record';

const cmdhInfo = {
  host: "http://command-hub-service-unify-test-1.test2.efficiency.ww5sawfyut0k.bitsvc.io",
  hostGrpc: "command-hub-service-unify-test-1.test2.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  route: "/exec",
  port: 80,
  appname: "piidebug",
  secret: "Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=",
}

async function main() {
  let i = 0;
  while( i < 1) {
    const res = await sendHttp(funName, cmdhInfo, { WithdrawId: '36708' });
    console.log(res);
    i++
  }

}

main();