import ytpl from "ytpl";

(async ()=>{
  let info = await ytpl("UCpmdhW1ru6r6xIaLSbVHoHQ");

  console.log(info.author);
  console.log(info.items[0]);
})();
