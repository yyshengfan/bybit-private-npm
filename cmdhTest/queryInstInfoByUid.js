/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendPureGrpc } = require("../index");
const funInfo = {
  hostGrpc: "omp-instmng-unify-dev-1.test2.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  pbPath: "./pb/inst/user.proto",
  funPath: "com.bybit.cht.instmng.common.service.integration.grpc.user.InstInfoService",
  funName: "QueryInstInfoByUid",
};

async function main() {
  let i = 0;
  while (i < 1) {
    // const res = await sendPureGrpc(funInfo, { requestId: "ceshiyixia", uid: 3701064 });
    // const res = await sendPureGrpc(funInfo, { requestId: "ceshiyixia", uid: 4406753 });
    const res = await sendPureGrpc(funInfo, { requestId: "ceshiyixia1212121222", uid: 4616298 });
    console.log(JSON.stringify(res));
    i++;
  }
}

main();
