/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require("../index");
const funInfo = {
  funName:
    "/com.bybit.option.fundpool.grpc.finance/FundPoolRiskService/queryVerifySserial",
  reqPath: "com.bybit.option.fundpool.grpc.finance.FundPoolRiskRequest",
  resPath: "com.bybit.option.fundpool.grpc.finance.FundPoolRiskResponse",
  pbRootPath: "./pb",
};

const cmdhInfo = {
  hostGrpc:
    "command-hub-service-unify-test-2.test3.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  appname: "piidebug",
  secret: "Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=",
  pbRootPath: "./pb/proto3",
};

async function main() {
  let i = 0;
  while (i < 1) {
    const res = await sendGrpc(funInfo, cmdhInfo, {
      bizRequestId: "81959d88-848c-4f86-8388-9d658b731159",
      resOrderId:
        "aa_2_1_deposit_nil2s_skip-notification-scene-82784bd4-e3b3-422c-96e9-1684076813811683800000_FUNDPOOL_OUTTER",
      uid: 20,
    });
    console.log(res);
    i++;
  }
}

main();
