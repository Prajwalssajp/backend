import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN
})) // it is used in config 

app.use(express.json({limit:"456kb"})) // to send data to backend from as json 

app.use(express.urlencoded({extended:true,limit:"302kb"}))

app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRoute from "./routes/user.routes.js"
import videoRoute from "./routes/video.routes.js"
import commentRoute from "./routes/comment.routes.js"
import healthCheckRoute  from "./routes/healthcheck.routes.js"
import likeRoute from "./routes/like.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
// route declaration
app.use('/api/v1/users',userRoute)
// http://localhost:4000/api/v1/users
app.use('/api/v1/video',videoRoute)
app.use('/api/v1/comment',commentRoute)
app.use('/api/v1',healthCheckRoute)
app.use('/api/v1/like',likeRoute)
app.use('/api/v1/playlist',playlistRoute)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/tweet",tweetRouter)
export {app}