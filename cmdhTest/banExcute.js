/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require('../index');
const funInfo = {
  funName: '/api.ban.BanInternal/EnableBan',
  reqPath: 'api.ban.EnableBanRequest',
  resPath: 'api.ban.EnableBanResponse',
  pbRootPath: './pb'
};

const cmdhInfo = {
  hostGrpc: 'command-hub-service-cht-test-1.test.efficiency.ww5sawfyut0k.bitsvc.io:9090',
  // hostGrpc: 'ban-service-private-unify-test-3.test3.efficiency.ww5sawfyut0k.bitsvc.io:9090',
  appname: 'piidebug',
  secret: 'Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=',
  pbRootPath: './pb/proto3'
};

async function main() {
  let i = 0;
  while( i < 1) {
    const res = await sendGrpc(funInfo, cmdhInfo, {"is_notification": false, "ban_tag": [ {"biz_type": "TRADE", "name": "trade", "value": "all_trade"}], "ban_reason": 2, "uids": [4405557], "request_id": "254ce8da-7d73-440f-b431-1bbd40a6bf9f", "from": "1000", "operator": "2345"});
    console.log(res);
    i++
  }

}

main();