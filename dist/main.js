"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const snoowrap = require("snoowrap");
const { SubmissionStream } = require("snoostorm");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fetchLimit = 25;
const otherRequester = new snoowrap({
    userAgent: "getSubmissions",
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    username: process.env.DISCORD_USERNAME,
    password: process.env.DISCORD_PASSWORD,
});
function processPost(Post) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.Post.create({
            data: Post,
        });
    });
}
function monitorPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        const submissions = new SubmissionStream(otherRequester, {
            subreddit: "testingground4bots",
            limit: fetchLimit,
            pollTime: 2000,
        });
        const connectedAt = Date.now() / 1000;
        submissions.on("item", (item) => {
            if (connectedAt > item.created_utc)
                return;
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
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$connect();
        yield monitorPosts();
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
//npx ts-node .\src\main.ts
//echo $DATABASE_URL
