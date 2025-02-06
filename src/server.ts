import {app} from "./app"; // ✅ Import correctly

const PORT = process.env.PORT || 5000;
const HOST = "10.0.70.208"; // ✅ Make sure this is a valid host

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
