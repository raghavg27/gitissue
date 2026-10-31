// The feature list and FAQ. The features page, its structured data and llms.txt all read from here.

export const FEATURES = [
  {
    name: "Say the bug out loud",
    what: "Dictate the bug in the browser, or type it. Each new phrase is added to the text.",
    why: "Testers find most bugs on a phone, where speaking is faster than typing.",
  },
  {
    name: "Follows the repo's own template",
    what: "GitIssue reads the issue templates, CONTRIBUTING and README of the repo, and fills the template it finds.",
    why: "Maintainers triage faster when each issue has the format and the fields that they asked for.",
  },
  {
    name: "Real screen names from the code",
    what: "GitIssue scans the screen and route files of the repo, and keeps only the names that it finds in the code.",
    why: "A developer can go to the correct file at once, and the AI cannot invent a screen.",
  },
  {
    name: "Duplicate check before you post",
    what: "Open and closed issues are searched for the same bug, and the possible matches show before the draft.",
    why: "One issue with all the findings is more useful than three issues that say the same thing.",
  },
  {
    name: "Comment, reopen or file a regression",
    what: "When the bug is already reported, you add your findings as a comment. You reopen a closed issue if you can, or file a new issue that links to it.",
    why: "A bug that comes back gets attention in the correct place, with its history.",
  },
  {
    name: "Saved devices",
    what: "Detect the device and browser you test on in one tap, or enter it by hand. Saved devices can be picked for each report.",
    why: "The device and OS version are the details that bug reports most often forget.",
  },
  {
    name: "Screenshots",
    what: "Paste, pick or take up to 5 images. They go into the issue where the template asks for them.",
    why: "A picture shows the bug faster than a paragraph.",
  },
  {
    name: "You approve each post",
    what: "You see and edit the full draft, or ask for a change in plain words. Nothing goes to GitHub until you tap Post.",
    why: "The issue is posted with your name, so you have the last word.",
  },
  {
    name: "URL shortcut",
    what: "On any GitHub repo page, change github.com to the GitIssue address to open the report form for that repo.",
    why: "You can start a report from the page you already have open.",
  },
  {
    name: "Drafts stay on your device",
    what: "Your text, screenshots and draft are kept in this browser until you post or discard them.",
    why: "A refresh, a sign-in or a limit does not lose your work.",
  },
  {
    name: "No account before the first step",
    what: "You can open a repo and describe the bug first. GitIssue asks you to sign in with GitHub only when you want the draft.",
    why: "You can try the app before you give it access to anything.",
  },
  {
    name: "My reports",
    what: "A list of each issue you created, reopened or commented on through GitIssue.",
    why: "You can follow up on your reports from one place.",
  },
] as const;

export const FAQ = [
  {
    q: "Does GitIssue post anything without me?",
    a: "No. GitIssue writes to GitHub only when you tap Post, Post comment or Reopen and comment.",
  },
  {
    q: "Which AI does GitIssue use?",
    a: "Groq drafts the issue first. If Groq fails, Google Gemini is the backup. Each call has a 20 second limit.",
  },
  {
    q: "Does it work with private repos?",
    a: "Yes, if your GitHub account can see the repo. Your description and short parts of the code go to the AI provider to make the draft.",
  },
  {
    q: "What does GitIssue keep about me?",
    a: "Your GitHub user name, an encrypted GitHub token, your saved devices and a list of your reports. The privacy policy lists each service that receives data.",
  },
  {
    q: "Is GitIssue free and open source?",
    a: "Yes. The code is on GitHub under the MIT license, and you can host your own copy.",
  },
] as const;
