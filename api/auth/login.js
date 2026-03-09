import connectDB from '../../server/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export default async function handler(req, res) {
	if (req.method !== 'POST') return res.status(405).end()

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
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Помилка логіну' })
	}
}
