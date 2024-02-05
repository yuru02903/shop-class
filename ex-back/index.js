// dotenv 是一個可協助設定"環境變數"的npm套件，透過建立一個.env檔案，使開發者可以在一個檔案中管理所有的環境變數，存放的變數會同步存放在process.env.變數名稱中。這樣就可以把資料庫連線、第三方 API token、session secret 等東西都放在.env 中，在部署的指令前直接使用process.env.變數名稱即可使用環境變數。
// config同樣也是一個很熱門的npm套件，使用上也相當容易，藉由將變數以json方式存為"全域變數"來使用，
import 'dotenv/config'
// 引入 express套件(是一個function)，並將其存入 express這個變數中
import express from 'express'
// Mongoose 是 MongoDB 的前端，MongoDB是資料庫
import mongoose from 'mongoose'
import cors from 'cors'
import routeUsers from './routes/users.js'
import routeProducts from './routes/products.js'
import routeOrders from './routes/orders.js'
import { StatusCodes } from 'http-status-codes'
import './passport/passport.js'

// 把載入的 Express 套件，存成一個名為 app 的物件，使後續可以透過 app 來使用 Express 這個框架所提供的方法
const app = express()

// app.use() 會使所有 request 經過 middleware 處理。
app.use(
  // 跨來源資源共用（CORS)，當使用者代理請求一個不是目前文件來源——例如來自於不同網域（domain）、通訊協定（protocol）或通訊埠（port）的資源時，會建立一個跨來源 HTTP 請求（cross-origin HTTP request）。基於安全性考量，程式碼所發出的跨來源 HTTP 請求會受到限制。例如，XMLHttpRequest 及 Fetch 都遵守同源政策（same-origin policy）。這代表網路應用程式所使用的 API 除非使用 CORS 標頭，否則只能請求與應用程式相同網域的 HTTP 資源。
  cors({
    // origin = 請求的來源
    // callback(Error錯誤, 是否允許來源) => 當錯誤發生時，回傳第一個參數
    origin (origin, callback) {
      // 如果請求的來源符合以下條件，允許請求
      if (origin === undefined || origin.includes('github.io') || origin.includes('localhost')) {
        callback(null, true)
      } else {
        callback(new Error('CORS'), false)
      }
    }
  })
)

// app.use(function (err, req, res, next) {}) => Error-handling middleware 錯誤處理中介軟體函數，與其他function差別在於使用四個參數
app.use((_, req, res, next) => {
  // 當發生特定error時，回覆特定訊息
  // 傳遞資料的格式是 JSON ，後端透過 Express 提供的函數 res.json()，幫我們送出 JSON 資料的回應資料。
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: '請求被拒絕'
  })
})

// express.json() => 使Express 可以解讀 JSON 文字，將其轉成 javascript 的 Object
app.use(express.json())

app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: '資料格式錯誤'
  })
})

app.use('/users', routeUsers)
app.use('/products', routeProducts)
app.use('/orders', routeOrders)

// app.all(path, callback [, callback ...]) => 不論任何 HTTP 要求的行為皆執行
// '*' => 代表的是任意多個字元/任意字串 => 任意路徑
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

// 監聽 "環境變數的 port" 或 "port 4000" 發出的請求
// async 是非同步函式，可在 async 函式內使用 await，使其變成同步函式
app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  // mongoose.connect(欲連結的數據庫)
  await mongoose.connect(process.env.DB_URL)
  console.log('資料庫連線成功')
})
