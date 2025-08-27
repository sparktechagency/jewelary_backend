import {app} from "./app";

const PORT = process.env.PORT || 5000;
const HOST = "72.60.42.191"; // 

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
