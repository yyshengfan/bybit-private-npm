/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendPureGrpc } = require("../index");
const funInfo = {
  hostGrpc: "grc-disposal-center-risk-test-1.test.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  pbPath: "./pb/risk-proto3/bybit/rc/grc_disposal_center/v1/grc_disposal_center.proto",
  funPath: "bybit.rc.grc_disposal_center.v1.GrcDisposalCenter",
  funName: "DoDisposal",
};

async function main() {
  let i = 0;
  while (i < 1) {
    const res = await sendPureGrpc(funInfo, {
      "action_name": "lark",
      "app_name": "sivir",
      "disposal": "notice",
      "extra_info_in": "{\"level\":4,\"ruleId\":34312,\"content\":\"wozhishilaiceshiyixia\",\"env\":\"test\",\"key\":\"ceshi34521\",\"app\":\"sivir\",\"handler\":\"hui.tian\",\"backupHandler\":\"hui.tian\",\"receiver\":\"hui.tian\",\"larkWebhook\":\"https://open.larksuite.com/open-apis/bot/v2/hook/180e5e1c-e575-4852-8835-3e31b814530a\",\"sms\":1,\"isSendlarkUser\":1,\"isCallReceiver\":0,\"title\":\"ceshiyixia\",\"overwriteHeader\":true,\"dialing\":true}",
      "request_id": "W202305303833A6090000757EF6AAC6"
  });
    console.log(res);
    i++;
  }
}

main();
