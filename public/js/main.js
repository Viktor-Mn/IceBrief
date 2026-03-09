const userRaw = localStorage.getItem('user')
const user = userRaw ? JSON.parse(userRaw) : null
const role = localStorage.getItem('role')
const authNav = document.getElementById('auth-nav')
const userInfo = document.getElementById('user-info')
const logoutBtn = document.getElementById('logout-btn')

if (user && user.email) {
	userInfo?.classList.remove('hidden')
	userInfo.textContent = 'Ви увійшли як: ' + user.email
	logoutBtn?.classList.remove('hidden')
	document.getElementById('login-link')?.classList.add('hidden')
	document.getElementById('register-link')?.classList.add('hidden')

	// Кнопка адмінки
	if (role === 'admin' && !document.getElementById('admin-btn')) {
		const adminBtn = document.createElement('a')
		adminBtn.href = '/admin.html'
		adminBtn.id = 'admin-btn'
		adminBtn.className = 'btn'
		adminBtn.style.marginLeft = '10px'
		adminBtn.style.background = 'linear-gradient(145deg, #f59e0b, #d97706)'
		adminBtn.textContent = 'Всі брифи (Адмін)'
		authNav.appendChild(adminBtn)
	}
}

logoutBtn?.addEventListener('click', () => {
	localStorage.removeItem('user')
	localStorage.removeItem('token')
	localStorage.removeItem('role')
	location.reload()
})

function renderBriefCard(b) {
	const statusText = {
		new: 'Новий',
		process: 'В роботі',
		done: 'Завершено',
	}

	return `
        <div class="brief-card">
            <span class="status-badge status-${b.status || 'new'}">${statusText[b.status] || 'Новий'}</span>
            <h3>${b.projectName}</h3>
            <p>${b.description.substring(0, 80)}...</p>
            <a href="/brief.html?id=${b._id}" class="btn-main" style="margin-top: 15px;">Деталі</a>
        </div>
    `
}