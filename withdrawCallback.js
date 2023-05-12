/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require('./index');
const funInfo = {
  funName: '/bybit.assetwithdraw.withdraw.inner.v1.AssetWithdraw/NotifyWithdrawRiskVerifyResultEvent',
  reqPath: 'bybit.assetwithdraw.withdraw.inner.v1.NotifyWithdrawRiskVerifyResultEventReq',
  resPath: 'bybit.assetwithdraw.withdraw.inner.v1.NotifyWithdrawRiskVerifyResultEventResp',
  pbRootPath: './pb'
};

const cmdhInfo = {
  // hostGrpc: 'command-hub-service-sbu-test-5.test.efficiency.ww5sawfyut0k.bitsvc.io:9090',
  hostGrpc: 'command-hub-service-unify-test-1.test2.efficiency.ww5sawfyut0k.bitsvc.io:9090',
  appname: 'piidebug',
  secret: 'Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=',
  pbRootPath: './pb/proto3'
};

async function main() {
  const res = await sendGrpc(funInfo, cmdhInfo, { withdrawId: 70, requestId: "1111111" });
  console.log(res);
}

main();