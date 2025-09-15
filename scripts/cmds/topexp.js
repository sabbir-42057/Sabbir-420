module.exports = {
  config: {
    name: "topexp",
    version: "1.2",
    author: "null",
    role: 0,
    shortDescription: {
      en: "Show top 15 EXP users"
    },
    longDescription: {
      en: "Displays a list of top 15 users based on experience"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();

    // Format numbers with K, M, B, T suffixes
    function formatNumber(n) {
      if (n >= 1e12) return (n / 1e12).toFixed(2).replace(/\.?0+$/, "") + "T";
      if (n >= 1e9)  return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
      if (n >= 1e6)  return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
      if (n >= 1e3)  return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
      return n.toString();
    }

    // Filter and sort top 15 by exp
    const topExp = allUsers
      .filter(u => u.exp > 0)
      .sort((a, b) => b.exp - a.exp)
      .slice(0, 15);

    if (topExp.length === 0) {
      return message.reply("No users with EXP found.");
    }

    const badges = ["🥇", "🥈", "🥉"];
    const result = topExp.map((user, i) => {
      const fontName = user.name.replace(/[A-Za-z0-9]/g, c => ({
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆",
        H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍",
        O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔",
        V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠",
        h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧",
        o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮",
        v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒",
        5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
      }[c] || c));

      const prefix = i < 3 ? badges[i] : `${(i + 1).toString().padStart(2, "")}.`;
      const formattedExp = formatNumber(user.exp);

      return `${prefix} ${fontName} : ${formattedExp} XP`;
    });

    const finalMessage = `𝗧𝗼𝗽 𝟭𝟱 𝗯𝗼𝘁 𝘂𝘀𝗲𝗿'𝘀 🥂\n\n${result.join("\n")}`;
    message.reply(finalMessage);
  }
};
