const jwt = require('jsonwebtoken')
const SECRET = 'your_jwt_secret_key'

module.exports = role => (req, res, next) => {
	const token = req.headers['authorization']?.split(' ')[1]
	if (!token) return res.status(401).json({ error: 'Немає токена' })

	try {
		const decoded = jwt.verify(token, SECRET)
		if (role && decoded.role !== role) {
			return res.status(403).json({ error: 'Недостатньо прав' })
		}
		req.user = decoded
		next()
	} catch (e) {
		res.status(401).json({ error: 'Невалідний токен' })
	}
}
