import connectDB from '../../../server/db.js'
import { ObjectId } from 'mongodb'
import auth from '../../../server/middleware/auth.js'

export default async function handler(req, res) {
	const { id } = req.query
	if (req.method !== 'PATCH') return res.status(405).end()

	const db = await connectDB()
	try {
		const user = auth(req, 'admin')
		const { status } = req.body
		await db
			.collection('briefs')
			.updateOne({ _id: new ObjectId(id) }, { $set: { status } })
		res.json({ message: 'Статус оновлено' })
	} catch (err) {
		res
			.status(err.status || 500)
			.json({ error: err.error || err.message || 'Помилка сервера' })
	}
}
