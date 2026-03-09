const regForm = document.getElementById('registerForm')

if (regForm) {
	regForm.addEventListener('submit', async e => {
		e.preventDefault()

		const formData = new FormData(regForm)
		const data = Object.fromEntries(formData)

		const res = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (res.ok) {
			alert('Реєстрація успішна! Тепер увійдіть.')
			window.location.href = '/login.html'
		} else {
			const err = await res.json()
			alert('Помилка: ' + err.error)
		}
	})
}

// Функція для входу
const loginForm = document.getElementById('loginForm')

if (loginForm) {
	loginForm.addEventListener('submit', async e => {
		e.preventDefault()

		const email = loginForm.email.value
		const password = loginForm.password.value

		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		})

		const data = await res.json()

		if (data.token) {
			localStorage.setItem('token', data.token)
			localStorage.setItem('role', data.role)
			localStorage.setItem('user', JSON.stringify({ email: email }))
			window.location.href = '/'
		} else {
			alert(data.error)
		}
	})
}
