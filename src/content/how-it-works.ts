// The steps and the comparison. The home page and the How it works page read from here.

export const STEPS = [
  {
    title: "Paste the repo link",
    text: "Open any GitHub repo that you can see. Paste its link, or change github.com to the GitIssue address.",
  },
  {
    title: "Say what broke",
    text: "Talk or type the way you would tell a friend. Add screenshots and your device if you can.",
  },
  {
    title: "Check and post",
    text: "GitIssue writes the issue in the format of the repo, with the real screen names. You change what you want, then tap Post.",
  },
] as const;

export const COMPARISON = [
  {
    topic: "Format",
    manual: "You find the template and fill in each field by hand.",
    gitissue: "The template of the repo is filled in for you.",
  },
  {
    topic: "Screen names",
    manual: "You guess what the developer calls the screen.",
    gitissue: "The real names come from the code, and each one is checked.",
  },
  {
    topic: "Duplicates",
    manual: "You search old issues, or you post the same bug again.",
    gitissue: "Open and closed issues are checked before you post.",
  },
  {
    topic: "Device details",
    manual: "Often forgotten, so the developer has to ask.",
    gitissue: "Your device and browser are detected in one tap.",
  },
  {
    topic: "Time",
    manual: "Many minutes of typing on a small screen.",
    gitissue: "About a minute, and most of it is talking.",
  },
] as const;
