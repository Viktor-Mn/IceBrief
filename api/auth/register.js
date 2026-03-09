import connectDB from '../../server/db.js'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
	if (req.method !== 'POST') return res.status(405).end()

	try {
		const { email, password } = req.body
		if (!email || !password)
			return res.status(400).json({ error: 'Заповніть усі поля' })

		const db = await connectDB()
		const existing = await db
			.collection('users')
			.findOne({ email: email.toLowerCase() })
		if (existing) return res.status(400).json({ error: 'Користувач вже існує' })

		const hashedPassword = await bcrypt.hash(password, 10)
		await db
			.collection('users')
			.insertOne({
				email: email.toLowerCase(),
				password: hashedPassword,
				role: 'user',
			})

		res.status(201).json({ message: 'Користувача створено' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Помилка бази даних' })
	}
}
