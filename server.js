const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// מערך לאחסון הודעות
let messages = [];

// טעינת הודעות מהאחסון המקומי אם קיימות
const messagesPath = path.join(__dirname, 'localMessages.json');
try {
    if (fs.existsSync(messagesPath)) {
        const messagesData = fs.readFileSync(messagesPath);
        messages = JSON.parse(messagesData);
    }
} catch (err) {
    console.error('Error reading local messages file:', err);
}

function saveMessagesToFile() {
    try {
        fs.writeFileSync(messagesPath, JSON.stringify(messages));
    } catch (err) {
        console.error('Error writing local messages file:', err);
    }
}






// טיפול בחיבורים של Socket.io
io.on('connection', (socket) => {
    console.log('Client connected');

    // שליחת הודעות ללקוח המחובר
    socket.emit('loadMessages', messages);

    // קבלת הודעה חדשה מהלקוח ושליחתה לכל הלקוחות
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);
        messages.push(message);
        saveMessagesToFile();
        io.emit('receiveMessage', message);
    });


    // מחיקת הודעה על פי מזהה ואימות משתמש
    socket.on('deleteMessage', (data) => {
        const { messageId, userId } = data;
        console.log(`Deleting message with id ${messageId} for user ${userId}`);

        // נימוק מחיקת הודעה
        const messageIndex = messages.findIndex(msg => msg.id === messageId && msg.userId === userId);
        if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
            saveMessagesToFile();
            io.emit('deleteMessage', messageId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });



    // מערך לאחסון תוצאות המשחק
let results = [];

// טעינת תוצאות המשחק מהאחסון המקומי אם קיימות
const resultsPath = path.join(__dirname, 'localResults.json');
try {
    if (fs.existsSync(resultsPath)) {
        const resultsData = fs.readFileSync(resultsPath);
        results = JSON.parse(resultsData);
    }
} catch (err) {
    console.error('Error reading local results file:', err);
}

function saveResultsToFile() {
    // תשמור רק חמישת התוצאות הטובות ביותר
    const topResults = results.slice(0, 5);
    try {
        fs.writeFileSync(resultsPath, JSON.stringify(topResults));
    } catch (err) {
        console.error('Error writing local results file:', err);
    }
}



    // שליחת הודעות ללקוח המחובר
    socket.emit('loadMessages', messages);

    // שליחת תוצאות המשחק ללקוח המחובר
    socket.emit('resultsUpdate', results);

    // קבלת הודעה חדשה מהלקוח ושליחתה לכל הלקוחות
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);
        messages.push(message);
        saveMessagesToFile();
        io.emit('receiveMessage', message);
    });

    // קבלת תוצאה חדשה מהלקוח ושליחתה לכל הלקוחות
    socket.on('newResult', (data) => {
        const { score, username } = data;
        console.log('Received score:', score, 'from', username);
        results.push({ score, username });
        results.sort((a, b) => b.score - a.score); // מיון מהגבוה לנמוך
        saveResultsToFile();
        io.emit('resultsUpdate', results);
    });
});



// הפנה את כל הבקשות לקובץ index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// האזנה לפורט 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




