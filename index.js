const app = require("./server");

const PORT = process.env.PORT || 6969;

app.listen(PORT, () => {console.log(`Listening on port ${PORT}...`);});