import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * One-time seeding endpoint: creates the "Gym App Business Plan" teaching
 * checklist for the site admin. Idempotent (no-op if the project exists),
 * protected by a single-use random token, and removed after use.
 */
const SEED_TOKEN = "8cdc2a581cc5b7fb1423eb9b33707f238f47e905698bd7571d62fc4ad7f81268";
const OWNER_EMAIL = "julianleone@gmail.com";
const PROJECT_NAME = "Gym App Business Plan";

const PLAN: { section: string; items: { title: string; desc?: string }[] }[] = [
  {
    section: "The Big Idea",
    items: [
      {
        title: "Write down the problem your app will solve for gym owners",
        desc: "Every good business starts with a problem, not a product. Talk it out: what is hard, annoying, or time-consuming about running a gym? Write the problem in one sentence a gym owner would agree with.",
      },
      {
        title: "Describe your app idea in one sentence",
        desc: "This is called an elevator pitch — you should be able to say it in the time an elevator ride takes. Example shape: 'My app helps gym owners ____ so they can ____.'",
      },
      {
        title: "Explain who your customer is and why they would pay",
        desc: "Your customer is the gym OWNER, not the people working out. Owners spend money when something saves them time, makes them money, or keeps their members happy. Which of those does your idea do?",
      },
      {
        title: "Pick a name for your business and your app",
        desc: "Brainstorm at least 10 names before choosing. Say each one out loud, imagine it on a phone screen, and check that the name isn't already a famous app.",
      },
      {
        title: "Write down your goal for this project",
        desc: "A goal makes decisions easier. Example: 'In 6 months I want 3 real gyms trying my app.' Make it specific and possible.",
      },
    ],
  },
  {
    section: "Research: Know Your Customer",
    items: [
      {
        title: "List every kind of gym you can think of",
        desc: "Big chains, small local gyms, CrossFit boxes, martial arts studios, climbing gyms, yoga studios. They have different problems and different budgets. Picking ONE kind to start with is a smart business move called choosing a niche.",
      },
      {
        title: "Prepare 5 interview questions for gym owners",
        desc: "Good questions ask about their life, not your app. Examples: 'What takes up most of your day?' 'What almost made you quit?' 'What software do you use and what do you hate about it?' Never ask 'Would you buy my app?' — people say yes to be nice.",
      },
      {
        title: "Visit or call 3 local gyms and interview the owner or manager",
        desc: "This is the scariest and most valuable step. Bring an adult, be polite, and say you're a student studying how gyms work. Write down what they say — their exact words are gold.",
      },
      {
        title: "Watch how a gym works for one hour",
        desc: "Sit in the lobby (with permission) and watch: how do people check in? What does the front desk person do? What looks slow or messy? Businesses call this observation research.",
      },
      {
        title: "Write a one-page profile of your typical customer",
        desc: "Give them a name, like 'Gym Owner Gina.' How old is her gym? How many members? What does she worry about at night? When you make decisions later, ask: 'Would Gina want this?'",
      },
    ],
  },
  {
    section: "Research: Study the Competition",
    items: [
      {
        title: "Find 3 apps gym owners already use",
        desc: "Search for 'gym management software.' Look at their websites and screenshots. Competition is a GOOD sign — it proves gym owners spend money on this problem.",
      },
      {
        title: "Write down what each competitor does well and badly",
        desc: "Read their app store reviews, especially the 1-star and 2-star ones. Angry reviews tell you exactly what customers wish existed — that's your opportunity.",
      },
      {
        title: "Find out what competitors charge",
        desc: "Most charge gyms a monthly fee (this is called a subscription). Write down the prices. This tells you what gym owners are used to paying.",
      },
      {
        title: "Write one sentence about why a gym would pick YOUR app",
        desc: "This is called a competitive advantage. It can be simpler, cheaper, friendlier, or made for one specific kind of gym that the big apps ignore.",
      },
    ],
  },
  {
    section: "Plan the App",
    items: [
      {
        title: "Brainstorm every feature your app could have",
        desc: "Go wild — check-ins, class schedules, payment reminders, workout tracking, member birthdays. No idea is bad during a brainstorm. Aim for 20+.",
      },
      {
        title: "Circle the 3 features that solve the main problem",
        desc: "This is the hardest business skill: saying no. A small app that does one thing well beats a big app that does ten things badly. The tiny first version is called an MVP — Minimum Viable Product.",
      },
      {
        title: "Draw every screen of your app on paper",
        desc: "Stick figures and boxes are perfect. Draw what the user sees first, what they tap, and what happens next. These drawings are called wireframes, and real app designers start exactly this way.",
      },
      {
        title: "Show your paper screens to 2 people and watch them 'use' it",
        desc: "Ask them to 'tap' the paper with their finger to do a task, like 'check in a member.' If they get confused, your design needs work — better to find out now than after building.",
      },
      {
        title: "Choose how you'll build it: no-code tool or real code",
        desc: "No-code tools (like Glide, Bubble, or Thunkable) let you build a working app by dragging blocks. Real code (like Swift or JavaScript) is more powerful but slower to learn. Either choice is legit — pick what gets a working version fastest.",
      },
      {
        title: "Break the work into small weekly goals",
        desc: "Big projects fail when the goal is 'build the app.' They succeed when the goal is 'this week: the check-in screen works.' Write a plan with one small goal per week.",
      },
    ],
  },
  {
    section: "Build the App",
    items: [
      {
        title: "Spend one week just learning your building tool",
        desc: "Follow the tool's beginner tutorial and build their example app first. Learning the tool before building YOUR app saves weeks of frustration.",
      },
      {
        title: "Build the first screen and show someone",
        desc: "Momentum matters more than perfection. One real working screen teaches you more than a month of planning.",
      },
      {
        title: "Build your 3 core features, one at a time",
        desc: "Finish one completely before starting the next. Half-finished features don't count — 'done' means someone else can use it without your help.",
      },
      {
        title: "Add real-looking example data",
        desc: "Fill the app with a fake gym: 20 made-up members, a class schedule, some check-ins. An app with realistic data is easier to test and way more impressive to show gym owners.",
      },
      {
        title: "Keep a builder's journal",
        desc: "Each time you work on the app, write 3 lines: what I did, what broke, what's next. Real engineers do this — it makes restarting after a busy week painless.",
      },
      {
        title: "Ask for help when you're stuck for more than a day",
        desc: "Every builder gets stuck. Search the tool's help forum, watch a video, or ask an adult or older student who codes. Asking for help is a skill, not a weakness.",
      },
    ],
  },
  {
    section: "Test the App",
    items: [
      {
        title: "Test every button and screen yourself and list what breaks",
        desc: "Try to break your own app on purpose: tap things in a weird order, type nonsense into forms, use it fast. Every problem you find goes on a bug list. Finding bugs is a win, not a failure.",
      },
      {
        title: "Fix the bugs that stop the main task from working",
        desc: "Fix the biggest problems first: anything that blocks checking in a member (or your core feature) matters more than a wrong color. This is called prioritizing.",
      },
      {
        title: "Watch 3 friends or family members try the app without helping them",
        desc: "Give them a task like 'check in a member,' then stay silent — no hints! Where they hesitate or get lost is exactly what you need to fix. This is called a usability test.",
      },
      {
        title: "Show the app to a real gym owner and watch them use it",
        desc: "Go back to an owner you interviewed. Real users find problems friends never will, and this visit turns a research contact into a possible first customer.",
      },
      {
        title: "Make one round of improvements and test again",
        desc: "Build, test, improve, repeat — this loop is called iteration, and it's how every great app is made. One full loop is a huge milestone.",
      },
    ],
  },
  {
    section: "Marketing",
    items: [
      {
        title: "Write your message in one sentence gym owners care about",
        desc: "Marketing is not bragging about features — it's showing you solve a problem. 'Members check themselves in, so you can coach' beats 'Our app has 5 features.'",
      },
      {
        title: "Make a one-page flyer or simple website for the app",
        desc: "Include: the problem, your one-sentence message, 2–3 screenshots, and how to reach you. Free tools like Canva or Google Sites work great.",
      },
      {
        title: "Record a 60-second demo video",
        desc: "Screen-record the app while you explain what's happening. Showing beats telling — a video does your pitch for you when you're not in the room.",
      },
      {
        title: "Practice your pitch out loud 10 times",
        desc: "Pitch to your family until you can explain the problem, your app, and why it's different in under a minute without notes. Confidence comes from repetition.",
      },
      {
        title: "List 10 gyms you could show the app to",
        desc: "Start with the owners you already interviewed — they know you. Then add nearby gyms, your family's gyms, and gyms your teachers or coaches go to. Warm introductions beat cold visits.",
      },
    ],
  },
  {
    section: "Business Development",
    items: [
      {
        title: "Decide what you would charge and why",
        desc: "Look at your competitor price research. Many apps charge a monthly fee; new businesses often give the first month free so trying it is easy. Pick a price and be ready to explain it.",
      },
      {
        title: "Ask one gym to be your free pilot customer",
        desc: "A pilot is a test partnership: they use the app free for a month, you fix what they complain about, and if they love it you ask for a testimonial. Every big software company started with one brave first customer.",
      },
      {
        title: "Check in with your pilot gym every week",
        desc: "Ask what they used, what confused them, and what they wish it did. Listening to customers after the sale is what turns a school project into a real business.",
      },
      {
        title: "Ask a happy user for a testimonial and a referral",
        desc: "A testimonial is a quote like 'This app saves me an hour a day.' A referral is an introduction to another gym owner. Both are free and more powerful than any ad.",
      },
      {
        title: "Track your numbers in a simple spreadsheet",
        desc: "How many gyms you pitched, how many said yes, how many still use the app each week. Businesses run on numbers — knowing yours makes you sound like a pro.",
      },
      {
        title: "Write down what you learned and what you'd do next",
        desc: "End by reflecting: What surprised you? What would you build differently? What's the next goal — more gyms, more features, or a new idea? Every entrepreneur's real product is what they learn.",
      },
    ],
  },
];

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${SEED_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = sql();

  const users = (await q`
    SELECT id FROM users WHERE email = ${OWNER_EMAIL}
  `) as { id: string }[];
  if (users.length === 0) {
    return NextResponse.json({ error: "owner not found" }, { status: 404 });
  }
  const ownerId = users[0].id;

  const existing = (await q`
    SELECT id FROM projects WHERE owner_id = ${ownerId} AND name = ${PROJECT_NAME}
  `) as { id: string }[];
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, existing: existing[0].id });
  }

  const projects = (await q`
    INSERT INTO projects (name, name_lang, description, owner_id, paid_at)
    VALUES (
      ${PROJECT_NAME},
      'en',
      ${"A step-by-step teaching checklist for a 7th grader planning and starting a business that builds an app for gym owners: research, app development, testing, marketing, and business development."},
      ${ownerId},
      NULL
    )
    RETURNING id
  `) as { id: string }[];
  const projectId = projects[0].id;

  await q`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${projectId}, ${ownerId}, 'owner')
  `;

  let sectionCount = 0;
  let itemCount = 0;
  for (const [sIdx, block] of PLAN.entries()) {
    const sections = (await q`
      INSERT INTO sections (project_id, name, name_lang, position, created_by)
      VALUES (${projectId}, ${block.section}, 'en', ${sIdx}, ${ownerId})
      RETURNING id
    `) as { id: string }[];
    sectionCount++;
    for (const [iIdx, item] of block.items.entries()) {
      await q`
        INSERT INTO items (project_id, section_id, title, description, source_lang, position, created_by)
        VALUES (${projectId}, ${sections[0].id}, ${item.title}, ${item.desc ?? null}, 'en', ${iIdx}, ${ownerId})
      `;
      itemCount++;
    }
  }

  return NextResponse.json({ ok: true, projectId, sectionCount, itemCount });
}
