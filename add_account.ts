import { readDb, writeDb } from "./src/lib/serverDb";
(async () => {
  try {
    const data: any = await readDb() || {};
    const players = data.players || [];
    
    // Check if already exists
    if (players.find((p: any) => p.email === "writtenbybabatunde@gmail.com")) {
      console.log("Account already exists!");
      return;
    }
    
    const newPlayer = {
      id: "p_babatunde_" + Date.now(),
      name: "Babatunde",
      username: "babatunde",
      email: "writtenbybabatunde@gmail.com",
      password: "thunderous",
      teamId: "",
      points: 0,
      role: "admin",
      walletId: "GSH-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000),
      cashWalletBalance: 0,
      voucherWalletBalance: 0,
      transactions: [],
      createdAt: new Date().toISOString()
    };
    
    players.push(newPlayer);
    data.players = players;
    await writeDb(data);
    console.log("✅ Account created successfully:", newPlayer.email);
    console.log("Role:", newPlayer.role);
    console.log("Password: thunderous");
  } catch(e) {
    console.error(e);
  }
})();
