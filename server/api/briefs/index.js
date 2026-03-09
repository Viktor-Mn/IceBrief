import connectDB from '../../../server/db.js'
import auth from '../../../server/middleware/auth.js'

export default async function handler(req, res) {
	const method = req.method
	const db = await connectDB()

	try {
		if (method === 'POST') {
			const user = auth(req) // токен з заголовку
			const newBrief = {
				...req.body,
				userId: user.id,
				createdAt: new Date(),
				status: req.body.status || 'new',
			}
			const result = await db.collection('briefs').insertOne(newBrief)
			return res.status(201).json(result)
		}

		if (method === 'GET') {
			const user = auth(req, 'admin') // тільки адмін може GET всіх
			const briefs = await db
				.collection('briefs')
				.find()
				.sort({ createdAt: -1 })
				.toArray()
			return res.json(briefs)
		}

		res.status(405).end()
	} catch (err) {
		res
			.status(err.status || 500)
			.json({ error: err.error || 'Помилка сервера' })
	}
}
