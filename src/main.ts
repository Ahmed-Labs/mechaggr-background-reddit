import * as dotenv from "dotenv";
dotenv.config();
const snoowrap = require("snoowrap");
const { SubmissionStream } = require("snoostorm");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchLimit = 25;

const otherRequester = new snoowrap({
  userAgent: "getSubmissions",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

type post = {
  title: string;
  author: string;
  postType: string;
  body: string;
  dateCreated: Date;
  url: string;
};

async function processPost(Post: post) {
  await prisma.Post.create({
    data: Post,
  });
}

async function monitorPosts() {
  const submissions = new SubmissionStream(otherRequester, {
    subreddit: "mechmarket",
    limit: fetchLimit,
    pollTime: 2000,
  });
  const connectedAt = Date.now() / 1000;
  submissions.on("item", (item: any) => {
    if (connectedAt > item.created_utc) return;
    const postInfo = {
      title: item.title,
      author: item.author.name,
      postType: item.link_flair_text ? item.link_flair_text : "None",
      body: item.selftext,
      dateCreated: new Date(item.created_utc * 1000),
      url: item.url,
    };
    console.log(postInfo);
    processPost(postInfo);
  });
}

async function main() {
  await prisma.$connect();
  await monitorPosts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

//npx ts-node .\src\main.ts
//echo $DATABASE_URL
