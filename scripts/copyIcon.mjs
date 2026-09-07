import fs from "fs";
import path from "path";

const src = path.join(process.cwd(), "app", "icon.png");
const dest1 = path.join(process.cwd(), "public", "logo.png");
const dest2 = path.join(process.cwd(), "public", "icon.png");

fs.copyFileSync(src, dest1);
fs.copyFileSync(src, dest2);
console.log("Copied app/icon.png to public/logo.png and public/icon.png");
