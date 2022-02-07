import express from 'express';

const app = express();
const host = '127.0.0.1';
const port = 3000;
app.use((req, res) => {
    res.send('Hello World!');
});
app.listen(port, host, () => {
    console.info(
        `Server @ http://${host}:${port}/`,
    );
});