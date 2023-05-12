/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require('../index');
const funInfo = {
  funName: '/bybit.assetwithdraw.withdraw.inner.v1.AssetWithdraw/GetWithdrawDeductByWithdrawIDAndBrokerID',
  reqPath: 'bybit.assetwithdraw.withdraw.inner.v1.GetWithdrawDeductByWithdrawIDAndBrokerIDReq',
  resPath: 'bybit.assetwithdraw.withdraw.inner.v1.GetWithdrawDeductByWithdrawIDAndBrokerIDResp',
  pbRootPath: './pb'
};

const cmdhInfo = {
  hostGrpc: 'command-hub-service-sbu-test-5.test.efficiency.ww5sawfyut0k.bitsvc.io:9090',
  appname: 'piidebug',
  secret: 'Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=',
  pbRootPath: './proto3'
};

async function main() {
  const res = await sendGrpc(funInfo, cmdhInfo, { withdraw_id: 70, broker_id: 0 });
  console.log(res);
}

main();