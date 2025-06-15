const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let allConcerns = []; // [{region, concern, env, lang, groupBuyCount, id}, ...]

wss.on("connection", function connection(ws) {
  // send info to newbie
  ws.send(JSON.stringify({ type: "init", data: allConcerns }));

  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);
    if (msg.type === "add") {
      // add worry
      allConcerns.push(msg.data);
      // brodcast to everyone
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "add", data: msg.data }));
        }
      });
    }
    if (msg.type === "joinGroupBuy") {
      // increase group buy number
      const { id } = msg.data;
      const c = allConcerns.find((x) => x.id === id);
      if (c) c.groupBuyCount = (c.groupBuyCount || 1) + 1;
      // broadcast
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "updateGroupBuy",
              data: { id, groupBuyCount: c.groupBuyCount },
            })
          );
        }
      });
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");
