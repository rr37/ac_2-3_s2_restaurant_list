// require packages used in the project
const express = require('express')
const exphbs = require('express-handlebars')
// require mongoose
const mongoose = require('mongoose')
// 載入 Restaurant model
const Restaurant = require('./models/restaurant')
// 引用 body-parser
const bodyParser = require('body-parser')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

const app = express()
const port = 3000

// setting template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
// setting static files
app.use(express.static('public'))
// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(bodyParser.urlencoded({ extended: true }))

// routes setting
app.get('/', (req, res) =>{
  Restaurant.find({})
    .lean()
    .then(restaurantsData => {
      res.render('index', { restaurantsData })
    })
    .catch(err => console.log(err))
})

app.get('/restaurants/new', (req, res) => {
  res.render('new')
})

app.post('/restaurants', (req, res) => {
  Restaurant.create(req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.get('/search', (req, res) => {
  // const results = restaurantList.results
  // const keyword = req.query.keyword
  
  const keywords = req.query.keyword
  const keyword = req.query.keyword.trim().toLowerCase()

  //當無輸入資料或輸入空格時導至主畫面
  if (!keyword || keyword.trim()==="") {
    return res.redirect("/")
  }

  // const searchRestaurant = results.filter( result => 
  //   result.name.toLowerCase().includes(keyword.toLowerCase()) ||
  //   result.category.includes(keyword)
  // )
  // res.render('index', { restaurants: searchRestaurant,keyword: keyword })

  Restaurant.find({})
    .lean()
    .then(restaurantsData => {
      const filterRestaurantsData = restaurantsData.filter(
        data =>
          data.name.toLowerCase().includes(keyword) ||
          data.category.includes(keyword)
      )
      res.render('index', {
        restaurantsData: filterRestaurantsData,
        keywords
      })
    })
    .catch(err => console.log(err))
})

app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  Restaurant.findById(id)
  .lean()
  .then((restaurant) => res.render('show', { restaurant }))
  .catch(error => console.log(error))
})

app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch(error => console.log(error))
})

app.post('/restaurants/:id', (req, res) => {
  const id = req.params.id
  Restaurant.findByIdAndUpdate(id, req.body)
    //可依照專案發展方向自定編輯後的動作，這邊是導向到瀏覽特定餐廳頁面
    .then(() => res.redirect(`/restaurants/${id}`))
    .catch(error => console.log(error))
})

app.post('/restaurants/:id/delete', (req, res) => {
  const id = req.params.id
  Restaurant.findByIdAndDelete(id)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// listen on server
app.listen(port, (req, res) => {
  console.log(`Express is listening on localhost: ${port}`)
})
