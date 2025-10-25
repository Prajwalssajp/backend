# chai aur backend series
📺 Videotube – A Full-Featured Video Sharing Backend
🚀 Overview

Videotube is a complete backend API inspired by platforms like YouTube.
It allows users to upload, like, comment, and manage videos — all powered by Node.js, Express, and MongoDB.
The project follows a clean MVC architecture and includes robust authentication, aggregation analytics, and cloud media storage with Cloudinary.

🧩 Features
👤 User System

Register, login, logout with JWT authentication

Profile update and avatar upload

Channel details and statistics

📹 Videos

Upload, update, delete, and fetch videos

Publish/unpublish control

Cloud storage using Cloudinary

💬 Comments

Add, update, and delete comments

Nested lookups for comment counts and user details

❤️ Likes & Subscriptions

Like/unlike videos, comments, and tweets

Subscribe/unsubscribe to channels

Subscriber and subscription count aggregation

🎞️ Playlists

Create, update, and delete playlists

Add/remove videos from playlists

📊 Dashboard

Aggregated stats for user’s uploaded videos

Total likes, comments, and subscribers using MongoDB’s $lookup and $group

🧠 Tech Stack
Layer	Technology
Runtime	Node.js
Framework	Express.js
Database	MongoDB + Mongoose
Authentication	JWT (JSON Web Token)
Cloud Storage	Cloudinary
Testing / API Client	Postman
Dev Tools	Nodemon, Prettier
