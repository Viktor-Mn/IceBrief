import connectDB from '../../server/db.js'
import { ObjectId } from 'mongodb'
import auth from '../../server/middleware/auth.js'

export default async function handler(req, res) {
	const { id } = req.query
	const method = req.method
	const db = await connectDB()

	try {
		if (method === 'GET') {
			const user = auth(req)
			const brief = await db
				.collection('briefs')
				.findOne({ _id: new ObjectId(id) })
			if (!brief) return res.status(404).json({ error: 'Бриф не знайдено' })
			if (user.role !== 'admin' && brief.userId !== user.id)
				return res.status(403).json({ error: 'Доступ заборонено' })
			return res.json(brief)
		}

		if (method === 'PUT') {
			const user = auth(req)
			const updated = req.body
			await db
				.collection('briefs')
				.updateOne({ _id: new ObjectId(id) }, { $set: updated })
			return res.json({ message: 'Бриф оновлено' })
		}

		if (method === 'DELETE') {
			const user = auth(req, 'admin')
			await db.collection('briefs').deleteOne({ _id: new ObjectId(id) })
			return res.json({ message: 'Видалено' })
		}

		res.status(405).end()
	} catch (err) {
		res
			.status(err.status || 500)
			.json({ error: err.error || err.message || 'Помилка сервера' })
	}
}
