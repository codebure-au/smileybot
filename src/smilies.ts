import axios from "axios";

const notAnimated = [
  ":(",
  ":)",
  ":3:",
  ":agesilaus:",
  ":am:",
  ":anime:",
  ":biglips:",
  ":bird:",
  ":birdthunk:",
  ":black101:",
  ":butt:",
  ":catholic:",
  ":cenobite:",
  ":cheeky:",
  ":cheers:",
  ":chef:",
  ":classiclol:",
  ":coal:",
  ":colbert:",
  ":confutoot:",
  ":confused:",
  ":cool:",
  ":coolfish:",
  ":D",
  ":d2a:",
  ":derptiel:",
  ":devil:",
  ":doh:",
  ":doit:",
  ":downs:",
  ":drac:",
  ":dukedoge:",
  ":eek:",
  ":eng101:",
  ":eng99:",
  ":engleft:",
  ":fedora:",
  ":fork:",
  ":frogdunce:",
  ":geno:",
  ":gerty:",
  ":gibs:",
  ":goleft:",
  ":gonk:",
  ":greatgift:",
  ":greencube:",
  ":grin:",
  ":gurf:",
  ":haw:",
  ":hehe:",
  ":hist101:",
  ":hotpickle:",
  ":hr:",
  ":imunfunny:",
  ":j:",
  ":jecht:",
  ":jewish:",
  ":jihad:",
  ":keke:",
  ":kiddo:",
  ":kimchi:",
  ":koos:",
  ":lolplant:",
  ":love:",
  ":mad:",
  ":madmax:",
  ":magical:",
  ":mcnally:",
  ":mrgw:",
  ":nexus:",
  ":nsa:",
  ":o:",
  ":ohdear:",
  ":palmon:",
  ":phoneline:",
  ":pipe:",
  ":piss:",
  ":prepop:",
  ":pseudo:",
  ":q:",
  ":question:",
  ":razzy:",
  ":redhammer:",
  ":regd13:",
  ":reject:",
  ":rolleye:",
  ":rolleyes:",
  ":saddowns:",
  ":sax:",
  ":shobon:",
  ":silent:",
  ":smuggo:",
  ":smugjones:",
  ":smugmrgw:",
  ":spergin:",
  ":ssh:",
  ":stare:",
  ":stoked:",
  ":stonk:",
  ":sun:",
  ":thunk:",
  ":thunkher:",
  ":toot:",
  ":tootzzz",
  ":v:",
  ":whip:",
  ":whitewater:",
  ":witch:",
  ":wth:",
  ":xd:",
  ":yarr:",
  ":yotj:",
  ":yum:",
  ":zombie:",
  ":zoro:",
  ";)",
  ";-*",
  ":10bux:",
  ":20bux:",
  ":banme:",
  ":bigwhat:",
];

const scrapeSmilies = async () => {
  try {
    const url = `https://forums.somethingawful.com/misc.php?action=showsmilies`;
    const response = await axios.get(url);

    const lines = (response.data as string).split("\n");

    let dictionary: Record<string, string> = {};

    lines.forEach((line, index) => {
      const regex = /^<li class="smilie">$/;

      if (regex.test(line)) {
        const textLine = lines[index + 1];
        const imageLine = lines[index + 2];
        const textRegex = /^ ?<div class="text">(:.*)<\/div>$/;
        const imageRegex =
          /^ ?<img alt=".*" src="(https\:\/\/.*)" title=".*">$/;

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
    console.log("error fetching smilies", e);
    return {};
  }
};

export { scrapeSmilies, notAnimated };
