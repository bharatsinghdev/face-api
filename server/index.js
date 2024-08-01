const express = require("express");
const connectDB = require("./configs/db");
const cors = require("cors");
const { asciiFace, frames } = require("./utils/Ascii");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json({ extended: true }));
app.use(cors());


app.use("/api/face", require("./routes/face"));


const intervalTime = 100;
let currentFrame = 0;

const animate = () => {
    process.stdout.write(`\r${frames[currentFrame]}`);
    currentFrame = (currentFrame + 1) % frames.length;
};

const interval = setInterval(animate, intervalTime);
// setTimeout(() => {
//     clearInterval(interval);
//     process.stdout.write('\n');
// }, 5000);

(async () => {
    try {
        const { default: chalk } = await import('chalk');
        const { default: figlet } = await import('figlet');

        const dbDetail = await connectDB();
        const { host, port, name } = dbDetail.connection;
        const dbUrl = dbDetail.connection.db.client.s.url;

        figlet('Face Server Started', (err, data) => {
            if (err) {
                console.log(chalk.red('Something went wrong with Figlet...'));
                console.dir(err);
                return;
            }

            app.listen(PORT, (err) => {
                console.log(chalk.green(data));
                console.log(chalk.blue(`Database connected at: ${host}:${port}/${name}`));
                console.log(chalk.cyan(`Database URL: ${dbUrl}`));
                console.log(chalk.magenta(asciiFace));
            })
        });
    } catch (err) {
        const { default: chalk } = await import('chalk');
        console.log(chalk.red('Error connecting to the database:'));
        console.log(chalk.red(err));
    }
})();
