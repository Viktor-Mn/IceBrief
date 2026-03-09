const form = document.getElementById('briefForm');

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Щоб створити бриф, потрібно увійти!');
            return (window.location.href = '/login.html');
        }

        const formData = new FormData(form);
        const data = {};

        // Правильна обробка масивів (чекбоксів) та звичайних полів
        formData.forEach((value, key) => {
            if (key.includes('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!data[cleanKey]) data[cleanKey] = [];
                data[cleanKey].push(value);
            } else {
                data[key] = value;
            }
        });

        // Додаємо статус за замовчуванням
        data.status = 'new';

        try {
            const res = await fetch('/api/briefs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert('Бриф успішно надіслано!');
                form.reset();
                window.location.href = '/index.html';
            } else {
                const err = await res.json();
                alert('Помилка: ' + err.error);
            }
        } catch (err) {
            console.error('Помилка відправки:', err);
        }
    });
}