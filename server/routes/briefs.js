const express = require('express')
const router = express.Router()
const connectDB = require('../db')
const { ObjectId } = require('mongodb')
const auth = require('../middleware/auth')

// Створення брифу (доступно авторизованим користувачам)
router.post('/', auth(), async (req, res) => {
	try {
		const db = await connectDB()
		const newBrief = {
			...req.body,
			userId: req.user.id, // Прив'язуємо бриф до юзера
			createdAt: new Date(),
			status: req.body.status || 'new',
		}
		const result = await db.collection('briefs').insertOne(newBrief)
		res.status(201).json(result)
	} catch (err) {
		res.status(500).json({ error: 'Помилка збереження' })
	}
})

// Отримання всіх брифів (для адміна)
router.get('/', auth('admin'), async (req, res) => {
	const db = await connectDB()
	const briefs = await db
		.collection('briefs')
		.find()
		.sort({ createdAt: -1 })
		.toArray()
	res.json(briefs)
})

// Отримання конкретного брифу
router.get('/:id', auth(), async (req, res) => {
	try {
		const db = await connectDB()
		const brief = await db
			.collection('briefs')
			.findOne({ _id: new ObjectId(req.params.id) })

		// Перевірка: адмін бачить все, юзер — тільки свої
		if (req.user.role !== 'admin' && brief.userId !== req.user.id) {
			return res.status(403).json({ error: 'Доступ заборонено' })
		}

		res.json(brief)
	} catch (err) {
		res.status(404).json({ error: 'Бриф не знайдено' })
	}
})

// Оновлення статусу (тільки адмін)
router.patch('/:id/status', auth('admin'), async (req, res) => {
	try {
		const db = await connectDB()
		const { status } = req.body
		await db
			.collection('briefs')
			.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } })
		res.json({ message: 'Статус оновлено' })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Видалення (тільки адмін)
router.delete('/:id', auth('admin'), async (req, res) => {
	const db = await connectDB()
	await db.collection('briefs').deleteOne({ _id: new ObjectId(req.params.id) })
	res.json({ message: 'Видалено' })
})

module.exports = router
