const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const briefsRoute = require('./routes/briefs')

const app = express()
const authRoute = require('./routes/auth')
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

app.use('/api/auth', authRoute)
app.use('/api/briefs', briefsRoute)

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
