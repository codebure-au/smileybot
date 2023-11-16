export const scrapeSmilies = async () => {
  try {
    const url = `https://forums.somethingawful.com/misc.php?action=showsmilies`;
    const response = await fetch(url);
    const data = await response.text();

    const lines = data.split("\n");

    let dictionary: Record<string, string> = {};

    lines.forEach((line, index) => {
      const regex = /^<li class="smilie">$/;

      if (regex.test(line)) {
        const textLine = lines[index + 1];
        const imageLine = lines[index + 2];
        const textRegex = /^ ?<div class="text">(:.*)<\/div>$/;
        const imageRegex =
          /^\s?<img alt(?:=".*?")? src="(https?\:\/\/.*)" title=".*">$/;

        if (!textRegex.test(textLine) || !imageRegex.test(imageLine)) return;

        const textMatch = textLine.match(textRegex);
        const imageMatch = imageLine.match(imageRegex);

        if (!textMatch || !imageMatch) return;

        const keyword = textMatch[1];
        const file = imageMatch[1];

        dictionary[keyword] = file;
      }
    });

    return dictionary;
  } catch (e) {
    return {};
  }
};
