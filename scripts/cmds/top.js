module.exports = {
  config: {
    name: "top",
    version: "1.3",
    author: "null",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
    },
    longDescription: {
      en: "Shows the top 15 richest users with medals and long-scale money formatting"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();
    const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 15);

    const medals = ["🥇", "🥈", "🥉"];

    function toFancy(str) {
      const map = {
        a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡',
        i: '𝐢', j: '𝐣', k: '𝐤', l: '𝐥', m: '𝐦', n: '𝐧', o: '𝐨', p: '𝐩',
        q: '𝐪', r: '𝐫', s: '𝐬', t: '𝐭', u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱',
        y: '𝐲', z: '𝐳',
        A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅', G: '𝐆', H: '𝐇',
        I: '𝐈', J: '𝐉', K: '𝐊', L: '𝐋', M: '𝐌', N: '𝐍', O: '𝐎', P: '𝐏',
        Q: '𝐐', R: '𝐑', S: '𝐒', T: '𝐓', U: '𝐔', V: '𝐕', W: '𝐖', X: '𝐗',
        Y: '𝐘', Z: '𝐙',
        0: '𝟎', 1: '𝟏', 2: '𝟐', 3: '𝟑', 4: '𝟒', 5: '𝟓', 6: '𝟔', 7: '𝟕', 8: '𝟖', 9: '𝟗',
        '.': '.', K: '𝐊', M: '𝐌', B: '𝐁', T: '𝐓',
        Q: '𝐐', a: '𝐚', i: '𝐢', S: '𝐒', x: '𝐱', p: '𝐩', O: '𝐎', c: '𝐜', N: '𝐍', D: '𝐃'
      };
      return str.split('').map(char => map[char] || char).join('');
    }

    function formatMoney(amount) {
      const units = [
        { value: 1e33, symbol: 'Dc' },
        { value: 1e30, symbol: 'No' },
        { value: 1e27, symbol: 'Oc' },
        { value: 1e24, symbol: 'Sp' },
        { value: 1e21, symbol: 'Sx' },
        { value: 1e18, symbol: 'Qi' },
        { value: 1e15, symbol: 'Qa' },
        { value: 1e12, symbol: 'T' },
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' }
      ];
      for (const unit of units) {
        if (amount >= unit.value) {
          return (amount / unit.value).toFixed(2) + unit.symbol;
        }
      }
      return amount.toString();
    }

    const topUsersList = topUsers.map((user, index) => {
      const medal = medals[index] || '';
      const rank = toFancy((index + 1).toString());
      const name = toFancy(user.name);
      const moneyFancy = toFancy(formatMoney(user.money));
      return `${medal} ${rank}. ${name}: ${moneyFancy}`;
    });

    const messageText = `𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬 👑\n\n${topUsersList.join('\n')}`;
    message.reply(messageText);
  }
};
