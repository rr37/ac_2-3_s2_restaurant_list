// require packages used in the project
const express = require('express')
const app = express()
const port = 3000

const exphbs = require('express-handlebars')
const restaurantList = require('./restaurant.json')

// setting template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// setting static files
app.use(express.static('public'))

// routes setting
app.get('/',(req, res) =>{
  res.render('index', {restaurants: restaurantList.results})
})

app.get('/search', (req, res) => {
  const results = restaurantList.results
  const keyword = req.query.keyword
  const searchRestaurant = results.filter( result => {
    return result.name.toLowerCase().includes(keyword.toLowerCase())
  })
  res.render('index', { restaurants: searchRestaurant,keyword: keyword })
})

app.get('/restaurants/:id', (req, res) => {
  const results = restaurantList.results
  const restaurant = results.find(result => 
    result.id.toString() === req.params.id
  )
    res.render('show', { restaurant: restaurant })
})

// listen on server
app.listen(port, (req, res) => {
  console.log(`Express is listening on localhost: ${port}`)
})
