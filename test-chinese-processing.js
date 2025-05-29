// Simple test for Chinese text processing
const chineseText = `
今天天气很好，我去公园散步。看到很多人在锻炼身体，有人在跑步，有人在打太极拳。
公园里的花开得很美，春天真是一个美好的季节。我拍了很多照片，准备分享到社交媒体上。
这是一个测试中文分词和词云生成的例子。希望系统能够正确处理中文文本。
#春天 #公园 #散步 #美好生活
`;

console.log("Test Chinese text:", chineseText);
console.log("Character count:", chineseText.length);
console.log("Contains Chinese characters:", /[\u4e00-\u9fff]/.test(chineseText));
