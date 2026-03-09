const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connectDB = require('../db')

const SECRET = 'your_jwt_secret_key'

router.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password)
			return res.status(400).json({ error: 'Заповніть усі поля' })

		const db = await connectDB()
		console.log('Connected to DB for auth')

		const existing = await db
			.collection('users')
			.findOne({ email: email.toLowerCase() })
		if (existing) return res.status(400).json({ error: 'Користувач вже існує' })

		const hashedPassword = await bcrypt.hash(password, 10)
		const result = await db.collection('users').insertOne({
			email: email.toLowerCase(),
			password: hashedPassword,
			role: 'user',
		})

		console.log('Inserted user:', result.insertedId)
		res.status(201).json({ message: 'Користувача створено' })
	} catch (e) {
		console.error('[AUTH ERROR]', e)
		res.status(500).json({ error: 'Помилка бази даних' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const db = await connectDB()
		const user = await db
			.collection('users')
			.findOne({ email: email.toLowerCase() })
		if (!user) return res.status(400).json({ error: 'Користувача не знайдено' })

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) return res.status(400).json({ error: 'Невірний пароль' })

		const token = jwt.sign({ id: user._id, role: user.role }, SECRET, {
			expiresIn: '1h',
		})
		res.json({ token, role: user.role })
	} catch (e) {
		console.error('[LOGIN ERROR]', e)
		res.status(500).json({ error: 'Помилка логіну' })
	}
})

module.exports = router
