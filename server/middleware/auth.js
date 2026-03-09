import jwt from 'jsonwebtoken'
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export default function auth(req, role) {
	const token = req.headers['authorization']?.split(' ')[1]
	if (!token) throw { status: 401, error: 'Немає токена' }

	const decoded = jwt.verify(token, SECRET)
	if (role && decoded.role !== role)
		throw { status: 403, error: 'Недостатньо прав' }

	return decoded
}
