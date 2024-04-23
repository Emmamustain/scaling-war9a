const pfpIndex = [
  { name: "crow", hash: "0.3556998334875874" },
  { name: "p1", hash: "0.704365089851476" },
  { name: "p2", hash: "0.6702055528575606" },
  { name: "letter-a", hash: "0.34803675373134224" },
  { name: "cat", hash: "0.8642211650475844" },
  { name: "skull", hash: "0.6345345071725821" },
  { name: "ski-mask", hash: "0.5189219679157691" },
  { name: "smiley", hash: "0.4129092667446894" },
  { name: "only-up", hash: "0.6431702367252157" },
  { name: "primordial", hash: "0.8966962875246469" },
  { name: "ghost", hash: "0.12117662108090999" },
  { name: "emma", hash: "0.9143266087609216" },
  
];

export default function custompfpchecker(username: string) {
  const search = pfpIndex.find((item) => item.name === username);
  if (search) return search?.hash;
  if (username === "random") return Math.random().toString();
  else return username;
}
