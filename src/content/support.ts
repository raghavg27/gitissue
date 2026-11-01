// The free plan limits and the paid upgrade for each, in order of priority. The support page reads from here.

export const UPGRADES = [
  {
    name: "Faster AI drafts with a paid Groq plan",
    now: "The free Groq plan gives a small number of tokens each minute. When many testers ask for a draft at the same time, GitIssue must wait, or it tells them the AI is busy.",
    next: "Higher limits, so drafts come back at once, also when your full team reports bugs on release day.",
  },
  {
    name: "A private and reliable backup AI with a paid Gemini plan",
    now: "Gemini writes the draft when Groq fails. On the free plan, Google can use that data, which includes parts of your repo code, to improve its models.",
    next: "On the paid plan, Google does not use your bug reports or code to train its models. The backup also gets higher limits, so it is there when Groq is busy.",
  },
  {
    name: "Longer time limits with Vercel Pro",
    now: "The free Hobby plan is for personal projects. Each request must finish in 60 seconds, so the main AI and the backup must share that time. There are also low monthly limits for traffic and server functions.",
    next: "More time for each request, so a slow AI answer does not fail. Higher monthly limits, so the site stays fast when more teams use it.",
  },
  {
    name: "A database that never sleeps with Supabase Pro",
    now: "A free Supabase project pauses after a week with no activity. It has a small database, 1 GB for screenshots, and no daily backups.",
    next: "The database never pauses. Daily backups keep your reports and saved devices safe. More storage keeps the screenshots in your issues online.",
  },
  {
    name: "Its own domain name",
    now: "The address of GitIssue ends in vercel.app. Each issue and comment that GitIssue posts has a link to this address.",
    next: "A short address that is easy to remember and to trust. The links in your issues continue to work if GitIssue moves to a different host.",
  },
  {
    name: "Error tracking and uptime alerts",
    now: "When something fails, I see it only in the server logs, and the free plan keeps them for a short time. If the site stops, I know only when someone tells me.",
    next: "An error tracking service and uptime alerts tell me about a problem at once, often before you see it.",
  },
  {
    name: "Dictation in every browser",
    now: "Dictation uses the speech engine that is in the browser. Some browsers, such as Firefox, do not have one, so testers there must type.",
    next: "A speech-to-text service that works in every browser and knows technical words, such as the names of frameworks and error codes.",
  },
  {
    name: "Larger AI models",
    now: "The free limits are smallest on the largest models, so GitIssue uses a model that fits the free plan and sends only short parts of the repo.",
    next: "Larger models that read more of the repo, so drafts follow your template better and find the correct screen names more often.",
  },
  {
    name: "An outside security review",
    now: "GitIssue keeps your GitHub token encrypted, and automated security tests run on each change. I do these checks myself.",
    next: "A security expert from outside the project examines the code, so you can trust GitIssue with access to your repos.",
  },
  {
    name: "Tests on real phones",
    now: "I test on the devices that I have and in browser emulators.",
    next: "A real device testing service, so GitIssue works on the phones and browsers that your testers use.",
  },
  {
    name: "More time for GitIssue",
    now: "I build GitIssue alone, in my free time.",
    next: "More hours for the features that maintainers ask for, and faster fixes for the bugs that you report.",
  },
] as const;
